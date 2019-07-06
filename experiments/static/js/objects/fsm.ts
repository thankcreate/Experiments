class Fsm {
    
    name: string = "DefaultFsm";
    states: Map<string, FsmState> = new Map();
    curState : FsmState;
    startupState: FsmState;

    constructor(name?: string) {
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
}



class FsmState {
    name: string;
    fsm: Fsm;

    prev: FsmState;
    next: FsmState;

    constructor(name: string, fsm: Fsm) {        
        this.name = name;
        this.fsm = fsm;
    }

    eventRoute: Map<string, string> = new Map();

    setAsStartup(): FsmState{
        this.fsm.setStartup(this);
        return this;
    }

    addEventToPrev(key: string): FsmState {
        if(this.prev) {
            this.prev.addEvent(key, this.name);
        }
        
        return this;
    }

    addEvent(key: string, target: string | FsmState): FsmState {
        if(this.eventRoute.has(key))
            console.warn("Added multiple event to state: [" + name  + "]:[" + key + "]");
        
        let targetName = "";
        if(target instanceof FsmState)
            targetName = target.name;
        else
            targetName = target;

        this.eventRoute.set(key, targetName);
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
}