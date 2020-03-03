/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }

    npNums = [0, 1, 2, 3, 4];
    currIndex = 0;

    getNewspaperNums(): number[]{
        return this.npNums;
    }

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initGamePlayFsm();           
        this.initNewspaperFsm();
        
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI()       

        CameraManager.getInstance().startDectector();   
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);

        CameraManager.getInstance().showVideo();       
        
            
        this.fillNewspaperContentByNum(0);
    }
    

    initGamePlayFsm() {                 
        this.initStGamePlayDefault();        
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
    }

    initNewspaperFsm() {
        this.initStNewspaperDefault();
        this.initStNewspaper0();
        this.updateObjects.push(this.newspaperFsm);
    }


    getGamePlayFsmData(): IFsmData {        
        return normal_2_1;
    }

    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();
        state.addDelayAction(this, 200)
            .addEventAction("START");

    }

    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.setOnEnter(s=>{        
            this.showPaper(true);    
            this.newspaperFsm.start();
            setTimeout(() => {
                this.showCam();
            }, 500);
        })
        
        state.addSubtitleAction(this.subtitle, 'Hello', false);
    }

    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();
        state.addFinishAction();
    }

    initStNewspaper0() {
        let state = this.newspaperFsm.getStateByIndex(0)
        state.addAction(s=>{
            this.paperStateOnEnter(0);
        })         
    }

    initStNewspaper1() {
        let state = this.newspaperFsm.getStateByIndex(1)
        state.addAction(s=>{
            this.paperStateOnEnter(1);
        }) 
    }


    isLastTestCorrect = false;
    emotionMaxed(myEmotion: MyEmotion){
        super.emotionMaxed(myEmotion);

        let item = NewsDataManager.getInstance().getByNum(this.npNums[this.currIndex]);
        let rightEmotion = item.answer == 0 ? MyEmotion.Negative : MyEmotion.Positive;
        
        this.isLastTestCorrect = myEmotion == rightEmotion;        
        this.showResult(this.isLastTestCorrect);         
    }

    paperStateOnEnter(index: number) {
        this.fillNewspaperContentByNum(this.npNums[index]);        
        this.hideResult();
        this.canRecieveEmotion = true;

        this.currIndex = index;
    }
}