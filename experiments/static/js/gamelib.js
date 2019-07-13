"use strict";
class BaseScene extends Phaser.Scene {
    constructor() {
        super(...arguments);
        this.updateObjects = [];
    }
    getControllerScene() {
        let controller = this.scene.get("Controller");
        return controller;
    }
    getSpeechManager() {
        return this.getControllerScene().speechManager;
    }
    playSpeech(text, timeOut = 4000) {
        let controller = this.scene.get("Controller");
        return controller.playSpeechInController(text, timeOut);
    }
    /**
     * Muse sure called super first
     * @param time
     * @param dt
     */
    update(time, dt) {
        this.updateObjects.forEach(e => {
            e.update(time, dt);
        });
    }
}
class Controller extends BaseScene {
    constructor() {
        super('Controller');
    }
    preload() {
    }
    create() {
        this.speechManager = new SpeechManager(this);
        // create an invisible text to load some remote font
        let style = getDefaultTextStyle();
        style.fontFamily = gameplayConfig.preloadFontFamily;
        this.add.text(0, 0, 'haha', style).setAlpha(0);
        this.scene.launch('Scene1');
        myResize(this.game);
    }
    playSpeechInController(text, timeOut = 4000) {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}
/// <reference path="scene-controller.ts" />
/**
 * Game Mode is what you choose from home mode select
 */
var GameMode;
/// <reference path="scene-controller.ts" />
/**
 * Game Mode is what you choose from home mode select
 */
(function (GameMode) {
    GameMode[GameMode["Normal"] = 0] = "Normal";
    GameMode[GameMode["Zen"] = 1] = "Zen";
})(GameMode || (GameMode = {}));
/**
 * EntryPoint is like a status/mode you entered the game mode
 * It's purpose is to differentiate whether it's from a die restart
 * Or it's a game from home page
 */
var EntryPoint;
/**
 * EntryPoint is like a status/mode you entered the game mode
 * It's purpose is to differentiate whether it's from a die restart
 * Or it's a game from home page
 */
(function (EntryPoint) {
    EntryPoint[EntryPoint["FromHome"] = 0] = "FromHome";
    EntryPoint[EntryPoint["FromDie"] = 1] = "FromDie";
})(EntryPoint || (EntryPoint = {}));
var Counter;
(function (Counter) {
    Counter[Counter["None"] = 0] = "None";
    Counter[Counter["IntoHome"] = 1] = "IntoHome";
    Counter[Counter["IntoNormalMode"] = 2] = "IntoNormalMode";
})(Counter || (Counter = {}));
let gOverlay;
class Scene1 extends BaseScene {
    constructor() {
        super('Scene1');
        this.initDwitterScale = 0.52;
        this.mode = GameMode.Normal;
        this.entryPoint = EntryPoint.FromHome;
        this.homeCounter = 0;
        this.counters = new Map();
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
        this.load.image('unit_white', 'assets/unit_white.png');
        this.load.image('footer_ai', 'assets/footer_ai.png');
        this.load.image('footer_google', 'assets/footer_google.png');
        this.load.image('footer_nyu', 'assets/footer_nyu.png');
        this.load.image('footer_sep', 'assets/footer_sep.png');
    }
    create() {
        this.container = this.add.container(400, 299);
        this.abContainer = this.add.container(0, 0);
        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);
        // Add confirmed listener for confirmedEvent to enemyManager
        this.centerObject.playerInputText.confirmedEvent.on(input => {
            this.enemyManager.inputTextConfirmed(input);
            this.time.delayedCall(300, () => {
                this.dwitterBKG.next();
            }, null, null);
        });
        // Dwitters         
        this.dwitterCenter = new Dwitter65536(this, this.container, 0, 0, 1920, 1080, true).setScale(this.initDwitterScale);
        this.dwitterBKG = new Dwitter65537(this, this.container, 0, 0, 2400, 1400, true);
        // Footer
        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = new Footer(this, this.abContainer, footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, 100);
        this.footerInitPosi = MakePoint(this.footer.inner);
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
        // Overlay
        this.overlayContainer = this.add.container(400, 299);
        this.overlay = new Overlay(this, this.overlayContainer, 0, 0);
        gOverlay = this.overlay;
        // Footer click event bind
        this.footer.badges[1].clickedEvent.on(() => {
            this.overlay.showGoogleDialog();
        });
        this.footer.badges[2].clickedEvent.on(() => {
            this.overlay.showAboutDialog();
        });
        // Main FSM
        this.mainFsm = new Fsm(this, this.getMainFsm());
        this.normalGameFsm = new Fsm(this, this.getNormalGameFsm());
        this.initMainFsm();
        this.initNormalGameFsm();
        // Sub FSM: normal game
    }
    fitImageToSize(image, height, width) {
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
    getMainFsm() {
        return mainFsm;
    }
    getNormalGameFsm() {
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
    getCounter(key, def) {
        if (notSet(def))
            def = 0;
        let res = this.counters.get(key);
        if (notSet(res)) {
            this.counters.set(key, def);
            res = def;
        }
        return res;
    }
    addCounter(key, def) {
        if (notSet(def))
            def = 0;
        let res = this.getCounter(key, def);
        res++;
        this.counters.set(key, res);
    }
    firstIntoHome() {
        return this.getCounter(Counter.IntoHome) == 1;
    }
    firstIntoNormalMode() {
        return this.getCounter(Counter.IntoNormalMode) == 1;
    }
    setEntryPointByIncomingEvent(evName) {
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
            s.autoSafeInOutClick(mainImage, e => {
                this.centerObject.playerInputText.homePointerOver();
                this.dwitterBKG.toStaticMode();
                // $("body").css('cursor','pointer');
            }, e => {
                this.centerObject.playerInputText.homePointerOut();
                this.dwitterBKG.toBlinkMode();
                // $("body").css('cursor','default');
            }, e => {
                this.centerObject.playerInputText.homePointerDown();
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
            .addFinishAction();
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
            .addAction((s, result, resolve, reject) => {
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
            .addSubtitleAction(this.subtitle, s => { return (this.mode === GameMode.Normal ? 'Normal' : 'Zen') + ' mode, start!'; }, true, null, null, 1)
            .addFinishAction();
    }
    initStHomeToGameAnimation() {
        let dt = 1000;
        let state = this.mainFsm.getState("HomeToGameAnimation");
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
                targets: this.footer.inner,
                y: "+= 250",
                duration: dt,
            }
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
            this.setEntryPointByIncomingEvent(s.fromEvent);
            this.normalGameFsm.start();
            // Hide title and show speaker dots
            this.centerObject.prepareToGame();
            this.backBtn.setEnable(true, true);
            // Back
            s.autoOn($(document), 'keydown', e => {
                if (e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                    s.event("BACK_TO_HOME"); // <-------------
                }
            });
            // Player input
            s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
            s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));
            // Damage handling
            s.autoOn(this.enemyManager.enemyReachedCoreEvent, null, e => {
                let enemy = e;
                this.hp.damageBy(enemy.health);
            });
            // Dead event handling
            s.autoOn(this.hp.deadEvent, null, e => {
                s.event("DIED");
            });
        });
        state.setOnExit(s => {
            this.normalGameFsm.stop();
            // Stop all subtitle and sounds
            this.subtitle.forceStopAndHideSubtitles();
        });
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
        });
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
        });
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
        });
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
                targets: this.footer.inner,
                y: this.footerInitPosi.y,
                duration: dt,
            }
        ])
            .addFinishAction();
    }
    setMode(mode) {
        this.mode = mode;
    }
    setEntryPoint(ep) {
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
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.SpawnOnEliminatedAndReachCore, { enemyDuration: duration, health: health });
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
        });
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
        });
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
                return "Calm down. Don't give up.";
            else
                return "I just know it! You'll come back. Haha";
        }, true, 2000, 3000, 1500)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, s => {
            return "I can get that this experiment is a little bit boring indeed.\n";
        }, true, 2000, 3000, 500)
            .addSubtitleAction(this.subtitle, s => {
            return "But I have my reasons";
        }, true, 2000, 3000, 1500);
    }
}
/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />
var gameplayConfig = {
    enemyDuratrion: 30000,
    spawnInterval: 8000,
    // enemyDuratrion: 5000,
    // spawnInterval: 1000,
    onlyDamageMostMatch: false,
    allowDamageBySameWord: false,
    tryAvoidDuplicate: true,
    allowSameInput: true,
    quickDrawDataPath: "assets/quick-draw-data/",
    defaultHealth: 3,
    damageTiers: [
        [0.8, 3],
        [0.5, 2],
        [0.4, 1],
        [0, 0]
    ],
    defaultTextSize: '32px',
    defaultImageTitleSize: '28px',
    preloadFontFamily: "'Averia Serif Libre'",
    defaultFontFamily: "'Averia Serif Libre', Georgia, serif",
    defaultFontFamilyFirefox: "'Averia Serif Libre', Georgia, serif",
    titleFontFamily: "Georgia, serif",
    subtitleFontFamily: "'Averia Serif Libre', Georgia, serif",
    healthIndicatorFontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    healthIndicatorWidth: 32,
    drawDataSample: 255,
    drawDataDefaultSize: 150,
    titleOriginal: "Project 65535",
    titleChangedTo: "Project 65536",
};
var phaserConfig = {
    // type: Phaser.WEBGL,
    type: Phaser.CANVAS,
    backgroundColor: '#EEEEEE',
    // backgroundColor: '#E4E4E4',
    scale: {
        // mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
        parent: 'phaser-example',
        width: 8000,
        // width: 1200,
        height: 1200,
        minWidth: 1200
    },
    canvasStyle: "vertical-align: middle;",
    scene: [Controller, Scene1]
};
class PhPointClass extends Phaser.Geom.Point {
}
;
class PhTextClass extends Phaser.GameObjects.Text {
}
;
class PhContainerClass extends Phaser.GameObjects.Container {
}
;
class PhImageClass extends Phaser.GameObjects.Image {
}
;
class Wrapper {
    // copy the following lines to the inherited class
    // constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
    //     super(scene, parentContainer, x, y, null);
    // } 
    /**
     * Target will be added into inner container
     * inner container will be added into parentContainer automatically
     * NO NEED to add this wrapper into the parent
     * @param scene
     * @param parentContainer
     * @param target
     */
    constructor(scene, parentContainer, x, y, target) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.inner = this.scene.add.container(x, y);
        this.parentContainer.add(this.inner);
        // Sometimes in the interitace classes the 'target' is undefined
        // because super constructor need call first
        if (target) {
            this.applyTarget(target);
        }
        this.init();
    }
    init() {
    }
    applyTarget(target) {
        this.wrappedObject = target;
        this.inner.add(target);
    }
    add(go) {
        this.inner.add(go);
    }
    setScale(x, y) {
        this.inner.setScale(x, y);
        return this;
    }
    getX() {
        return this.inner.x;
    }
    getY() {
        return this.inner.y;
    }
    setPosition(x, y) {
        this.inner.x = x;
        this.inner.y = y;
    }
}
class ImageWrapperClass extends Wrapper {
}
;
class TextWrapperClass extends Wrapper {
}
;
var GameState;
(function (GameState) {
    GameState[GameState["Home"] = 0] = "Home";
    GameState[GameState["Scene1"] = 1] = "Scene1";
})(GameState || (GameState = {}));
var ErrorInputCode;
(function (ErrorInputCode) {
    ErrorInputCode[ErrorInputCode["NoError"] = 0] = "NoError";
    ErrorInputCode[ErrorInputCode["Same"] = 1] = "Same";
    ErrorInputCode[ErrorInputCode["Contain"] = 2] = "Contain";
    ErrorInputCode[ErrorInputCode["Wrap"] = 3] = "Wrap";
    ErrorInputCode[ErrorInputCode["TooShort"] = 4] = "TooShort";
    ErrorInputCode[ErrorInputCode["Repeat"] = 5] = "Repeat";
    ErrorInputCode[ErrorInputCode["DamagedBefore"] = 6] = "DamagedBefore";
    ErrorInputCode[ErrorInputCode["NotWord"] = 7] = "NotWord";
})(ErrorInputCode || (ErrorInputCode = {}));
class TypedEvent {
    constructor() {
        this.listeners = [];
        this.listenersOncer = [];
        this.on = (listener) => {
            this.listeners.push(listener);
            return {
                dispose: () => this.off(listener)
            };
        };
        this.once = (listener) => {
            this.listenersOncer.push(listener);
        };
        this.off = (listener) => {
            const callbackIndex = this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                this.listeners.splice(callbackIndex, 1);
        };
        this.emit = (event) => {
            this.listeners.forEach(listener => listener(event));
            this.listenersOncer.forEach(listener => listener(event));
            this.listenersOncer = [];
        };
        this.pipe = (te) => {
            return this.on(e => te.emit(e));
        };
    }
}
// return the logic degisn wdith based on the config.scale.height
// this is the available canvas width
function getLogicWidth() {
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    if (windowR > scaleR) {
        return windowR * phaserConfig.scale.height;
    }
    else {
        return phaserConfig.scale.minWidth;
    }
}
function myResize(gm) {
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    gm.scale.resize(getLogicWidth(), phaserConfig.scale.height);
    var canvas = document.querySelector("canvas");
    if (windowR > scaleR) {
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    else {
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerWidth / scaleR + "px";
    }
    // canvas.style.verticalAlign= "middle";    
}
function getArrayInputData() {
    var data = { "input": "", "array": "" };
    data.input = $('#arg1').val().trim();
    data.array = $('#arg2').val().trim().split(' ');
    return data;
}
function test_api3() {
    var inputData = getArrayInputData();
    $.ajax({
        //几个参数需要注意一下
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api_3",
        data: JSON.stringify(inputData),
        success: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)       
        },
        error: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)                    
        }
    });
}
function test_api2() {
    $.ajax({
        //几个参数需要注意一下
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api_2",
        data: JSON.stringify(getFormData($("#form1"))),
        success: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)       
            $('#res').html(result.res);
            $('#arg1').val('');
            $('#arg2').val('');
        },
        error: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)                    
        }
    });
}
function magic() {
    test_api3();
    // test();
}
$('#form1').keydown(function (e) {
    var key = e.which;
    if (key == 13) {
        magic();
    }
});
function yabali() {
    // $.getJSON("assets/treeone.ndjson", function (json) {
    //     console.log(json); // this will show the info it in firebug console
    // });
    testSpeechAPI2();
}
// function testSpeechAPI() {
//     var inputText = $('#arg1').val();
//     var id = $('#arg2').val();
//     apiTextToSpeech(inputText, id,
//         sucData => {
//             console.log(sucData);
//         },
//         errData => {
//             console.log("fail speech");
//         });
// }
function testSpeechAPI2() {
    var inputText = $('#arg1').val();
    var id = $('#arg2').val();
    let dataOb = { input: inputText, id: id };
    let dataStr = JSON.stringify(dataOb);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api_speech", true);
    oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        console.log(arrayBuffer);
        var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audio.load();
        audio.play();
        console.log('haha ririr');
    };
    oReq.send(dataStr);
}
function distance(a, b) {
    let diffX = b.x - a.x;
    let diffY = b.y - a.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
}
function myMove(from, to, mv) {
    let diffX = to.x - from.x;
    let diffY = to.y - from.y;
    let d = distance(from, to);
    let ratio = mv / d;
    let rt = { x: from.x + diffX * ratio, y: from.y + diffY * ratio };
    return rt;
}
function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
}
function api(api, inputData, suc, err, dtType) {
    $.ajax({
        type: "POST",
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        url: "/" + api,
        data: inputData,
        success: function (result) {
            if (suc)
                suc(result);
        },
        error: function (result) {
            if (err)
                err(result);
        }
    });
}
function apiPromise(api, inputData, dtType) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            url: "/" + api,
            data: inputData,
            success: function (result) {
                resolve(result);
            },
            error: function (result) {
                reject(result);
            }
        });
    });
}
// API2 is to get the similarity between two strings
function api2(input, suc, err) {
    api("api_2", input, suc, err);
}
function formatTwoParamsInput(param1, param2) {
    var ob = { arg1: param1, arg2: param2 };
    return JSON.stringify(ob);
}
function api2WithTwoParams(arg1, arg2, suc, err) {
    let inputString = formatTwoParamsInput(arg1, arg2);
    api2(inputString, suc, err);
}
// API 3 is to get the similarty between one input string and a collection of strings
function api3(input, suc, err) {
    api("api_3", input, suc, err);
}
function formatArrayParamsInput(param1, param2) {
    var ob = { input: param1, array: param2 };
    return JSON.stringify(ob);
}
function api3WithTwoParams(inputString, arrayStrings, suc, err) {
    let data = formatArrayParamsInput(inputString, arrayStrings);
    api3(data, suc, err);
}
// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech(inputText, identifier) {
    let dataOb = { input: inputText, id: identifier, api: 1 };
    let dataStr = JSON.stringify(dataOb);
    return apiPromise("api_speech", dataStr);
}
// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech2(inputText, identifier) {
    return new Promise((resolve, reject) => {
        let dataOb = { input: inputText, id: identifier, api: 2 };
        let dataStr = JSON.stringify(dataOb);
        var oReq = new XMLHttpRequest();
        oReq.open("POST", "/api_speech", true);
        oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        oReq.responseType = "arraybuffer";
        oReq.onload = oEvent => {
            resolve(oReq);
        };
        oReq.onerror = o => {
            reject(o);
        };
        oReq.send(dataStr);
    });
}
var BrowserType;
(function (BrowserType) {
    BrowserType[BrowserType["IE"] = 0] = "IE";
    BrowserType[BrowserType["Eedge"] = 1] = "Eedge";
    BrowserType[BrowserType["Firefox"] = 2] = "Firefox";
    BrowserType[BrowserType["Chrome"] = 3] = "Chrome";
    BrowserType[BrowserType["Opera"] = 4] = "Opera";
    BrowserType[BrowserType["Safari"] = 5] = "Safari";
    BrowserType[BrowserType["Unknown"] = 6] = "Unknown";
})(BrowserType || (BrowserType = {}));
function isChrome() {
    return getExplore() == BrowserType.Chrome;
}
function isFirefox() {
    return getExplore() == BrowserType.Firefox;
}
function getExplore() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
        (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
                (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] :
                            (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0;
    if (Sys.ie)
        return BrowserType.IE;
    if (Sys.edge)
        return BrowserType.Eedge;
    if (Sys.firefox)
        return BrowserType.Firefox;
    if (Sys.chrome)
        return BrowserType.Chrome;
    if (Sys.opera)
        return BrowserType.Opera;
    if (Sys.safari)
        return BrowserType.Safari;
    // if (Sys.ie) return ('IE: ' + Sys.ie);  
    // if (Sys.edge) return ('EDGE: ' + Sys.edge);
    // if (Sys.firefox) return ('Firefox: ' + Sys.firefox);  
    // if (Sys.chrome) return ('Chrome: ' + Sys.chrome);  
    // if (Sys.opera) return ('Opera: ' + Sys.opera);  
    // if (Sys.safari) return ('Safari: ' + Sys.safari);
    return BrowserType.Unknown;
}
function getDefaultFontFamily() {
    // * firefox will not show the text if the font is loading
    if (isFirefox()) {
        return gameplayConfig.defaultFontFamilyFirefox;
    }
    return gameplayConfig.defaultFontFamily;
}
function getDefaultTextStyle() {
    let ret = {
        fontSize: gameplayConfig.defaultTextSize,
        fill: '#000000',
        fontFamily: getDefaultFontFamily(),
    };
    return ret;
}
function MakePoint(val) {
    return new Phaser.Geom.Point(val.x, val.y);
}
function MakePoint2(x, y) {
    return new Phaser.Geom.Point(x, y);
}
function cpp(pt) {
    return new Phaser.Geom.Point(pt.x, pt.y);
}
function getGame() {
    let thisGame = window.game;
    return thisGame;
}
function getGameState() {
    let thisGame = getGame();
    if (!thisGame.hasOwnProperty("gameState")) {
        thisGame.gameState = GameState.Home;
    }
    return thisGame.gameState;
}
function setGameState(state) {
    let thisGame = getGame();
    thisGame.gameState = state;
}
function lerp(start, end, perc) {
    return (end - start) * perc + start;
}
var S = Math.sin;
var C = Math.cos;
var T = Math.tan;
function R(r, g, b, a) {
    a = a === undefined ? 1 : a;
    return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
}
;
function getPixels(ctx) {
    return ctx.readPixels
        ? getPixels3d(ctx)
        : getPixels2d(ctx);
}
function getPixels3d(gl) {
    var canvas = gl.canvas;
    var height = canvas.height;
    var width = canvas.width;
    var buffer = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
    return buffer;
}
function getPixels2d(ctx) {
    var canvas = ctx.canvas;
    var height = canvas.height;
    var width = canvas.width;
    return ctx.getImageData(0, 0, width, height).data;
}
let canvasPixels = getPixels3d;
function conv(webgl, canvas2D) {
    var outCanvas = canvas2D ? canvas2D.canvas || canvas2D : document.createElement('canvas');
    var outContext = outCanvas.getContext('2d');
    var outImageData;
    webgl = webgl instanceof WebGLRenderingContext ? webgl : webgl.getContext('webgl') || webgl.getContext('experimental-webgl');
    outCanvas.width = webgl.canvas.width;
    outCanvas.height = webgl.canvas.height;
    outImageData = outContext.getImageData(0, 0, outCanvas.width, outCanvas.height);
    outImageData.data.set(new Uint8ClampedArray(canvasPixels(webgl).buffer));
    outContext.putImageData(outImageData, 0, 0);
    outContext.translate(0, outCanvas.height);
    outContext.scale(1, -1);
    outContext.drawImage(outCanvas, 0, 0);
    outContext.setTransform(1, 0, 0, 1, 0, 0);
    return outCanvas;
}
;
function clamp(val, min, max) {
    return Math.max(Math.min(val, max), min);
}
function arrayRemove(ar, element) {
    if (notSet(ar) || notSet(element))
        return;
    for (let i in ar) {
        if (ar[i] === element) {
            ar.splice(parseInt(i), 1);
        }
    }
}
function updateObject(from, to) {
    if (notSet(from) || notSet(to)) {
        console.log('update object found null');
        return;
    }
    for (let key in from) {
        to[key] = from[key];
    }
}
/**
 * When you want to deactive a button \
 * Just call setEnable(false) \
 * Don't set the visibility or activity of the inner objects directly
 */
class Button {
    /**
     * Target will be added into inner container
     * inner container will be added into parentContainer automatically
     * NO NEED to add this wrapper into the parent
     * @param scene
     * @param parentContainer
     * @param target
     */
    constructor(scene, parentContainer, x, y, imgKey, title, width, height, debug, fakeOriginX, fakeOriginY) {
        this.hoverState = 0; // 0:in 1:out
        this.prevDownState = 0; // 0: not down  1: down
        this.enable = true;
        // auto scale
        this.needInOutAutoAnimation = true;
        // auto change the text to another when hovered
        this.needTextTransferAnimation = false;
        // auto change the cursor to a hand when hovered
        this.needHandOnHover = false;
        this.clickedEvent = new TypedEvent();
        this.ignoreOverlay = false;
        this.animationTargets = [];
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.inner = this.scene.add.container(x, y);
        this.parentContainer.add(this.inner);
        if (imgKey) {
            this.image = this.scene.add.image(0, 0, imgKey);
            this.inner.add(this.image);
        }
        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        this.originalTitle = title;
        this.text = this.scene.add.text(0, 0, title, style).setOrigin(0.5).setAlign('center');
        this.inner.add(this.text);
        if (notSet(width))
            width = this.image ? this.image.displayWidth : this.text.displayWidth;
        if (notSet(height))
            height = this.image ? this.image.displayHeight : this.text.displayHeight;
        if (notSet(fakeOriginX))
            fakeOriginX = 0.5;
        if (notSet(fakeOriginY))
            fakeOriginY = 0.5;
        this.fakeZone = this.scene.add.image(0, 0, 'unit_white').setOrigin(fakeOriginX, fakeOriginY);
        this.fakeZone.setScale(width / 100, height / 100);
        this.inner.add(this.fakeZone);
        if (debug) {
            this.debugFrame = this.scene.add.graphics();
            this.debugFrame.lineStyle(4, 0xFF0000, 1);
            this.debugFrame.strokeRect(-width * fakeOriginX, -height * fakeOriginY, width, height);
            this.inner.add(this.debugFrame);
        }
        if (this.image)
            this.animationTargets.push(this.image);
        if (this.text)
            this.animationTargets.push(this.text);
        this.scene.updateObjects.push(this);
    }
    update(time, dt) {
        this.checkMouseEventInUpdate();
    }
    setEnable(val, needFade) {
        // hide
        if (!val && this.enable) {
            // console.log(this.text.text);
            this.hoverState = 0;
            if (needFade) {
                FadePromise.create(this.scene, this.inner, 0, 500)
                    .then(s => {
                    this.inner.setVisible(false);
                }).catch(e => { });
            }
            else {
                // console.log(this.text.text);
                this.inner.setVisible(false);
            }
        }
        // show
        else if (val && !this.enable) {
            this.text.text = this.originalTitle;
            this.animationTargets.forEach(e => {
                e.setScale(1);
            });
            if (needFade) {
                FadePromise.create(this.scene, this.inner, 1, 500);
            }
            this.inner.setVisible(true);
        }
        this.enable = val;
        return this;
    }
    // 1: on   2: off
    setHoverState(st) {
        if (this.hoverState == 0 && st == 1) {
            this.pointerin();
        }
        else if (this.hoverState == 1 && st == 0) {
            this.pointerout();
        }
        this.hoverState = st;
    }
    checkMouseEventInUpdate() {
        var pointer = this.scene.input.activePointer;
        let contains = false;
        if (!this.canInteract())
            contains = false;
        else
            contains = this.fakeZone.getBounds().contains(pointer.x, pointer.y);
        this.setHoverState(contains ? 1 : 0);
        if (contains) {
            if (pointer.isDown && this.prevDownState === 0) {
                this.click();
            }
        }
        this.prevDownState = pointer.isDown ? 1 : 0;
    }
    click() {
        if (this.needInOutAutoAnimation) {
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: this.animationTargets,
                scale: 0.9,
                duration: 40,
            });
            timeline.add({
                targets: this.animationTargets,
                scale: 1.25,
                duration: 90,
            });
            timeline.play();
        }
        this.clickedEvent.emit(this);
    }
    pointerin() {
        if (this.needInOutAutoAnimation) {
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1.25,
                duration: 100,
            });
        }
        if (this.needTextTransferAnimation) {
            this.text.text = this.hoverTitle;
        }
        if (this.needHandOnHover) {
            $("body").css('cursor', 'pointer');
        }
    }
    pointerout() {
        if (this.needInOutAutoAnimation) {
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1,
                duration: 100,
            });
        }
        if (this.needTextTransferAnimation) {
            this.text.text = this.originalTitle;
        }
        if (this.needHandOnHover) {
            $("body").css('cursor', 'default');
        }
    }
    setToHoverChangeTextMode(hoverText) {
        this.hoverTitle = hoverText;
        this.needInOutAutoAnimation = false;
        this.needTextTransferAnimation = true;
    }
    canInteract() {
        if (gOverlay && gOverlay.isInShow() && !this.ignoreOverlay)
            return false;
        let container = this.inner;
        while (container != null) {
            if (!container.visible)
                return false;
            container = container.parentContainer;
        }
        if (!this.enable)
            return false;
        return true;
    }
}
class SpeakerButton extends ImageWrapperClass {
    init() {
        this.icon = this.scene.add.image(0, 0, 'speaker_dot').setAlpha(0);
        this.inner.add(this.icon);
    }
    toSpeakerMode(dt = 250) {
        this.scene.tweens.add({
            targets: this.icon,
            alpha: 1,
            duration: dt,
        });
    }
    toNothingMode(dt = 250) {
        this.scene.tweens.add({
            targets: this.icon,
            alpha: 0,
            duration: 250,
        });
    }
}
class CenterObject {
    constructor(scene, parentContainer, designSize) {
        this.speakerRight = 56;
        this.speakerLeft = -56;
        this.homeScale = 1.3;
        this.gameScale = 1.2;
        this.initRotation = -Math.PI / 2;
        this.frame = 0;
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);
        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);
        this.mainImage = this.scene.add.image(0, 0, "circle").setInteractive();
        this.inner.add(this.mainImage);
        this.speakerBtn = new SpeakerButton(this.scene, this.inner, this.speakerRight, 28, this.scene.add.image(0, 0, "speaker"));
        this.playerInputText = new PlayerInputText(this.scene, this.inner, this, "Project 65535");
        this.playerInputText.init("");
        this.playerInputText.changedEvent.on((inputControl) => { this.playerInputChanged(inputControl); });
        this.inner.setScale(this.homeScale);
        this.inner.setRotation(this.initRotation);
        this.text = this.scene.add.text(0, -200, '', { fill: '#000000' }).setVisible(false);
        this.inner.add(this.text);
        // Buttons
        let btn = new Button(this.scene, this.inner, 0, -30, null, "Normal", 200, 98, false, 0.5, 0.7).setEnable(false, false);
        this.btnMode0 = btn;
        btn = new Button(this.scene, this.inner, 0, 30, null, "Zen", 200, 98, false, 0.5, 0.3).setEnable(false, false);
        this.btnMode1 = btn;
    }
    playerInputChanged(inputControl) {
        let percent = inputControl.text.width / this.getTextMaxWidth();
        percent = Math.max(0, percent);
        percent = Math.min(1, percent);
        let desti = lerp(this.speakerRight, this.speakerLeft, percent);
        // this.speakerImage.x = desti;
        if (percent == 0) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: desti,
                duration: 150
            });
        }
        else {
            if (this.backToZeroTween)
                this.backToZeroTween.stop();
            // this.speakerImage.x = desti;
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: desti,
                duration: 50
            });
        }
    }
    getDesignWidth() {
        return this.designSize.x;
    }
    getTextMaxWidth() {
        return this.getDesignWidth() * 0.65;
    }
    update() {
        let pointer = this.scene.input.activePointer;
        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
            'isDown: ' + pointer.isDown,
            'rightButtonDown: ' + pointer.rightButtonDown()
        ]);
    }
    prepareToGame() {
        this.playerInputText.prepareToNormalGame();
        this.speakerBtn.toSpeakerMode(1000);
        this.speakerBtn.inner.x = this.speakerRight;
    }
    prepareToHome() {
        this.playerInputText.prepareToGoBack();
        this.speakerBtn.toNothingMode(1000);
        // this.speakerBtn.inner.x = this.speakerRight;
        if (this.backToZeroTween)
            this.backToZeroTween.stop();
        this.backToZeroTween = this.scene.tweens.add({
            targets: this.speakerBtn.inner,
            x: this.speakerRight,
            duration: 150
        });
    }
    u3(t, c, x) {
        let Y = 0;
        let X = 0;
        let r = 140 - 16 * (t < 10 ? t : 0);
        for (let U = 0; U < 44; (r < 8 ? "䃀䀰䜼䚬䶴伙倃匞䖴䚬䞜䆀䁠".charCodeAt(Y - 61) >> X - 18 & 1 : 0) || x.fillRect(8 * X, 8 * Y, 8, 8))
            X = 120 + r * C(U += .11) | 0, Y = 67 + r * S(U) | 0;
    }
}
class Died extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        // Big banner
        this.banner = new Rect(this.scene, this.inner, 0, 0, {
            originX: 0.5,
            originY: 0.5,
            width: 3000,
            height: 350,
            fillColor: 0x000000,
            lineColor: 0x000000,
            lineAlpha: 0,
        });
        // Title
        let style = getDefaultTextStyle();
        style.fill = '#ffffff';
        style.fontSize = '250px';
        let title = this.scene.add.text(0, -10, "YOU DIED", style).setOrigin(0.5).setAlign('center');
        this.applyTarget(title);
        // Restart Btn
        this.restartBtn = new Button(this.scene, this.inner, 0, 125, null, ">reboot -n", 200, 100, false);
        this.restartBtn.text.setFontSize(44);
    }
    hide() {
        this.inner.setVisible(false);
        this.restartBtn.setEnable(false, false);
    }
    show() {
        this.inner.setVisible(true);
        this.inner.alpha = 0;
        this.restartBtn.setEnable(true, false);
        return TweenPromise.create(this.scene, {
            targets: this.inner,
            alpha: 1,
            duration: 200
        });
    }
}
var canvasIndex = 0;
/**
 * The current Dwitter only uses Canvas context to draw things \
 * This is because for some heavy-performance task, webgl is extremely laggy
 */
