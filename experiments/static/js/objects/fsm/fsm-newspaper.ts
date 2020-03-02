class NewspaperFsm extends Fsm{
    npNumbers: number[];
    constructor(scene: BaseScene, npNumbers:number[]) {
        super(scene, null);

        // deep copy
        this.npNumbers = [...npNumbers];        
        this.initNpStates();

        this.name = 'NewspaperFSM';
    }
    
    initNpStates() {
        if(notSet(this.npNumbers) || this.npNumbers.length == 0)
            return;

        for(let i = 0; i < this.npNumbers.length; i++) {
            let statename = this.getStateNameByIndexNumber(i);
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