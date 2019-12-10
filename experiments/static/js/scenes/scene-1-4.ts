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
        this.updateObjects.push(this.normalGameFsm);
    }

    needShowEcoAboutAtStartup() : boolean {
        return false;
    }
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state
            .addDelayAction(this, 500)
            .addAction(s=>{
                if(this.needShowEcoAboutAtStartup()) {
                    let dialog = this.overlay.showEcnomicDialog();
                    dialog.singleUseClosedEvent.on(()=>{
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
        state.setOnEnter(s=>{
            // this.enemyManager.sensetiveDuration = 60000;
            // // this.needFeedback = true;
            // this.enemyManager.setNextNeedSensitiveAlways(true);     
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.ClickerGame);

            // if((this.enemyManager.curStrategy as SpawnStrategyClickerGame).normalNormalCount >= 1 ) {
            //     s.event('WARN') ;
            // }            
        })
        .addSubtitleAction(this.subtitle, "Seems I have to admit that I'm a bad experiment designer", true)
        .addSubtitleAction(this.subtitle, "I really don't know why those 4O4s keep coming.\nHowever, I think you'll surely help me get rid of them, right?", true)
        .addAction(s=>{
            this.hud.showContainerRight();            
        })        
        .addSubtitleAction(this.subtitle, "Don't worry! I've prepared some handy tools for you,\nbut everything comes with a PRICE.\n And let's just define the PRICE as the SCORE you've got", true)
        .addSubtitleAction(this.subtitle, "Remember! I'm always on YOUR side.", true)
        .addFinishAction();
    }

    hasWarnKey = 'HasWarn';

    initStateIdle() {
        let state = this.normalGameFsm.getState("Idle");
        state.setOnEnter(s=>{
            
        });
        state.setOnUpdate(s=>{
            if(this.getCurClickerStrategy().normalNormalCount >= 1 && !this.normalGameFsm.getVar(this.hasWarnKey, false)) {
                this.normalGameFsm.setVar(this.hasWarnKey, true);
                s.event('WARN');
            }               
        });
    }

    getCurClickerStrategy() : SpawnStrategyClickerGame{
        return this.enemyManager.curStrategy as SpawnStrategyClickerGame;
    }

    initWarn() {
        let state = this.normalGameFsm.getState("Warn");
        state.setOnEnter(s=>{
            
        })
        .addSubtitleAction(this.subtitle, "Can't you read? ", true)
        .addSubtitleAction(this.subtitle, "You can ONLY benefit from eliminating 4O4s. \n Why are you still so obsessed with the word matching!", true, null, null, 4000)
        .addSubtitleAction(this.subtitle, "Just be a reasonable person! Seriously!", true, null, null, 2000);
    }   
}