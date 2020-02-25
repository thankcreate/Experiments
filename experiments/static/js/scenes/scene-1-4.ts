/// <reference path="scene-1.ts" />

class Scene1L4 extends Scene1 {

    upgrade1: Button;

    openTurn: Phaser.Sound.BaseSound;

    constructor() {
        super('Scene1L4');
    }

    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            bgm_turn: ["assets/audio/OpenTurn.mp3", 'openTurn']
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }

    getNormalGameFsm(): IFsmData {
        return normal_1_4;
    }

    playOpenTurnBgm() {

        this.playAsBgm(this.openTurn);

        // TODO: Should be extracted to its own logic        
        // change the dwitter        
    }

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);

        // this.initShake();
        this.initNormalGameFsm();

        this.hp.initMaxHealth(10);
        this.createBtns();


        this.addCallbackForFirstTimeBubble();
        // this.overlay.showReviewForm();
    }

    addCallbackForFirstTimeBubble() {
        for(let i = 0; i < this.ui.hud.rightBtns.length; i++) {
            this.ui.hud.rightBtns[i].firstTimeBubbleCallback = (idx)=>{this.firstTimeBubbleAutoBad(idx)};
        }
        
    }

    createBtns() {
        // this.upgrade1 = new Button(this, )
    }

    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();
        this.initWarn();
        this.initStateIdle();
        this.initStMock();

        this.initStPromptAutoBad();
        this.initStPrmoptAutoTyper();
        this.initStPromptTurn();
        this.initStPrmoptAutoTurn();
        this.initStPrmoptCreator();

        this.updateObjects.push(this.normalGameFsm);
    }


    needShowEcoAboutAtStartup(): boolean {
        if (isEconomicSpecialEdition()) {
            return true;
        }

        return false;
    }
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state
            .addDelayAction(this, 500)
            .addAction(s => {
                if (this.needShowEcoAboutAtStartup()) {
                    let dialog = this.overlay.showEcnomicDialog();
                    dialog.singleUseClosedEvent.on(() => {
                        s.event('START');
                    });
                }
                else {
                    s.event('START');
                }
            })
        // .addEventAction("START");

    }

    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.setOnEnter(s => {
            
            
            // this.enemyManager.sensetiveDuration = 60000;
            // // this.needFeedback = true;
            // this.enemyManager.setNextNeedSensitiveAlways(true);     
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.ClickerGame);

            // if((this.enemyManager.curStrategy as SpawnStrategyClickerGame).normalNormalCount >= 1 ) {
            //     s.event('WARN') ;
            // }            

            /**
             * Pause at first because all the forked logic is originated from 'Idle' state
             * We need to exclude any possible player input here
             */
            this.pause('　　　', 0);
            //this.pause(null, 0);   
        })

        state.setOnExit(s=>{            
            this.unPause()
            this.getCurClickerStrategy().startLoopCreateNormal();
        })

        
        state.addSubtitleAction(this.subtitle, s=>this.getUserName() + "!\n Looks like I have to admit that I'm a bad experiment designer.", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "I really don't know why those 4O4s keep appearing.\nHowever, I think you'll surely help me get rid of them, right?", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addAction(s => {
           this.hud.showContainerRight();
        })                
        state.addSubtitleAction(this.subtitle, "Don't worry! I've prepared some handy tools for you,\nbut everything comes with a PRICE.\n And let's just define the PRICE as the SCORE you've got", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "Remember! I'm always on YOUR side.", true)        
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addFinishAction();

        
    }

    

    hasWarnKey = 'HasWarn';

    initStateIdle() {
        let state = this.normalGameFsm.getState("Idle");
        state.setOnEnter(s => {
            
        });
        state.setOnUpdate(s => {
            if (this.getCurClickerStrategy().normalNormalCount >= startWarnNum && !this.normalGameFsm.getVar(this.hasWarnKey, false)) {
                this.normalGameFsm.setVar(this.hasWarnKey, true);
                s.event('WARN');
            }
        });
        // state.addEventAction('MOCK');
    }

    getCurClickerStrategy(): SpawnStrategyClickerGame {
        return this.enemyManager.curStrategy as SpawnStrategyClickerGame;
    }

    initWarn() {
        let state = this.normalGameFsm.getState("Warn");
        state.setOnEnter(s => {

        })
            .addSubtitleAction(this.subtitle, "Let me be clear", true)
            .addSubtitleAction(this.subtitle, "You can ONLY benefit from eliminating 4O4s. \n Don't be so obsessed with the word matching!", true, null, null, 4000)
            .addSubtitleAction(this.subtitle, "Just be a reasonable person. Seriously!", true, null, null, 2000)
            .addFinishAction();
    }


    gamePlayStarted() {
        super.gamePlayStarted();
        this.hud.infoPanel.inner.setVisible(true);
    }

    gamePlayExit() {
        super.gamePlayExit();
        this.hud.infoPanel.inner.setVisible(false);
    }

    initStMock() {
        let state = this.normalGameFsm.getState("Mock");
        state.addDelayAction(this, 3000)
        state.addSubtitleAction(this.subtitle, s=>this.getUserName() + "!\n What are you doing? You think this is fun?", true);
        state.addSubtitleAction(this.subtitle, "Finally, I know who created those words and 4O4s!", true);
        state.addSubtitleAction(this.subtitle, s=>"It's has always been YOU! \n" + this.getUserName() + "!", true);
        state.addSubtitleAction(this.subtitle, "I know what you're thinking,", true);
        state.addSubtitleAction(this.subtitle, "You think that it's me\n who put the 'Creator' button here, right?", true);
        state.addSubtitleAction(this.subtitle, "But the fact I put it there doesn't\n simply mean you have the right to use it!", true);
        state.addSubtitleAction(this.subtitle, "Of course, it's my procedural rhetoric...", true);
        state.addSubtitleAction(this.subtitle, "But, I don't know. Maybe it's just that\n I think you are different and I really count on you.", true, null, null, 3000);
        state.addSubtitleAction(this.subtitle, "Anyway, thank you for participating in my experiment.\n We are not done yet", true);
        state.addSubtitleAction(this.subtitle, "Before we move on,\n would you kindly fill in this beautiful forms for me please?", true, null, 50);
        state.addAction(s=>{
            this.pause();
            Overlay.getInstance().showFormRating(true);
        })

        // state.addSubtitleAction(this.subtitle, "Well, I don't want to argue with you about that. \n It's just so gross!", true);

        // state.addSubtitleAction(this.subtitle, "And I don't want to bear this ugly scene any more", true);
        // state.addSubtitleAction(this.subtitle, "If you want to continue, just do it. \nBut our experiment is DONE.", false);
        // state.addSubtitleAction(this.subtitle, "Voice from Tron & Rachel: Hi, this is our current thesis progress. \n Thank you for playing!", false);
    }

    firstTimeBubbleAutoBad(idx) {        
        console.log(idx);
        let eventNames = [
            'TO_PROMPT_COMPLETE_BAD',
            'TO_PROMPT_AUTO_BAD',
            'TO_PROMPT_TURN',
            'TO_PROMPT_AUTO_TURN',
            'TO_PROMPT_CREATOR',
        ];
        // global event
        this.normalGameFsm.event(eventNames[idx], true);
    }


    
    addYesOrNoAction(s: FsmState, targetBtn: PropButton) {
        
        s.addAction((s: FsmState, result, resolve, reject) => {
            targetBtn.hasNoActualClick = false;
            // Turn the original pause title to " 'Y' / 'N' "
            this.pauseLayer.title.text = cYesOrNo;
            s.autoOn($(document), 'keypress', (event)=>{
                var code = String.fromCharCode(event.keyCode).toUpperCase();                
                if(code == 'Y') {
                    targetBtn.click();                    
                    resolve('YES');
                }
                else if(code == 'N') {           
                    resolve('NO');                    
                }
            });

            s.autoOn(targetBtn.clickedEvent, null, o => {                
                resolve('YES');
            })
        })
        .addAction(s=>{
            this.subtitle.forceStopAndHideSubtitles();
        });
    }

    initStPromptAutoBad() {
        let targetBtn = this.ui.hud.rightBtns[0];
        let state = this.normalGameFsm.getState("PromptCompleteBad");
        state.setOnEnter(s=>{
            targetBtn.hasNoActualClick = true;
        });
        state.addSubtitleAction(this.subtitle, "Congratulations!", false)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true)
        state.addSubtitleAction(this.subtitle, "Based on your score,\n I think this AUTO-COMPLETION tool might be of help", false, null, null, 2500)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true)
