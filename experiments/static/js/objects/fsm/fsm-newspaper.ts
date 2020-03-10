
type PapernEnterCallback = (state: FsmState, index:number)=>any;
type CorrectEnterCallback = (state: FsmState, index:number)=>any;
class NewspaperFsm extends Fsm{
    npNumbers: number[];

    static DEFAULT_ST_NAME = 'Default';

    newspapaerStates: FsmState[] = [];
    papernEnterCallBack: PapernEnterCallback;
    correctEnterCallback: CorrectEnterCallback;

    constructor(
        scene: BaseScene, 
        npNumbers:number[], 
        papernEnterCallBack:PapernEnterCallback,
        correctEnterCallback:CorrectEnterCallback
        ) {
        super(scene, null);
        
        this.papernEnterCallBack = papernEnterCallBack;
        this.correctEnterCallback = correctEnterCallback;
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
            this.addEvent(Fsm.FINISHED, prevStName, currStName);

            // if not the last one, add the Correct/Wrong brances
            if(i != this.npNumbers.length - 1) {
                let nextStName = this.getStateNameByIndexNumber(i + 1);

                let correctStName = this.getStateReactionNameByIndexNumber(i, true);
                let wrongStName = this.getStateReactionNameByIndexNumber(i, false);
                this.addEvent(Fsm.CORRECT, currStName, correctStName);
                this.addEvent(Fsm.WRONG, currStName, wrongStName);
                
                this.addEvent(Fsm.FINISHED, correctStName, nextStName);
                this.addEvent(Fsm.FINISHED, wrongStName, nextStName);


                // Second chance
                // Wrong->2nd
                let secondStName = this.getState2ndChanceNameByIndex(i);                
                this.addEvent(Fsm.SECODN_CHANCE, wrongStName, secondStName);                
                
                // 2nd -> correct
                this.addEvent(Fsm.CORRECT, secondStName, correctStName);      
                
                // 2nd -> wrong
                this.addEvent(Fsm.WRONG, secondStName, wrongStName);      

            }
            prevStName = currStName;
        }

        for(let i = 0; i < this.npNumbers.length; i++) {
            let state = this.getStateByIndex(i);
            state.addOnEnter(s=>{
                this.papernEnterCallBack(s, i);
            })

            let correct = this.getReactionStateByIndex(i, true);

            if(correct) {
                correct.addOnEnter(s=>{
                    this.correctEnterCallback(s, i);
                })
            }
            
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

    getReactionStateByIndex(index: number, correct: boolean) : FsmState {
        let stName = this.getStateReactionNameByIndexNumber(index, correct);
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

    getStateReactionNameByIndexNumber(index: number, correct: boolean) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperStateReaction-${index}-${correct ? 'CORRECT' : 'WRONG'}`
    }

    getState2ndChanceNameByIndex(index: number) {
        if(index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';            
        }
        return `NewspaperStateReaction-${index}-second`
    }
}