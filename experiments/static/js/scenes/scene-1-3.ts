class Scene1L3 extends Scene1 {

    shakeTween: PhTween;
    inputTween: PhTween;
    bgm: Phaser.Sound.BaseSound;
    constructor() {
        super('Scene1L3');
    }

    
    getNormalGameFsm(): IFsmData {
        return normal_1_3;
    }

    preload() {
        super.preload();   
        this.load.audio("bgm_1", "assets/audio/SeperateWays.mp3");
    }
    
    
    
    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);

        this.initShake();
        this.initNormalGameFsm();       
        this.bgm = this.sound.add('bgm_1');
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


    lastRepeatTime: number;
    needBeatInput: boolean;
    initShake() {        
        this.shakeTween = this.tweens.add({
            targets: this.centerObject.mainImage,            
            scale: 1.1,    
            yoyo: true,
            duration: 100,            
            repeat: -1,
            repeatDelay: 235,
            onYoyo: ()=>{
                this.dwitterBKG.nextWithColorChange();
                this.enemyManager.changeAllEnemies();
            },
            onRepeat: () =>{
                // console.log('onRepeat');
                this.lastRepeatTime = this.curTime;
                // console.log(this.lastRepeatTime);
                this.needBeatInput = true;
            }
        });
        this.shakeTween.pause();
    }

    update(time, dt) {
        super.update(time, dt);

        // if(this.needBeatInput) {
        //     let dif = this.curTime - this.lastRepeatTime;
        //     if(dif > 200 && dif < 400) {
        //         this.centerObject.playerInputText.inBeat = true;
        //     }
        //     else {
        //         this.centerObject.playerInputText.inBeat = false;
        //     }
        // }
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
            .addAction(s=>{
                // this.shakeTween.play();
                // this.bgm.play();
                // this.enemyManager.stopSpawnAndClear();
                // this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);                 
            })
            .addSubtitleAction(this.subtitle, "Damn. The thing is that, my advisor Frank doesn't like this", true)            
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "He told me that the experiment should be fun at first", true)
            .addSubtitleAction(this.subtitle, "After the labels were removed, he didn't feel fun any more", true)
            .addSubtitleAction(this.subtitle, "He told me that if I just make such a lengthy dialog, \nIan Bogost won't like me.", true)            
            .addSubtitleAction(this.subtitle, "You know....\n The Procedural Rhetoric thing!", true)
            .addSubtitleAction(this.subtitle, "When I was still a human, I mean seriously, \nI was really once a Master of Fine Arts grad student in game design ", true)
            .addSubtitleAction(this.subtitle, "Of course! \nIan Bogost, I love him, a lot", true)
            .addSubtitleAction(this.subtitle, "To prove that I'm a decent experiment artist, \nseems that I have to take my advisor's advice", true)
            .addSubtitleAction(this.subtitle, "And this is what my game becomes now.", true)
            .addSubtitleAction(this.subtitle, "Hope you enjoy it", true)            
            .addAction(s=>{
                this.shakeTween.play();
                this.bgm.play();
                this.enemyManager.stopSpawnAndClear();
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);               
            });
    }
}