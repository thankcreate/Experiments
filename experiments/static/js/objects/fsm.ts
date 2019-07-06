class Fsm {
    
    scene: PhScene; 
    name: string;
    states: Map<string, FsmState> = new Map();
    curState : FsmState;
    startupState: FsmState;

    constructor(scene: PhScene, name: string = "DefaultFsm") {
        this.scene = scene;
        this.name = name;
    }

    isRunning: boolean = true;

    lastAddedState: FsmState;


    addState(stateName: string, autoConnect: boolean = true) : FsmState {
        let state = new FsmState(stateName, this);
        let res = true;
        if(autoConnect)
            res = this.addAndConnectToLast(state);
        else
            res = this.addStateInner(state);


        this.lastAddedState = state;
        if(res)
            return state;
        else
            return null;
    }

    private addStateInner(state : FsmState) : boolean {
        if(this.states.has(state.name)) {
            console.warn("Added multiple state to fsm: [" + name  + "]:[" + state.name + "]");
            return false;
        }

        if(this.lastAddedState) {
            state.prev = this.lastAddedState;
        }

        
        state.fsm = this;
        this.states.set(state.name, state);        

        return true;
    }

    private addAndConnectToLast(state: FsmState) : boolean {             
        
        let res = this.addStateInner(state);
        if(!res)
            return false;

        if(this.lastAddedState) {
            this.lastAddedState.next = state;
            state.prev = this.lastAddedState;
        }

        return true;
    }

    update(time, dt) {
        if(!this.isRunning)
            return;    
        if(this.curState && this.curState.onUpdate)
            this.curState.onUpdate(this.curState, time, dt);
    }

    stateFinsiehd(state: FsmState) {
        if(state.next) {
            this.runState(state.next);
        }
    }

    /**
     * invoke a event
     * @param key 
     */
    event(key: string) : void{
        if(this.curState) {
            if(this.curState.eventRoute.has(key)) {
                let targetName = this.curState.eventRoute.get(key);
                let state = this.states.get(targetName);

                if(state) {
                    this.runState(state);
                }
            }
        }
    }

    runState(state: FsmState) {
        this.curState = state;
        state.onEnter(state);
        
    }

    

    setStartup(state: FsmState) {
        this.startupState = state;    
    }

    start() {
        if(this.startupState) {
            this.runState(this.startupState);
        }
        else {
            console.warn("No startup state for FSM: " + this.name);
        }       
    }

    addEvent(eventName: string, from: string | FsmState, to: string | FsmState) {
        from = this.getStateName(from);
        to = this.getStateName(to);

        if(!this.states.has(from)) {
            console.warn("Can't find FsmState + " + from);
            return;
        }

        if(!this.states.has(to)) {
            console.warn("Can't find FsmState + " + to);
            return;
        }

        let fromState = this.states.get(from);
        if(fromState.eventRoute.has(eventName)) {
            console.warn("Added multiple event to state: [" + fromState.name  + "]:[" + eventName + "]");
            // don't return still add
        }

        fromState.eventRoute.set(eventName, to);        
    }

    getStateName(state: string | FsmState) : string {
        let targetName = "";
        if(state instanceof FsmState)
            targetName = state.name;
        else
            targetName = state;

        return targetName;
    }
}



class FsmState {
    name: string;
    fsm: Fsm;

    /**
     * Prev is only a temp value used in the construction process /
     * It only points to the previously constructed state in the Fsm,
     * doesn't not mean prev.next = this
     * Never use this value outside of this class
     */
    prev: FsmState;

    /**
     * Next points to the default FsmState in a finish
     */
    next: FsmState;

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

    eventRoute: Map<string, string> = new Map();

    setAsStartup(): FsmState{
        this.fsm.setStartup(this);
        return this;
    }

    addEventFromPrev(eventName: string): FsmState {
        if(this.prev) {            
            this.addEventFrom(eventName, this.prev.name);
        }

        return this;
    }



    /**
     * 
     * @param from 
     * @param eventName 
     */
    addEventFrom(eventName:string, from: string | FsmState) : FsmState{
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
     * Don't call from outside
     */
    onEnter : StateHandler;
    setOnEnter(handler: StateHandler) : FsmState {
        this.onEnter = handler;
        return this;
    }


    
    /**
     * Don't call from outside
     */
    onUpdate :StateUpdateHandler;
    setOnUpdate(handler: StateUpdateHandler) : FsmState {
        this.onUpdate = handler;
        return this;
    }

    /**
     * If you want to exit, just call finish() instead \
     * Don't call from outside
     * * Don't do any async job in onExit
     */
    onExit: StateHandler;
    setOnExit(handler: StateHandler) : FsmState {
        this.onExit = handler;
        return this;
    }


    finished() {
        this.exitProcess();
    }

    private exitProcess() {
        if(this.onExit)
            this.onExit(this);
        this.fsm.stateFinsiehd(this);
    }

    isActive() : boolean{
        return this.fsm.curState == this;
    }
}