class Scene1L4 extends Scene1 {
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
            this.enemyManager.setNextNeedSensitive(true);     
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.SpawnOnEliminatedAndReachCore);
            
        });
        state.addSubtitleAction(this.subtitle, "Sorry, I have to admit that I'm a bad experiment designer", true);
        state.addSubtitleAction(this.subtitle, "In my original design, those 404s shouldn't be here.\nBut I don't know why they keep coming more and more.", true);
        state.addSubtitleAction(this.subtitle, "However, I think you'll surely help me get rid of them, right?", true);
        state.addSubtitleAction(this.subtitle, "Don't worry, I've prepared some handy tools for you,\nbut everything comes with a PRICE.", true);
        state.addSubtitleAction(this.subtitle, "And let's just define the PRICE as the SCORE you've got", true);
        state.addSubtitleAction(this.subtitle, "Remember, I'm always on YOUR side.", true);
        
    }
}