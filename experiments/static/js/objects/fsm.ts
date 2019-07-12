interface IFsmData {
    name: string,
    initial: string,
    events: {
        name: string;
        from: string;
        to: string;
    }[],
}

type AcionConditionFunc = (s:FsmState) => ConditionalRes
type ActionConfig = {
    finishImmediately? :boolean,
    conditionalRun?: AcionConditionFunc
}

function ImFinishConfig(val: boolean): ActionConfig{
    return {finishImmediately: val};
}


enum ConditionalRes {
    Run,
    PassResolve,
    PassReject,
}

class Fsm {

    static FinishedEventName = "FINISHED";
    scene: PhScene;
    name: string;
    states: Map<string, FsmState> = new Map();
    curState: FsmState;
    startupState: FsmState;

    // Custorm-stored variables
    // will call initVar() to reset it whenever the fsm is started or restarted
    variables: Map<string, any> = new Map(); 

    // constructor(scene: PhScene, name: string = "DefaultFsm") {
    //     this.scene = scene;
    //     this.name = name;
    // }

    constructor(scene: PhScene, fsm: IFsmData) {
        this.name = fsm.name;

        // Add all events
        for (let i in fsm.events) {
            let event = fsm.events[i];
            let eName = event.name;
            let eFrom = event.from;
            let eTo = event.to;
            let stFrom = this.states.get(eFrom);
            if (!stFrom) {
                stFrom = this.addState(eFrom);
                // console.debug("Added FsmState + " + eFrom);
            }

            if (!this.states.has(eTo)) {
                this.addState(eTo);
                // console.debug("Added FsmState  + " + eTo);
            }
            stFrom.addEventTo(eName, eTo);
        }

        // Set startup state
        if(fsm.initial) {
            let initState = this.states.get(fsm.initial);
            if(!initState) {
                initState = this.addState(fsm.initial);
            }
            initState.setAsStartup();
        }
    }

    isRunning: boolean = true;

    getState(stateName: string): FsmState {
        return this.states.get(stateName);
    }

    addState(stateName: string): FsmState {
        let state = new FsmState(stateName, this);
        let res = true;

        res = this.addStateInner(state);


        if (res)
            return state;
        else
            return null;
    }

    private addStateInner(state: FsmState): boolean {
        if (this.states.has(state.name)) {
            console.warn("Added multiple state to fsm: [" + name + "]:[" + state.name + "]");
            return false;
        }

        state.fsm = this;
        this.states.set(state.name, state);

        return true;
    }


    update(time, dt) {
        if (!this.isRunning)
            return;

        if (this.curState && this.curState._onUpdate)
            this.curState._onUpdate(this.curState, time, dt);
    }


    setVar<T>(key: string, val: T){
        this.variables.set(key, val);
    }

    hasVar(key: string): boolean{
        return this.variables.has(key);
    }

    getVar<T>(key: string, def: any): T{        
        if(this.variables.has(key))
            return this.variables.get(key);
        else 
            return def;
    }

    /**
     * invoke a event
     * @param key 
     */
    event(key: string): void {
        if(key.toUpperCase() !== key) {
            console.warn("FSM event is not all capitalized: " + key + "\nDid you used the state's name as the event's name by mistake?");
        }

        if (this.curState) {
            if (this.curState.eventRoute.has(key)) {               
                
                let targetName = this.curState.eventRoute.get(key);
                let state = this.states.get(targetName);
                state.fromEvent = key;
                this.runState(state);
            }
        }

    }

    runState(state: FsmState) {
        if(this.curState)
            this.curState._exit(this.curState);        
        
        this.curState = state;
        state._onEnter(state);
    }



    setStartup(state: FsmState) {
        this.startupState = state;
    }

    start(clearVar: boolean = true) {
        if(clearVar) {
            this.clearVar();
        }

        if (this.startupState) {
            this.runState(this.startupState);
        }
        else {
            console.warn("No startup state for FSM: " + this.name);
        }
    }

    clearVar() {
        this.variables.clear();
    }

    restart(clearVar: boolean = true) {        
        this.start();        
    }

    stop() {
        this.isRunning = false;
        this.curState = null;
    }

    addEvent(eventName: string, from: string | FsmState, to: string | FsmState) {
        from = this.getStateName(from);
        to = this.getStateName(to);

        if (!this.states.has(from)) {
            console.warn("Can't find FsmState + " + from);
            return;
        }

        if (!this.states.has(to)) {
            console.warn("Can't find FsmState + " + to);
            return;
        }

        let fromState = this.states.get(from);
        if (fromState.eventRoute.has(eventName)) {
            console.warn("Added multiple event to state: [" + fromState.name + "]:[" + eventName + "]");
            // don't return still add
        }

        fromState.eventRoute.set(eventName, to);
    }

