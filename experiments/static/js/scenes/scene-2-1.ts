/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initNormalGameFsm();           
        
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI()
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);

        CameraManager.getInstance().startDectector();   
        

        CameraManager.getInstance().showVideo();
    }
    

    initNormalGameFsm() {
        this.initStNormalDefault();
        
        this.initStStart();

        console.log('123');
        this.updateObjects.push(this.normalGameFsm);
    }


    getNormalGameFsm(): IFsmData {        
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
    }
}