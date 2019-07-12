/// <reference path="scene-controller.ts" />

/**
 * Game Mode is what you choose from home mode select
 */
enum GameMode {
    Normal,
    Zen,
}

/**
 * EntryPoint is like a status/mode you entered the game mode
 * It's purpose is to differentiate whether it's from a die restart
 * Or it's a game from home page
 */
enum EntryPoint {
    FromHome,
    FromDie,    
}

enum Counter {
    None,
    IntoHome,
    IntoNormalMode,
}

class Scene1 extends BaseScene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;
    container: Phaser.GameObjects.Container;
    abContainer: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;
    playerInput: PlayerInputText;
    centerObject: CenterObject;
    footer: PhImage;

    mainFsm: Fsm;
    normalGameFsm: Fsm;

    dwitterCenter: Dwitter;
    dwitterBKG: Dwitter65537

    initDwitterScale: number = 0.52;

    subtitle: Subtitle;
    backBtn: Button;

    hp: HP;
    died: Died;

    footerInitPosi: PhPoint;
    hpInitPosi: PhPoint;

    mode: GameMode = GameMode.Normal;
    entryPoint: EntryPoint = EntryPoint.FromHome;

    homeCounter: number = 0;

    counters: Map<Counter, number> = new Map();

    constructor() {
        super('Scene1');

        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };

        this.container;

        this.enemyManager;
    }

    preload() {
        this.load.image('circle', 'assets/circle.png');
        this.load.image('speaker_dot', 'assets/speaker_dot.png');
        this.load.image('speaker', 'assets/speaker.png');
        this.load.image('footer', 'assets/footer.png');
        this.load.image('unit_white', 'assets/unit_white.png')
    }



    create() {
        this.container = this.add.container(400, 299);
        this.abContainer = this.add.container(0, 0);



        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);

        // Add confirmed listener for confirmedEvent to enemyManager
        this.centerObject.playerInputText.confirmedEvent.on(
            input => {
                this.enemyManager.inputTextConfirmed(input)
                this.time.delayedCall(300, () => {
                    this.dwitterBKG.next();
                }, null, null);
            });


        // Dwitters         
        this.dwitterCenter = new Dwitter65536(this, this.container, 0, 0, 1920, 1080, true).setScale(this.initDwitterScale);
        this.dwitterBKG = new Dwitter65537(this, this.container, 0, 0, 2400, 1400, true);


        // Bottom badge
        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = this.add.image(footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, "footer").setOrigin(0, 1);
        this.footerInitPosi = MakePoint(this.footer);
        this.fitImageToSize(this.footer, 100);


        // Subtitle
        this.subtitle = new Subtitle(this, this.container, 0, 370);


        // Back button
        this.backBtn = new Button(this, this.abContainer, 100, 50, '', '< exit()', 180, 80, false).setEnable(false, false);
        this.backBtn.text.setColor('#000000');
        this.backBtn.text.setFontSize(44);


        // HP        
        let hpBottom = 36;
        let hpLeft = 36;
        this.hp = new HP(this, this.abContainer, hpLeft, phaserConfig.scale.height - hpBottom);
        this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        this.hp.inner.y += 250;

        // Died layer
        this.died = new Died(this, this.container, 0, 0);
        this.died.hide();


        // Main FSM
        this.mainFsm = new Fsm(this, this.getMainFsm());
        this.normalGameFsm = new Fsm(this, this.getNormalGameFsm());
        this.initMainFsm();
        this.initNormalGameFsm();

        // Sub FSM: normal game
    }



    fitImageToSize(image: PhImage, height: number, width?: number, ) {
        let oriRatio = image.width / image.height;
        image.displayHeight = height;
        if (width) {
            image.displayWidth = width;
        }
        else {
            image.displayWidth = oriRatio * height;
        }
    }


    update(time, dt) {
        super.update(time, dt);

        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);
        this.enemyManager.update(time, dt);
        this.centerObject.update();
    }

    getMainFsm(): IFsmData {
        return mainFsm;
    }

    getNormalGameFsm(): IFsmData {
        return normalGameFsm;
    }

    initMainFsm() {


        this.initStHome();
        this.initStFirstMeet();
        this.initStModeSelect();
        this.initStHomeToGameAnimation();
        this.initStNormalGame();
        this.initStBackToHomeAnimation();
        this.initStDied();
        this.initStRestart();
        this.initStSecondMeet();

        this.updateObjects.push(this.mainFsm);
        this.mainFsm.start();
    }


    getCounter(key: Counter, def?: number) {
        if (notSet(def)) def = 0;

        let res = this.counters.get(key);
        if (notSet(res)) {
            this.counters.set(key, def);
            res = def;
        }
        return res;
    }

    addCounter(key: Counter, def?: number) {
        if (notSet(def)) def = 0;

        let res = this.getCounter(key, def);
        res++;
        this.counters.set(key, res);
    }

    firstIntoHome(): boolean {
        return this.getCounter(Counter.IntoHome) == 1;
    }

    firstIntoNormalMode(): boolean {
        return this.getCounter(Counter.IntoNormalMode) == 1;
    }

    setEntryPointByIncomingEvent(evName: string) {
        this.setEntryPoint(evName.toLowerCase().indexOf('restart') >= 0 ? EntryPoint.FromDie : EntryPoint.FromHome);
    }

    initStHome() {
        let state = this.mainFsm.getState("Home");
        state.setAsStartup().setOnEnter(s => {
            this.addCounter(Counter.IntoHome);

            this.subtitle.startMonologue();
            this.dwitterBKG.toBlinkMode();
            this.dwitterBKG.toBlinkMode();


            let mainImage = this.centerObject.mainImage;
            s.autoSafeInOutClick(mainImage,
                e => {
                    console.log('hahao');
                    this.centerObject.playerInputText.homePointerOver();
                    this.dwitterBKG.toStaticMode();
                },
                e => {
                    this.centerObject.playerInputText.homePointerOut();
                    this.dwitterBKG.toBlinkMode();
                },
                e => {
                    this.centerObject.playerInputText.homePointerDown();
                    this.dwitterBKG.toStaticMode();
                    this.subtitle.stopMonologue();

                    let firstIn = this.firstIntoHome();
                    if (firstIn)
                        s.event('TO_FIRST_MEET');
                    else
                        s.event('TO_SECOND_MEET');
                });
        });
    }

    initStFirstMeet() {
        this.mainFsm.getState("FirstMeet")
            .addSubtitleAction(this.subtitle, 'TronTron!', true)
            // .addSubtitleAction(this.subtitle, 'God! Someone finds me finally!', true)
            // // .addSubtitleAction(this.subtitle, "This is terminal 65536.\nWhich experiment do you like to take?", true)

            // .addSubtitleAction(this.subtitle, "This is terminal 65536.\nNice to meet you, human", true)
            // .addSubtitleAction(this.subtitle, "I know this is a weird start, but there's no time to explain.\nWhich experiment do you like to take?", false, null, null, 10)
            .addFinishAction();
    }

    initStSecondMeet() {
        let state = this.mainFsm.getState("SecondMeet");
        state
            .addSubtitleAction(this.subtitle, 'Want to play again?', true).finishImmediatly()
            .addFinishAction()
    }

    initStModeSelect() {
        //* Enter Actions
        let state = this.mainFsm.getState("ModeSelect");
        // Hide content of centerObject
        state
            .addAction(() => {

                this.centerObject.speakerBtn.inner.alpha = 0;
                
                this.centerObject.playerInputText.stopTitleTween();
                this.centerObject.playerInputText.title.alpha = 0;
            })
            // Rotate the center object to normal angle   
            .addTweenAction(this, {
                targets: this.centerObject.inner,
                rotation: 0,
                duration: 600,
            })
            // Show Mode Select Buttons
            .addAction((s: FsmState, result, resolve, reject) => {
                this.centerObject.btnMode0.setEnable(true, true);
                this.centerObject.btnMode1.setEnable(true, true);

                s.autoOn(this.centerObject.btnMode0.clickedEvent, null, () => {
                    this.setMode(GameMode.Normal);
                    resolve('clicked');
                });

                s.autoOn(this.centerObject.btnMode1.clickedEvent, null, () => {
                    this.setMode(GameMode.Zen);
                    resolve('clicked');
                });
            })
            .addSubtitleAction(this.subtitle, 'Good choice', true, 2000, 1000, 100).setBoolCondition(o => this.firstIntoHome())
            .addAction(() => {
                this.centerObject.btnMode0.setEnable(false, true);
                this.centerObject.btnMode1.setEnable(false, true);
            })
            // Show back the content of centerObject
            .addTweenAllAction(this, [
                {
                    targets: [this.centerObject.speakerBtn.inner, this.centerObject.playerInputText.title],
                    alpha: 1,
                    duration: 400
                }
            ]).finishImmediatly()
            .addSubtitleAction(this.subtitle, s=>{return (this.mode === GameMode.Normal ? 'Normal' : 'Zen') + ' mode, start!'}
                , true, null, null, 1)
            .addFinishAction();
    }



    initStHomeToGameAnimation() {
        let dt = 1000;
        let state = this.mainFsm.getState("HomeToGameAnimation")
        state.addTweenAllAction(this, [
            // Rotate center to normal angle
            {
                targets: this.centerObject.inner,
                rotation: 0,
                scale: this.centerObject.gameScale,
                duration: dt,
            },
            // Scale out the outter dwitter
            {
                targets: this.dwitterCenter.inner,
                alpha: 0,
                scale: 2,
                duration: dt,
            },
            {
                targets: this.hp.inner,
                y: this.hpInitPosi.y,
                duration: dt,
            },
            {
                targets: this.footer,
                y: "+= 250",
                duration: dt,
            }
        ])
            .addDelayAction(this, 1000)
            .addFinishAction();


    }

    /**
     * We have 2 paths to get to NormalGame: \
     * Home -> ... -> NormalGame \
     * NormalGame -> ... -> Died -> ... -> NormalGame 
     * Currently the way to judge if it's from the died way is from \
     * the FsmState property 'fromEvent'  
     * TODO: Judging from 'fromEvent' is not a good way, will change later
     */
    initStNormalGame() {
        // this is a everlasting event
        // whenever the backBtn is enabled
        // it should be regarded as can accept click
        this.backBtn.clickedEvent.on(e => {
            this.mainFsm.event("BACK_TO_HOME");
        });

        let state = this.mainFsm.getState("NormalGame");
        state.setOnEnter(s => {
            this.setEntryPointByIncomingEvent(s.fromEvent);
            this.normalGameFsm.start();
            // Hide title and show speaker dots
            this.centerObject.prepareToGame();
            this.backBtn.setEnable(true, true);


            // Back
            s.autoOn($(document), 'keydown', e => {
                if (e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                    s.event("BACK_TO_HOME");   // <-------------
                }
            });

            // Player input
            s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
            s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));

            // Damage handling
            s.autoOn(this.enemyManager.enemyReachedCoreEvent, null, e => {
                let enemy = <Enemy>e;
                this.hp.damageBy(enemy.health);
            });

            // Dead event handling
            s.autoOn(this.hp.deadEvent, null, e => {
                s.event("DIED");
            })
        });

        state.setOnExit(s => {
            this.normalGameFsm.stop();

            // Stop all subtitle and sounds
            this.subtitle.forceStopAndHideSubtitles();
        })

        // Check mode and dispatch
        state.addDelayAction(this, 1500)
            .addAction(s => {
                if (this.mode === GameMode.Normal) {
                    this.addCounter(Counter.IntoNormalMode);
                    if (this.firstIntoNormalMode())
                        s.event('TUTORIAL_START', this.normalGameFsm);
                    else
                        s.event('NORMAL_START', this.normalGameFsm);
                }
                else if (this.mode === GameMode.Zen) {
                    alert('Haha, not finished yet~');
                }
            })



    }

    /**
     * Event: BACK_TO_HOME sent by backBtn (everlasting)
     * Event: RESTART sent by restartBtn
     */
    initStDied() {
        let state = this.mainFsm.getState("Died");
        state.addAction((s, result, resolve, reject) => {
            // Stop all enemies
            this.enemyManager.freezeAllEnemies();



            // Show the died overlay
            this.died.show();

            s.autoOn(this.died.restartBtn.clickedEvent, null, () => {
                s.event("RESTART");
                resolve('restart clicked');
            });


        })

        state.setOnExit(() => {
            this.hp.reset();
            this.enemyManager.stopSpawnAndClear();
            this.died.hide();
            this.normalGameFsm.restart(true);
        });
    }

    initStRestart() {
        let state = this.mainFsm.getState("Restart");
        state.addAction(s => {
            s.event("RESTART_TO_GAME");
        })
    }



    initStBackToHomeAnimation() {
        let dt = 1000;
        this.mainFsm.getState("BackToHomeAnimation")
            .addAction(() => {
                this.centerObject.prepareToHome();
                this.enemyManager.stopSpawnAndClear();
                this.backBtn.setEnable(false, true);
            })
            .addDelayAction(this, 300)
            .addTweenAllAction(this, [
                {
                    targets: this.centerObject.inner,
                    rotation: this.centerObject.initRotation,
                    scale: this.centerObject.homeScale,
                    duration: dt,
                },
                {
                    targets: this.dwitterCenter.inner,
                    alpha: 1,
                    scale: this.initDwitterScale,
                    duration: dt,
                },
                {
                    targets: this.hp.inner,
                    y: "+= 250",
                    duration: dt,
                },
                {
                    targets: this.footer,
                    y: this.footerInitPosi.y,
                    duration: dt,
                }
            ])
            .addFinishAction();
    }

    setMode(mode: GameMode) {
        this.mode = mode;
    }

    setEntryPoint(ep: EntryPoint) {
        this.entryPoint = ep;
    }

    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStTutorialStart();
        this.initStExplainHp();
        this.initStFlowStrategy();
        this.initStNormalStart();

        this.updateObjects.push(this.normalGameFsm);
    }

    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
    }

    initStTutorialStart() {
        let state = this.normalGameFsm.getState("TutorialStart");

        // Invoke EXPLAIN_HP need 2 requirements(&&):
        // 1. One enemy is eliminated
        // 2. Welcome subitle is finished
        state.setUnionEvent('EXPLAIN_HP', 2);

        state
            .addAction(s => {
                // let health = 3;
                // let duration = 50000;
                let health = 100;
                let duration = 1000;

                this.enemyManager.startSpawnStrategy(
                    SpawnStrategyType.SpawnOnEliminatedAndReachCore,
                    { enemyDuration: duration, health: health })

                s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                    s.unionEvent('EXPLAIN_HP', 'one_enemy_eliminated');
                });
            })
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "To help me complete the experiment,\njust type in what's in your mind when you see the " + lastEnemyName.toLocaleLowerCase();
            }, true, 2000, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Type in anything.\nAnything you think that's related";
            }, true, 2000, 3000, 1000)
            .addAction(s => {
                s.unionEvent('EXPLAIN_HP', 'subtitle_finished');
            })
    }

    initStExplainHp() {
        let state = this.normalGameFsm.getState('ExplainHp');
        state
            .addDelayAction(this, 300)
            .addSubtitleAction(this.subtitle, s => {
                let last = this.enemyManager.getLastEliminatedEnemyInfo();
                let str = "Great, you've just got your first blood.";
                // console.log(last);
                // console.log(last.damagedBy);
                if (last && last.damagedBy && last.damagedBy.length > 0) {
                    let enemyName = last.name.toLowerCase();
                    let length = last.damagedBy.length;
                    if (length == 1)
                        str += ("\nOf course! " + last.damagedBy[0] + " can match " + enemyName);
                    else
                        str += ("\nOf course! " + last.damagedBy[0] + ' and ' + last.damagedBy[1].toLowerCase() + " can match " + enemyName);
                }
                return str;
            }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "You may have noticed the number under every item.\n It represents the health of them";
            }, true, 2000, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "The more semantically related your input is to the items,\nthe more damage they take";
            }, true, 2000, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "If you don't eliminate them before they reach me,\nyou lose your HP by their remaining health";
            }, true, 2000, 3000, 600)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Pretty simple, huh?";
            }, true, 2000, 3000, 600)
            .addDelayAction(this, 10000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "It's either you hurt them, or they hurt you.\nThat's the law of the jungle";
            }, true, 2000, 3000, 600)
            .addDelayAction(this, 500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Hurt each other! Yeah! I like it.";
            }, true, 2000, 3000, 600)
            .addEventAction("TO_FLOW_STRATEGY");
    }

    initStFlowStrategy() {
        let state = this.normalGameFsm.getState('FlowStrategy');
        state.addAction(s => {
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
        })
    }

    // Normal Start may come from a die or from home
    // If it's from die, we need add a different subtitle
    initStNormalStart() {
        let state = this.normalGameFsm.getState('NormalStart');
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            .addDelayAction(this, 1500)
            .addSubtitleAction(this.subtitle, s => {        
                if(this.entryPoint === EntryPoint.FromDie)        
                    return "Calm down. Don't give up."
                else
                    return "I just know it! You'll come back. Haha";
            }, true, 2000, 3000, 1500)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, s => {                
                return "I can get that this experiment is a little bit boring indeed.\n"
            }, true, 2000, 3000, 500)
            .addSubtitleAction(this.subtitle, s => {                
                return "But I have my reasons"
            }, true, 2000, 3000, 1500)
    }
}

