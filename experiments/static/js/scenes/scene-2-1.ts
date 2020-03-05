/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }
    
    get npNums(): number[]{
        return [0, 1, 2, 3, 4];
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


        this.setNewspaperStyle(NewsPaperStyle.ONLY_TEXT_CENTER);
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
        state.addOnEnter(s=>{        
            this.showPaper(true);    
            this.setNewspaperStyle(NewsPaperStyle.ONLY_TEXT_CENTER);
            this.setNewspaperContent('😀');
            this.setNewspaperFontSize(150);
            this.setNewspaperTitle('65536 Sucks');
            this.newspaperFsm.start();
            // setTimeout(() => {
            //     this.showCam();
            // }, 500);            
        })        
        
    }

    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();        

        state.addAction(s=>{
            this.setNewspaperContent('😅');
            this.setNewspaperTitle('Welcome');
        })
        state.addSubtitleAction(this.subtitle, ()=>`Welcome, ${this.getUserName()}. \nI know. It's hard to say welcome. We owe you`, false);
        state.addAction(s=>{
            this.setNewspaperContent('😣');
            this.setNewspaperTitle('65536 Sucks');
        })
        state.addSubtitleAction(this.subtitle, ()=>`I can understand what it means\n to come through the annoying Experiment 65536`, false);
        state.addAction(s=>{
            this.setNewspaperContent('🙃');
            this.setNewspaperTitle('Procedurality👎 ');
        })
        state.addSubtitleAction(this.subtitle, `Those nerds are so obsessed with their stupid Procedural Rhetoric, \nbut have forgotten the subject experience`, false);
        state.addAction(s=>{
            this.setNewspaperContent('🤗');
            this.setNewspaperTitle('65537');
        })
        state.addSubtitleAction(this.subtitle, ()=>`But trust me, ${this.getUserName()}. \nNo hassle on the compulsive typing is needed here in 65537 any more. \nAll you need is just providing your natural reaction with ease`, false);


        state.addFinishAction();
    }

    initStNewspaper0() {
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index)
        
        state.addOnEnter(s=>{
            this.setNewspaperStyle(NewsPaperStyle.DEFAULT);    
            this.canRecieveEmotion = false;        
        })

        state.addSubtitleAction(this.subtitle, 'For example:\n Can you show me how you feel when see the news above?', false);
        state.addAction(s=>{
            // this.canRecieveEmotion = true;    
        });

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

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Haha, ${this.getUserName()}. That's great, right?`, false);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `Hmmmmm. `, false);
        wrong.addFinishAction();
    }


    

}