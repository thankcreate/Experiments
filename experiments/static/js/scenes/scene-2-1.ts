/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }

    npNums = [0, 1, 2, 3, 4]

    getNewspaperNums(): number[]{
        return this.npNums;
    }

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initGamePlayFsm();           
        
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI()       

        CameraManager.getInstance().startDectector();   
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);

        CameraManager.getInstance().showVideo();       
        
            
        this.fillNewspaperContent(0);
    }
    

    initGamePlayFsm() {                 
        this.initStNormalDefault();
        
        this.initStStart();
        this.updateObjects.push(this.gamePlayFsm);
    }


    // getGamePlayFsmData(): IFsmData {        
    //     return normal_2_1;
    // }

    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
        state.addDelayAction(this, 200)
            .addEventAction("START");

    }

    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.setOnEnter(s=>{        
            this.showPaper(true);    
            setTimeout(() => {
                this.showCam();
            }, 500);
        })
        
        state.addSubtitleAction(this.subtitle, 'Hello', false);
    }
}