/// <reference path="scene-1.ts" />
class Scene1L2 extends Scene1 {
    constructor() {
        super('Scene1L2');
    }

    
    getGamePlayFsmData(): IFsmData {
        return normal_1_2;
    }
    
    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);
        this.initNormalGameFsm();       

        this.hp.initMaxHealth(10);
    }
    
    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();

        this.updateObjects.push(this.gamePlayFsm);
    }



    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
        state.addDelayAction(this, 500)
            .addEventAction("START");

    }

    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
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
            .addSubtitleAction(this.subtitle, "Whoops, sorry, I lied.", true)
            .addSubtitleAction(this.subtitle, "Actually, 65536 is not 65536.", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "It's just 0, if you've taken the algorithm class.\nIt's a joke. Haha", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "What's with the frown? I guess you don't think it's fun. Whatever.", true)
            .addSubtitleAction(this.subtitle, "Let's continue with our experiment", true)         
            .addSubtitleAction(this.subtitle, "As you can see, we don't have those labels anymore.", true)
            .addSubtitleAction(this.subtitle, "But I don't really think you need them.", true)
            .addSubtitleAction(this.subtitle, "It might be a little bit harder, but it's also really fun, right?", true)
            .addSubtitleAction(this.subtitle, "If you have an MFA degree in Game Design like me,\nyou'll know that ambiguity is what makes fun happen!", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "Alright, this time I won't say 65536 again\n", true)
            .addSubtitleAction(this.subtitle, "See? I'm more merciful than I used to be", true)
            .addSubtitleAction(this.subtitle, "This time you only need to help me eliminate 255 more,\nand I'll just tell you the secret of universe.", false)
            .addDelayAction(this, 10000)
            .addAction(s=>{
                this.getController().gotoNextScene();
            })

    }
}