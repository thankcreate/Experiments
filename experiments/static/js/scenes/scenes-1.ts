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

    

    /**
     * container is aligned to the center of canvas
     */
    container: PhContainer;

    /**
     * middle is also aligned to the center
     */
    midContainder: PhContainer;

    /**
     * abContainer is aligned to the top-left corner
     */
    abContainer: PhContainer;

    /**
     * overlayContainer is also aligned to the center, but above the standard container
     */
    overlayContainer: PhContainer;

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

    sfxLaser : Phaser.Sound.BaseSound;
    sfxMatches: Phaser.Sound.BaseSound[] = [];
    sfxFail : Phaser.Sound.BaseSound;

    
    

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {        
        super(config);

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
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('arrow_rev', 'assets/arrow_rev.png');
        this.load.image('speaker_dot', 'assets/speaker_dot.png');
        this.load.image('speaker', 'assets/speaker.png');
        this.load.image('unit_white', 'assets/unit_white.png')
        this.load.image('footer_ai', 'assets/footer_ai.png')
        this.load.image('footer_google', 'assets/footer_google.png')
        this.load.image('footer_nyu', 'assets/footer_nyu.png')
        this.load.image('footer_sep', 'assets/footer_sep.png')
        this.load.image('leaderboard_icon', 'assets/leaderboard_icon.png')
        this.load.image('rounded_btn', 'assets/rounded_with_title_btn_90_10.png')
        this.load.image('popup_bubble', 'assets/popup_bubble.png');
        this.load.image('popup_bubble_left', 'assets/popup_bubble_left.png');
        
        this.load.audio("sfx_match_1", "assets/audio/Match_1.wav");
        this.load.audio("sfx_match_2", "assets/audio/Match_2.wav");
        this.load.audio("sfx_match_3", "assets/audio/Match_3.wav");        

        this.load.image('purchased_mark', "assets/purchased_mark.png")
        this.load.image('magic', 'assets/magic.png');

        this.preloadBadges();        
    }

    preloadBadges() {
        for(let i in badInfos) {
            let resId = getBadgeResID(i);
            let resPath = 'assets/' + resId + '.png';
            this.load.image(resId, resPath);
        }
    }

    loadAudio() {
        let audioLoadConfig = {
            sfx_laser: ["assets/audio/Hit_Hurt131.wav", "sfxLaser"],
            sfx_fail: ["assets/audio/Fail.wav", "sfxFail"],            
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }

    loadAudioWithConfig(audioLoadConfig) {
        for(let i in audioLoadConfig) {
            this.load.audio(i, audioLoadConfig[i][0]);
        }
        
        this.load.on('filecomplete', (arg1)=>{
            if(audioLoadConfig[arg1]) {
                // console.log(arg1);
                this[audioLoadConfig[arg1][1]] = this.sound.add(arg1);
            }
        });
        this.load.start();   
    }

    create() {
        this.loadAudio();        
        this.sfxMatches = [];
        this.sfxMatches.push(this.sound.add("sfx_match_1"));
        this.sfxMatches.push(this.sound.add("sfx_match_2"));
        this.sfxMatches.push(this.sound.add("sfx_match_3"));

        this.container = this.add.container(400, 299);
        this.midContainder = this.add.container(400, 299);
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

    curTime;
    dif;
    update(time, dt) {
        
        super.update(time, dt);
        this.curTime =  time;
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);
        this.midContainder.setPosition(w / 2, h / 2);
        this.overlayContainer.setPosition(w / 2, h / 2);

        this.enemyManager.update(time, dt);
        this.centerObject.update();
        this.hud.update(time, dt);

        // this.checkDuckVolumn();
    }


    // checkDuckVolumn() {
    //     if(this.subtitle.isTextInShow()) {
    //       (this.bgm as any).volume = 0.2;
    //     }
    //     else {
    //         (this.bgm as any).volume = 1;
    //     }
    // }

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

            // s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
            //     let enemy = <Enemy>e;
            //     // TODO
            //     // this.hud.addScore(baseScore);
            // });

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

    
}

