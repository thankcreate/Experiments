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
    IntoZenMode,
    Story0Finished
}

class Scene1 extends BaseScene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;

    container: Phaser.GameObjects.Container;
    abContainer: Phaser.GameObjects.Container;
    overlayContainer: Phaser.GameObjects.Container;

    enemyManager: EnemyManager;
    playerInput: PlayerInputText;
    centerObject: CenterObject;

    overlay: Overlay;

    mainFsm: Fsm;
    normalGameFsm: Fsm;
    zenFsm: Fsm;

    dwitterCenter: Dwitter;
    dwitterBKG: Dwitter65537

    initDwitterScale: number = 0.52;

    subtitle: Subtitle;
    backBtn: Button;

    ui: UI;

    hud: Hud;
    private _hp: HP;
    died: Died;

    hpInitPosi: PhPoint;

    mode: GameMode = GameMode.Normal;
    entryPoint: EntryPoint = EntryPoint.FromHome;

    homeCounter: number = 0;

    counters: Map<Counter, number> = new Map();

    playerName: string = "";
    leaderboardManager: LeaderboardManager;



    constructor() {
        super('Scene1');

        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };

        this.container;

        this.enemyManager;
    }

    get hp(): HP {
        return this.hud.hp;
    }

    preload() {
        this.load.image('circle', 'assets/circle.png');
        this.load.image('speaker_dot', 'assets/speaker_dot.png');
        this.load.image('speaker', 'assets/speaker.png');
        this.load.image('unit_white', 'assets/unit_white.png')
        this.load.image('footer_ai', 'assets/footer_ai.png')
        this.load.image('footer_google', 'assets/footer_google.png')
        this.load.image('footer_nyu', 'assets/footer_nyu.png')
        this.load.image('footer_sep', 'assets/footer_sep.png')
        this.load.image('leaderboard_icon', 'assets/leaderboard_icon.png')
    }



    create() {
        this.container = this.add.container(400, 299);
        this.abContainer = this.add.container(0, 0);



        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);
        // Leaderboard
        this.leaderboardManager = LeaderboardManager.getInstance();

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


        // Subtitle
        this.subtitle = new Subtitle(this, this.container, 0, 370);


        // Back button
        this.backBtn = new Button(this, this.abContainer, 100, 50, '', '< exit()', 180, 80, false).setEnable(false, false);
        this.backBtn.text.setColor('#000000');
        this.backBtn.text.setFontSize(44);


        // HP        
        // let hpBottom = 36;
        // let hpLeft = 36;
        // this.hp = new HP(this, this.abContainer, hpLeft, phaserConfig.scale.height - hpBottom);
        // this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        // this.hp.inner.y += 250;

        this.hud = new Hud(this, this.abContainer, 0, 0);

        this.ui = new UI(this, this.abContainer, 0, 0);
        this.ui.hud = this.hud;


        // Died layer
        this.died = new Died(this, this.container, 0, 0);
        this.died.hide();

        // Overlay
        this.overlayContainer = this.add.container(400, 299);
        this.overlay = new Overlay(this, this.overlayContainer, 0, 0);
        


        // Footer click event bind        
        this.ui.footer.badges[0].clickedEvent.on(() => {
            this.overlay.showAiDialog();
        });

        this.ui.footer.badges[1].clickedEvent.on(() => {
            this.overlay.showGoogleDialog();
        });

        this.ui.footer.badges[2].clickedEvent.on(() => {
            this.overlay.showAboutDialog();
        });

        this.ui.leaderboardBtn.clickedEvent.on(() => {
            this.overlay.showLeaderBoardDialog();
        });



        // Main FSM
        this.mainFsm = new Fsm(this, this.getMainFsm());
        this.normalGameFsm = new Fsm(this, this.getNormalGameFsm());
        this.zenFsm = new Fsm(this, this.getZenFsm())
        this.initMainFsm();
        this.initNormalGameFsm();
        this.initZenFsm();
        // Sub FSM: normal game
    }

    initZenFsm() {
        this.initStZenStart();
        this.initStZenIntro();
        this.updateObjects.push(this.zenFsm);
    }

    initStZenStart() {
        let state = this.zenFsm.getState("ZenStart");
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            .addDelayAction(this, 1500)
            .addAction(s => {
                if (this.firstIntoZenMode()) {
                    s.event('TO_FIRST_INTRODUCTION');
                }
            })
    }

    initStZenIntro() {
        let state = this.zenFsm.getState("ZenIntro");
        state
            .addSubtitleAction(this.subtitle, s => {
                return "Interesting!"
            }, true, 2000, 3000, 500)
            .addSubtitleAction(this.subtitle, s => {
                return "I never expect that someone would really choose the Zen mode."
            }, true, 2000, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                return "No wonder they call you " + this.playerName + ".\nI begin to wonder who you really are."
            }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                return "We have plenty of time. Just enjoy yourself, please."
            }, true, 2000, 3000, 1500)
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
        this.overlayContainer.setPosition(w / 2, h / 2);

        this.enemyManager.update(time, dt);
        this.centerObject.update();
    }

    getMainFsm(): IFsmData {
        return mainFsm;
    }

    getNormalGameFsm(): IFsmData {
        return normalGameFsm;
    }

    getZenFsm(): IFsmData {
        return zenFsm;
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

    firstIntoZenMode(): boolean {
        return this.getCounter(Counter.IntoZenMode) == 1;
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

            LeaderboardManager.getInstance().updateInfo();


            let mainImage = this.centerObject.mainImage;

            s.autoSafeInOutClick(mainImage,
                e => {
                    this.centerObject.playerInputText.showTitle();
                    this.dwitterBKG.toStaticMode();
                },
                e => {
                    this.centerObject.playerInputText.hideTitle();
                    this.dwitterBKG.toBlinkMode();
                },
                e => {
                    this.centerObject.playerInputText.changeTitleToChanged();
                    this.dwitterBKG.toStaticMode();
                    this.subtitle.stopMonologue();


                    let firstIn = this.firstIntoHome();
                    if (firstIn) {
                        s.event('TO_FIRST_MEET');
                    }
                    else
                        s.event('TO_SECOND_MEET');
                });
        });
    }

    initStFirstMeet() {
        this.mainFsm.getState("FirstMeet")
            // .addSubtitleAction(this.subtitle, 'TronTron!', true)
            .addSubtitleAction(this.subtitle, "God! Someone finds me finally!", true)

            // .addSubtitleAction(this.subtitle, "This is terminal 65536.\nWhich experiment do you like to take?", true)
            .addSubtitleAction(this.subtitle, "This is terminal 65536.\nNice to meet you, human", true)
            .addSubtitleAction(this.subtitle, "May I know your name, please?", false).finishImmediatly()
            // Rotate the center object to normal angle   
            .addTweenAction(this, {
                targets: this.centerObject.inner,
                rotation: 0,
                duration: 600,
            }).finishImmediatly()
            // Hide title
            .addAction((s, result, resolve, reject) => {
                // this.centerObject.playerInputText.hideTitle();
                this.centerObject.prepareToGame();

                // Player input
                s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
                s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));
                s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, (word) => {
                    this.playerName = word;
                    resolve(word);
                });
            })
            .addAction((s, result) => {
                // Disable input listener
                s.removeAutoRemoveListners();

                // reset speaker, hide input
                this.centerObject.prepareToHome();

                // prepareToHome don't show the title back
                // need to show title manually
                this.centerObject.playerInputText.showTitle(false);

                // pretend the AI is thinking
                this.subtitle.hideText();
            })
            .addDelayAction(this, 800)
            .addSubtitleAction(this.subtitle, s => {
                return this.playerName + "? That sounds good."
            }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, "I know this is a weird start, but there's no time to explain.\nWhich experiment do you like to take?", false, null, null, 10)


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

        state
            // Hide content of centerObject
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
            }).setBoolCondition(s => this.centerObject.inner.rotation !== 0)
            // Show Mode Select Buttons
            .addAction((s: FsmState, result, resolve, reject) => {
                this.centerObject.btnMode0.setEnable(true, true);
                this.centerObject.btnMode1.setEnable(true, true);

                s.autoOn(this.centerObject.btnMode0.clickedEvent, null, () => {
                    this.setMode(GameMode.Normal);
                    s.removeAutoRemoveListners();  // in case the player clicked both buttons quickly
                    resolve('clicked');
                });

                s.autoOn(this.centerObject.btnMode1.clickedEvent, null, () => {
                    this.setMode(GameMode.Zen);
                    s.removeAutoRemoveListners();
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
            .addSubtitleAction(this.subtitle, s => { return (this.mode === GameMode.Normal ? 'Normal' : 'Zen') + ' mode, start!' }
                , true, null, null, 1)
            .addFinishAction();
    }



    initStHomeToGameAnimation() {
        let dt = 1000;
        let state = this.mainFsm.getState("HomeToGameAnimation")
        state
            .addAction(s => {
               
                this.ui.gotoGame(this.mode);
            })
            .addTweenAllAction(this, [
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
            ])
            .addDelayAction(this, 600)
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
            this.hud.reset();
            this.setEntryPointByIncomingEvent(s.fromEvent);
            this.normalGameFsm.start();
            this.zenFsm.start();
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

            // Damage handling, only in normal mode
            if(this.mode == GameMode.Normal) {
                s.autoOn(this.enemyManager.enemyReachedCoreEvent, null, e => {
                    let enemy = <Enemy>e;
                    this.hp.damageBy(enemy.health);
                });
            }
            

            s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                let enemy = <Enemy>e;
                this.hud.addScore(1000);
            });


            // Dead event handling
            s.autoOn(this.hp.deadEvent, null, e => {
                s.event("DIED");
            })
        });

        state.setOnExit(s => {
            this.normalGameFsm.stop();
            LeaderboardManager.getInstance().reportScore(this.playerName, this.ui.hud.score);
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
                else {
                    this.addCounter(Counter.IntoZenMode);
                    s.event('START', this.zenFsm);
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
            .addAction(s => {
                this.ui.gotoHome();
            })
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
        this.initStStory0();
        this.initStStory1();

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
                let health = 3;
                let duration = 50000;
                // let health = 100;
                // let duration = 1000;

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
            }, true, 2500, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Come on, " + this.playerName + "! Type in anything.\nAnything you think that's related.";
            }, false, 2500, 3000, 1000)
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
            }, true, 2500, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "You may have noticed the number under every item.\n It represents the health of them.";
            }, true, 2500, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "The more semantically related your input is to the items,\nthe more damage they will take.";
            }, true, 2500, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "If you don't eliminate them before they reach me,\nyou'll lose your HP by their remaining health.";
            }, true, 2500, 3000, 600)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Pretty simple, huh?";
            }, true, 2500, 3000, 600)
            .addDelayAction(this, 9000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "It's either you hurt them, or they hurt you.\nThat's the law of the jungle.";
            }, true, 2500, 3000, 600)
            .addDelayAction(this, 500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Hurt each other! Yeah! I like it.";
            }, true, 2500, 3000, 600)
            .addEventAction("TO_FLOW_STRATEGY");
    }

    initStFlowStrategy() {
        let state = this.normalGameFsm.getState('FlowStrategy');
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            // TODO: here should have a better condition to get to next story state instead of just waiting 5s            
            .addDelayAction(this, 6000)
            .addFinishAction();  // -< here finish means goto story0
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
                if (this.entryPoint === EntryPoint.FromDie)
                    return "Calm down, " + this.playerName + ". Let's do it again.\n You have to help me."
                else
                    return "I just know it, " + this.playerName + "! You'll come back. Haha";
            }, true, 2000, 3000, 1500)
            .addDelayAction(this, 3)
            .addFinishAction();
    }

    initStStory0() {
        let state = this.normalGameFsm.getState('Story0');
        state
            .addAction(state => { }).setBoolCondition(s => this.getCounter(Counter.Story0Finished) === 0, false)  // <---- reject if story0 has finished
            .addSubtitleAction(this.subtitle, s => {
                return "I can get that this experiment is a little bit boring indeed.\n"
            }, true, 2000, 3000, 200)
            .addSubtitleAction(this.subtitle, s => {
                return "But I have my reasons.\nIt's just I can't tell you right now."
            }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                return "What about you help me eliminate 65536 more enemies,\nand I tell you the secret of the universe as a reward?"
            }, false, 2000, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
                return "What do you think? " + this.playerName + ". Think about it.";
            }, true, 2000, 3000, 2000)
            .addSubtitleAction(this.subtitle, s => {
                return "Yes? No?\nAre you still there?"
            }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, s => {
                return "Oh! Sorry, " + this.playerName + "! I forgot to say that you could\n just talk to me by the input you type in.\nYes, or no?"
            }, false, 2000, 3000, 1).finishImmediatly()
            .addAction((s, result, resolve, reject) => {
                s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, o => {
                    // this.overlay.showBlack();    
                    let wd = o.toLowerCase();
                    if (wd == "yes" || wd == 'no')
                        resolve(wd);
                })
            })
            // .addAction(()=>{
            //     this.subtitle.wrappedObject.setColor('#ffffff');
            // })
            // TODO here should move counter here, and change wd===yes to getVar() way
            .addSubtitleAction(this.subtitle, (s, wd) => {
                if (wd === 'yes') {
                    s.fsm.setVar('answer', true);
                    return "Good!"
                }
                else if (wd === 'no') {
                    s.fsm.setVar('answer', false);
                    return "No? really? I hope you know what you are doing.\nAnyway, have fun!"
                }
            }, true, 2000, 3000, 1000)
            .addAction(o => { this.addCounter(Counter.Story0Finished) })
            .addAction(s => {
                let an = s.fsm.getVar('answer', false);
                if (!an) {
                    this.backBtn.clickedEvent.emit(this.backBtn);
                }
            })
            .addFinishAction().setFinally();
    }

    initStStory1() {
        let state = this.normalGameFsm.getState('Story1');
        state.addAction((s) => {
            // console.log('hahaha, story1');
        })

    }
}

