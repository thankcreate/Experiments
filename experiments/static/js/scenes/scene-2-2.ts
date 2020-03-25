/// <reference path="scene-2.ts" />
class Scene2L2 extends Scene2 {
    constructor() {
        super('Scene2L2');

    }

    get npNums(): number[]{
        return [0, 1, 2, 3, 4, 5, 6];
    }

    create() {
        super.create();
        this.initGamePlayFsm();           
        this.initNewspaperFsm();
    }

    initGamePlayFsm() {                 
        this.initStGamePlayDefault();        
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
        console.log('afdsafdasfdas');
    }

    initNewspaperFsm() {
        // this.initStNewspaperDefault();
        // this.initStNewspaper0();
        // this.initStNewspaper1();
        // this.initStNewspaper2();
        // this.initStNewspaper3();
        // this.initStNewspaper4();
        // this.initStNewspaper5();
        // this.initStNewspaper6();
        this.updateObjects.push(this.newspaperFsm);
    }


    getGamePlayFsmData(): IFsmData {        
        return normal_2_2;
    }

    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();        
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }

    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s=>{      
            console.log('aahahahahahha')  ;
            this.showPaper(true);    
            // this.setCenterTextPaper('65536 Sucks', '😀')
            // this.newspaperFsm.start();                   
        })        
    }
}