    getStateName(state: string | FsmState): string {
        let targetName = "";
        if (state instanceof FsmState)
            targetName = state.name;
        else
            targetName = state;

        return targetName;
    }
}



class FsmState {
    name: string;
    fsm: Fsm;

    eventRoute: Map<string, string> = new Map();      
    _unionEvents: Map<string, {require: number, set: Set<string>}> = new Map();
    actions: {action: FsmAction, actionConfig: ActionConfig}[] = [];
    
    enterExitListners: TypedEvent<boolean> = new TypedEvent();

    autoRemoveListners: {target: OnOffable | TypedEvent<any>, key:string, func: any}[] = [];
    safeInOutWatchers: {target: PhImage, hoverState: number, prevDownState:number}[] = [];
    
    fromEvent: string;

    constructor(name: string, fsm: Fsm) {
        this.name = name;
        this.fsm = fsm;

        this.otherInit();
    }

    /**
     * used for init in inheritance
     */
    otherInit() {

    }

    needStopActions() {
        return !this.isActive();
    }



    autoOn(target: OnOffable | TypedEvent<any>, key:string | undefined, func: any) {
        if(target instanceof TypedEvent){
            target.on(func);
        }
        else {
            target.on(key, func);
        }
        this.autoRemoveListners.push({target, key, func});
    }

    autoSafeInOutClick(target: PhImage, inFunc: any, outFun?: any, clickFun?: any) {
        this.safeInOutWatchers.push({target, hoverState: 0, prevDownState: 0});

        target.on('safein', inFunc);
        this.autoRemoveListners.push({target, key:'safein', func: inFunc});

        if(outFun) {
            target.on('safeout', outFun);
            this.autoRemoveListners.push({target, key:'safeout', func: outFun});
        }
            
        if(clickFun) {
            target.on('safeclick', clickFun);
            this.autoRemoveListners.push({target, key:'safeclick', func: clickFun})
        }
    }

    addAction(action :FsmAction): FsmState {
        this.actions.push({action: action, actionConfig: null});
        return this;
    }

    getPromiseMiddleware(index: number): PromiseMiddleware {
        let action = this.actions[index].action;
        let actionConfig = this.actions[index].actionConfig;

        // If this function don't need to run
        if(actionConfig && actionConfig.conditionalRun) {
            let res = actionConfig.conditionalRun(this) ;
            let needRun = res === ConditionalRes.Run;
            if(!needRun) {
                return (state, result) => new Promise((resolve, reject) =>{
                    if(res === ConditionalRes.PassResolve) 
                        resolve('Passed and resolved by condition in action config');
                    else if(res === ConditionalRes.PassReject)
                        resolve('Passed and rejected by condition in action config');
                });
            }
        }

        if(action.length > 2) {            
            return (state, result) => new Promise((resolve, reject) =>{
                action(state, result, resolve, reject);
                if(actionConfig && actionConfig.finishImmediately)
                    resolve('Finished Immediately');
            });                        
        } 
        else {
            return (state, result) => new Promise((resolve, reject) =>{
                let actionResult = action(state, result);
                resolve(actionResult);
            });
        }
    }

    /**
     * runActions is called internally by _onEnter
     */
    runActions() {
        if (this.actions.length == 0)
            return;

        // Add first promise
        // let curPromise = this.actions[0](this, null);
        let curPromise = this.getPromiseMiddleware(0)(this, null);

        for (let i = 1; i < this.actions.length; i++) {
            // Add check stop promise
            curPromise = curPromise.then(result => {
                return new Promise((resolve, reject) => {
                    if (this.needStopActions())
                        reject("Need stop");
                    else
                        resolve(result);
                })
            });
            // Add every 'then'
            curPromise = curPromise.then(res => {
                return this.getPromiseMiddleware(i)(this, res);
            });
        }

        curPromise.catch(reason => {
            console.log('catched error in state: ' + reason);
        });
    }

    /**
     * Set the last added action's config
     * @param config 
     */
    updateConfig(config: ActionConfig) : FsmState {
        if(this.actions.length > 0) {
            let action = this.actions[this.actions.length - 1];
            if(notSet(action.actionConfig)) action.actionConfig = {};
                updateObject(config, action.actionConfig);
        }
        return this;
    }

    finishImmediatly() : FsmState {        
        this.updateConfig(ImFinishConfig(true));
        return this;
    }


