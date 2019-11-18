class Scene1L4 extends Scene1 {

    upgrade1: Button;

    constructor() {
        super('Scene1L4');
    }

    getNormalGameFsm(): IFsmData {
        return normal_1_4;
    }
    
    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);

        // this.initShake();
        this.initNormalGameFsm();       
       
        this.hp.initMaxHealth(100);
        this.createBtns();
    }

    createBtns() { 
        // this.upgrade1 = new Button(this, )
    }

    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();

        this.updateObjects.push(this.normalGameFsm);
    }

    
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state.addDelayAction(this, 500)
            .addEventAction("START");

    }

    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.setOnEnter(s=>{
            this.enemyManager.sensetiveDuration = 60000;
            // this.needFeedback = true;
            this.enemyManager.setNextNeedSensitiveAlways(true);     
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.SpawnOnEliminatedAndReachCore);
            
        });
        state.addSubtitleAction(this.subtitle, "Sorry, I have to admit that I'm a bad experiment designer", true);
        state.addSubtitleAction(this.subtitle, "I really don't know why those 4O4s keep coming more and more.\nHowever, I think you'll surely help me get rid of them, right?", true);        
        state.addSubtitleAction(this.subtitle, "Don't worry! I've prepared some handy tools for you,\nbut everything comes with a PRICE.\n And let's just define the PRICE as the SCORE you've got", true);                
        state.addSubtitleAction(this.subtitle, "Remember! I'm always on YOUR side.", true);
        
    }
}