class NewspaperFsm extends Fsm{
    npNumbers: number[];

    static DEFAULT_ST_NAME = 'Default';
    constructor(scene: BaseScene, npNumbers:number[]) {
        super(scene, null);

        // deep copy
        this.npNumbers = [...npNumbers];        
        this.constructNpStates();

        this.name = 'NewspaperFSM';
        this.addInitalState(NewspaperFsm.DEFAULT_ST_NAME);

    }
    
    constructNpStates() {
        if(notSet(this.npNumbers) || this.npNumbers.length == 0)
            return;

        let prevStName = NewspaperFsm.DEFAULT_ST_NAME;
        for(let i = 0; i < this.npNumbers.length; i++) {
            let currStName = this.getStateNameByIndexNumber(i);
            this.addEvent(Fsm.FinishedEventName, prevStName, currStName);

            prevStName = currStName;
        }
    }


    

    /**
     * 
     * @param index ~ [0, length - 1]
     */    
    getStateByIndex(index: number) :FsmState{
        let stName = this.getStateNameByIndexNumber(index);
        return this.getState(stName)
    }

    /**
     * 
     * @param num example: [4, 2, 1, 8]
     */
    getStateByNum(num: number) : FsmState{
        let idx = this.npNumbers.findIndex(v=>v==num);
        if(idx >= 0) {
            return this.getStateByIndex(idx);
        }
        else {
            return null;
        }
    }

    // index: [0, length - 1]
    getStateNameByIndexNumber(index: number) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperState-${index}`
    }
}