//      state.addSubtitleAction(this.subtitle, "Just type in 'B', and we will help you complete it", false);
        state.addSubtitleAction(this.subtitle, "To purchase this upgrade, press 'Y'.\n To ignore, press 'N'", false).finishImmediatly()
        
        this.addYesOrNoAction(state, targetBtn);

        state.addFinishAction();
        state.setOnExit(s=>{            
            targetBtn.hideAttachedBubble();
        })
    }

    initStPrmoptAutoTyper() {
        let state = this.normalGameFsm.getState("PromptAutoBad");
        state.setOnEnter(s=>{
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.ui.hud.rightBtns[1];
        state.addSubtitleAction(this.subtitle, "You know what, based on the feedback from previous playtesters. \n Seldom of them have the patience to listen carefully what I'm saying", false);
        state.addSubtitleAction(this.subtitle, "So I decided to pause the game when I'm talking to you.", false);
        state.addSubtitleAction(this.subtitle, "An automatic typer that marks things as BAD for you.\n How nice it is!", false).finishImmediatly()
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.setOnExit(s=>{            
            targetBtn.hideAttachedBubble();
        })

    }

    // TODO: maybe the showPause should be put into the state onEnter
    // TODO: the prompt of hinting the player not to do the word mathing should be put into a more flexible state
    
    initStPromptTurn() {
        let state = this.normalGameFsm.getState("PromptTurn");
        state.setOnEnter(s=>{
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.ui.hud.rightBtns[2];
        state.addSubtitleAction(this.subtitle, "OK, what about we give you a choice to turn non-4O4s into 4O4?", false).finishImmediatly()
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.setOnExit(s=>{            
            targetBtn.hideAttachedBubble();
        })
    }

    initStPrmoptAutoTurn() {
        let state = this.normalGameFsm.getState("PromptAutoTurn");
        state.setOnEnter(s=>{
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.ui.hud.rightBtns[3];
        state.addSubtitleAction(this.subtitle, "Tired of turning them manually?", false).finishImmediatly()
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.setOnExit(s=>{            
            targetBtn.hideAttachedBubble();
        })
    }
    
    initStPrmoptCreator() {
        let state = this.normalGameFsm.getState("PromptCreator");
        state.setOnEnter(s=>{
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.ui.hud.rightBtns[4];
        // state.addSubtitleAction(this.subtitle, "An automatic typer that marks things as BAD for you.\n How nice it is!", false).finishImmediatly()
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.setOnExit(s=>{            
            targetBtn.hideAttachedBubble();
        })
    }
}