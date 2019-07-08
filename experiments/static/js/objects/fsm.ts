interface IFsmData {
    name: string,
    initial: string,
    events: {
      name: string;
      from: string;
      to: string;
    }[],
  }


class Fsm {

    static FinishedEventName = "Finished";
    scene: PhScene;
    name: string;
    states: Map<string, FsmState> = new Map();
    curState: FsmState;
    startupState: FsmState;

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
        if (this.curState && this.curState.onUpdate)
            this.curState.onUpdate(this.curState, time, dt);
    }



    /**
     * invoke a event
     * @param key 
     */
    event(key: string): void {
        if (this.curState) {
            this.curState._exit(this.curState);

            if (this.curState.eventRoute.has(key)) {
                let targetName = this.curState.eventRoute.get(key);
                let state = this.states.get(targetName);

                if (state) {
                    this.runState(state);
                }
            }
        }
    }

    runState(state: FsmState) {
        this.curState = state;
        state._onEnter(state);

    }



    setStartup(state: FsmState) {
        this.startupState = state;
    }

    start() {
        if (this.startupState) {
            this.runState(this.startupState);
        }
        else {
            console.warn("No startup state for FSM: " + this.name);
        }
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

    actions: FsmAction[] = [];
    
    autoRemoveListners: {target: OnOffable, key:string, func: any}[] = [];


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



    autoOn(target: OnOffable, key:string, func: any) {
        target.on(key, func);
        this.autoRemoveListners.push({target, key, func});
    }


    addAction(func: (state?, result?, resolve?, reject?) => any): FsmState {
        this.actions.push(func);
        return this;
    }

    getPromiseMiddleware(index: number): PromiseMiddleware {
        return this.convertActionToPromiseMiddleware(this.actions[index]);
    }

    convertActionToPromiseMiddleware(action: FsmAction): PromiseMiddleware {
        if(action.length > 2) {            
            return (state, result) => new Promise((resolve, reject) =>{
                action(state, result, resolve, reject);
            });                        
        } 
        else {
            return (state, result) => new Promise((resolve, reject) =>{
                action(state, result);
                resolve(undefined);
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
            console.log('catched: ' + reason);
        });
    }

    eventRoute: Map<string, string> = new Map();

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
            listener.target.off(listener.key, listener.func);
        }

        // remove all cached
        this.autoRemoveListners.length = 0;
    }

    _exit(state: FsmState): FsmState {
        if (this.onExit)
            this.onExit(this);

        this.removeAutoRemoveListners();

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
    

    isActive(): boolean {
        return this.fsm.curState == this;
    }
}
