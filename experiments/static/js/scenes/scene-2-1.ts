/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }

    paperIDs = [0, 1, 2, 3, 4]

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initNormalGameFsm();           
        
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI()       

        CameraManager.getInstance().startDectector();   
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);

        CameraManager.getInstance().showVideo();

        
        
            
        this.fillNewspaperContent(0);
    }
    

    initNormalGameFsm() {                 
        this.initStNormalDefault();
        
        this.initStStart();
        this.updateObjects.push(this.normalGameFsm);
    }


    getGamePlayFsmData(): IFsmData {        
        return normal_2_1;
    }

    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state.addDelayAction(this, 200)
            .addEventAction("START");

    }

    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.setOnEnter(s=>{        
            this.showPaper(true);    
            setTimeout(() => {
                this.showCam();
            }, 500);
        })
        
        state.addSubtitleAction(this.subtitle, 'Hello', false);
    }
}