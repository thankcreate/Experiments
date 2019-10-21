class Scene1L2 extends Scene1 {
    constructor() {
        super('Scene1L2');
    }

    
    getNormalGameFsm(): IFsmData {
        return normal_1_2;
    }
    
    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initNormalGameFsm();       

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
            let health = 4;
            let duration = 50000;

            this.enemyManager.startSpawnStrategy(
                SpawnStrategyType.RandomFlow,
                { enemyDuration: duration, health: health })
        });

        state
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "Hahahahaha", true)
            .addSubtitleAction(this.subtitle, "Sorry, I lied", true)
            .addSubtitleAction(this.subtitle, "Actually, 65536 is not 65536", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "It's just 0, if you have taken the algorithm class.\nIt's a joke. Haha", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "I guess you don't think it's fun. But, whatever", true)
            .addSubtitleAction(this.subtitle, "Let's continue our experiment", true)         
            .addSubtitleAction(this.subtitle, "As you can see, we don't have those labels now", true)
            .addSubtitleAction(this.subtitle, "But I don't really think you need them", true)
            .addSubtitleAction(this.subtitle, "It might be a little bit harder, but we also got some fun, right?", true)
            .addSubtitleAction(this.subtitle, "If you have a master's degree in game design like me,\nyou will know that ambiguity is what makes fun happen!", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "OK, this time, I won't say 65536 again\n", true)
            .addSubtitleAction(this.subtitle, "See? I'm more merciful than I used to be", true)
            .addSubtitleAction(this.subtitle, "This time you only need to help me eliminate 255 more,\nand I'll just let you know the secret of universe.", false)
            .addDelayAction(this, 10000)
            .addAction(s=>{
                window.location.replace(window.location.origin + "?level=3");
            })

    }
}