    setCondition(func: AcionConditionFunc) : FsmState {
        this.updateConfig({conditionalRun: func})
        return this;
    }

    setBoolCondition(func: (s?: FsmState) => boolean) : FsmState {
        this.updateConfig({conditionalRun: s=>{
            if(func(s))
                return ConditionalRes.Run;
            else
                return ConditionalRes.PassResolve;
        }})
        return this;
    }

    

    setAsStartup(): FsmState {
        this.fsm.setStartup(this);
        return this;
    }




    /**
     * 
     * @param from 
     * @param eventName 
     */
    addEventFrom(eventName: string, from: string | FsmState): FsmState {
        let fromName = this.fsm.getStateName(from);
        this.fsm.addEvent(eventName, fromName, this.name);
        return this;
    }

    /**
     * Add event from this to target
     * @param eventName 
     * @param to 
     */

    addEventTo(eventName: string, to: string | FsmState): FsmState {
        let toName = this.fsm.getStateName(to);
        this.fsm.addEvent(eventName, this.name, toName);
        return this;
    }

    /**
     * The real onEnter process, including 2 processes:
     * 1. custum onEnter
     * 2. run actions
     * @param handler 
     */
    _onEnter(state: FsmState): FsmState {
        this.resetUnionEvent();
        this.enterExitListners.emit(true);

        if(this.onEnter)
            this.onEnter(state);

        this.runActions();
        return this;
    }

    
    private onEnter: StateHandler;
    setOnEnter(handler: StateHandler): FsmState {
        this.onEnter = handler;
        return this;
    }



    _onUpdate(state: FsmState, time?, dt?) {
        if(this.onUpdate)
            this.onUpdate(state, time, dt);
        
        let mp = getGame().input.activePointer;        
        this.safeInOutWatchers.forEach( e=>{            

            let contains = e.target.getBounds().contains(mp.x, mp.y)
            if( e.hoverState == 0 && contains){
                e.hoverState = 1;
                e.target.emit('safein');
            }
            else if(e.hoverState == 1 && !contains){
                e.hoverState = 0;
                e.target.emit('safeout');
            }

            if(contains) {
                if(mp.isDown && e.prevDownState === 0) {
                    e.target.emit('safeclick');
                }
            }
            e.prevDownState = mp.isDown ? 1 : 0;
        })
    }
    /**
     * Don't call from outside
     */
    onUpdate: StateUpdateHandler;
    setOnUpdate(handler: StateUpdateHandler): FsmState {
        this.onUpdate = handler;
        return this;
    }

    private removeAutoRemoveListners() {
        for(let i in this.autoRemoveListners) {
            let listener = this.autoRemoveListners[i];

            if(listener.target instanceof TypedEvent){
                listener.target.off(listener.func);
            }
            else {
                listener.target.off(listener.key, listener.func);
            }
            
        }

        // remove all cached
        this.autoRemoveListners.length = 0;
    }

    _exit(state: FsmState): FsmState {
        this.enterExitListners.emit(false);

        if (this.onExit)
            this.onExit(this);

        this.removeAutoRemoveListners();
        this.safeInOutWatchers.length = 0;

        return this;
    };


    /**
     * If you want to exit, just call finish() instead \
     * Don't call from outside
     * * DON'T do any async job in onExit
     */
    private onExit: StateHandler;
    setOnExit(handler: StateHandler): FsmState {
        this.onExit = handler;
        return this;
    }


    finished() {
        this.fsm.event(Fsm.FinishedEventName);
    }

    
    /**
     * Union event will only invoke the event when the \
     * counter reached the set value \
     * It's mostly used when you want to send a event
     * after multiple conditions are reached
     */
    unionEvent(evName: string, id: string) {
        let body = this._unionEvents.get(evName);
        if(!body || !body.set)
            return;
        
        body.set.add(id);
        if(body.set.size == body.require) {
            this.event(evName);
        }
    }

    resetUnionEvent() {
        this._unionEvents.forEach((value, key, map) =>{
            value.set.clear();
        });
    }

    setUnionEvent(evName: string, require: number) {
        let set = new Set<string>();
        this._unionEvents.set(evName, {require: require, set: set});
    }

    /**
     * Only call this if you know what you are doin
     * @param evName 
     */
    event(evName: string, fsm?: Fsm) {
            
        if(notSet(fsm))
            this.fsm.event(evName);
        else
            fsm.event(evName);
    }
    

    isActive(): boolean {
        return this.fsm.curState == this;
    }
}