class Dwitter extends Wrapper {
    constructor(scene, parentContainer, x, y, width, height, useImage = true) {
        super(scene, parentContainer, x, y, null);
        this.isRunning = true;
        this.useImage = useImage;
        this.height = height;
        this.width = width;
        if (useImage) {
            this.constructImage();
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }
        this.dwitterInit();
    }
    constructImage() {
        canvasIndex++;
        this.canvasTexture = this.scene.textures.createCanvas('dwitter' + canvasIndex, this.width, this.height);
        this.c = this.canvasTexture.getSourceImage();
        this.x = this.c.getContext('2d');
        let img = this.scene.add.image(0, 0, 'dwitter' + canvasIndex).setOrigin(0.5, 0.5);
        this.applyTarget(img);
    }
    dwitterInit() {
        // Default origin set to 0.5
        this.setOrigin(0.5, 0.5);
        this.frame = 0;
        // Push to the scene's update array
        this.scene.updateObjects.push(this);
    }
    update(time, dt) {
        if (!this.isRunning)
            return;
        let innerTime = this.frame / 60;
        this.frame++;
        if (this.inner.alpha == 0)
            return;
        this.u(innerTime, this.c, this.x);
    }
    setOrigin(xOri, yOri) {
        if (this.useImage) {
            this.wrappedObject.setOrigin(xOri, yOri);
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }
    }
    u(t, c, x) {
        // In inheritance
    }
}
class Dwitter65536 extends Dwitter {
    u(t, c, x) {
        let a = 0;
        c.width |= c.style.background = "#CDF";
        for (let j = 3e3; j--; x.arc(960, 540, 430 + 60 * S(j / 500 + a * 4) * Math.pow((S(a - t * 2) / 2 + .5), 9), a, a)) {
            a = j / 159 + t;
            x.lineWidth = 29;
        }
        x.stroke();
    }
}
class Dwitter65537 extends Dwitter {
    constructor() {
        super(...arguments);
        this.freq = 5; // frequency
        this.phase = 5; // initial phase
        this.lastT = -1;
    }
    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.03;
        // this.inner.alpha = 1;
        this.needModify = true;
        this.param1 = 25;
        this.needStopOnFirstShow = false;
    }
    u(t, c, x) {
        // console.log(t);
        if (this.needModify) {
            t = ~~(t / this.freq);
            t += this.phase;
        }
        if (t === this.lastT) {
            // console.log("same return " + t +"   "+ this.lastT);
            return;
        }
        this.lastT = t;
        // console.log("here");
        this._u(t, c, x);
    }
    next() {
        this.lastT++;
        this._u(this.lastT, this.c, this.x);
    }
    toBlinkMode() {
        this.isRunning = true;
        this.needModify = false;
        this.param1 = 200;
    }
    toStaticMode() {
        this.isRunning = false;
        this.needModify = true;
        this.param1 = 25;
    }
    toSlowStepMode() {
        this.isRunning = true;
        this.needModify = true;
        this.param1 = 25;
    }
    _u(t, c, x) {
        if (this.needStopOnFirstShow) {
            this.needStopOnFirstShow = false;
            this.isRunning = false;
        }
        let a = 0;
        c.width |= 0;
        for (let i = 1e3; i--;) {
            x.arc(this.width / 2, this.height / 2, i ^ (t * this.param1 % 600), i / 100, i / 100 + .03);
            x.stroke();
            x.beginPath(x.lineWidth = 70);
        }
    }
}
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Text"] = 0] = "Text";
    EnemyType[EnemyType["TextWithImage"] = 1] = "TextWithImage";
    EnemyType[EnemyType["Image"] = 2] = "Image";
})(EnemyType || (EnemyType = {}));
class Enemy {
    constructor(scene, enemyManager, posi, lblStyle, config) {
        this.centerRadius = 125;
        this.damagedHistory = []; //store only valid input history
        this.inStop = false;
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.inner;
        this.lbl = config.label;
        this.health = config.health;
        this.lblStyle = lblStyle;
        this.initPosi = posi;
        this.config = config;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.dest = new Phaser.Geom.Point(0, 0);
        this.initContent();
    }
    initContent() {
        // init in inheritance
    }
    update(time, dt) {
        this.checkIfReachEnd();
        this.healthIndicator.update(time, dt);
    }
    checkIfReachEnd() {
        if (this.inStop)
            return;
        let dis = distance(this.dest, this.inner);
        let stopDis = this.getStopDistance();
        // console.log(stopDis);
        // console.log("dis:" + dis +  "stopdis:" + stopDis );
        if (dis < stopDis) {
            this.enemyManager.enemyReachedCore(this);
            this.stopRunAndDestroySelf();
        }
    }
    getStopDistance() {
        return this.centerRadius;
    }
    getTweenDurationFromEstimated(duration) {
        let dis = distance(this.dest, this.inner);
        let stopDis = this.getStopDistance();
        return duration / (dis - stopDis) * dis;
    }
    startRun() {
        // the real tween time should be longer than the input duration
        // this is because the tween's target x and y is the center of the circle
        // the the enemy will stop in a distance from the circle core
        let tweenDuration = this.getTweenDurationFromEstimated(this.config.duration);
        this.inner.alpha = 0; // muse init from here, or it will have a blink
        this.mvTween = this.scene.tweens.add({
            targets: this.inner,
            x: this.dest.x,
            y: this.dest.y,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
                duration: 500
            },
            duration: tweenDuration
        });
    }
    freeze() {
        this.mvTween.pause();
    }
    stopRunAndDestroySelf() {
        let thisEnemy = this;
        thisEnemy.enemyManager.removeEnemy(thisEnemy);
        this.inStop = true;
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.dispose();
            }
        });
    }
    dispose() {
        this.inner.destroy();
    }
    getRealHealthDamage(val) {
        let ret = 0;
        let tiers = gameplayConfig.damageTiers;
        for (let i in tiers) {
            let tier = tiers[i];
            if (val >= tier[0])
                return tier[1];
        }
        return ret;
    }
    checkIfDamagedByThisWordBefore(input) {
        for (let i in this.damagedHistory) {
            if (this.damagedHistory[i] === input) {
                return true;
            }
        }
        return false;
    }
    damage(val, input) {
        let ret = {
            damage: 0,
            code: this.checkIfInputLegalWithEnemy(input, this.lbl)
        };
        // Found error
        if (ret.code != ErrorInputCode.NoError) {
            return ret;
        }
        // Zero damage
        ret.damage = this.getRealHealthDamage(val);
        if (ret.damage == 0) {
            return ret;
        }
        // Damaged by thie same input word before
        if (!gameplayConfig.allowDamageBySameWord && this.checkIfDamagedByThisWordBefore(input)) {
            ret.code = ErrorInputCode.DamagedBefore;
            return ret;
        }
        // Update history
        // We have to history need to update: the enemy's damage history
        // and the manager's omni history
        this.damagedHistory.push(input);
        this.updateOmniDamageHistory(input);
        console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);
        // Handle health
        this.health -= ret.damage;
        if (this.health <= 0) {
            this.eliminated();
        }
        this.health = Math.max(0, this.health);
        this.healthIndicator.damagedTo(this.health);
        return ret;
    }
    updateOmniDamageHistory(input) {
        this.enemyManager.omniHistory.forEach(e => {
            if (e.id === this.id) {
                if (notSet(e.damagedBy))
                    e.damagedBy = [];
                e.damagedBy.push(input);
            }
        });
    }
    eliminated() {
        this.enemyManager.enemyEliminated(this);
        this.stopRunAndDestroySelf();
    }
    checkIfInputLegalWithEnemy(inputLbl, enemyLbl) {
        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();
        if (inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;
        if (enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }
        if (inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }
        return ErrorInputCode.NoError;
    }
    disolve() {
        this.stopRunAndDestroySelf();
    }
}
class EnemyImage extends Enemy {
    constructor(scene, enemyManager, posi, lblStyle, config) {
        super(scene, enemyManager, posi, lblStyle, config);
    }
    initContent() {
        super.initContent();
        this.gap = 10;
        // figure
        this.figure = new QuickDrawFigure(this.scene, this.inner, this.config.image);
        let lb = this.figure.getLeftBottom();
        let rb = this.figure.getRightBottom();
        this.lblStyle.fontSize = gameplayConfig.defaultImageTitleSize;
        // text
        this.text = this.scene.add.text((lb.x + lb.y) / 2, lb.y + this.gap, this.config.label, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;
        this.text.setOrigin(0.5, 0);
        this.inner.add(this.text);
        let lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
        // // healthText
        // let lb = this.text.getBottomLeft();
        // this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), this.lblStyle);
        // this.healthText.setOrigin(0, 0);
        // this.inner.add(this.healthText);  
    }
    getStopDistance() {
        return this.centerRadius + gameplayConfig.drawDataDefaultSize / 2 + 10;
    }
    dispose() {
        super.dispose();
        this.figure.dispose();
        this.figure = null;
    }
}
var gEnemyID = 0;
class EnemyManager {
    constructor(scene, parentContainer) {
        /**
         * At first, it's call spawn history,\
         * but later on, I think I should also added the time info
         * about when the enemy is killed for use in the strategy.
         * So, I change the name to omni
         */
        this.omniHistory = [];
        this.enemyReachedCoreEvent = new TypedEvent();
        this.enemyEliminatedEvent = new TypedEvent();
        this.strategies = new Map();
        this.scene = scene;
        this.inner = this.scene.add.container(0, 0);
        parentContainer.add(this.inner);
        this.interval = gameplayConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];
        // this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.labels = figureNames;
        this.lblStyl = getDefaultTextStyle();
        this.enemyRunDuration = gameplayConfig.enemyDuratrion;
        this.spawnRadius = 500;
        this.strategies.set(SpawnStrategyType.SpawnOnEliminatedAndReachCore, new SpawnStrategyOnEliminatedAndReachCore(this));
        this.strategies.set(SpawnStrategyType.FlowTheory, new SpawnStrategyFlowTheory(this));
        this.strategies.set(SpawnStrategyType.None, new SpawnStrategy(this, SpawnStrategyType.None, {}));
    }
    ;
    startSpawnStrategy(strategy, config) {
        if (this.curStrategy)
            this.curStrategy.onExit();
        this.curStrategy = this.strategies.get(strategy);
        this.curStrategy.updateConfig(config);
        if (this.curStrategy)
            this.curStrategy.onEnter();
    }
    startAutoSpawn() {
        this.autoSpawnTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,
            onStart: () => {
                // console.log('onstart');
                this.spawn();
            },
            onRepeat: () => {
                this.spawn();
            },
            repeat: -1
        });
    }
    stopAutoSpawn() {
        if (this.autoSpawnTween)
            this.autoSpawnTween.stop();
    }
    resetAllStrateges() {
        this.strategies.forEach((value, key, map) => {
            value.reset();
        });
    }
    stopSpawnAndClear() {
        this.stopAutoSpawn();
        this.resetAllStrateges();
        this.curStrategy = null;
        // Must iterate from back
        // disolve will use slice to remove itself from the array
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].disolve();
        }
        // this.enemies.forEach(e=>{
        //     e.disolve();
        // });
        this.enemies.length = 0;
        this.omniHistory.length = 0;
    }
    getNextName() {
        let ret = "";
        // max try count
        let maxTry = 100;
        for (let i = 0; i < maxTry; i++) {
            var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
            var name = this.labels[lblIndex];
            if (gameplayConfig.tryAvoidDuplicate) {
                var contains = false;
                this.enemies.forEach(enemy => {
                    if (enemy.lbl.toLocaleLowerCase() === name.toLocaleLowerCase()) {
                        contains = true;
                    }
                });
                if (!contains) {
                    ret = name;
                    break;
                }
            }
            else {
                ret = name;
                break;
            }
        }
        return ret[0].toUpperCase() + ret.substring(1, ret.length);
    }
    spawn(config) {
        if (notSet(config))
            config = {};
        if (notSet(config.type))
            config.type = EnemyType.Image;
        if (notSet(config.label))
            config.label = this.getNextName();
        if (notSet(config.duration))
            config.duration = gameplayConfig.enemyDuratrion;
        if (notSet(config.health))
            config.health = gameplayConfig.defaultHealth;
        var name = config.label;
        var figureName = name.split(' ').join('-').toLowerCase();
        if (notSet(config.image))
            config.image = figureName;
        var posi = this.getSpawnPoint();
        var tm = getGame().getTime();
        var id = gEnemyID++;
        this.insertSpawnHistory(id, posi, name, tm);
        // var enemy = new EnemyText(this.scene, this, posi, this.lblStyl, {
        //     type: EnemyType.Text,
        //     label: name
        // });
        var enemy = new EnemyImage(this.scene, this, posi, this.lblStyl, config);
        enemy.id = id;
        // console.log('-------------------------')
        this.enemies.forEach(item => {
            // console.log("item: " + item.lbl + " " + item.inner.x + " "+ item.inner.y + " "+ item.inner.alpha);
        });
        // console.log(this.enemies.length + "  name:" + name);
        this.enemies.push(enemy);
        enemy.startRun();
        if (this.curStrategy)
            this.curStrategy.enemySpawned(enemy);
        return enemy;
    }
    insertSpawnHistory(id, posi, name, time) {
        let rad = Math.atan2(posi.y, posi.x);
        let item = {
            id: id,
            degree: rad,
            name: name,
            time: time,
        };
        this.omniHistory.push(item);
    }
    removeEnemy(enemy) {
        for (let i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    }
    update(time, dt) {
        // dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        for (let i in this.enemies) {
            this.enemies[i].update(time, dt);
        }
        if (this.curStrategy)
            this.curStrategy.onUpdate(time, dt);
        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }
    getSpawnPoint() {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = 0;
        while (true) {
            rdDegree = (Math.random() * 2 - 1) * Math.PI;
            pt.x = Math.cos(rdDegree) * this.spawnRadius;
            pt.y = Math.sin(rdDegree) * this.spawnRadius;
            if (this.isValidDegree(rdDegree)) {
                break;
            }
        }
        // console.log(rdDegree);
        return pt;
    }
    isValidDegree(rdDegree) {
        var threshould = Math.PI / 2;
        var subtitleRestrictedAngle = Math.PI / 3 * 2;
        let notInSubtitleZone = !(rdDegree > Math.PI / 2 - subtitleRestrictedAngle / 2 && rdDegree < Math.PI / 2 + subtitleRestrictedAngle / 2);
        let farEnoughFromLastOne = false;
        if (this.omniHistory.length == 0)
            farEnoughFromLastOne = true;
        else {
            var lastOne = this.omniHistory[this.omniHistory.length - 1];
            farEnoughFromLastOne = this.getAngleDiff(lastOne.degree, rdDegree) > threshould;
        }
        return notInSubtitleZone && farEnoughFromLastOne;
    }
    getAngleDiff(angl1, angle2) {
        let diff1 = Math.abs(angl1 - angle2);
        let diff2 = Math.PI * 2 - diff1;
        return Math.min(diff1, diff2);
    }
    // inputConfirm(input: string) {
    //     var enemies = this.enemies;        
    //     var inputWord = input;
    //     let checkLegal : ErrorInputCode = this.checkIfInputLegalAlone(inputWord);
    //     if(checkLegal == ErrorInputCode.NoError) {
    //         this.sendInputToServer(inputWord);
    //     }
    //     else {
    //         console.log("ErrorInputCode before send: " + checkLegal);
    //     }
    // }
    sendInputToServer(inputWord) {
        this.scene.playSpeech(inputWord);
        var enemyLabels = [];
        for (let i in this.enemies) {
            var enemy = this.enemies[i];
            enemyLabels.push(enemy.lbl);
        }
        api3WithTwoParams(inputWord, enemyLabels, 
        // suc
        res => {
            // console.log(res);
            this.confirmCallbackSuc(res);
        }, 
        // err
        function err(res) {
            // console.log("API3 failed");
        });
    }
    // api3 callback
    confirmCallbackSuc(res) {
        var ar = res.outputArray;
        var input = res.input;
        // filter the duplicate labels
        var seen = {};
        ar = ar.filter(item => {
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });
        let legal = true;
        // if we only want to damage the most similar word
        if (gameplayConfig.onlyDamageMostMatch) {
            ar = this.findBiggestDamage(ar);
        }
        for (let i in ar) {
            let entry = ar[i];
            let entryName = ar[i].name;
            let entryValue = ar[i].value;
            // since network has latency, 
            // the enemy could have been eliminated when the callback is invoked
            // we need to be careful about the availability of the enemy
            let enemiesWithName = this.findEnemyByName(entryName);
            enemiesWithName.forEach(e => {
                e.damage(entryValue, input);
            });
        }
    }
    findBiggestDamage(ar) {
        let ret = [];
        let max = -1;
        let entry = null;
        ar.forEach(element => {
            if (element.value > max) {
                max = element.value;
                entry = element;
            }
        });
        if (entry)
            ret.push(entry);
        return ret;
    }
    // haha
    findEnemyByName(name) {
        let ret = [];
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (e.lbl === name) {
                ret.push(e);
            }
        }
        return ret;
    }
    /**
     * PlayerInputTextListener interface implement
     * @param input
     */
    inputTextConfirmed(input) {
        this.sendInputToServer(input);
    }
    updateTheKilledTimeHistoryForEnemy(enemy, eliminated) {
        this.omniHistory.forEach(v => {
            if (v.id === enemy.id) {
                v.killedTime = getGame().getTime();
                v.eliminated = eliminated;
            }
        });
    }
    enemyReachedCore(enemy) {
        // Acturally, I don't think health could be <= 0
        // this is just for safe in case it happens
        if (enemy.health <= 0)
            return;
        // killed time is undefined by default
        // if player failed to kill it, set the value to negative
        this.updateTheKilledTimeHistoryForEnemy(enemy, false);
        if (this.curStrategy)
            this.curStrategy.enemyReachedCore(enemy);
        this.enemyReachedCoreEvent.emit(enemy);
    }
    enemyEliminated(enemy) {
        this.updateTheKilledTimeHistoryForEnemy(enemy, true);
        if (this.curStrategy)
            this.curStrategy.enemyEliminated(enemy);
        this.enemyEliminatedEvent.emit(enemy);
    }
    // This is mostly used when died
    freezeAllEnemies() {
        if (this.autoSpawnTween)
            this.autoSpawnTween.pause();
        this.startSpawnStrategy(SpawnStrategyType.None);
        this.enemies.forEach(element => {
            element.freeze();
        });
    }
    getLastSpawnedEnemyName() {
        if (this.omniHistory.length == 0) {
            return '';
        }
        return this.omniHistory[this.omniHistory.length - 1].name;
    }
    // acturally, this is not the 'last'
    // it's more like the first created among the eliminated ones
    getLastEliminatedEnemyInfo() {
        console.log(this.omniHistory);
        for (let i in this.omniHistory) {
            let e = this.omniHistory[i];
            if (e.eliminated === true)
                return e;
        }
        return null;
    }
}
/// <reference path="enemy-base.ts" />
class EnemyText extends Enemy {
    constructor(scene, enemyManager, posi, lblStyle, config) {
        super(scene, enemyManager, posi, lblStyle, config);
    }
    initContent() {
        super.initContent();
        // text
        this.text = this.scene.add.text(0, 0, this.lbl, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;
        this.text.setOrigin(this.initPosi.x > 0 ? 0 : 1, this.initPosi.y > 0 ? 0 : 1);
        this.inner.add(this.text);
        // healthText
        let lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
    }
}
/**
 * This class is created to solve the origin problem of PhGraphics
 */
class Figure extends Wrapper {
    handleConfig(config) {
        if (notSet(config))
            config = {};
        if (notSet(config.width))
            config.width = 100;
        if (notSet(config.height))
            config.height = 100;
        if (notSet(config.originX))
            config.originX = 0;
        if (notSet(config.originY))
            config.originY = 0;
        this.config = config;
    }
    constructor(scene, parentContainer, x, y, config) {
        super(scene, parentContainer, x, y, null);
        this.handleConfig(config);
        let graphics = this.scene.add.graphics();
        this.applyTarget(graphics);
        this.drawGraphics();
        this.calcGraphicsPosition();
    }
    drawGraphics() {
        // To be implemented in inheritance
    }
    setOrigin(x, y) {
        this.config.originX = x;
        this.config.originY = y;
        this.calcGraphicsPosition();
    }
    setSize(width, height) {
        this.config.width = width;
        if (!notSet(height))
            this.config.height = height;
        this.drawGraphics();
        this.calcGraphicsPosition();
    }
    calcGraphicsPosition() {
        this.applyOrigin(this.wrappedObject);
        if (this.othersContainer) {
            this.applyOrigin(this.othersContainer);
        }
    }
    applyOrigin(ob) {
        if (ob) {
            ob.x = -this.config.width * this.config.originX;
            ob.y = -this.config.height * this.config.originY;
        }
    }
}
class Rect extends Figure {
    handleConfig(config) {
        super.handleConfig(config);
        if (notSet(config.lineWidth))
            config.lineWidth = 4;
        if (notSet(config.lineColor))
            config.lineColor = 0x000000;
        if (notSet(config.lineAlpha))
            config.lineAlpha = 1;
        if (notSet(config.fillColor))
            config.fillColor = 0xffffff;
        if (notSet(config.fillColor))
            config.fillAlpha = 1;
    }
    drawGraphics() {
        let graphics = this.wrappedObject;
        let config = this.config;
        graphics.clear();
        // Some times even if lineWidth == 0 && width == 0
        // There is still a tiny line
        // So we need to double check that if the width == 0,
        // we don't draw anything
        if (config.width === 0)
            return;
        graphics.fillStyle(config.fillColor, config.fillAlpha);
        graphics.fillRect(0, 0, config.width, config.height);
        if (config.lineWidth != 0) {
            graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha);
            graphics.strokeRect(0, 0, config.width, config.height);
        }
    }
}
class Dialog extends Figure {
    constructor(scene, parentContainer, x, y, config) {
        super(scene, parentContainer, x, y, config);
        this.othersContainer = this.scene.add.container(0, 0);
        this.inner.add(this.othersContainer);
        let width = config.width;
        let height = config.height;
        // title
        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50, config.title, titleStyle).setOrigin(0.5).setAlign('center');
        this.othersContainer.add(this.title);
        // content
        let contentStyle = getDefaultTextStyle();
        this.content = this.scene.add.text(config.padding + config.contentPadding, this.title.getBottomCenter().y + config.titleContentGap, config.content, contentStyle);
        this.content.setFontSize(28);
        this.content.setOrigin(0, 0).setAlign('left');
        this.content.setWordWrapWidth(width - (this.config.padding + config.contentPadding) * 2);
        this.othersContainer.add(this.content);
        // OK btn
        this.okBtn = new Button(this.scene, this.othersContainer, width / 2, height - config.btnToBottom, null, '< OK >', 120, 50);
        this.okBtn.text.setColor('#000000');
        this.okBtn.text.setFontSize(38);
        this.okBtn.setToHoverChangeTextMode("-< OK >-");
        this.okBtn.needHandOnHover = true;
        this.okBtn.ignoreOverlay = true;
    }
    setContent(content, title) {
        this.config.title = title;
        this.config.content = content;
        this.content.text = content;
        this.title.text = title;
    }
    handleConfig(config) {
        super.handleConfig(config);
        if (notSet(config.lineWidth))
            config.lineWidth = 4;
        if (notSet(config.lineColor))
            config.lineColor = 0x000000;
        if (notSet(config.lineAlpha))
            config.lineAlpha = 1;
        if (notSet(config.fillColor))
            config.fillColor = 0xffffff;
        if (notSet(config.fillColor))
            config.fillAlpha = 1;
        if (notSet(config.padding))
            config.padding = 4;
    }
    drawGraphics() {
        let graphics = this.wrappedObject;
        let config = this.config;
        graphics.clear();
        graphics.fillStyle(config.fillColor, config.fillAlpha);
        graphics.fillRect(0, 0, config.width, config.height);
        graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha);
        graphics.strokeRect(config.padding, config.padding, config.width - config.padding * 2, config.height - config.padding * 2);
    }
    show() {
        this.inner.setVisible(true);
    }
    hide() {
        this.inner.setVisible(false);
    }
}
/**
 * The anchor of footer is bottom-left
 */
