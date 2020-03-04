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
        this.initStNewspaper1();
        this.initStNewspaper2();
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
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index)
        state.addAction(s=>{
            this.paperStateOnEnter(index);
        })         

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Yeah, that's my good ${this.getUserName()}`, false);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `No, ${this.getUserName()}. You must be kidding.\nThink twice before you act out.`, false);
        wrong.addFinishAction();
    }

    initStNewspaper1() {
        let index = 1;
        let state = this.newspaperFsm.getStateByIndex(index)
        state.addAction(s=>{
            this.paperStateOnEnter(index);
        }) 

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Of course ${this.getUserName()}. How stupid it is to fight against the experiment!`, false);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `${this.getUserName()}. It's fun. I know.\n Playing with the experiment is always fun, \nbut please behave yourself.`, false);
        wrong.addFinishAction();
    }

    initStNewspaper2() {
        let index = 2;
        let state = this.newspaperFsm.getStateByIndex(index)
        state.addAction(s=>{
            this.paperStateOnEnter(index);
        }) 

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Haha, ${this.getUserName()}. That's great, right?`, false);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `Hmmmmm. `, false);
        wrong.addFinishAction();
    }


    isLastTestCorrect = false;
    emotionMaxed(myEmotion: MyEmotion){
        super.emotionMaxed(myEmotion);

        let item = NewsDataManager.getInstance().getByNum(this.npNums[this.currIndex]);
        let rightEmotion = item.answer == 0 ? MyEmotion.Negative : MyEmotion.Positive;
        
        let correct = myEmotion == rightEmotion;
        this.isLastTestCorrect = correct;        
        this.showResult(this.isLastTestCorrect);         

        this.newspaperFsm.event(correct ? Fsm.CORRECT : Fsm.WRONG);
    }

    paperStateOnEnter(index: number) {
        this.fillNewspaperContentByNum(this.npNums[index]);        

        this.topProgress.value = 0;
        this.bottomProgress.value = 0;
        this.refreshProgressBarCss();

        this.hideResult();
        this.canRecieveEmotion = true;
        this.currIndex = index;
    }
}