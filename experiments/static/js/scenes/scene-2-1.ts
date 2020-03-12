/// <reference path="scene-2.ts" />

class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');

    }
    
    get npNums(): number[]{
        return [0, 1, 2, 3, 4, 5, 6];
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
        this.initStNewspaper3();
        this.initStNewspaper4();
        this.initStNewspaper5();
        this.initStNewspaper6();
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
            this.setCenterTextPaper('65536 Sucks', '😀')
            this.newspaperFsm.start();                   
        })        
    }



    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();        

        state.addAction(s=>{
            this.setCenterTextPaper('Welcome', '😅')
        })
        state.addSubtitleAction(this.subtitle, ()=>`Welcome, ${this.getUserName()}. \nI know. It's hard to say welcome. We owe you a lot.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('65536 Sucks', '😣')
        })
        state.addSubtitleAction(this.subtitle, ()=>`I do understand what it means\n to come through the annoying Experiment 65536.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('Procedurality👎', '🙃')
        })
        state.addSubtitleAction(this.subtitle, `Those nerds are so obsessed with their stupid Procedural Rhetoric, \nbut have forgotten the subject experience completely.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('65537', '🤗')
        })
        state.addSubtitleAction(this.subtitle, ()=>`But trust me, ${this.getUserName()}. \nNo hassle on the compulsive typing is needed here in 65537 anymore. \nAll you need is just providing your natural reaction with ease.`, false);


        state.addFinishAction();
    }

    initStNewspaper0() {
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index)
        
        state.addOnEnter(s=>{
            
            this.canRecieveEmotion = false;        
        })

        
        state.addSubtitleAction(this.subtitle, 'For example:\n Can you show me how you feel when see the news above?', false);
        
        state.addAction(s=>{            
            this.showManualBtns(true);
        });
        state.addSubtitleAction(this.subtitle, 'You can answer by clicking on the emoji buttons on the right side.', false);
        
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Yeah, that's my good ${this.getUserName()}`, true);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `No! ${this.getUserName()}. You must be kidding.\nThink twice before you act out.`, true);
        wrong.addSubtitleAction(this.subtitle, ()=> `Let me give you another try.`, true);
        // wrong.addAction(s=>{
        //     this.resetProgress();
        //     this.hideResult();
        // });
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }

    initStNewspaper1() {
        let index = 1;
        let state = this.newspaperFsm.getStateByIndex(index)     

        state.addSubtitleAction(this.subtitle, 'And, what about this? How do you feel?', false);

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Of course, ${this.getUserName()}. How stupid it is to fight against the experiment!`, true);
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '😀')
        })
        correct.addAction(s=>{
            this.hideResult();
        })
        correct.addSubtitleAction(this.subtitle, ()=> `It's easy, right?`, false); 
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '😎')
        })        
        
        correct.addAction(s=>{             
            this.showManualBtns(false);
        });
        correct.addSubtitleAction(this.subtitle, "But what you have just played with is old-stuff,\n and we don't like clicking around.", false); 
        
        correct.addAction(s=>{            
            this.showCam(true);            
        }); 
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '🤗')
        })   
        correct.addSubtitleAction(this.subtitle, "With the help of THIS,\n we can make your life even easier.", false);
        
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `${this.getUserName()}, it's fun. I know.\n Playing with the experiment is always fun, \nbut please behave yourself.`, true);
        wrong.addSubtitleAction(this.subtitle, ()=> `Could you try it again for me?`, true);
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }

    initStNewspaper2() {
        let index = 2;
        let state = this.newspaperFsm.getStateByIndex(index)        
        
        state.addAction(s=>{            
            this.showProgressBars();
            this.canRecieveEmotion = true;
        });
        state.addSubtitleAction(this.subtitle, "Just relax and show your most natural expression\nregarding to the news.", false);      
        // 🦷
        state.addSubtitleAction(this.subtitle, "If you want to show a smile,\nplease make sure we can see your grinning TEETH.", false);
                


        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addAction(s=>{            
        })

        correct.addSubtitleAction(this.subtitle, ()=> `Haha, ${this.getUserName()}. Labs are the best.`, true);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `Why would someone hate to see more labs?`, true);
        wrong.addSubtitleAction(this.subtitle, ()=> `I guess ${this.getUserName()} wants to try again.`, true);
        wrong.addAction(s=>{
            this.resetProgress();
            this.hideResult();
            this.canRecieveEmotion = true;  
        });
        wrong.addEventAction(Fsm.SECODN_CHANCE);

        // Second chance
        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addSubtitleAction(this.subtitle, "If you want to show a smile,\nplease make sure we can see your grinning TEETH.", false);
    }

    initStNewspaper3() {
        let index = 3;
        let state = this.newspaperFsm.getStateByIndex(index)
        
        state.addSubtitleAction(this.subtitle, "Disgusting. Iconoclasts!\n So exuberant, so unavailing.", false);
        
        // 😟👃
        state.addSubtitleAction(this.subtitle, "If you want to show disgusting, \njust make some FURROWED BROW or NOSE WRINKLE.", false);        

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `You never let me down, ${this.getUserName()}.`, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Iconoclasts are the cancer of our community.`, true);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `No! Don't make me doubt if you are one of them.`, true);
        wrong.addSubtitleAction(this.subtitle, ()=> `Try again.`, true);        
        // wrong.addSubtitleAction(this.subtitle, ()=> `Please be carefull and don't cause any misunderstanding between us.\nTry again.`, true);        
        wrong.addEventAction(Fsm.SECODN_CHANCE);

        // Second chance
        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addSubtitleAction(this.subtitle, "If you want to show disgusting, \njust make some FURROWED BROW or NOSE WRINKLE.", false);
    }

    initStNewspaper4() {
        let index = 4;
        let state = this.newspaperFsm.getStateByIndex(index)
        
        
        state.addSubtitleAction(this.subtitle, "I think food price will be fine. What do you say?", false);
        

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Excellent reaction.`, true);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `Wrong! \nTry again.`, true);        
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }

    initStNewspaper5() {
        let index = 5;
        let state = this.newspaperFsm.getStateByIndex(index)
        
        state.addSubtitleAction(this.subtitle, "Things have changed a little bit. What now?", false);
        

        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addSubtitleAction(this.subtitle, ()=> `Well done, ${this.getUserName()}.`, true);
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addSubtitleAction(this.subtitle, ()=> `Wrong again!\n Try again again!`, true);      
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }

    initStNewspaper6() {
        let index = 6;
        let state = this.newspaperFsm.getStateByIndex(index)

        state.addSubtitleAction(this.subtitle, "OK, this is the last one.", false);
       
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);        
        correct.addSubtitleAction(this.subtitle, ()=> `Congratulations!\nYou've passed the trial.`, true);
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '🤑');
            this.showCam(false);
            this.hideResult();
        });
        correct.addSubtitleAction(this.subtitle, `No worries. Food price is fine.\nWe made it up.`, true)
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '🧐');
        });
        correct.addSubtitleAction(this.subtitle, `Shortage is impossible to happen after the experiments were invented,\nand we just want to confirm you've get accustomed to our experiment`, true)
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '😍');
        });
        correct.addSubtitleAction(this.subtitle, ()=>`But I think someone as smart as ${this.getUserName()} must have realized the trick already`, true)
        correct.addAction(s=>{
            this.setCenterTextPaper('65537', '😀');
        });
        correct.addSubtitleAction(this.subtitle, `Anyway, the exercise has finished.\nLet's come to a real trial.`, true)
        
        correct.addFinishAction();

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);        
        wrong.addSubtitleAction(this.subtitle, ()=> `Wrong again!\n Try again again!`, true);          
        wrong.addEventAction(Fsm.SECODN_CHANCE);        
    }
}