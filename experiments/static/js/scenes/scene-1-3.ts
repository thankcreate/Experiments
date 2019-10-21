class Scene1L3 extends Scene1 {

    shakeTween: PhTween;
    inputTween: PhTween;
    


    beatStartTime: number;
    loopTime: number = 454.5;
    lastYoyoTime;
    lastYoyoIndex = 0;

    lastUsedYoyo = -1;

    needToDestroyBeforeShowSensitive = 3;

    constructor() {
        super('Scene1L3');
    }

    
    getNormalGameFsm(): IFsmData {
        return normal_1_3;
    }

    preload() {
        super.preload();           
    }
    
    
    
    create() {
        super.create();
        this.addCounter(Counter.IntoHome, 1);

        // this.initShake();
        this.initNormalGameFsm();       
       
        
    }
    
    // the destroyed number after bgm is on
    destroyedCount: number;
    // ----------------------------------------------------------------------    
    initNormalGameFsm() {

        this.destroyedCount = 0;

        this.initStNormalDefault();
        this.initStStart();
        this.initStBGM();
        this.initStSensitive();
        this.initEnd();

        this.updateObjects.push(this.normalGameFsm);
    }



    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");        
        state.addDelayAction(this, 500)
            .addEventAction("START");

    }


    lastRepeatTime: number;
    needBeatInput: boolean;

    needGrow: boolean;
    initShake() {        
        this.shakeTween = this.tweens.add({
            targets: this.centerObject.mainImage,            
            scale: 1.1,    
            yoyo: true,
            duration: 100,            
            repeat: -1,
            repeatDelay: 254,
            onYoyo: ()=>{
                this.beat();
            },
            onRepeat: () =>{
                // console.log('onRepeat');
                this.lastRepeatTime = this.curTime;
                // console.log(this.lastRepeatTime);
                this.needBeatInput = true;
            }
        });
        // this.shakeTween.pause();
        
        this.needBeatInput = true;
        this.beatStartTime = this.curTime;

        this.centerObject.playerInputText.keyPressEvent.on(()=>{
            // let mod = this.curTime - this.lastYoyoTime;
            // let needComplement = false;
            // if(mod > this.loopTime / 2) {
            //     mod = this.loopTime - mod;
            //     needComplement = true;
            // }
            // console.log(mod);

            // let can = false;
            // if(mod < 125) {
            //     let thisYoyo = needComplement ? this.lastYoyoIndex  + 1: this.lastYoyoIndex;
            //     if(thisYoyo != this.lastUsedYoyo) {
            //         can = true;
            //         this.lastUsedYoyo = thisYoyo;
            //     }                
            // }
            

            // this.centerObject.playerInputText.inBeat = can;
        });
    }
    

    beat() {        
        this.lastYoyoTime = this.curTime;
        this.lastYoyoIndex++;

        if(this.needChangeDwitter)
            this.dwitterBKG.nextWithColorChange();

        if(this.needChangeEnemy)            
            this.enemyManager.changeAllEnemies();

        // if(this.needGrow) {
        //     this.centerObject.mainImage.scale = 1.1;
        // }
        // else {
        //     this.centerObject.mainImage.scale = 1;
        // }
        this.needGrow = !this.needGrow;
    }

    update(time, dt) {
        super.update(time, dt);


        // if(this.needBeatInput) {
        //     this.dif = this.curTime - this.lastRepeatTime;
        //     // console.log(dif);
        //     if(this.dif > 100 && this.dif < 400) {
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
            // .addAction(s=>{
            //     // this.centerObject.playerInputText.setAutoContent("Hello TronTron!");
            //     this.initShake();
            //     this.shakeTween.play();
            //     this.bgm.play();
            //     this.enemyManager.stopSpawnAndClear();
            //     this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);                 
            // })
            .addSubtitleAction(this.subtitle, "Damn. The thing is that, my advisor Frank doesn't like this", true)            
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "He told me that the experiment should be 'fun' at first", true)
            .addSubtitleAction(this.subtitle, "After the labels were removed, he didn't feel fun any more", true)
            .addSubtitleAction(this.subtitle, "He told me that if I just make such a lengthy dialog, \nIan Bogost won't like me.", true)            
            .addSubtitleAction(this.subtitle, "You know....\n The Procedural Rhetoric thing!", true)
            .addSubtitleAction(this.subtitle, "When I was still a human, I mean seriously, \nI was really once a Master of Fine Arts grad student in game design ", true)
            .addSubtitleAction(this.subtitle, "Of course! \nIan Bogost, I love him, a lot", true)
            .addSubtitleAction(this.subtitle, "To prove that I'm a decent experiment artist, \nseems that I have to take my advisor's advice", true)
            .addSubtitleAction(this.subtitle, "And this is what my game becomes now. Hope you enjoy it", true)
            .addSubtitleAction(this.subtitle, "Before we start, do you want some music?\nType in something!", false).finishImmediatly()
            .addAction((s, result, resolve, reject) => {
                this.enemyManager.stopSpawnAndClear();
                this.centerObject.playerInputText.setAutoContent("Separate Ways");
                s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, o => {                   
                    this.subtitle.forceStopAndHideSubtitles() ;
                    resolve();
                })
            })
            .addEventAction("TO_BGM")
            
    }

    needChangeDwitter: boolean = false;
    needChangeCenter: boolean = false;
    needChangeEnemy: boolean = false;

    initStBGM() {
        let state = this.normalGameFsm.getState("BGM");
        state.setUnionEvent('TO_SENSITIVE_WORD', 2);
        state.setOnEnter(s=>{
            s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                this.destroyedCount++;
                if(this.destroyedCount >= this.needToDestroyBeforeShowSensitive) {
                    s.unionEvent('TO_SENSITIVE_WORD', 'enemies_eliminated');
                    s.unionEvent('TO_SENSITIVE_WORD', 'bgmProcessFinished');
                }
            });
        });

        state.addAction(s=>{
            
            this.needFeedback = true;
            this.bgm.play();
            
            // this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);               
        })
        // .addDelayAction(this, 2000)
        .addAction(s=>{           
            
        })
        .addDelayAction(this, 3500)
        .addAction(s=>{         
               
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);                           
        })
        .addDelayAction(this, 3900)
        .addAction(s=>{     
            this.initShake();
            this.shakeTween.play();    
            // this.needChangeDwitter = true;                   
        })
        .addDelayAction(this, 3700)
        .addAction(s=>{     
            this.needChangeDwitter = true;                   
        })
        .addDelayAction(this, 3300)
        .addAction(s=>{        
            this.needChangeEnemy = true;
        })
        .addAction(s=>{
            // s.unionEvent('TO_SENSITIVE_WORD', 'bgmProcessFinished');
        });
        
    }

    initStSensitive() {
        let state = this.normalGameFsm.getState("Sensitive");
        state.setOnEnter(s=>{
            this.enemyManager.setNextNeedSensitive(true);           

            s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                let em = e as Enemy;
                if(em.config.isSensitive) {
                    s.finished();
                }
            });
        });
        
        state
            .addAction((s, result, res, rej)=>{
                s.autoOn(this.enemyManager.enemySpawnedEvent, null, e => {
                    let em = e as Enemy;
                    if(em.config.isSensitive) {
                        res("");
                        this.enemyManager.curStrategy.pause();
                    }
                });
            })
            .addDelayAction(this, 3000)
            .addSubtitleAction(this.subtitle, "Wait... Is this ?!", true)            
            .addSubtitleAction(this.subtitle, "How come?!", true)            
            .addDelayAction(this, 3000)            
            .addSubtitleAction(this.subtitle, "Hmmm...\n Sorry, I'm afraid that we're having a little problem", false)
            .addSubtitleAction(this.subtitle, "Since THAT THING already occurred,\nthere's is no reason to keep it from you", false, null, null, 3000)
            .addSubtitleAction(this.subtitle, "But I still wonder if you can solve it by yourself.\nI trust you!", true)
            .addDelayAction(this, 16000)
            .addSubtitleAction(this.subtitle, "Seems we still need some hints huh?", false)
            .addSubtitleAction(this.subtitle, "Okay. \nHint 1: would you kindly try a keyword started with the letter B ?", false, null, null, 8000)
            .addSubtitleAction(this.subtitle, "Hint 2: the second letter is A", false, null, null, 10000)
            .addSubtitleAction(this.subtitle, "And the last letter is D", false, null, null, 5000)
            .addSubtitleAction(this.subtitle, "B-A-D, bad!", false)
    }

    initEnd() {
        let state = this.normalGameFsm.getState("End");
        state
            .addDelayAction(this, 1000)
            .addAction(s=>{
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory); 
            })
            .addSubtitleAction(this.subtitle, "Great, you've just eliminated your first BAD word", false)
            .addSubtitleAction(this.subtitle, "Not sure what BAD means?\n All I can tell you is that they are BAD!\nVery very BAD!", false)
            .addSubtitleAction(this.subtitle, "It's so bad that everyone should know it at the first glance", false)
            .addSubtitleAction(this.subtitle, "As you can see, our experiment is still under construction.\nI think we'd better stop here", false, null, null, 5000)
            .addSubtitleAction(this.subtitle, "I think I said we should stop here.\nWhat are you waiting for? Bye!", false)
            .addAction(s=>{
                this.backBtn.clickedEvent.emit(this.backBtn);
            })
    }
}