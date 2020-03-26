
type NewspaperEventCallback = (state: FsmState, index:number)=>any;
class NewspaperFsm extends Fsm{
    npNumbers: number[];

    static DEFAULT_ST_NAME = 'Default';
    static DIED_ST_NAME = 'Died';

    static DIED_EV_NAME = 'G_DIED';

    newspapaerStates: FsmState[] = [];
    papernEnterCallBack: NewspaperEventCallback;
    correctEnterCallback: NewspaperEventCallback;
    secondChanceCallback: NewspaperEventCallback;
    paperEndEntercallBack: NewspaperEventCallback;
    paperEndAddActionCallback:NewspaperEventCallback;
    paperDiedAddActionCallBack: NewspaperEventCallback;

    constructor(
        scene: BaseScene, 
        npNumbers:number[], 
        papernEnterCallBack:NewspaperEventCallback,
        correctEnterCallback:NewspaperEventCallback,
        secondChanceCallback:NewspaperEventCallback,
        paperEndEntercallBack:NewspaperEventCallback,
        paperEndAddActionCallback: NewspaperEventCallback,
        paperDiedAddActionCallBack: NewspaperEventCallback
        ) {
        super(scene, null);
        
        this.papernEnterCallBack = papernEnterCallBack;
        this.correctEnterCallback = correctEnterCallback;
        this.secondChanceCallback = secondChanceCallback;
        this.paperEndEntercallBack = paperEndEntercallBack;
        this.paperEndAddActionCallback = paperEndAddActionCallback;
        this.paperDiedAddActionCallBack = paperDiedAddActionCallBack;

        // deep copy
        this.npNumbers = [...npNumbers];        
        this.constructNpStates();

        this.name = 'NewspaperFSM';
        this.addInitalState(NewspaperFsm.DEFAULT_ST_NAME);        
    }
    
    constructNpStates() {
        if(notSet(this.npNumbers) || this.npNumbers.length == 0)
            return;

        this.addEvent(NewspaperFsm.DIED_EV_NAME, NewspaperFsm.DEFAULT_ST_NAME, NewspaperFsm.DIED_ST_NAME);

        let prevEndName = NewspaperFsm.DEFAULT_ST_NAME;
        for(let i = 0; i < this.npNumbers.length; i++) {
            let correctStName = this.getStateReactionNameByIndex(i, true);
            let wrongStName = this.getStateReactionNameByIndex(i, false);
            let endStName = this.getStateEndNameByIndex(i);

            let currStName = this.getStateNameByIndex(i);
            this.addEvent(Fsm.FINISHED, prevEndName, currStName);
            this.addEvent(Fsm.FINISHED, currStName, endStName);

            this.addEvent(Fsm.CORRECT, currStName, correctStName);
            this.addEvent(Fsm.WRONG, currStName, wrongStName);
            
            this.addEvent(Fsm.FINISHED, correctStName, endStName);
            this.addEvent(Fsm.FINISHED, wrongStName, endStName);

            // Second chance
            // Wrong->2nd
            let secondStName = this.getState2ndChanceStateNameByIndex(i);                
            this.addEvent(Fsm.SECODN_CHANCE, wrongStName, secondStName);                
            
            // 2nd -> correct
            this.addEvent(Fsm.CORRECT, secondStName, correctStName);      
            
            // 2nd -> wrong
            this.addEvent(Fsm.WRONG, secondStName, wrongStName);      

            
            prevEndName = endStName;
        }

        this.getState(NewspaperFsm.DIED_ST_NAME).addOnEnter(s=>{
            // the second param is nonsense here
            this.paperDiedAddActionCallBack(s, 0);
        });

        for(let i = 0; i < this.npNumbers.length; i++) {
            let state = this.getStateByIndex(i);
            state.addOnEnter(s=>{
                this.papernEnterCallBack(s, i);
            })

            let correct = this.getReactionStateByIndex(i, true);
            if(correct) {
                if(this.correctEnterCallback) {
                    correct.addOnEnter(s=>{
                        this.correctEnterCallback(s, i);
                    })
                }               
            }
            
            let secondChance = this.getSecondChangeStateByIndex(i);
            if(secondChance) {
                if(this.secondChanceCallback) {
                    secondChance.addOnEnter(s=>{
                        this.secondChanceCallback(s,i);
                    })
                }                
            }

            let end = this.getStateEndByIndex(i);
            if(end) {
                if(this.paperEndEntercallBack) {
                    end.addOnEnter(s=>{
                        this.paperEndEntercallBack(s, i);
                    })
                }
                if(this.paperEndAddActionCallback) {
                    this.paperEndAddActionCallback(end, i);
                }                
            }
        }
    }


    

    /**
     * 
     * @param index ~ [0, length - 1]
     */    
    getStateByIndex(index: number) :FsmState{
        let stName = this.getStateNameByIndex(index);
        return this.getState(stName)
    }

    getReactionStateByIndex(index: number, correct: boolean) : FsmState {
        let stName = this.getStateReactionNameByIndex(index, correct);
        return this.getState(stName)
    }

    getSecondChangeStateByIndex(index: number) : FsmState{
        return this.getState(this.getState2ndChanceStateNameByIndex(index));
    }

    getStateEndByIndex(index:number) :FsmState {
        return this.getState(this.getStateEndNameByIndex(index));
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
    getStateNameByIndex(index: number) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperState-${index}`
    }

    getStateReactionNameByIndex(index: number, correct: boolean) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperStateReaction-${index}-${correct ? 'CORRECT' : 'WRONG'}`
    }

    getState2ndChanceStateNameByIndex(index: number) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperState-${index}-second`
    }

    getStateEndNameByIndex(index: number) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperState-${index}-end`
    }
}