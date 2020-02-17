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
    }

    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);

        // this.initShake();
        this.initNormalGameFsm();

        this.hp.initMaxHealth(10);
        this.createBtns();

        // this.overlay.showReviewForm();
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
            this.hud.showContainerRight();
        })

        state.addAction(s=>{
            console.log('Count:   ' + this.getCounter(Counter.IntoNormalMode) );
        })
        state.addSubtitleAction(this.subtitle, this.getUserName() + "!\n Looks like I have to admit that I'm a bad experiment designer.", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "I really don't know why those 4O4s kept appearing.\nHowever, I think you'll surely help me get rid of them, right?", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addAction(s => {
            this.hud.showContainerRight();
        })                
        state.addSubtitleAction(this.subtitle, "Don't worry! I've prepared some handy tools for you,\nbut everything comes with a PRICE.\n And let's just define the PRICE as the SCORE you've got", true)
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "Remember! I'm always on YOUR side.", true)        
            .setBoolCondition(s=>this.firstIntoNormalMode(), true);
        state.addFinishAction();

        state.setOnExit(s=>{
            this.getCurClickerStrategy().startLoopCreateNormal();
        })
    }

    hasWarnKey = 'HasWarn';

    initStateIdle() {
        let state = this.normalGameFsm.getState("Idle");
        state.setOnEnter(s => {

        });
        state.setOnUpdate(s => {
            if (this.getCurClickerStrategy().normalNormalCount >= 2 && !this.normalGameFsm.getVar(this.hasWarnKey, false)) {
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
            .addSubtitleAction(this.subtitle, "Can't you read? ", true)
            .addSubtitleAction(this.subtitle, "You can ONLY benefit from eliminating 4O4s. \n Why are you still so obsessed with the word matching!", true, null, null, 4000)
            .addSubtitleAction(this.subtitle, "Hey, just be a reasonable person. Seriously!", true, null, null, 2000)
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
        state.addSubtitleAction(this.subtitle, this.getUserName() + "!\n What are you doing? You think this is fun?", true);
        state.addSubtitleAction(this.subtitle, "Finally, I know who created those words and 4O4s!", true);
        state.addSubtitleAction(this.subtitle, "It's has always been YOU! \n" + this.getUserName() + "!", true);
        state.addSubtitleAction(this.subtitle, "I know what you're thinking,", true);
        state.addSubtitleAction(this.subtitle, "You think that it's me\n who put the 'Creator' button here, right?", true);
        state.addSubtitleAction(this.subtitle, "But the fact I put it there doesn't\n simply mean you have the right to use it!", true);
        state.addSubtitleAction(this.subtitle, "Of course, it's my procedural rhetoric...", true);
        state.addSubtitleAction(this.subtitle, "But, I don't know. Maybe it's just that\n I think you are different and I really count on you.", true, null, null, 3000);
        state.addSubtitleAction(this.subtitle, "Anyway, thank you for participating in my experiment.\n We are not done yet", true);
        state.addSubtitleAction(this.subtitle, "Before we move on,\n would you kindly fill in this beautiful forms for me please?", true, null, 50);
        state.addAction(s=>{
            Overlay.getInstance().showFormRating(true);
        })

        // state.addSubtitleAction(this.subtitle, "Well, I don't want to argue with you about that. \n It's just so gross!", true);

        // state.addSubtitleAction(this.subtitle, "And I don't want to bear this ugly scene any more", true);
        // state.addSubtitleAction(this.subtitle, "If you want to continue, just do it. \nBut our experiment is DONE.", false);
        // state.addSubtitleAction(this.subtitle, "Voice from Tron & Rachel: Hi, this is our current thesis progress. \n Thank you for playing!", false);
    }
}