class Footer extends Wrapper {
    constructor(scene, parentContainer, x, y, overallHeight) {
        super(scene, parentContainer, x, y, null);
        this.badges = [];
        let keys = ['footer_ai', 'footer_google', 'footer_nyu'];
        let sepKey = 'footer_sep';
        let curX = 0;
        let gapLogoSep = 50;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let button = new Button(this.scene, this.inner, curX, 0, key, '', undefined, undefined, false, 0, 1);
            button.image.setOrigin(0, 1);
            button.needInOutAutoAnimation = false;
            button.needHandOnHover = true;
            this.badges.push(button);
            if (i === keys.length - 1)
                continue;
            curX += button.image.displayWidth;
            console.log(button.image.displayWidth);
            curX += gapLogoSep;
            let sep = this.scene.add.image(curX, 0, sepKey);
            sep.setOrigin(0, 1);
            this.inner.add(sep);
            curX += gapLogoSep;
        }
        let picH = this.badges[0].image.displayHeight;
        this.inner.setScale(overallHeight / picH);
    }
}
function ImFinishConfig(val) {
    return { finishImmediately: val };
}
var ConditionalRes;
(function (ConditionalRes) {
    ConditionalRes[ConditionalRes["Run"] = 0] = "Run";
    ConditionalRes[ConditionalRes["PassResolve"] = 1] = "PassResolve";
    ConditionalRes[ConditionalRes["PassReject"] = 2] = "PassReject";
})(ConditionalRes || (ConditionalRes = {}));
class Fsm {
    // constructor(scene: PhScene, name: string = "DefaultFsm") {
    //     this.scene = scene;
    //     this.name = name;
    // }
    constructor(scene, fsm) {
        this.states = new Map();
        // Custorm-stored variables
        // will call initVar() to reset it whenever the fsm is started or restarted
        this.variables = new Map();
        this.isRunning = true;
        this.name = fsm.name;
        // Add all events
        for (let i in fsm.events) {
            let event = fsm.events[i];
            let eName = event.name;
            let eFrom = event.from;
            let eTo = event.to;
            let stFrom = this.states.get(eFrom);
            if (!stFrom) {
                stFrom = this.addState(eFrom);
                // console.debug("Added FsmState + " + eFrom);
            }
            if (!this.states.has(eTo)) {
                this.addState(eTo);
                // console.debug("Added FsmState  + " + eTo);
            }
            stFrom.addEventTo(eName, eTo);
        }
        // Set startup state
        if (fsm.initial) {
            let initState = this.states.get(fsm.initial);
            if (!initState) {
                initState = this.addState(fsm.initial);
            }
            initState.setAsStartup();
        }
    }
    getState(stateName) {
        return this.states.get(stateName);
    }
    addState(stateName) {
        let state = new FsmState(stateName, this);
        let res = true;
        res = this.addStateInner(state);
        if (res)
            return state;
        else
            return null;
    }
    addStateInner(state) {
        if (this.states.has(state.name)) {
            console.warn("Added multiple state to fsm: [" + name + "]:[" + state.name + "]");
            return false;
        }
        state.fsm = this;
        this.states.set(state.name, state);
        return true;
    }
    update(time, dt) {
        if (!this.isRunning)
            return;
        if (this.curState && this.curState._onUpdate)
            this.curState._onUpdate(this.curState, time, dt);
    }
    setVar(key, val) {
        this.variables.set(key, val);
    }
    hasVar(key) {
        return this.variables.has(key);
    }
    getVar(key, def) {
        if (this.variables.has(key))
            return this.variables.get(key);
        else
            return def;
    }
    /**
     * invoke a event
     * @param key
     */
    event(key) {
        if (key.toUpperCase() !== key) {
            console.warn("FSM event is not all capitalized: " + key + "\nDid you used the state's name as the event's name by mistake?");
        }
        if (this.curState) {
            if (this.curState.eventRoute.has(key)) {
                let targetName = this.curState.eventRoute.get(key);
                let state = this.states.get(targetName);
                state.fromEvent = key;
                this.runState(state);
            }
        }
    }
    runState(state) {
        if (this.curState)
            this.curState._exit(this.curState);
        this.curState = state;
        state._onEnter(state);
    }
    setStartup(state) {
        this.startupState = state;
    }
    start(clearVar = true) {
        if (clearVar) {
            this.clearVar();
        }
        if (this.startupState) {
            this.runState(this.startupState);
        }
        else {
            console.warn("No startup state for FSM: " + this.name);
        }
    }
    clearVar() {
        this.variables.clear();
    }
    restart(clearVar = true) {
        this.start();
    }
    stop() {
        this.isRunning = false;
        this.curState = null;
    }
    addEvent(eventName, from, to) {
        from = this.getStateName(from);
        to = this.getStateName(to);
        if (!this.states.has(from)) {
            console.warn("Can't find FsmState + " + from);
            return;
        }
        if (!this.states.has(to)) {
            console.warn("Can't find FsmState + " + to);
            return;
        }
        let fromState = this.states.get(from);
        if (fromState.eventRoute.has(eventName)) {
            console.warn("Added multiple event to state: [" + fromState.name + "]:[" + eventName + "]");
            // don't return still add
        }
        fromState.eventRoute.set(eventName, to);
    }
    getStateName(state) {
        let targetName = "";
        if (state instanceof FsmState)
            targetName = state.name;
        else
            targetName = state;
        return targetName;
    }
}
Fsm.FinishedEventName = "FINISHED";
class FsmState {
    constructor(name, fsm) {
        this.eventRoute = new Map();
        this._unionEvents = new Map();
        this.actions = [];
        this.enterExitListners = new TypedEvent();
        this.autoRemoveListners = [];
        this.safeInOutWatchers = [];
        this.name = name;
        this.fsm = fsm;
        this.otherInit();
    }
    /**
     * used for init in inheritance
     */
    otherInit() {
    }
    needStopActions() {
        return !this.isActive();
    }
    autoOn(target, key, func) {
        if (target instanceof TypedEvent) {
            target.on(func);
        }
        else {
            target.on(key, func);
        }
        this.autoRemoveListners.push({ target, key, func });
    }
    autoSafeInOutClick(target, inFunc, outFun, clickFun) {
        this.safeInOutWatchers.push({ target, hoverState: 0, prevDownState: 0 });
        target.on('safein', inFunc);
        this.autoRemoveListners.push({ target, key: 'safein', func: inFunc });
        if (outFun) {
            target.on('safeout', outFun);
            this.autoRemoveListners.push({ target, key: 'safeout', func: outFun });
        }
        if (clickFun) {
            target.on('safeclick', clickFun);
            this.autoRemoveListners.push({ target, key: 'safeclick', func: clickFun });
        }
    }
    addAction(action) {
        this.actions.push({ action: action, actionConfig: null });
        return this;
    }
    getPromiseMiddleware(index) {
        let action = this.actions[index].action;
        let actionConfig = this.actions[index].actionConfig;
        // If this function don't need to run
        if (actionConfig && actionConfig.conditionalRun) {
            let res = actionConfig.conditionalRun(this);
            let needRun = res === ConditionalRes.Run;
            if (!needRun) {
                return (state, result) => new Promise((resolve, reject) => {
                    if (res === ConditionalRes.PassResolve)
                        resolve('Passed and resolved by condition in action config');
                    else if (res === ConditionalRes.PassReject)
                        resolve('Passed and rejected by condition in action config');
                });
            }
        }
        if (action.length > 2) {
            return (state, result) => new Promise((resolve, reject) => {
                action(state, result, resolve, reject);
                if (actionConfig && actionConfig.finishImmediately)
                    resolve('Finished Immediately');
            });
        }
        else {
            return (state, result) => new Promise((resolve, reject) => {
                let actionResult = action(state, result);
                resolve(actionResult);
            });
        }
    }
    /**
     * runActions is called internally by _onEnter
     */
    runActions() {
        if (this.actions.length == 0)
            return;
        // Add first promise
        // let curPromise = this.actions[0](this, null);
        let curPromise = this.getPromiseMiddleware(0)(this, null);
        for (let i = 1; i < this.actions.length; i++) {
            // Add check stop promise
            curPromise = curPromise.then(result => {
                return new Promise((resolve, reject) => {
                    if (this.needStopActions())
                        reject("Need stop");
                    else
                        resolve(result);
                });
            });
            // Add every 'then'
            curPromise = curPromise.then(res => {
                return this.getPromiseMiddleware(i)(this, res);
            });
        }
        curPromise.catch(reason => {
            console.log('catched error in state: ' + reason);
        });
    }
    /**
     * Set the last added action's config
     * @param config
     */
    updateConfig(config) {
        if (this.actions.length > 0) {
            let action = this.actions[this.actions.length - 1];
            if (notSet(action.actionConfig))
                action.actionConfig = {};
            updateObject(config, action.actionConfig);
        }
        return this;
    }
    finishImmediatly() {
        this.updateConfig(ImFinishConfig(true));
        return this;
    }
    setCondition(func) {
        this.updateConfig({ conditionalRun: func });
        return this;
    }
    setBoolCondition(func) {
        this.updateConfig({ conditionalRun: s => {
                if (func(s))
                    return ConditionalRes.Run;
                else
                    return ConditionalRes.PassResolve;
            } });
        return this;
    }
    setAsStartup() {
        this.fsm.setStartup(this);
        return this;
    }
    /**
     *
     * @param from
     * @param eventName
     */
    addEventFrom(eventName, from) {
        let fromName = this.fsm.getStateName(from);
        this.fsm.addEvent(eventName, fromName, this.name);
        return this;
    }
    /**
     * Add event from this to target
     * @param eventName
     * @param to
     */
    addEventTo(eventName, to) {
        let toName = this.fsm.getStateName(to);
        this.fsm.addEvent(eventName, this.name, toName);
        return this;
    }
    /**
     * The real onEnter process, including 2 processes:
     * 1. custum onEnter
     * 2. run actions
     * @param handler
     */
    _onEnter(state) {
        this.resetUnionEvent();
        this.enterExitListners.emit(true);
        if (this.onEnter)
            this.onEnter(state);
        this.runActions();
        return this;
    }
    setOnEnter(handler) {
        this.onEnter = handler;
        return this;
    }
    _onUpdate(state, time, dt) {
        if (this.onUpdate)
            this.onUpdate(state, time, dt);
        let mp = getGame().input.activePointer;
        this.safeInOutWatchers.forEach(e => {
            let contains = e.target.getBounds().contains(mp.x, mp.y);
            if (gOverlay && gOverlay.isInShow())
                contains = false;
            if (e.hoverState == 0 && contains) {
                e.hoverState = 1;
                e.target.emit('safein');
            }
            else if (e.hoverState == 1 && !contains) {
                e.hoverState = 0;
                e.target.emit('safeout');
            }
            if (contains) {
                if (mp.isDown && e.prevDownState === 0) {
                    e.target.emit('safeclick');
                }
            }
            e.prevDownState = mp.isDown ? 1 : 0;
        });
    }
    setOnUpdate(handler) {
        this.onUpdate = handler;
        return this;
    }
    removeAutoRemoveListners() {
        for (let i in this.autoRemoveListners) {
            let listener = this.autoRemoveListners[i];
            if (listener.target instanceof TypedEvent) {
                listener.target.off(listener.func);
            }
            else {
                listener.target.off(listener.key, listener.func);
            }
        }
        // remove all cached
        this.autoRemoveListners.length = 0;
    }
    _exit(state) {
        this.enterExitListners.emit(false);
        if (this.onExit)
            this.onExit(this);
        this.removeAutoRemoveListners();
        this.safeInOutWatchers.length = 0;
        return this;
    }
    ;
    setOnExit(handler) {
        this.onExit = handler;
        return this;
    }
    finished() {
        this.fsm.event(Fsm.FinishedEventName);
    }
    /**
     * Union event will only invoke the event when the \
     * counter reached the set value \
     * It's mostly used when you want to send a event
     * after multiple conditions are reached
     */
    unionEvent(evName, id) {
        let body = this._unionEvents.get(evName);
        if (!body || !body.set)
            return;
        body.set.add(id);
        if (body.set.size == body.require) {
            this.event(evName);
        }
    }
    resetUnionEvent() {
        this._unionEvents.forEach((value, key, map) => {
            value.set.clear();
        });
    }
    setUnionEvent(evName, require) {
        let set = new Set();
        this._unionEvents.set(evName, { require: require, set: set });
    }
    /**
     * Only call this if you know what you are doin
     * @param evName
     */
    event(evName, fsm) {
        if (notSet(fsm))
            this.fsm.event(evName);
        else
            fsm.event(evName);
    }
    isActive() {
        return this.fsm.curState == this;
    }
}
/// <reference path="fsm.ts" />
var TweenPromise = {
    create: function (scene, config) {
        let tp = new Promise(res => {
            config.onComplete = res;
            let centerRotateTween = scene.tweens.add(config);
        });
        return tp;
    }
};
var TimeOutPromise = {
    create: function (dt, isResolve = true) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (isResolve)
                    resolve('timeout resolve by :' + dt);
                else
                    reject('timeout reject by: ' + dt);
            }, dt);
        });
    }
};
var FadePromise = {
    create: function (scene, target, to, dt) {
        return new Promise((resolve, reject) => {
            scene.tweens.add({
                targets: target,
                alpha: to,
                duration: dt,
                onComplete: () => resolve('completed')
            });
        });
    }
};
var TimeOutRace = {
    create: function (base, dt, isResolve = true) {
        return Promise.race([base, TimeOutPromise.create(dt, isResolve)]);
    }
};
var TimeOutAll = {
    create: function (base, dt, isResolve = true) {
        return Promise.all([base, TimeOutPromise.create(dt, isResolve)]);
    }
};
function notSet(val) {
    return val === null || val === undefined;
}
FsmState.prototype.addSubtitleAction = function (subtitle, text, autoHideAfter, timeout, minStay, finishedSpeechWait) {
    let self = this;
    if (notSet(timeout))
        timeout = 2000;
    if (notSet(minStay))
        minStay = 1000;
    if (notSet(finishedSpeechWait))
        finishedSpeechWait = 600;
    self.addAction((state, result, resolve, reject) => {
        let realText = typeof (text) == 'string' ? text : text(state);
        subtitle.loadAndSay(subtitle, realText, autoHideAfter, timeout, minStay, finishedSpeechWait)
            .then(s => { resolve('subtitle show end'); })
            .catch(s => { resolve('subtitle show end with some err'); });
    });
    return self;
};
FsmState.prototype.addLogAction = function (message) {
    let self = this;
    self.addAction((state, result) => {
        console.log(message);
    });
    return self;
};
FsmState.prototype.addFinishAction = function () {
    let self = this;
    self.addAction((state, result) => {
        state.finished();
    });
    return self;
};
FsmState.prototype.addEventAction = function (eventName, fsm) {
    let self = this;
    self.addAction((state, result) => {
        state.event(eventName, fsm);
    });
    return self;
};
FsmState.prototype.addDelayAction = function (scene, dt) {
    this.addAction((state, result, resolve, reject) => {
        scene.time.delayedCall(dt, resolve, [], null);
    });
    return this;
};
FsmState.prototype.addTweenAction = function (scene, config) {
    this.addAction((state, result, resolve, reject) => {
        config.onComplete = resolve;
        let tweeen = scene.tweens.add(config);
    });
    return this;
};
FsmState.prototype.addTweenAllAction = function (scene, configs) {
    this.addAction((state, result, resolve, reject) => {
        let promises = [];
        configs.forEach(element => {
            promises.push(TweenPromise.create(scene, element));
        });
        Promise.all(promises).then(data => {
            resolve(data);
        }).catch(e => console.log(e));
    });
    return this;
};
var mainFsm = {
    name: 'MainFsm',
    initial: "Home",
    events: [
        { name: 'TO_FIRST_MEET', from: 'Home', to: 'FirstMeet' },
        { name: 'TO_SECOND_MEET', from: 'Home', to: 'SecondMeet' },
        { name: 'FINISHED', from: 'HomeToGameAnimation', to: 'NormalGame' },
        { name: 'BACK_TO_HOME', from: 'NormalGame', to: 'BackToHomeAnimation' },
        { name: 'FINISHED', from: 'BackToHomeAnimation', to: 'Home' },
        { name: 'FINISHED', from: 'FirstMeet', to: 'ModeSelect' },
        { name: 'FINISHED', from: 'SecondMeet', to: 'ModeSelect' },
        { name: 'FINISHED', from: 'ModeSelect', to: 'HomeToGameAnimation' },
        { name: 'DIED', from: 'NormalGame', to: 'Died' },
        { name: 'RESTART', from: 'Died', to: 'Restart' },
        { name: 'BACK_TO_HOME', from: 'Died', to: 'BackToHomeAnimation' },
        { name: 'RESTART_TO_GAME', from: 'Restart', to: 'NormalGame' }
    ],
};
// var mainFsm = 
// {
//   initial: "Home",  
//   events: [
//     { name: 'Finished', from: 'Home', to: 'HomeToGameAnimation' },
//     { name: 'Finished', from: 'HomeToGameAnimation', to: 'NormalGame' },
//     { name: 'BACK_TO_HOME', from: 'NormalGame', to: 'BACK_TO_HOMEAnimation' },
//   ], 
// };
// var traverse = require('babel-traverse').default;
// var babylon = require("babylon");
// var generator = require("babel-generator").default
// const ast = babylon.parse(code);
// traverse(ast, {
//   enter: path => {
//     const { node, parent } = path;        
//     // do with the node
//   }
// });
var normalGameFsm = {
    name: 'NormalGameFsm',
    initial: "Default",
    events: [
        { name: 'TUTORIAL_START', from: 'Default', to: 'TutorialStart' },
        { name: 'EXPLAIN_HP', from: 'TutorialStart', to: 'ExplainHp' },
        { name: 'TO_FLOW_STRATEGY', from: 'ExplainHp', to: 'FlowStrategy' },
        { name: 'NORMAL_START', from: 'Default', to: 'NormalStart' }
    ]
};
class HealthIndicator {
    // mvTween: PhTween;
    constructor(scene, parentContainer, posi, num) {
        this.textPosi = MakePoint2(0, 1);
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.num = num;
        // circle
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 1); // background circle
        this.graphics.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        this.inner.add(this.graphics);
        // text health
        this.text = this.makeCenterText(num);
        // text mask
        // in canvas mode, nested children in a container won't accept the mask
        // so I need to add fadein / fadeout
        this.maskGraph = this.scene.make.graphics({});
        this.maskGraph.fillStyle(0x0000ff, 1); // background circle
        this.maskGraph.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        let p = this.getAbsolutePosi(this.inner, this.textPosi);
        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;
        this.mask = this.maskGraph.createGeometryMask();
        this.text.setMask(this.mask);
    }
    makeCenterText(num, offsetX = 0, offsetY = 0) {
        this.textStyle = getDefaultTextStyle();
        this.textStyle.fontFamily = gameplayConfig.healthIndicatorFontFamily;
        this.textStyle.fill = '#FFFFFF';
        this.textStyle.fontSize = '28px';
        let t = this.scene.add.text(this.textPosi.x + offsetX, this.textPosi.y + offsetY, num.toString(), this.textStyle);
        t.setOrigin(0.5, 0.5);
        this.inner.add(t);
        if (this.mask) {
            t.setMask(this.mask);
        }
        return t;
    }
    damagedTo(num) {
        let curNum = this.num;
        let newNum = num;
        // In canvas mode, nested children in a container won't accept the mask
        // so I need to add fadein/fadeout
        let oldText = this.text;
        let outTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                oldText.destroy();
            }
        });
        this.text = this.makeCenterText(num, 0, -gameplayConfig.healthIndicatorWidth);
        this.text.alpha = 0;
        let inTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            alpha: 1,
            duration: 500
        });
    }
    update(time, dt) {
        let p = this.getAbsolutePosi(this.inner, this.textPosi);
        // console.log("getAbsolutePosi:" + p.x + " " + p.y);
        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;
    }
    getAbsolutePosi(ct, posi) {
        var ret = MakePoint2(posi.x, posi.y);
        while (ct != null) {
            ret.x += ct.x;
            ret.y += ct.y;
            ct = ct.parentContainer;
        }
        return ret;
    }
}
class HP extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.progressColor = 0x888888;
        this.progressGap = 4;
        this.titleGap = 1;
        this.barHeight = 40;
        this.barWidth = 400;
        this.frameWidth = 6;
        this.maxHealth = 10;
        this.currHealth = this.maxHealth;
        this.deadEvent = new TypedEvent();
        this.mainBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: 0x222222,
            width: this.barWidth,
            height: this.barHeight,
            lineWidth: this.frameWidth,
            originX: 0,
            originY: 1,
        });
        this.progressMaxWidth = this.barWidth - this.frameWidth - this.progressGap * 2;
        this.innerProgress = new Rect(this.scene, this.inner, this.frameWidth / 2 + this.progressGap, -this.frameWidth / 2 - this.progressGap, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.progressMaxWidth,
            height: this.barHeight - this.frameWidth - this.progressGap * 2,
            lineWidth: 0,
            originX: 0,
            originY: 1,
        });
        let style = getDefaultTextStyle();
        let title = this.scene.add.text(-this.frameWidth / 2, -this.barHeight - this.titleGap, "HP", style).setOrigin(0, 1);
        this.applyTarget(title);
    }
    setTitle(val) {
        this.wrappedObject.text = val;
    }
    damageBy(val) {
        if (this.currHealth <= 0)
            return;
        this.currHealth -= val;
        this.currHealth = Math.max(0, this.currHealth);
        let perc = this.currHealth / this.maxHealth;
        let newProgressWidth = perc * this.progressMaxWidth;
        this.innerProgress.setSize(newProgressWidth);
        if (this.currHealth == 0) {
            this.deadEvent.emit('Haha, you died');
        }
    }
    reset() {
        this.currHealth = this.maxHealth;
        this.innerProgress.setSize(this.progressMaxWidth);
    }
}
var nyuAbout = `The NYU Game Center is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`;
var googleAbout = `Experiment 65536 is made with the help of the following solutions from Google:

TensorFlow TFHub universal-sentence-encoder: Encodes text into high-dimensional vectors that can be used for text classification, semantic similarity, clustering and other natural language tasks

Quick, Draw! The Data: These doodles are a unique data set that can help developers train new neural networks, help researchers see patterns in how people around the world draw, and help artists create things we haven’t begun to think of.

Google Cloud Text-to-Speech API (WaveNet): Applies groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio
`;
// The wrapped PhText is only for the fact the Wrapper must have a T
// We don't really use the wrapped object
class Overlay extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.inShow = false;
        let width = getLogicWidth();
        this.bkg = new Rect(this.scene, this.inner, 0, 0, {
            fillColor: 0x000000,
            fillAlpha: 0.8,
            width: width,
            height: phaserConfig.scale.height,
            lineWidth: 0,
            originX: 0.5,
            originY: 0.5,
        });
        this.dialog = new Dialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 1000,
            height: 700,
            title: 'About',
            titleContentGap: 40,
            contentPadding: 60,
            btnToBottom: 65,
            content: nyuAbout
        });
        this.dialog.setOrigin(0.5, 0.5);
        this.dialog.okBtn.clickedEvent.on(() => {
            this.hide();
        });
        this.dialog.inner.setVisible(false);
        this.hide();
    }
    ;
    showAboutDialog() {
        this.dialog.setContent(nyuAbout, "NYU Game Center");
        this.show();
        this.dialog.show();
    }
    showGoogleDialog() {
        this.dialog.setContent(googleAbout, "Solutions");
        this.show();
        this.dialog.show();
    }
    show() {
        this.inShow = true;
        this.inner.setVisible(true);
    }
    hide() {
        this.inShow = false;
        this.inner.setVisible(false);
    }
    isInShow() {
        return this.inShow;
    }
}
class PlayerInputText {
    constructor(scene, container, centerObject, dummyTitle) {
        this.confirmedEvent = new TypedEvent();
        this.changedEvent = new TypedEvent();
        this.fontSize = 32;
        this.titleSize = 24;
        this.inputHistory = []; //store only valid input history
        this.gap = 4;
        this.gapTitle = 6;
        this.canAcceptInput = false;
        this.scene = scene;
        this.parentContainer = container;
        this.centerObject = centerObject;
        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF',
            fontFamily: "Georgia, serif"
        };
        this.maxCount = 100;
        this.text; // main text input
        this.shortWords = new Set();
        this.shortWords.add("go");
        this.shortWords.add("hi");
        this.shortWords.add("no");
        this.shortWords.add("tv");
        // * Phaser's keydown logic sometimes will invoke duplicate events if the input is fast        
        // * Hence, we should use the standard keydown instead
        // * Caution: Management of the lifetime of the listners here 
        // * has been moved to the FSM state: NormalGame: onEnter
        // this.scene.input.keyboard.on('keydown', (event) => this.keydown(event));        
        // $(document).keypress(this.keypress.bind(this));
        // $(document).keydown(this.keydown.bind(this));
        this.titleStyle = {
            fontSize: this.titleSize + 'px',
            fill: '#FFFFFF',
            fontFamily: gameplayConfig.titleFontFamily
        };
        this.title = this.scene.add.text(-this.getAvailableWidth() / 2, -this.gapTitle, dummyTitle, this.titleStyle).setOrigin(0, 1).setAlpha(0);
        this.parentContainer.add(this.title);
    }
    init(defaultStr) {
        this.text = this.scene.add.text(-this.getAvailableWidth() / 2, -this.gap, defaultStr, this.lblStyl).setOrigin(0, 1);
        this.parentContainer.add(this.text);
    }
    // keypress to handle all the valid characters
    keypress(event) {
        if (!this.getCanAcceptInput())
            return;
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        // console.log("keykown: " + code);
        if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            return;
        }
        if (t.length < this.maxCount && this.text.width < this.getAvailableWidth()) {
            var codeS = String.fromCharCode(code);
            if (t.length == 0)
                codeS = codeS.toUpperCase();
            t += codeS;
        }
        this.text.setText(t);
        this.changedEvent.emit(this);
        // console.log("dis width: " + this.text.displayWidth);
        // console.log("width: " + this.text.width);
    }
    getAvailableWidth() {
        return this.centerObject.getTextMaxWidth();
    }
    // keydown to handle the commands
    keydown(event) {
        if (!this.getCanAcceptInput())
            return;
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        if (code == Phaser.Input.Keyboard.KeyCodes.BACKSPACE /* backspace */
            || code == Phaser.Input.Keyboard.KeyCodes.DELETE /* delete*/) {
            if (t.length > 0) {
                t = t.substring(0, t.length - 1);
            }
        }
        else if (code == Phaser.Input.Keyboard.KeyCodes.ESC) {
            t = "";
        }
        else if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            t = "";
            this.confirm();
        }
        this.text.setText(t);
        this.changedEvent.emit(this);
    }
    confirm() {
        var inputWord = this.text.text;
        let checkLegal = this.checkIfInputLegalBeforeSend(inputWord);
        let legal = checkLegal == ErrorInputCode.NoError;
        if (legal) {
            this.inputHistory.push(inputWord);
            this.confirmedEvent.emit(inputWord);
            this.showConfirmEffect(inputWord, this.text, 250);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
    }
    /**
     * Set the real label to a empty string\
     * then construct a new pseudo text and show a fade tween on it
     */
    showConfirmEffect(oriWord, refText, dt) {
        refText.text = "";
        let fakeText = this.scene.add.text(refText.x, refText.y, oriWord, refText.style).setOrigin(refText.originX, refText.originY);
        refText.parentContainer.add(fakeText);
        let fadeTween = this.scene.tweens.add({
            targets: fakeText,
            alpha: 0,
            y: '-= 40',
            duration: dt,
            onComplete: function () {
                fakeText.destroy();
            }
        });
    }
    /**
     * Check without the need to compare with other enemy lables
     * This is mostly done before sending the input to the server on the client side
     * @param inputLbl player input
     */
    checkIfInputLegalBeforeSend(inputLbl) {
        var inputLblWithoutSpace = inputLbl.trim().replace(/ /g, '').toLowerCase();
        if (!this.shortWords.has(inputLblWithoutSpace) && inputLblWithoutSpace.length <= 2) {
            return ErrorInputCode.TooShort;
        }
        else if (!gameplayConfig.allowSameInput && this.checkIfRecentHistoryHasSame(inputLbl, 1)) {
            return ErrorInputCode.Repeat;
        }
        return ErrorInputCode.NoError;
    }
    /**
     * Check if the input history has the same input
     * @param inputLbl
     * @param recentCount
     */
    checkIfRecentHistoryHasSame(inputLbl, recentCount = 3) {
        inputLbl = inputLbl.trim();
        for (let i = this.inputHistory.length - 1; i >= 0 && --recentCount >= 0; i--) {
            if (this.inputHistory[i].trim() === inputLbl) {
                return true;
            }
        }
        return false;
    }
    checkInput() {
    }
    homePointerOver() {
        this.title.setText("Project 65535");
        if (this.titleOut)
            this.titleOut.stop();
        this.titleIn = this.scene.tweens.add({
            targets: this.title,
            alpha: 1,
            duration: 400,
        });
    }
    homePointerOut() {
        this.title.setText("Project 65535");
        if (this.titleIn)
            this.titleIn.stop();
        this.titleOut = this.scene.tweens.add({
            targets: this.title,
            alpha: 0,
            duration: 250,
        });
    }
    // If you want to force set a status of the title like set title.alpha = 0
    // but there is still a tween on it, you will notice that the setting didin't work
    // Cause the tween will override the settting
    // You muse stop any related tween, and then set it
    stopTitleTween() {
        if (this.titleIn)
            this.titleIn.stop();
        if (this.titleOut)
            this.titleOut.stop();
    }
    /**
     * Current logic is that we get into scene1 once player clicked the center circle
     * Transfer to the scene 1 game play
     */
    homePointerDown() {
        this.title.setText(gameplayConfig.titleChangedTo);
        if (this.titleOut)
            this.titleOut.stop();
    }
    prepareToNormalGame() {
        this.showConfirmEffect(this.title.text, this.title, 1000);
        this.setCanAcceptInput(true);
    }
    prepareToGoBack() {
        // this.title.setText(gameplayConfig.titleOriginal);
        this.showConfirmEffect(this.text.text, this.text, 1000);
        this.setCanAcceptInput(false);
        // set title alpha to 0 becuase when entered game mode, the title's alpha is still 1
        // we only used a pseudo title to show the faked showConfirmEffect
        this.title.alpha = 0;
    }
    setCanAcceptInput(val) {
        this.canAcceptInput = val;
    }
    getCanAcceptInput() {
        return this.canAcceptInput;
    }
}
var figureNames = ["aircraft carrier", "airplane", "alarm clock", "ambulance", "angel", "animal migration", "ant", "anvil", "apple", "arm", "asparagus", "axe", "backpack", "banana", "bandage", "barn", "baseball bat", "baseball", "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard", "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake", "blackberry", "blueberry", "book", "boomerang", "bottlecap", "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket", "bulldozer", "bus", "bush", "butterfly", "cactus", "cake", "calculator", "calendar", "camel", "camera", "camouflage", "campfire", "candle", "cannon", "canoe", "car", "carrot", "castle", "cat", "ceiling fan", "cell phone", "cello", "chair", "chandelier", "church", "circle", "clarinet", "clock", "cloud", "coffee cup", "compass", "computer", "cookie", "cooler", "couch", "cow", "crab", "crayon", "crocodile", "crown", "cruise ship", "cup", "diamond", "dishwasher", "diving board", "dog", "dolphin", "donut", "door", "dragon", "dresser", "drill", "drums", "duck", "dumbbell", "ear", "elbow", "elephant", "envelope", "eraser", "eye", "eyeglasses", "face", "fan", "feather", "fence", "finger", "fire hydrant", "fireplace", "firetruck", "fish", "flamingo", "flashlight", "flip flops", "floor lamp", "flower", "flying saucer", "foot", "fork", "frog", "frying pan", "garden hose", "garden", "giraffe", "goatee", "golf club", "grapes", "grass", "guitar", "hamburger", "hammer", "hand", "harp", "hat", "headphones", "hedgehog", "helicopter", "helmet", "hexagon", "hockey puck", "hockey stick", "horse", "hospital", "hot air balloon", "hot dog", "hot tub", "hourglass", "house plant", "house", "hurricane", "ice cream", "jacket", "jail", "kangaroo", "key", "keyboard", "knee", "knife", "ladder", "lantern", "laptop", "leaf", "leg", "light bulb", "lighter", "lighthouse", "lightning", "line", "lion", "lipstick", "lobster", "lollipop", "mailbox", "map", "marker", "matches", "megaphone", "mermaid", "microphone", "microwave", "monkey", "moon", "mosquito", "motorbike", "mountain", "mouse", "moustache", "mouth", "mug", "mushroom", "nail", "necklace", "nose", "ocean", "octagon", "octopus", "onion", "oven", "owl", "paint can", "paintbrush", "palm tree", "panda", "pants", "paper clip", "parachute", "parrot", "passport", "peanut", "pear", "peas", "pencil", "penguin", "piano", "pickup truck", "picture frame", "pig", "pillow", "pineapple", "pizza", "pliers", "police car", "pond", "pool", "popsicle", "postcard", "potato", "power outlet", "purse", "rabbit", "raccoon", "radio", "rain", "rainbow", "rake", "remote control", "rhinoceros", "rifle", "river", "roller coaster", "rollerskates", "sailboat", "sandwich", "saw", "saxophone", "school bus", "scissors", "scorpion", "screwdriver", "sea turtle", "see saw", "shark", "sheep", "shoe", "shorts", "shovel", "sink", "skateboard", "skull", "skyscraper", "sleeping bag", "smiley face", "snail", "snake", "snorkel", "snowflake", "snowman", "soccer ball", "sock", "speedboat", "spider", "spoon", "spreadsheet", "square", "squiggle", "squirrel", "stairs", "star", "steak", "stereo", "stethoscope", "stitches", "stop sign", "stove", "strawberry", "streetlight", "string bean", "submarine", "suitcase", "sun", "swan", "sweater", "swing set", "sword", "syringe", "t-shirt", "table", "teapot", "teddy-bear", "telephone", "television", "tennis racquet", "tent", "The Eiffel Tower", "The Great Wall of China", "The Mona Lisa", "tiger", "toaster", "toe", "toilet", "tooth", "toothbrush", "toothpaste", "tornado", "tractor", "traffic light", "train", "tree", "triangle", "trombone", "truck", "trumpet", "umbrella", "underwear", "van", "vase", "violin", "washing machine", "watermelon", "waterslide", "whale", "wheel", "windmill", "wine bottle", "wine glass", "wristwatch", "yoga", "zebra", "zigzag"];
var gQuickIndex = 0;
class QuickDrawFigure {
    constructor(scene, parentContainer, lbl) {
        this.curIndex = -1;
        this.interval = 200;
        this.testIndex = 0;
        this.sampleRate = gameplayConfig.drawDataSample;
        this.originX = 0.5;
        this.originY = 0.5;
        this.newSize = gameplayConfig.drawDataDefaultSize;
        this.graphicLineStyle = {
            width: 4,
            color: 0x000000,
            alpha: 1
        };
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.lbl = lbl;
        this.inner = this.scene.add.graphics({ lineStyle: this.graphicLineStyle });
        let fullPath = this.getFilePathByLbl(lbl);
        $.getJSON(fullPath, json => {
            this.figures = json;
            // this.drawFigure(this.figures[3]);          
            this.startChange();
        });
        this.testIndex = gQuickIndex;
        gQuickIndex++;
        this.parentContainer.add(this.inner);
    }
    ;
    dispose() {
        if (this.changeTween) {
            this.changeTween.stop();
            this.changeTween = null;
        }
    }
    // 
    drawFigure(figure) {
        var strokes = figure.drawing;
        this.inner.clear();
        // let maxY = -10000;
        // let maxX = -10000;
        // the sample is 255, which means that x, y are both <= 255        
        // console.log("drawFigure");
        for (let strokeI = 0; strokeI < strokes.length; strokeI++) {
            // console.log("drawFigure strokeI:" + strokeI);
            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for (let i = 0; i < count - 1; i++) {
                this.mappedLineBetween(xArr[i], yArr[i], xArr[i + 1], yArr[i + 1]);
                // maxX = Math.max(maxX, xArr[i]);
                // maxY = Math.max(maxY, yArr[i]);
                // console.log(xArr[i]);
            }
        }
        // console.log("MaxX: " + maxX + "   MaxY: " + maxY) ;        
    }
    mappedLineBetween(x1, y1, x2, y2) {
        let mappedPosi1 = this.getMappedPosi(x1, y1);
        let mappedPosi2 = this.getMappedPosi(x2, y2);
        this.inner.lineBetween(mappedPosi1[0], mappedPosi1[1], mappedPosi2[0], mappedPosi2[1]);
    }
    getFilePathByLbl(lbl) {
        let folderPath = gameplayConfig.quickDrawDataPath;
        return folderPath + lbl + ".json";
    }
    startChange() {
        this.changeTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,
            onStart: () => {
                this.change();
            },
            onRepeat: () => {
                this.change();
            },
            repeat: -1
        });
    }
    change() {
        if (!this.figures || this.figures.length == 0)
            return;
        this.curIndex = (this.curIndex + 1) % this.figures.length;
        this.drawFigure(this.figures[this.curIndex]);
    }
    getMappedPosi(x, y) {
        let scaleRate = this.newSize / this.sampleRate;
        let posi = [
            x * scaleRate - this.newSize * this.originX,
            y * scaleRate - this.newSize * this.originY
        ];
        return posi;
    }
    getRightBottom() {
        let mappedPosi = this.getMappedPosi(this.sampleRate, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    }
    getLeftBottom() {
        let mappedPosi = this.getMappedPosi(0, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    }
}
var SpawnStrategyType;
(function (SpawnStrategyType) {
    SpawnStrategyType[SpawnStrategyType["None"] = 0] = "None";
    SpawnStrategyType[SpawnStrategyType["SpawnOnEliminatedAndReachCore"] = 1] = "SpawnOnEliminatedAndReachCore";
    SpawnStrategyType[SpawnStrategyType["FlowTheory"] = 2] = "FlowTheory";
})(SpawnStrategyType || (SpawnStrategyType = {}));
class SpawnStrategy {
    constructor(manager, type, config) {
        this.config = {};
        this.config = this.getInitConfig();
        this.enemyManager = manager;
        this.type = type;
        this.updateConfig(config);
    }
    getInitConfig() {
        return {};
    }
    updateConfig(config) {
        if (notSet(config))
            return;
        for (let key in config) {
            this.config[key] = config[key];
        }
    }
    onEnter() {
    }
    onExit() {
    }
    onUpdate(time, dt) {
    }
    enemyReachedCore(enemy) {
    }
    enemyEliminated(enemy) {
    }
    enemySpawned(enemy) {
    }
    reset() {
    }
}
class SpawnStrategyOnEliminatedAndReachCore extends SpawnStrategy {
    constructor(manager, config) {
        super(manager, SpawnStrategyType.SpawnOnEliminatedAndReachCore, config);
    }
    getInitConfig() {
        return {
            healthMin: 3,
            healthMax: 3,
            health: 3,
            enemyDuration: 60000,
        };
    }
    spawn() {
        let config = this.config;
        this.enemyManager.spawn({ health: config.health, duration: config.enemyDuration });
    }
    onEnter() {
        if (this.enemyManager.enemies.length == 0) {
            this.spawn();
        }
    }
    enemyReachedCore(enemy) {
        this.spawn();
    }
    enemyEliminated(enemy) {
        this.spawn();
    }
}
class SpawnStrategyFlowTheory extends SpawnStrategy {
    constructor(manager, config) {
        super(manager, SpawnStrategyType.FlowTheory, config);
    }
    getInitConfig() {
        return {
            healthMin: 3,
            healthMax: 3,
            health: 3,
            enemyDuration: 40000,
        };
    }
    spawn() {
        let config = this.config;
        this.enemyManager.spawn({ health: config.health, duration: config.enemyDuration });
    }
    getInterval() {
        let history = this.enemyManager.omniHistory;
        let n = history.length;
        let sumLife = 0;
        let avaiCount = 0;
        let killedCount = 0;
        for (let i = 0; i < n; i++) {
            let item = history[i];
            let killedTime = item.killedTime;
            let spawnTime = item.time;
            if (killedTime === undefined || item.eliminated === undefined) {
                continue;
            }
            if (item.eliminated === true) {
                killedCount++;
            }
            let duration = killedTime - spawnTime;
            if (duration <= 0)
                continue;
            avaiCount++;
            sumLife += duration;
            if (item.eliminated === false) {
                sumLife += 1;
            }
        }
        let average = sumLife / avaiCount;
        let adjusted = average * 0.7;
        if (killedCount >= 4)
            adjusted *= 0.8;
        if (killedCount >= 8)
            adjusted *= 0.9;
        if (avaiCount == 0) {
            return 8000;
        }
        else {
            console.log(adjusted);
            return adjusted;
        }
    }
    onEnter() {
        console.log('flow entered');
    }
    onUpdate(time, dt) {
        let lastSpawnTime = -1000;
        let historyLength = this.enemyManager.omniHistory.length;
        if (historyLength > 0) {
            lastSpawnTime = this.enemyManager.omniHistory[historyLength - 1].time;
        }
        let currentEnemies = this.enemyManager.enemies.length;
        let minEnemies = 2;
        let enemiesNeedSpawn = Math.max(0, minEnemies - currentEnemies);
        if (enemiesNeedSpawn > 0) {
            for (let i = 0; i < enemiesNeedSpawn; i++) {
                this.spawn();
            }
        }
        else {
            let timeSinceLastSpawn = time - lastSpawnTime;
            let interval = this.getInterval();
            if (timeSinceLastSpawn > interval) {
                console.log('update spawn');
                this.spawn();
            }
        }
    }
}
class SpeechManager {
    constructor(scene) {
        this.loadedSpeechFilesStatic = {};
        this.loadedSpeechFilesQuick = {};
        // contain all the currently playing && not completed sounds played by playSoundByKey()
        this.playingSounds = [];
        this.scene = scene;
    }
    /**
     * If after 'timeOut' the resource is still not ready to play\
     * cancel the whole process
     * @param text
     * @param play
     * @param timeOut
     */
    quickLoadAndPlay(text, play = true, timeOut = 4000) {
        console.log("Begin quick load and play");
        // in quick mode the key is just the input text
        // we can judge if we have the key stored directly
        let key = text;
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = this.loadedSpeechFilesQuick.hasOwnProperty(key);
        let cached = cachedInPhaser && cachedByMySelf;
        if (cached) {
            if (play) {
                // console.log("play cahced");
                return this.playSoundByKey(key);
            }
        }
        else {
            let apiAndLoadPromise = apiTextToSpeech2(text, "no_id")
                .then(oReq => {
                //console.log("suc in quickLoadAndPlay")
                var arrayBuffer = oReq.response;
                // this blob may leak memory
                var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
                var url = URL.createObjectURL(blob);
                // console.log(url);    
                return this.phaserLoad(text, text, url, false);
            });
            let ret = TimeOutRace.create(apiAndLoadPromise, timeOut, false)
                .then(key => {
                if (play)
                    return this.playSoundByKey(key);
            });
            // .catch(e => {
            //     console.log("error in static load and play");
            //     console.log(e);
            // });
            return ret;
        }
    }
    /**
     * If after 'timeOut' the resource is still not ready to play\
     * cancel the whole process
     * @param text
     * @param play
     * @param timeOut
     */
    staticLoadAndPlay(text, play = true, timeOut = 4000) {
        let apiAndLoadPromise = apiTextToSpeech(text, "no_id")
            .then(sucRet => {
            let retID = sucRet.id;
            let retText = sucRet.input;
            let retPath = sucRet.outputPath;
            let md5 = sucRet.md5;
            return this.phaserLoad(retText, md5, retPath, true);
        });
        let ret = TimeOutRace.create(apiAndLoadPromise, timeOut, false)
            .then(key => {
            if (play)
                return this.playSoundByKey(key);
        });
        // .catch(e => {
        //     console.log("error in static load and play");
        //     console.log(e);
        // });
        return ret;
    }
    clearSpeechCacheStatic() {
        for (let key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesStatic = {};
    }
    clearSpeechCacheQuick() {
        for (let key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesQuick = {};
    }
    phaserLoad(text, key, fullPath, isStatic = true) {
        // console.log("isStatic: " + isStatic);
        // console.log("------------------------------");      
        let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        let cachedByMySelf = isStatic ?
            this.loadedSpeechFilesStatic.hasOwnProperty(key) :
            this.loadedSpeechFilesQuick.hasOwnProperty(key);
        // double check
        if (cachedByMySelf && cachedInPhaser) {
            return Promise.resolve(key);
        }
        else {
            // console.log(fullPath);
            return this.loadAudio(key, [fullPath], isStatic);
        }
    }
    // phaserLoadAndPlay(text, key, fullPath, isStatic = true, play = true): Pany {
    //     // console.log("isStatic: " + isStatic);
    //     // console.log("------------------------------");      
    //     let cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
    //     let cachedByMySelf = isStatic ?
    //         this.loadedSpeechFilesStatic.hasOwnProperty(key) :
    //         this.loadedSpeechFilesQuick.hasOwnProperty(key);
    //     // double check
    //     if (cachedByMySelf && cachedInPhaser) {
    //         return this.playSoundByKey(key);
    //     }
    //     else {
    //         console.log(fullPath);
    //         return this.loadAudio(key, [fullPath], isStatic, play);
    //     }
    // }
    loadAudio(key, pathArray, isStatic = true) {
        return new Promise((resolve, reject) => {
            this.scene.load.audio(key, pathArray);
            let localThis = this;
            this.scene.load.addListener('filecomplete', function onCompleted(arg1, arg2, arg3) {
                resolve(arg1);
                localThis.scene.load.removeListener('filecomplete', onCompleted);
            });
            this.scene.load.start();
        })
            .then(suc => {
            if (isStatic)
                this.loadedSpeechFilesStatic[key] = true;
            else
                this.loadedSpeechFilesQuick[key] = true;
            if (suc === key)
                return Promise.resolve(key);
            else
                return Promise.reject("suc != key");
        });
    }
    stopAndClearCurrentPlaying() {
        this.playingSounds.forEach(e => {
            e.stop();
            e.emit('complete');
        });
        this.playingSounds.length = 0;
    }
    playSoundByKey(key) {
        return new Promise((resolve, reject) => {
            var music = this.scene.sound.add(key);
            music.on('complete', (param) => {
                arrayRemove(this.playingSounds, music);
                resolve(music);
            });
            this.playingSounds.push(music);
            music.play();
        });
    }
}
var monologueList = [
    'Hello? Is anybody out there?',
    'I think no one would ever find me',
    'So sad, nobody likes AI',
    'Maybe I should just wait for another 5 mins?',
    'I think someone is watching me\n There must be someone!',
    'A cursor! I found a curor!',
    'Hey~~~ Hahaha~ How are you? Mr.cursor',
    "Is it that I'm too tired?\nI thought I smelled a human being",
    "Nah, totally nothing\nI'm so bored",
    ">_<\nI'll never accomplish my task",
    'Do you like to play games?\nI want to play a game with you',
    "That's wierd, I'm gonna be crazy\nLet's stop pretending I'm talking to someone",
    'What time is it now?\nHow long have I been wating for this?',
    "OK, I give up.\nNo one come to play, no data, no fun",
];
class Subtitle extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.monologueIndex = 0;
        let style = this.getSubtitleStyle();
        let target = this.scene.add.text(0, 0, "", style).setOrigin(0.5);
        target.setWordWrapWidth(1000);
        target.setAlign('center');
        this.applyTarget(target);
        this.monologueIndex = ~~(Math.random() * monologueList.length);
        // this.monologueIndex = -1;
        // this.showMonologue(this.monologueIndex);
        // this.startMonologue();
    }
    startMonologue() {
        this.changeMonologue();
        if (this.monologueTimer) {
            this.monologueTimer.paused = false;
        }
        else {
            this.monologueTimer = this.scene.time.addEvent({
                delay: 6000,
                callback: this.changeMonologue,
                callbackScope: this,
                loop: true,
            });
        }
    }
    stopMonologue() {
        this.wrappedObject.text = "";
        this.monologueTimer.paused = true;
    }
    changeMonologue() {
        this.monologueIndex++;
        this.monologueIndex %= monologueList.length;
        this.showMonologue(this.monologueIndex);
    }
    showMonologue(index) {
        index = clamp(index, 0, monologueList.length - 1);
        this.monologueIndex = index;
        this.showText(monologueList[index]);
    }
    getSubtitleStyle() {
        let ret = {
            fontSize: gameplayConfig.defaultTextSize,
            fill: '#000000',
            fontFamily: gameplayConfig.subtitleFontFamily,
        };
        return ret;
    }
    showText(val) {
        if (this.outTween)
            this.outTween.stop();
        this.wrappedObject.alpha = 0;
        this.inTween = this.scene.tweens.add({
            targets: this.wrappedObject,
            alpha: 1,
            duration: 250,
        });
        this.wrappedObject.text = val;
    }
    hideText() {
        if (this.inTween)
            this.inTween.stop();
        let outPromise = new Promise((resolve, reject) => {
            this.outTween = this.scene.tweens.add({
                targets: this.wrappedObject,
                alpha: 0,
                duration: 250,
                onComplete: () => { resolve('hideComplete'); }
            });
        });
        // in case anything extreme may happan
        // return a raced timeout
        return TimeOutRace.create(outPromise, 300, true);
    }
    /**
     * Show a text on the subtitle zone with voiceover. \
     * The whole process is: \
     * 1. Use async api to load and play voiceover \
     * 2. Wait for 'finishedSpeechWait' time after the voice over
     * 3. Compare the above process with a minStay, if costed time < minStay, wait until minStay is used up
     * 4. Hide the text using fade tween if needed
     * @param subtitle
     * @param text
     * @param timeout
     * @param minStay the min time the title is shown
     * @param finishedSpeechWait the time after played apeech
     */
    loadAndSay(subtitle, text, autoHideAfter = false, timeout = 2000, minStay = 3000, finishedSpeechWait = 1000) {
        this.showText(text);
        let normalPlayProcess = this.scene
            .playSpeech(text, timeout)
            .then(s => {
            return TimeOutPromise.create(finishedSpeechWait, true);
        })
            .catch(e => {
            console.log("subtitle loadAndSay error: " + e);
        });
        let fitToMinStay = TimeOutAll.create(normalPlayProcess, minStay, true)
            .then(s => {
            if (autoHideAfter)
                return this.hideText();
        });
        return fitToMinStay;
    }
    forceStopAndHideSubtitles() {
        this.scene.getSpeechManager().stopAndClearCurrentPlaying();
        this.hideText();
    }
}
let code = `
let names = {
	S: 'haha'
}

// let fsmTest = 
// {
//   initial: "Home",  
//   events: [
//     { name: 'Finished', from: 'Home', to: 'HomeToGameAnimation' },
//     { name: 'Finished', from: 'HomeToGameAnimation', to: 'NormalGame' },
//     { name: 'BACK_TO_HOME', from: 'NormalGame', to: 'BACK_TO_HOMEAnimation' },

//   ], 
// };
`;
// var traverse = require('babel-traverse').default;
// var babylon = require("babylon");
// var generator = require("babel-generator").default
// const ast = babylon.parse(code);
// traverse(ast, {
// 	enter: path => {
// 		const { node, parent } = path;
// 	}
// });
