"use strict";
/**
 * Game Mode is what you choose from home mode select
 */
var GameMode;
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
    Counter[Counter["IntoZenMode"] = 3] = "IntoZenMode";
    Counter[Counter["Story0Finished"] = 4] = "Story0Finished";
})(Counter || (Counter = {}));
class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        this.updateObjects = [];
        this.needFeedback = false;
        this.bgmVolume = 1;
        this.mode = GameMode.Normal;
        this.entryPoint = EntryPoint.FromHome;
        this.homeCounter = 0;
        this.counters = new Map();
        this.playerName = "";
        this.sfxMatches = [];
        this.anyKeyEvent = new TypedEvent();
        this.pauseCounter = 0;
        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };
    }
    get hud() {
        return this.ui.hud;
    }
    preload() {
        this.load.image('arrow', 'assets/arrow.png');
        this.load.image('arrow_rev', 'assets/arrow_rev.png');
        this.load.image('speaker_dot', 'assets/speaker_dot.png');
        this.load.image('speaker', 'assets/speaker.png');
        this.load.image('unit_white', 'assets/unit_white.png');
        this.load.image('footer_ai', 'assets/footer_ai.png');
        this.load.image('footer_google', 'assets/footer_google.png');
        this.load.image('footer_nyu', 'assets/footer_nyu.png');
        this.load.image('footer_sep', 'assets/footer_sep.png');
        this.load.image('leaderboard_icon', 'assets/leaderboard_icon.png');
        this.load.image('rounded_btn', 'assets/rounded_with_title_btn_90_10.png');
        this.load.image('popup_bubble', 'assets/popup_bubble.png');
        this.load.image('popup_bubble_left', 'assets/popup_bubble_left.png');
        this.load.image('popup_bubble_bottom', 'assets/popup_bubble_bottom.png');
        this.load.image('checkbox_on', 'assets/checkbox_on.png');
        this.load.image('checkbox_off', 'assets/checkbox_off.png');
        this.load.image('rect_button', 'assets/rect_button.png');
        this.load.audio("sfx_match_1", "assets/audio/Match_1.wav");
        this.load.audio("sfx_match_2", "assets/audio/Match_2.wav");
        this.load.audio("sfx_match_3", "assets/audio/Match_3.wav");
        this.load.image('purchased_mark', "assets/purchased_mark.png");
        this.load.image('level_mark', "assets/level_mark.png");
        this.load.image('magic', 'assets/magic.png');
        this.preloadBadges();
    }
    preloadBadges() {
        for (let i in badInfos) {
            let resId = getBadgeResID(i);
            let resPath = 'assets/' + resId + '.png';
            this.load.image(resId, resPath);
        }
    }
    /**
     * audioLoadConfigItem:
     * keyName: ["pathToTheFile, propVarName"]
     * The callback will set the this.proVarName once the load is completed
     */
    loadAudio() {
        let audioLoadConfig = {
            sfx_laser: ["assets/audio/Hit_Hurt131.wav", "sfxLaser"],
            sfx_fail: ["assets/audio/Fail.wav", "sfxFail"],
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }
    loadAudioWithConfig(audioLoadConfig) {
        for (let i in audioLoadConfig) {
            this.load.audio(i, audioLoadConfig[i][0]);
        }
        this.load.on('filecomplete', (arg1) => {
            if (audioLoadConfig[arg1]) {
                // console.log(arg1);
                this[audioLoadConfig[arg1][1]] = this.sound.add(arg1);
            }
        });
        this.load.start();
    }
    createContainerMain() {
    }
    postCreate() {
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
    }
    createCenter(parentContainer) {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220));
    }
    createDwitters(parentContainer) {
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterCenterCircle(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRadialBKG(this, parentContainer, 0, 0, 2400, 1400, true);
    }
    create() {
        this.loadAudio();
        this.sfxMatches = [];
        this.sfxMatches.push(this.sound.add("sfx_match_1"));
        this.sfxMatches.push(this.sound.add("sfx_match_2"));
        this.sfxMatches.push(this.sound.add("sfx_match_3"));
        this.container = this.add.container(400, 299);
        this.subtitleContainer = this.add.container(400, 299);
        this.midContainder = this.add.container(400, 299);
        this.abContainer = this.add.container(0, 0);
        this.overlayContainer = this.add.container(400, 299);
        // Dwitters         
        this.createDwitters(this.container);
        // Center cicle-like object        
        this.centerObject = this.createCenter(this.container);
        this.createContainerMain();
        // Leaderboard
        this.leaderboardManager = LeaderboardManager.getInstance();
        // Back button
        this.backBtn = new Button(this, this.abContainer, 100, 50, '', '< exit()', 180, 80, false).setEnable(false, false);
        this.backBtn.text.setColor('#000000');
        this.backBtn.text.setFontSize(44);
        // HP                
        let hud = this.createHud(this.abContainer);
        this.ui = new UI(this, this.abContainer, 0, 0);
        this.ui.hud = hud;
        // Subtitle
        this.subtitle = new Subtitle(this, this.subtitleContainer, 0, Subtitle.subtitleOriY);
        // Pause Layer
        this.pauseLayer = new PauseLayer(this, this.container, 0, 0);
        this.pauseLayer.hide();
        // Died layer
        this.died = new Died(this, this.overlayContainer, 0, 0);
        this.died.hide();
        // Overlay Dialogs
        this.overlay = new Overlay(this, this.overlayContainer, 0, 0);
        // Main FSM
        this.mainFsm = new Fsm(this, this.getMainFsmData());
        this.gamePlayFsm = this.makeGamePlayFsm();
        this.zenFsm = new Fsm(this, this.getZenFsm());
        this.initMainFsm();
        // Sub FSM: normal game
        this.postCreate();
        // initVoiceType
        this.initVoiceType();
    }
    createHud(parentContainer) {
        return null;
    }
    makeGamePlayFsm() {
        return new Fsm(this, this.getGamePlayFsmData());
    }
    initVoiceType() {
        this.getSpeechManager().setVoiceType(VoiceType.Voice65536);
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
        this.updateObjects.forEach(e => {
            e.update(time, dt);
        });
        this.curTime = time;
        dt = dt / 1000;
        // console.log(1/dt);
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        this.container.setPosition(w / 2, h / 2);
        this.subtitleContainer.setPosition(w / 2, h / 2);
        this.midContainder.setPosition(w / 2, h / 2);
        this.overlayContainer.setPosition(w / 2, h / 2);
        this.centerObject.update(time, dt);
        if (this.hud) {
            this.hud.update(time, dt);
        }
        this.updateBgmVolume();
    }
    updateBgmVolume() {
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
        if (this.fmodBgmInstance && this.fmodBgmInstance.val) {
            this.fmodBgmInstance.val.setVolume(this.bgmVolume);
        }
    }
    getMainFsmData() {
        return mainFsm;
    }
    getGamePlayFsmData() {
        //normalGameFsm
        return null;
    }
    getZenFsm() {
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
    firstIntoZenMode() {
        return this.getCounter(Counter.IntoZenMode) == 1;
    }
    setEntryPointByIncomingEvent(evName) {
        this.setEntryPoint(evName.toLowerCase().indexOf('restart') >= 0 ? EntryPoint.FromDie : EntryPoint.FromHome);
    }
    initStHome() {
        let state = this.mainFsm.getState("Home");
        state.addOnExit(s => {
            this.centerObject.playerInputText.pressAnyToStart.setVisible(false);
        });
        state.setAsStartup().addOnEnter(s => {
            this.addCounter(Counter.IntoHome);
            this.centerObject.playerInputText.pressAnyToStart.setVisible(true);
            this.subtitle.startMonologue();
            this.dwitterBKG.toAutoRunMode();
            this.dwitterBKG.toAutoRunMode();
            LeaderboardManager.getInstance().updateInfo();
            let mainImage = this.centerObject.mainImage;
            s.autoOn($(document), 'keypress', () => {
                if (this.overlay.inShow) {
                    return;
                }
                this.homeEnterInvoked(s);
            });
            s.autoSafeInOutClick(mainImage, e => {
                this.centerObject.playerInputText.showTitle();
                this.dwitterBKG.toStaticMode();
            }, e => {
                this.centerObject.playerInputText.hideTitle();
                this.dwitterBKG.toAutoRunMode();
            }, e => {
                this.homeEnterInvoked(s);
            });
        });
    }
    homeEnterInvoked(s) {
        this.centerObject.playerInputText.changeTitleToChanged();
        if (this.needChangeUiWhenIntoGame())
            this.dwitterBKG.toStaticMode();
        this.subtitle.stopMonologue();
        if (this.forceDirectIntoGame()) {
            s.event('FORCE_DIRECT_INTO_GAME');
        }
        // let firstIn = this.firstIntoHome();
        let name = this.getUserName();
        if (name) {
            s.event('TO_SECOND_MEET');
        }
        else {
            s.event('TO_FIRST_MEET');
        }
        this.anyKeyEvent.emit('haha');
    }
    forceDirectIntoGame() {
        return false;
    }
    sceneAddFirstMeetGreetingActinos(s) {
        s.addSubtitleAction(this.subtitle, "Default greeting!", true);
        return s;
    }
    initStFirstMeet() {
        let state = this.mainFsm.getState("FirstMeet");
        state.addAction(s => {
            this.centerObject.playerInputText.showTitle();
        });
        this.sceneAddFirstMeetGreetingActinos(state);
        // Rotate the center object to normal angle   
        state.addTweenAction(this, {
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
            // audio effect
            s.autoOn($(document), 'keypress', () => {
                this.playOneShot('TypeInName');
            });
            s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, (word) => {
                this.playerName = word.trim();
                setCookie('name', word);
                console.log('just in time check: ' + getCookie('name'));
                resolve(word);
                this.playOneShot('ConfirmName');
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
            .addDelayAction(this, 800);
        this.sceneAfterNameInput(state)
            .addFinishAction();
    }
    sceneAfterNameInput(s) {
        s.addSubtitleAction(this.subtitle, s => {
            return this.playerName + "? That sounds good.";
        }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, "I know this is a weird start, but there's no time to explain.", false, null, null, 10)
            .addSubtitleAction(this.subtitle, "Which experiment do you like to take?", false, null, null, 10).setBoolCondition(o => this.needModeSelect());
        return s;
    }
    initStSecondMeet() {
        let state = this.mainFsm.getState("SecondMeet");
        state
            .addSubtitleAction(this.subtitle, s => {
            return 'Welcome back! ' + this.getUserName();
        }, false, null, 1000, 0);
        if (this.needModeSelect()) {
            state.finishImmediatly();
        }
        state.addFinishAction();
    }
    needModeSelect() {
        return true;
    }
    playOneShot(eventName) {
        FmodManager.getInstance().playOneShot(eventName);
    }
    initStModeSelect() {
        //* Enter Actions
        let state = this.mainFsm.getState("ModeSelect");
        state
            // Hide content of centerObject
            .addAction(() => {
            if (this.needModeSelect()) {
                this.centerObject.speakerBtn.inner.alpha = 0;
                this.centerObject.playerInputText.stopTitleTween();
                this.centerObject.playerInputText.title.alpha = 0;
            }
            else {
                this.centerObject.playerInputText.stopTitleTween();
                this.centerObject.playerInputText.title.alpha = 1;
            }
            // easy to have a current sound here
            // this.playOneShot('StartChooseLevel'); 
        })
            // Rotate the center object to normal angle   
            .addTweenAction(this, {
            targets: this.centerObject.inner,
            rotation: 0,
            duration: 600,
        }).setBoolCondition(s => this.centerObject.inner.rotation !== 0)
            // Show Mode Select Buttons
            .addAction((s, result, resolve, reject) => {
            if (this.needModeSelect()) {
                this.centerObject.btnMode0.setEnable(true, true);
                this.centerObject.btnMode1.setEnable(true, true);
                this.centerObject.modeToggles.initFocus();
                s.autoOn(this.centerObject.btnMode0.clickedEvent, null, () => {
                    this.setMode(GameMode.Normal);
                    s.removeAutoRemoveListners(); // in case the player clicked both buttons quickly
                    resolve('clicked');
                    this.playOneShot('ConfirmLevel');
                });
                s.autoOn(this.centerObject.btnMode1.clickedEvent, null, () => {
                    this.setMode(GameMode.Zen);
                    s.removeAutoRemoveListners();
                    resolve('clicked');
                    this.playOneShot('ConfirmLevel');
                });
            }
            else {
                resolve('clicked');
            }
        })
            // .addSubtitleAction(this.subtitle, 'Good choice', true, 2000, 1000, 100).setBoolCondition(o => this.firstIntoHome() && this.needModeSelect())
            .addAction(() => {
            this.centerObject.btnMode0.setEnable(false, true);
            this.centerObject.btnMode1.setEnable(false, true);
        })
            // Show back the content of centerObject
            .addTweenAllAction(this, [
            {
                targets: this.centerObject.getFadeInAndOutCoreObjectes(),
                alpha: 1,
                duration: 400
            }
        ]).finishImmediatly()
            .addDelayAction(this, 200).setBoolCondition(o => !this.needModeSelect());
        // 'Voiceover: Normal Mode Start'
        this.sceneAddModeStartAction(state)
            .addFinishAction();
    }
    sceneAddModeStartAction(s) {
        s.addSubtitleAction(this.subtitle, s => { return (this.mode === GameMode.Normal ? 'Normal' : 'Zen') + ' mode, start!'; }, true, null, null, 1);
        return s;
    }
    needChangeUiWhenIntoGame() {
        return true;
    }
    sceneHomeTogameAnimation(s) {
        return s;
    }
    initStHomeToGameAnimation() {
        let state = this.mainFsm.getState("HomeToGameAnimation");
        state.addAction(s => {
            if (this.needChangeUiWhenIntoGame())
                this.ui.gotoGame(this.mode);
        });
        state.addAction(s => {
            this.playOneShot('GameStart');
        });
        this.sceneHomeTogameAnimation(state);
        state.addDelayAction(this, 600);
        state.addFinishAction();
    }
    sceneIntoNormalGame(s) {
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
        state.addOnEnter(s => {
            // FSM 
            this.setEntryPointByIncomingEvent(s.fromEvent);
            this.gamePlayFsm.start();
            this.zenFsm.start();
            // UI reset
            if (this.hud) {
                this.hud.reset();
            }
            // Back
            if (this.needChangeUiWhenIntoGame())
                this.backBtn.setEnable(true, true);
            s.autoOn($(document), 'keydown', e => {
                if (!this.overlay.isInShow() && e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                    s.event("BACK_TO_HOME"); // <-------------
                }
            });
            // Delegates
            this.gamePlayStarted();
            this.sceneIntoNormalGame(s);
        });
        // Check mode and dispatch
        state.addDelayAction(this, 1500)
            .addAction(s => {
            if (this.mode === GameMode.Normal) {
                if (this.firstIntoNormalMode())
                    s.event('TUTORIAL_START', this.gamePlayFsm);
                else
                    s.event('NORMAL_START', this.gamePlayFsm);
            }
            else {
                s.event('START', this.zenFsm);
            }
        });
        state.addOnExit(s => {
            this.sceneExitNormalGame(s);
        });
    }
    sceneExitNormalGame(s) {
        this.gamePlayFsm.stop();
        this.zenFsm.stop();
        // Stop all subtitle and sounds
        this.subtitle.forceStopAndHideSubtitles();
        this.gamePlayExit();
    }
    /**
     * Event: BACK_TO_HOME sent by backBtn (everlasting)
     * Event: RESTART sent by restartBtn
     */
    initStDied() {
        let state = this.mainFsm.getState("Died");
        state.addAction((s, result, resolve, reject) => {
            this.sceneEnterDied(s, result, resolve, reject);
        });
        state.addOnExit(() => {
            this.sceneExitDied();
        });
    }
    sceneEnterDied(s, result, resolve, reject) {
        // Show the died overlay
        this.died.show();
        s.autoOn(this.died.restartBtn.clickedEvent, null, () => {
            s.event("RESTART");
            resolve('restart clicked');
        });
    }
    sceneExitDied() {
        this.died.hide();
        this.gamePlayFsm.restart(true);
    }
    initStRestart() {
        let state = this.mainFsm.getState("Restart");
        state.addAction(s => {
            s.event("RESTART_TO_GAME");
        });
    }
    scenePrepareBackToHome() {
        this.centerObject.prepareToHome();
        this.backBtn.setEnable(false, true);
    }
    initStBackToHomeAnimation() {
        let dt = 1000;
        this.mainFsm.getState("BackToHomeAnimation")
            .addAction(() => {
            this.scenePrepareBackToHome();
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
                scale: this.initCenterDwitterScale,
                duration: dt,
            },
        ])
            .addFinishAction();
    }
    setMode(mode) {
        this.mode = mode;
    }
    setEntryPoint(ep) {
        this.entryPoint = ep;
    }
    playAsBgm(sound) {
        if (this.bgm) {
            this.bgm.stop();
        }
        this.bgm = sound;
        this.bgm.play('', { loop: true });
    }
    pause(title, alpha) {
        this.pauseCounter++;
        // console.log('pause: ' + this.pauseCounter);
        if (this.pauseCounter == 1) {
            this.pauseInner(title, alpha);
        }
    }
    /**
     * Don't call directly.
     * @param title
     * @param alpha
     */
    pauseInner(title, alpha) {
        this.pauseLayer.show(title, alpha);
    }
    unPause() {
        this.pauseCounter--;
        // console.log('unPause: ' + this.pauseCounter);
        if (this.pauseCounter == 0) {
            this.unPauseInnner();
        }
    }
    unPauseInnner() {
        this.pauseLayer.hide();
    }
    gamePlayStarted() {
        if (this.mode === GameMode.Normal) {
            this.addCounter(Counter.IntoNormalMode);
        }
        else {
            this.addCounter(Counter.IntoZenMode);
        }
        this.pauseCounter = 0;
        if (this.playerName.length == 0) {
            this.playerName = getCookie('name');
        }
    }
    gamePlayExit() {
    }
    getUserName() {
        let un = getUserName();
        return un;
    }
    needHud() {
        return true;
    }
    isPausedOrDied() {
        return this.pauseLayer.inShown || this.died.inShown;
    }
    //
    getController() {
        let controller = this.scene.get("Controller");
        return controller;
    }
    getSpeechManager() {
        return this.getController().speechManager;
    }
    playSpeech(text, timeOut = 4000) {
        let controller = this.scene.get("Controller");
        return controller.playSpeechInController(text, timeOut);
    }
    /**
     * The hover state check here take overlapping into consideration
     * Only return true if there is no other interactive object above it.
     * @param target
     */
    isObjectHovered(target) {
        if (notSet(target))
            return false;
        return this.getHoverTopMostObject() === target;
    }
    getHoverTopMostObject() {
        let mp = this.input.mousePointer;
        let obs = this.input.hitTestPointer(mp);
        let sorted = this.input.sortGameObjects(obs);
        return sorted[0];
    }
    getOriginalTitle() {
        return 'Project 65536';
    }
    getChangedToTitle() {
        return 'Project 65536';
    }
}
/// <reference path="scene-base.ts" />
class SceneTrailor extends BaseScene {
    constructor(config) {
        super(config);
        this.camAllowed = false;
    }
    preload() {
        super.preload();
        this.load.image('circle', 'assets/circle.png');
    }
    create() {
        deleteAllCookie();
        super.create();
        this.createYoutubeVideo();
        this.initNormalGameFsm();
        this.anyKeyEvent.on((s) => {
            playYoutubeVideo();
            $('#yb-player').css('visibility', 'visible');
            this.overlay.showTempMask();
        });
        this.subtitle.inner.alpha = 0;
        let offsetX = getLogicWidth() * 11.8 / 100;
        let offsetY = getLogicHeight() * 0 / 100;
        this.centerObject.inner.x = offsetX;
        this.dwitterCenter.inner.x = offsetX;
        this.dwitterBKG.inner.x = offsetX;
        this.centerObject.inner.scale *= 1.15;
        this.dwitterCenter.inner.scale *= 1.15;
        this.centerObject.inner.y = offsetY;
        this.dwitterCenter.inner.y = offsetY;
        this.dwitterBKG.inner.y = offsetY;
    }
    createYoutubeVideo() {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        s_youtubeFinishCallback = () => {
            this.getController().gotoNextScene();
        };
    }
    initNormalGameFsm() {
        this.updateObjects.push(this.gamePlayFsm);
    }
    forceDirectIntoGame() {
        return true;
    }
    needChangeUiWhenIntoGame() {
        return false;
    }
    initStNormalDefault() {
        // let state = this.normalGameFsm.getState("Default");
        // state.addAction(s=>{
        //     this.confirmCount = 0;
        // })
        // state.addEventAction('START');
    }
    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
    }
    getGamePlayFsmData() {
        return normal_1_0;
    }
    needHud() {
        return false;
    }
    sceneHomeTogameAnimation(s) {
        super.sceneHomeTogameAnimation(s);
        let dt = 1000;
        s.addTweenAllAction(this, [
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
        ]);
        return s;
    }
}
/// <reference path="scene-trailor.ts" />
class Scene1L0 extends SceneTrailor {
    constructor() {
        super('Scene1L0');
    }
}
class Scene1 extends BaseScene {
    constructor(config) {
        super(config);
    }
    get hud() {
        return this.ui.hud;
    }
    preload() {
        super.preload();
        this.load.image('circle', 'assets/circle.png');
    }
    createContainerMain() {
        super.createContainerMain();
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);
    }
    postCreate() {
        super.postCreate();
        this.centerObject.playerInputText.confirmedEvent.on(input => {
            this.enemyManager.inputTextConfirmed(input);
        });
        // Add confirmed listener for confirmedEvent to enemyManager
        this.centerObject.playerInputText.confirmedEvent.on(input => {
            this.time.delayedCall(300, () => {
                this.dwitterBKG.next();
            }, null, null);
        });
    }
    update(time, dt) {
        super.update(time, dt);
        this.curTime = time;
        dt = dt / 1000;
        this.enemyManager.update(time, dt);
    }
    get score() {
        return this.hud.score;
    }
    sceneExitNormalGame(s) {
        super.sceneExitNormalGame(s);
        LeaderboardManager.getInstance().reportScore(this.playerName, this.score);
    }
    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);
        // Hide title and show speaker dots
        this.centerObject.prepareToGame();
        // Player input
        s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
        s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));
        // Dead event handling
        s.autoOn(this.hp.deadEvent, null, e => {
            s.event("DIED");
        });
        // Damage handling, only in normal mode
        if (this.mode == GameMode.Normal) {
            s.autoOn(this.enemyManager.enemyReachedCoreEvent, null, e => {
                let enemy = e;
                this.hp.damageBy(enemy.health);
            });
        }
    }
    get hp() {
        return this.hud.hp;
    }
    createHud(parentContainer) {
        return new Hud65536(this, parentContainer, 0, 0);
    }
    sceneEnterDied(s, result, resolve, reject) {
        super.sceneEnterDied(s, result, resolve, reject);
        this.enemyManager.freezeAllEnemies();
    }
    sceneExitDied() {
        super.sceneExitDied();
        this.enemyManager.stopSpawnAndClear();
    }
    scenePrepareBackToHome() {
        super.scenePrepareBackToHome();
        this.enemyManager.stopSpawnAndClear();
    }
    pauseInner(title, alpha) {
        super.pauseInner(title, alpha);
        this.enemyManager.freezeAllEnemies();
    }
    unPauseInnner() {
        super.unPauseInnner();
        this.enemyManager.unFreezeAllEnemies();
    }
    sceneAddFirstMeetGreetingActinos(s) {
        s.addSubtitleAction(this.subtitle, "God! Someone finds me finally!", true)
            .addSubtitleAction(this.subtitle, "This is terminal 65536.\nNice to meet you, human", true)
            .addSubtitleAction(this.subtitle, "May I know your name, please?", false).finishImmediatly();
        return s;
    }
    getOriginalTitle() {
        return 'Project 65536';
    }
    getChangedToTitle() {
        return 'Project 65536';
    }
    sceneHomeTogameAnimation(s) {
        super.sceneHomeTogameAnimation(s);
        let dt = 1000;
        s.addTweenAllAction(this, [
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
        ]);
        return s;
    }
}
/// <reference path="scene-1.ts" />
class Scene1L1 extends Scene1 {
    constructor() {
        super('Scene1L1');
    }
    create() {
        super.create();
        // console.log('print');
        // console.log(getCookie('name'));
        // setCookie("name", "TronTron");
        this.initNormalGameFsm();
        this.initZenFsm();
        this.hp.initMaxHealth(10);
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
        this.updateObjects.push(this.gamePlayFsm);
    }
    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
    }
    initStTutorialStart() {
        let state = this.gamePlayFsm.getState("TutorialStart");
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
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.SpawnOnEliminatedAndReachCore, { enemyDuration: duration, health: health });
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
        });
    }
    initStExplainHp() {
        let state = this.gamePlayFsm.getState('ExplainHp');
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
        let state = this.gamePlayFsm.getState('FlowStrategy');
        state
            .addAction(s => {
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
        })
            // TODO: here should have a better condition to get to next story state instead of just waiting 5s            
            .addDelayAction(this, 6000)
            .addFinishAction(); // -< here finish means goto story0
    }
    // Normal Start may come from a die or from home
    // If it's from die, we need add a different subtitle
    initStNormalStart() {
        let state = this.gamePlayFsm.getState('NormalStart');
        state
            .addAction(s => {
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
        })
            .addDelayAction(this, 1500)
            .addSubtitleAction(this.subtitle, s => {
            if (this.entryPoint === EntryPoint.FromDie)
                return "Calm down, " + this.playerName + ". Let's do it again.\n You have to help me.";
            else
                return "I just knew it, " + this.playerName + "! You're not gonna leave. Haha";
        }, true, 2000, 3000, 1500)
            .addDelayAction(this, 3)
            .addFinishAction();
    }
    initStStory0() {
        let state = this.gamePlayFsm.getState('Story0');
        state
            .addAction(state => { }).setBoolCondition(s => this.getCounter(Counter.Story0Finished) === 0, false) // <---- reject if story0 has finished
            .addSubtitleAction(this.subtitle, s => {
            return "Okay, I know that this experiment is a bit boring.\n";
        }, true, 2000, 3000, 200)
            .addSubtitleAction(this.subtitle, s => {
            return "But I have my reasons.\nIt's just I can't tell you right now.";
        }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
            return "How about you help me eliminate 65536 more enemies,\nand I tell you the secret of the universe as a reward?";
        }, false, 2000, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
            return "What do you think? " + this.playerName + ". Think about it.";
        }, true, 2000, 3000, 2000)
            .addSubtitleAction(this.subtitle, s => {
            return "Yes? No?\nAre you still there?";
        }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, s => {
            return "Oh! Sorry, " + this.playerName + "! I forgot to say that you could\n just talk to me by typing.\nYes, or no?";
        }, false, 2000, 3000, 1).finishImmediatly()
            .addAction((s, result, resolve, reject) => {
            s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, o => {
                // this.overlay.showBlack();    
                let wd = o.toLowerCase();
                if (wd == "yes" || wd == 'no')
                    resolve(wd);
            });
        })
            // .addAction(()=>{
            //     this.subtitle.wrappedObject.setColor('#ffffff');
            // })
            // TODO here should move counter here, and change wd===yes to getVar() way
            .addSubtitleAction(this.subtitle, (s, wd) => {
            if (wd === 'yes') {
                s.fsm.setVar('answer', true);
                return "Good!";
            }
            else if (wd === 'no') {
                s.fsm.setVar('answer', false);
                return "No? really? I hope you know what you're doing.\nAnyway, have fun!";
            }
        }, true, 2000, 3000, 1000)
            .addAction(o => { this.addCounter(Counter.Story0Finished); })
            .addAction(s => {
            // let an = s.fsm.getVar('answer', false);
            // if (!an) {
            //     this.backBtn.clickedEvent.emit(this.backBtn);
            // }
            // ignore for the demo
            this.getController().gotoNextScene();
        })
            .addFinishAction().setFinally();
    }
    initStStory1() {
        let state = this.gamePlayFsm.getState('Story1');
        state.addAction((s) => {
            // console.log('hahaha, story1');
        });
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
        });
    }
    initStZenIntro() {
        let state = this.zenFsm.getState("ZenIntro");
        state
            .addSubtitleAction(this.subtitle, s => {
            return "Interesting!";
        }, true, 2000, 3000, 500)
            .addSubtitleAction(this.subtitle, s => {
            return "Wow, I never expect that someone would really choose the Zen mode.";
        }, true, 2000, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
            return "No wonder they call you " + this.playerName + ".\nI begin to wonder who you really are.";
        }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
            return "We have plenty of time. Just enjoy yourself, please.";
        }, true, 2000, 3000, 1500);
    }
    getGamePlayFsmData() {
        return normal_1_1;
    }
}
/// <reference path="scene-1.ts" />
class Scene1L2 extends Scene1 {
    constructor() {
        super('Scene1L2');
    }
    getGamePlayFsmData() {
        return normal_1_2;
    }
    create() {
        super.create();
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
        state.addOnEnter(s => {
            let health = 4;
            let duration = 50000;
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.RandomFlow, { enemyDuration: duration, health: health });
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
            .addSubtitleAction(this.subtitle, "As you can see, we don't have those labels anymore.", true)
            .addSubtitleAction(this.subtitle, "But I don't really think you need them.", true)
            .addSubtitleAction(this.subtitle, "It might be a little bit harder, but it also added some fun, right?", true)
            .addSubtitleAction(this.subtitle, "If you have an MFA degree in Game Design like me,\nyou'll know that ambiguity is what makes fun happen!", true)
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, "Alright, this time I won't say 65536 again\n", true)
            .addSubtitleAction(this.subtitle, "See? I'm more merciful than I used to be", true)
            .addSubtitleAction(this.subtitle, "This time you only need to help me eliminate 256 more,\nand I'll just tell you the secret of universe.", false)
            .addDelayAction(this, 10000)
            .addAction(s => {
            this.getController().gotoNextScene();
        });
    }
}
/// <reference path="scene-1.ts" />
class Scene1L3 extends Scene1 {
    // needToDestroyBeforeShowSensitive = 2;
    constructor() {
        super('Scene1L3');
        this.loopTime = 454.5;
        this.lastYoyoIndex = 0;
        this.lastUsedYoyo = -1;
        this.needToDestroyBeforeShowSensitive = 5;
        this.needChangeDwitter = false;
        this.needChangeCenter = false;
        this.needChangeEnemy = false;
    }
    getGamePlayFsmData() {
        return normal_1_3;
    }
    preload() {
        super.preload();
    }
    loadAudio() {
        super.loadAudio();
    }
    create() {
        super.create();
        // this.initShake();
        this.initNormalGameFsm();
        this.hp.initMaxHealth(100);
        this.initSeparateWaysBGM();
    }
    initSeparateWaysBGM() {
        let FMOD = FmodManager.getInstance().FMOD;
        this.fmodBgmInstance = FmodManager.getInstance().createInstanceByEventName('SeparateWaysProp');
        this.fmodBgmInstance.val.setCallback((type, event, parameters) => { this.separateWaysMarkerCallback(type, event, parameters); }, FMOD.STUDIO_EVENT_CALLBACK_TIMELINE_MARKER | FMOD.STUDIO_EVENT_CALLBACK_TIMELINE_BEAT |
            FMOD.STUDIO_EVENT_CALLBACK_SOUND_PLAYED | FMOD.STUDIO_EVENT_CALLBACK_SOUND_STOPPED);
    }
    playSeparateWaysBGM() {
        FmodManager.getInstance().playInstance(this.fmodBgmInstance);
    }
    separateWaysMarkerCallback(type, event, parameters) {
        let FMOD = FmodManager.getInstance().FMOD;
        if (type == FMOD.STUDIO_EVENT_CALLBACK_TIMELINE_MARKER) {
            var props = parameters;
            let name = props.name;
            if (name == '1') {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            }
            else if (name == '2') {
                this.initShake();
                this.shakeTween.play();
            }
            else if (name == '3') {
                this.needChangeDwitter = true;
            }
            else if (name == '4') {
                this.needChangeEnemy = true;
                this.gamePlayFsm.curState.unionEvent('TO_SENSITIVE_WORD', 'bgmProcessFinished');
            }
        }
    }
    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.destroyedCount = 0;
        this.initStNormalDefault();
        this.initStStart();
        this.initStBGM();
        this.initStSensitive();
        this.initEnd();
        this.updateObjects.push(this.gamePlayFsm);
    }
    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
        state.addDelayAction(this, 500)
            .addEventAction("START");
    }
    initShake() {
        this.shakeTween = this.tweens.add({
            targets: this.centerObject.mainImage,
            scale: 1.1,
            yoyo: true,
            duration: 100,
            repeat: -1,
            repeatDelay: 254,
            onYoyo: () => {
                this.beat();
            },
            onRepeat: () => {
                // console.log('onRepeat');
                this.lastRepeatTime = this.curTime;
                // console.log(this.lastRepeatTime);
                this.needBeatInput = true;
            }
        });
        // this.shakeTween.pause();
        this.needBeatInput = true;
        this.beatStartTime = this.curTime;
        this.centerObject.playerInputText.keyPressEvent.on(() => {
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
        if (this.needChangeDwitter)
            this.dwitterBKG.nextWithColorChange();
        if (this.needChangeEnemy)
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
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            let health = 4;
            let duration = 50000;
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.RandomFlow, { enemyDuration: duration, health: health });
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
            .addSubtitleAction(this.subtitle, "He told me that experiments should be 'fun' at first", true)
            .addSubtitleAction(this.subtitle, "After the labels were removed, he didn't feel fun any more", true)
            .addSubtitleAction(this.subtitle, "He told me if I just make such a lengthy dialog, \nIan Bogost won't like me.", true)
            .addSubtitleAction(this.subtitle, "You know....\n The Procedural Rhetoric thing!", true)
            .addSubtitleAction(this.subtitle, "When I was still a human, I mean, seriously, \nI was really once an MFA in Game Design ", true)
            .addSubtitleAction(this.subtitle, "And of course! \nIan Bogost, I loved him, A LOT.", true)
            .addSubtitleAction(this.subtitle, "To prove that I'm a decent experiment artist, \nseems that I have to accept my advisor's words.", true)
            .addSubtitleAction(this.subtitle, "And this is what my experiment becomes now. Hope you enjoyed it.", true)
            .addSubtitleAction(this.subtitle, "Before we start, do you want some music?\n Type in something!", false).finishImmediatly()
            .addAction((s, result, resolve, reject) => {
            this.enemyManager.stopSpawnAndClear();
            this.centerObject.playerInputText.setAutoContent("Separate Ways");
            s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, o => {
                this.subtitle.forceStopAndHideSubtitles();
                resolve();
            });
        })
            .addEventAction("TO_BGM");
    }
    initStBGM() {
        let state = this.gamePlayFsm.getState("BGM");
        state.setUnionEvent('TO_SENSITIVE_WORD', 2);
        state.addOnEnter(s => {
            s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                this.destroyedCount++;
                if (this.destroyedCount >= this.needToDestroyBeforeShowSensitive) {
                    s.unionEvent('TO_SENSITIVE_WORD', 'enemies_eliminated');
                    // s.unionEvent('TO_SENSITIVE_WORD', 'bgmProcessFinished');
                }
            });
        });
        state.addAction(s => {
            this.needFeedback = true;
            this.playSeparateWaysBGM();
            // this.playAsBgm(this.bgmSeperateWays);            
            // this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);               
        })
            // // .addDelayAction(this, 2000)
            // .addAction(s=>{           
            // })
            // .addDelayAction(this, 3500)
            // .addAction(s=>{         
            //     this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);                           
            // })
            // .addDelayAction(this, 3900)
            // .addAction(s=>{     
            //     this.initShake();
            //     this.shakeTween.play();    
            //     // this.needChangeDwitter = true;                   
            // })
            // .addDelayAction(this, 3700)
            // .addAction(s=>{     
            //     this.needChangeDwitter = true;                   
            // })
            // .addDelayAction(this, 3300)
            // .addAction(s=>{        
            //     this.needChangeEnemy = true;
            // })
            .addAction(s => {
            s.unionEvent('TO_SENSITIVE_WORD', 'bgmProcessFinished');
        });
    }
    initStSensitive() {
        let state = this.gamePlayFsm.getState("Sensitive");
        state.addOnEnter(s => {
            this.enemyManager.setNextNeedSensitiveOneShot(true);
            s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                let em = e;
                if (em.isSensative()) {
                    s.finished();
                }
            });
        });
        state
            .addAction((s, result, res, rej) => {
            s.autoOn(this.enemyManager.enemySpawnedEvent, null, e => {
                let em = e;
                if (em.isSensative()) {
                    res("");
                    this.enemyManager.curStrategy.pause();
                }
            });
        })
            .addDelayAction(this, 3000)
            .addSubtitleAction(this.subtitle, "Wait...Is this...!?", true)
            .addSubtitleAction(this.subtitle, "How come?!", true)
            .addDelayAction(this, 3000)
            .addSubtitleAction(this.subtitle, "Hmmm...\n Sorry, I'm afraid that there's a little problem.", false)
            .addSubtitleAction(this.subtitle, "Since THAT THING's already there,\nthere's no reason to keep it from you.", false, null, null, 3000)
            .addSubtitleAction(this.subtitle, "But I still wonder if you can solve it by yourself.\nI have faith in you.", true)
            .addDelayAction(this, 16000)
            .addSubtitleAction(this.subtitle, "Seems like we still need some hints, hmm?", false)
            .addSubtitleAction(this.subtitle, "Okay. \nHint 1: would you kindly try a keyword starting with the letter B ?", false, null, null, 8000)
            .addSubtitleAction(this.subtitle, "Hint 2: the second letter is A", false, null, null, 10000)
            .addSubtitleAction(this.subtitle, "And the last letter is D", false, null, null, 5000)
            .addSubtitleAction(this.subtitle, "B-A-D, bad!", false);
    }
    initEnd() {
        let state = this.gamePlayFsm.getState("End");
        state
            .addDelayAction(this, 1000)
            .addAction(s => {
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
        })
            .addSubtitleAction(this.subtitle, "Great, you've just eliminated your first BAD word", false)
            .addSubtitleAction(this.subtitle, "Not sure what BAD means?\n All I can tell you is that they are BAD!\nVery very BAD!", false)
            .addSubtitleAction(this.subtitle, "It's so bad that everyone should recognize it at first glance.", false)
            .addSubtitleAction(this.subtitle, "As you can see, our experiment is still under construction.\nI think we'd better stop here", false, null, null, 5000)
            .addSubtitleAction(this.subtitle, "I think I said we should stop here.\nWhat are you waiting for? Bye!", false)
            .addAction(s => {
            this.backBtn.clickedEvent.emit(this.backBtn);
            setTimeout(() => {
                this.getController().gotoNextScene();
            }, 2000);
        });
    }
}
// 123
/// <reference path="scene-1.ts" />
class Scene1L4 extends Scene1 {
    constructor() {
        super('Scene1L4');
        this.hasWarnKey = 'HasWarn';
    }
    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            bgm_turn: ["assets/audio/OpenTurn.mp3", 'openTurn']
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }
    getGamePlayFsmData() {
        return normal_1_4;
    }
    playOpenTurnBgm() {
        this.playAsBgm(this.openTurn);
        // TODO: Should be extracted to its own logic        
        // change the dwitter        
    }
    create() {
        super.create();
        // this.initShake();
        this.initNormalGameFsm();
        this.hp.initMaxHealth(10);
        this.createBtns();
        this.addCallbackForFirstTimeBubble();
        // this.overlay.showReviewForm();
    }
    addCallbackForFirstTimeBubble() {
        for (let i = 0; i < this.hud.rightBtns.length; i++) {
            this.hud.rightBtns[i].firstTimeBubbleCallback = (idx) => { this.firstTimeBubbleAutoBad(idx); };
        }
        this.hud.leftBtns[0].firstTimeBubbleCallback = (idx) => { this.badUpgradeFirstTimeBubble(); };
    }
    badUpgradeFirstTimeBubble() {
        this.gamePlayFsm.event("TO_KEYWORDS", true);
    }
    createBtns() {
        // this.upgrade1 = new Button(this, )
    }
    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();
        this.initWarn();
        this.initStateIdle();
        this.initStMock();
        this.initStPromptAutoBad();
        this.initStPrmoptAutoTyper();
        this.initStPromptTurn();
        this.initStPrmoptAutoTurn();
        this.initStPrmoptCreator();
        this.intiStPromptKeywords();
        this.updateObjects.push(this.gamePlayFsm);
    }
    needShowEcoAboutAtStartup() {
        if (isEconomicSpecialEdition()) {
            return true;
        }
        return false;
    }
    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
        state
            .addDelayAction(this, 500)
            .addAction(s => {
            if (this.needShowEcoAboutAtStartup()) {
                let dialog = this.overlay.showEcnomicDialog();
                dialog.singleUseClosedEvent.on(() => {
                    s.event('START');
                });
            }
            else {
                s.event('START');
            }
        });
        // .addEventAction("START");
    }
    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            // this.enemyManager.sensetiveDuration = 60000;
            // // this.needFeedback = true;
            // this.enemyManager.setNextNeedSensitiveAlways(true);     
            this.enemyManager.startSpawnStrategy(SpawnStrategyType.ClickerGame);
            // if((this.enemyManager.curStrategy as SpawnStrategyClickerGame).normalNormalCount >= 1 ) {
            //     s.event('WARN') ;
            // }            
            /**
             * Pause at first because all the forked logic is originated from 'Idle' state
             * We need to exclude any possible player input here
             */
            this.pause('　　　', 0);
            //this.pause(null, 0);   
        });
        state.addOnExit(s => {
            this.unPause();
            this.getCurClickerStrategy().startLoopCreateNormal();
        });
        state.addSubtitleAction(this.subtitle, s => this.getUserName() + "!\n Looks like I have to admit that I'm a bad experiment designer.", true)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "I really don't know why those 4O4s keep appearing.\nHowever, I think you'll surely help me get rid of them, right?", true)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        state.addAction(s => {
            this.hud.showContainerRight();
        });
        state.addSubtitleAction(this.subtitle, "Don't worry! I've prepared some handy tools for you,\nbut everything comes with a PRICE.\n And let's just define the PRICE as the SCORE you've got", true)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "Remember! I'm always on YOUR side.", true)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        state.addFinishAction();
    }
    initStateIdle() {
        let state = this.gamePlayFsm.getState("Idle");
        state.addOnEnter(s => {
        });
        state.setOnUpdate(s => {
            if (this.getCurClickerStrategy().normalNormalCount >= startWarnNum && !this.gamePlayFsm.getVar(this.hasWarnKey, false)) {
                this.gamePlayFsm.setVar(this.hasWarnKey, true);
                s.event('WARN');
            }
        });
        // state.addEventAction('MOCK');
    }
    getCurClickerStrategy() {
        return this.enemyManager.curStrategy;
    }
    initWarn() {
        let state = this.gamePlayFsm.getState("Warn");
        state.addOnEnter(s => {
        })
            .addSubtitleAction(this.subtitle, "Let me be clear", true)
            .addSubtitleAction(this.subtitle, "You can ONLY benefit from eliminating 4O4s. \n Don't be so obsessed with the word matching!", true, null, null, 4000)
            .addSubtitleAction(this.subtitle, "Just be a reasonable person. Seriously!", true, null, null, 2000)
            .addFinishAction();
    }
    gamePlayStarted() {
        super.gamePlayStarted();
        this.hud.infoPanel.inner.setVisible(true);
    }
    gamePlayExit() {
        super.gamePlayExit();
        this.hud.infoPanel.inner.setVisible(false);
    }
    initStMock() {
        let state = this.gamePlayFsm.getState("Mock");
        state.addDelayAction(this, 3000);
        state.addSubtitleAction(this.subtitle, s => this.getUserName() + "!\n What are you doing? You think this is fun?", true);
        state.addSubtitleAction(this.subtitle, "Finally, I know who created those words and 4O4s!", true);
        state.addSubtitleAction(this.subtitle, s => "It's has always been YOU! \n" + this.getUserName() + "!", true);
        state.addSubtitleAction(this.subtitle, "I know what you're thinking,", true);
        state.addSubtitleAction(this.subtitle, "You think that it's me\n who put the 'Creator' button here, right?", true);
        state.addSubtitleAction(this.subtitle, "But the fact I put it there doesn't\n simply mean you have the right to use it!", true);
        state.addSubtitleAction(this.subtitle, "Of course, it's my procedural rhetoric...", true);
        state.addSubtitleAction(this.subtitle, "But, I don't know. Maybe it's just that\n I think you are different and I really count on you.", true, null, null, 3000);
        state.addSubtitleAction(this.subtitle, "Anyway, thank you for participating in my experiment.\n We are not done yet", true);
        state.addSubtitleAction(this.subtitle, "Before we move on,\n would you kindly fill in this beautiful forms for me please?", true, null, 50);
        state.addAction(s => {
            this.pause();
            Overlay.getInstance().showFormRating(true);
        });
        // state.addSubtitleAction(this.subtitle, "Well, I don't want to argue with you about that. \n It's just so gross!", true);
        // state.addSubtitleAction(this.subtitle, "And I don't want to bear this ugly scene any more", true);
        // state.addSubtitleAction(this.subtitle, "If you want to continue, just do it. \nBut our experiment is DONE.", false);
        // state.addSubtitleAction(this.subtitle, "Voice from Tron & Rachel: Hi, this is our current thesis progress. \n Thank you for playing!", false);
    }
    firstTimeBubbleAutoBad(idx) {
        console.log(idx);
        let eventNames = [
            'TO_PROMPT_COMPLETE_BAD',
            'TO_PROMPT_AUTO_BAD',
            'TO_PROMPT_TURN',
            'TO_PROMPT_AUTO_TURN',
            'TO_PROMPT_CREATOR',
        ];
        // global event
        this.gamePlayFsm.event(eventNames[idx], true);
    }
    addYesOrNoAction(s, targetBtn) {
        s.addAction((s, result, resolve, reject) => {
            targetBtn.hasNoActualClick = false;
            // Turn the original pause title to " 'Y' / 'N' "
            this.pauseLayer.title.text = cYesOrNo;
            s.autoOn($(document), 'keypress', (event) => {
                var code = String.fromCharCode(event.keyCode).toUpperCase();
                if (code == 'Y') {
                    targetBtn.click();
                    resolve('YES');
                }
                else if (code == 'N') {
                    resolve('NO');
                }
            });
            s.autoOn(targetBtn.clickedEvent, null, o => {
                resolve('YES');
            });
        })
            .addAction(s => {
            this.subtitle.forceStopAndHideSubtitles();
        });
    }
    /**
     * After autobad is finished, we begin to check if we need to goto
     * the Keywords panel prompt after a delay
     */
    initStPromptAutoBad() {
        let targetBtn = this.hud.rightBtns[0];
        let state = this.gamePlayFsm.getState("PromptCompleteBad");
        state.addOnEnter(s => {
            targetBtn.hasNoActualClick = true;
            // was reset to false in addYesOrNoAction
        });
        state.addSubtitleAction(this.subtitle, "Congratulations!", false)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        state.addSubtitleAction(this.subtitle, "Based on your score,\n I think this AUTO-COMPLETION tool might be of help", false, null, null, 500)
            .setBoolCondition(s => this.firstIntoNormalMode(), true);
        //      state.addSubtitleAction(this.subtitle, "Just type in 'B', and we will help you complete it", false);
        state.addSubtitleAction(this.subtitle, "To purchase this upgrade, press 'Y'.\n To ignore, press 'N'", false).finishImmediatly();
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
    intiStPromptKeywords() {
        let targetBtn = this.hud.leftBtns[0];
        let state = this.gamePlayFsm.getState("PromptKeywords");
        state.addOnEnter(s => {
        });
        state.addSubtitleAction(this.subtitle, "If you take a closer look at the panel on the left,\nYou will see we have provided plenty of ammo for you to eliminate 4O4s!", false);
        state.addSubtitleAction(this.subtitle, "As we all know, the content behind 4O4s are bad, evil and vicious!\n You name it!", false);
        state.addSubtitleAction(this.subtitle, "Once purchased, you can upgrade them with the score you have earned.", true);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
    initStPrmoptAutoTyper() {
        let state = this.gamePlayFsm.getState("PromptAutoBad");
        state.addOnEnter(s => {
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.hud.rightBtns[1];
        state.addSubtitleAction(this.subtitle, "You know what, based on the feedback from previous playtesters. \n Seldom of them have the patience to listen carefully what I'm saying", false);
        state.addSubtitleAction(this.subtitle, "So I decided to pause the game when I'm talking to you.", false);
        state.addSubtitleAction(this.subtitle, "An automatic typer that marks things as BAD for you.\n How nice it is!", false).finishImmediatly();
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
    // TODO: maybe the showPause should be put into the state onEnter
    // TODO: the prompt of hinting the player not to do the word mathing should be put into a more flexible state
    initStPromptTurn() {
        let state = this.gamePlayFsm.getState("PromptTurn");
        state.addOnEnter(s => {
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.hud.rightBtns[2];
        state.addSubtitleAction(this.subtitle, "OK, what about we give you a choice to TURN non-4O4s into 4O4?", false).finishImmediatly();
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
    initStPrmoptAutoTurn() {
        let state = this.gamePlayFsm.getState("PromptAutoTurn");
        state.addOnEnter(s => {
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.hud.rightBtns[3];
        state.addSubtitleAction(this.subtitle, "Tired of TURNING them manually?", false).finishImmediatly();
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
    initStPrmoptCreator() {
        let state = this.gamePlayFsm.getState("PromptCreator");
        state.addOnEnter(s => {
            targetBtn.hasNoActualClick = true;
        });
        let targetBtn = this.hud.rightBtns[4];
        // state.addSubtitleAction(this.subtitle, "An automatic typer that marks things as BAD for you.\n How nice it is!", false).finishImmediatly()
        this.addYesOrNoAction(state, targetBtn);
        state.addFinishAction();
        state.addOnExit(s => {
            targetBtn.hideAttachedBubble();
        });
    }
}
class Scene1LPaper extends Scene1 {
    constructor() {
        super('Scene1LPaper');
        this.COUNT_ALL_TIME = 30;
        this.paperWidth = 1000;
        this.paperHeight = 900;
        this.startReadTime = 0;
        this.confirmCount = 0;
        this.inCountDown = false;
    }
    create() {
        super.create();
        this.createPaper();
        this.createCountdown();
        this.createNextLevelBtn();
        this.initNormalGameFsm();
        this.initPaperButtonCallback();
        CameraManager.getInstance().initFaceAPI();
        this.dwitterBKG.changeTo(1);
    }
    createNextLevelBtn() {
        let btn = new Button(this, this.abContainer, getLogicWidth() - 315, getLogicHeight() - 490, null, ' -> Next Experiment ');
        btn.text.setFontSize(60);
        btn.text.setBackgroundColor('#000000');
        btn.text.setColor('#ffffff');
        btn.needHandOnHover = true;
        btn.needInOutAutoAnimation = false;
        btn.setEnable(false, false);
        this.nextLevelBtn = btn;
        anchorToRight(315, btn.inner);
        btn.clickedEvent.on(() => {
            this.getController().gotoNextScene();
            // window.location.replace(window.location.origin + "?level=4");
        });
    }
    initPaperButtonCallback() {
        this.paper.continueBtn.clickedEvent.on(b => {
            if (this.paper.checkboxImg.getData('on')) {
                this.gamePlayFsm.event('CONTINUE');
            }
            else {
                alert('You should confirm you have read the paper before continuing.');
            }
        });
    }
    createPaper() {
        this.paper = new Paper(this, this.container, 0, getLogicHeight() / 2, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 0,
            width: this.paperWidth,
            height: this.paperHeight,
            title: 'Procedural Rhetoric',
            topTitleGap: 30,
            titleContentGap: 80,
            contentPadding: 60,
            contentBtnGap: 30,
            btnToBottom: 65,
            content: paperContent,
        });
        this.paper.hide();
        this.paper.setOrigin(0.5, 1);
        this.paper.updateDefaultY();
    }
    createCountdown() {
        let style = getDefaultTextStyle();
        style.fontSize = '40px';
        this.countDown = this.add.text(-this.paperWidth / 2 - 10, getLogicHeight() / 2 - this.paperHeight - 2, ' 00:30 ', style);
        this.countDown.setColor('#ffffff');
        this.countDown.setBackgroundColor('#000000');
        this.countDown.setOrigin(1, 0);
        this.container.add(this.countDown);
        this.countDown.setVisible(false);
    }
    gamePlayStarted() {
        super.gamePlayStarted();
        this.subtitle.wrappedObject.setBackgroundColor('#000000');
        this.subtitle.wrappedObject.setColor('#ffffff');
        this.paper.continueBtn.setEnable(true, false);
        this.startReadTime = this.curTime;
    }
    gamePlayExit() {
        super.gamePlayExit();
        this.subtitle.wrappedObject.setBackgroundColor('');
        this.subtitle.wrappedObject.setColor('#000000');
        this.paper.hide();
        this.countDown.setVisible(false);
        CameraManager.getInstance().hideVideo();
        this.nextLevelBtn.setEnable(false, false);
    }
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();
        this.initConfirm1();
        this.initConfirm2();
        this.updateObjects.push(this.gamePlayFsm);
    }
    needModeSelect() {
        return false;
    }
    initStNormalDefault() {
        let state = this.gamePlayFsm.getState("Default");
        state.addAction(s => {
            this.confirmCount = 0;
        });
        state.addEventAction('START');
    }
    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addAction(s => {
            this.paper.show();
            CameraManager.getInstance().startDectector();
            CameraManager.getInstance().setPosition(CamPosi.PaperLevel);
            CameraManager.getInstance().requestPermission();
        });
    }
    initConfirm1() {
        let state = this.gamePlayFsm.getState('Confirm_1');
        state.addOnExit(s => {
            clearInterval(this.countDownInterval);
            this.inCountDown = false;
        });
        state.addAction(s => {
            this.paper.continueBtn.canClick = false;
            let t = this.curTime - this.startReadTime;
            let tShow = (t / 1000).toFixed(3);
            BirdManager.getInstance().print('Subject: ' + this.getUserName() + '\nReading Time: ' + tShow + ' seconds');
        });
        state.addSubtitleAction(this.subtitle, s => 'You sure?\n ' + this.getUserName() + ", I don't think you could have read it so fast.", false);
        state.addSubtitleAction(this.subtitle, 'According to our assessement based on your previous performances,\n It should take you  at least 30 seconds to complete the reading.', false);
        state.addSubtitleAction(this.subtitle, "Why don't you do me a favor and read it again?", true, null, null, 2000);
        state.addAction(s => {
            this.paper.reset();
        });
        state.addTweenAction(this, {
            targets: this.paper.othersContainer,
            y: this.paper.defaultY,
            duration: 500,
        });
        state.addAction(s => {
            this.setCountDownLlb(this.COUNT_ALL_TIME);
            this.remainingTime = this.COUNT_ALL_TIME;
            this.countDown.setVisible(true);
            this.inCountDown = true;
            this.countDownInterval = setInterval(() => {
                this.updateCountDown();
            }, 1000);
        })
            .addAction(s => {
        });
    }
    getStars() {
        let ret = '';
        let fullStar = '★';
        let emptyStar = '☆';
        let fullCount = Math.floor(Math.random() * 3) + 1; // 1-3        
        for (let i = 0; i < fullCount; i++) {
            ret += fullStar;
        }
        for (let i = 0; i < 5 - fullCount; i++) {
            ret += emptyStar;
        }
        return ret;
    }
    captureAndPrint() {
        if (!CameraManager.getInstance().camAllowed) {
            return;
        }
        let imageData = CameraManager.getInstance().captureCameraImage();
        BirdManager.getInstance().print('Subject: ' + this.getUserName() + '\nCooperative Level: ' + this.getStars(), imageData);
    }
    initConfirm2() {
        let state = this.gamePlayFsm.getState('Confirm_2');
        state.addAction(() => {
        })
            .addSubtitleAction(this.subtitle, s => this.getUserName() + "! I can see you are still not reading carefully enough.", false)
            .addAction(() => {
            CameraManager.getInstance().showVideo();
            setTimeout(() => {
                this.captureAndPrint();
            }, 2000);
        })
            .addSubtitleAction(this.subtitle, "Look at you!", false)
            .addSubtitleAction(this.subtitle, "What a stubborn face!", false, null, null, 2000)
            .addSubtitleAction(this.subtitle, "You know, when Mitu told me to put a camera here\n to check and make sure you really read, \nI thought it's superfluous.", false, null, null, 2500)
            .addSubtitleAction(this.subtitle, "But the fact proved she's right.", false, null, null, 2000)
            .addSubtitleAction(this.subtitle, s => "Don't worry, " + this.getUserName() + "! We have not given you up.\nIt's just that we might need to adjust the plan a little bit", false)
            .addAction(() => {
            this.nextLevelBtn.setEnable(true, true);
            this.paper.continueBtn.setEnable(false, true);
        })
            .addSubtitleAction(this.subtitle, "Let's continue our experiment.\n We'll find a way to help you out!", true, null, null, 5000)
            .addAction(s => {
        });
    }
    setCountDownLlb(val) {
        let twoDig = val + '';
        if (val < 10) {
            twoDig = '0' + val;
        }
        if (val == 0) {
            twoDig = '00';
        }
        this.countDown.text = ' 00:' + twoDig + ' ';
        if (val > 0) {
            this.paper.checkboxDesc.text = 'Click to confirm you have completed the reading (' + val + 's)';
        }
        else {
            this.paper.checkboxDesc.text = 'Click to confirm you have completed the reading';
        }
    }
    update(time, dt) {
        super.update(time, dt);
        if (this.inCountDown) {
            this.paper.checkboxImg.removeInteractive();
            this.paper.checkboxDesc.removeInteractive();
            this.paper.checkboxDesc.setAlpha(0.3);
        }
        else {
            this.paper.checkboxImg.setInteractive();
            this.paper.checkboxDesc.setInteractive();
            this.paper.checkboxDesc.setAlpha(1);
        }
    }
    updateCountDown() {
        --this.remainingTime;
        this.setCountDownLlb(this.remainingTime);
        if (this.remainingTime == 0) {
            this.inCountDown = false;
            this.paper.continueBtn.canClick = true;
            clearInterval(this.countDownInterval);
        }
    }
    getGamePlayFsmData() {
        return normal_1_paper;
    }
    needHud() {
        return false;
    }
}
/// <reference path="scene-base.ts" />
class MyInput {
    constructor(scene) {
        this.lastPointerPosi = new PhPointClass(0, 0);
        this.controller = scene;
        this.canvas = this.controller.game.canvas;
        console.log(this.canvas);
        this.canvas.addEventListener('mousemove', evt => {
            let rect = this.canvas.getBoundingClientRect();
            let scaleX = this.canvas.width / rect.width;
            let scaleY = this.canvas.height / rect.height;
            let x = (evt.clientX - rect.left) * scaleX;
            let y = (evt.clientY - rect.top) * scaleY;
            this.lastPointerPosi.x = x;
            this.lastPointerPosi.y = y;
        }, false);
    }
}
class Controller extends Phaser.Scene {
    constructor() {
        super('Controller');
        this.sceneSeq = [
            '1-0',
            '1-1',
            '1-2',
            '1-3',
            '1-Paper',
            '1-4',
            '2-0',
            '2-1',
            '2-2',
            '2-Paper',
            '2-3'
        ];
    }
    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }
    create() {
        myResize(this.game);
        this.speechManager = new SpeechManager(this);
        WebFont.load({
            google: {
                families: ['Averia Serif Libre']
            },
            active: () => {
                this.gotoFirstScene();
            },
            inactive: () => {
                this.gotoFirstScene();
            }
        });
        // this.myInput = new MyInput(this);
    }
    gotoFirstScene() {
        // console.log("origin: " + window.location.origin);        
        // this.scene.launch('Scene1L2');      
        let level = getCurrentLevelRaw().split('-');
        let sceneName = `Scene${level[0]}L${level[1]}`;
        if (level[0] == '1') {
            document.title = 'Experiment 65536';
        }
        else if (level[0] == '2') {
            document.title = 'Experiment 65537';
        }
        console.log(sceneName);
        this.scene.launch(sceneName);
    }
    gotoNextScene() {
        let level = getCurrentLevelRaw();
        let idx = 0;
        for (let i = 0; i < this.sceneSeq.length; i++) {
            if (this.sceneSeq[i] == level) {
                idx = i;
                break;
            }
        }
        if (idx != this.sceneSeq.length - 1) {
            window.location.replace(window.location.origin + `?level=${this.sceneSeq[idx + 1]}`);
        }
    }
    playSpeechInController(text, timeOut = 4000) {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}
/// <reference path="scene-trailor.ts" />
class Scene2L0 extends SceneTrailor {
    constructor() {
        super('Scene2L0');
    }
    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');
    }
    createCenter(parentContainer) {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220), CenterType.Rect);
    }
    createDwitters(parentContainer) {
        // super.createDwitters(parentContainer);
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2800, 1400, true);
    }
    getOriginalTitle() {
        return 'Project 65537';
    }
    getChangedToTitle() {
        return 'Project 65537';
    }
}
class Scene2 extends BaseScene {
    constructor(config) {
        super(config);
        this.fullTime = 4;
        // fullTime = 1;
        // cleanTimeLong = 2;
        this.cleanTimeLong = 10;
        this.cleanTimeShort = 2;
        this.cleanTime = 10; // seconds
        this.currIndex = 0;
        this.rssCurIndex = 0;
        this.rssItems = [];
        this.npHp = 2;
        this.npMaxHp = 2;
        this.isExercise = false;
        this.isAttentionChecking = false;
        this.topProgress = { value: 0 }; // [0, 1]
        this.bottomProgress = { value: 0 }; // [0, 1]
        this.canRecieveEmotion = false;
        this.canRecieveEmojiClick = false;
        this.needFreezeIndicatorMeterBtn = false;
        /**
         *
         * @param attention [0, 100]
         */
        this.lastAttention = 0;
        /**
         * Called from update
         * @param time
         * @param dt
         */
        this.curCleanProgress = 0; // [0, 1]
        this.onlyShowPositive = false;
        // whether need to animate the dwitter background when a emotion intensity reached a threshould
        this.needDwitterFlow = false;
        this.isProgressAudioPlaying = false;
        this.isLastTestCorrect = false;
        this.lastMaxedEmojion = MyEmotion.Negative;
        this.initialPaperTranslateX = -50;
        this.initialPaperTranslateY = -50;
        this.initialCamTranslateX = -100;
        this.initialCamTranslateY = -50;
        this.indicatorBtnTop = 1;
        this.indicatorBtnBottom = 99;
        this.needChangeMonkey = true;
        this.isCamShown = false;
        this.npStyle = NewspaperStyle.DEFAULT;
        this.innerBorderStyles = ['double', 'dashed', 'dotted', 'solid'];
        this.inFinalAutoMode = false;
        this.lastDragID = '';
        this.sourceID = '#newspaper-toolbox-stamps';
        this.destiID = '#stamp-dest-container';
        this.destiCount = 0;
        this.sourceCount = 0;
    }
    get npNums() {
        return [0];
    }
    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');
    }
    getPropID(idx) {
        return `prop-${idx}`;
    }
    create() {
        super.create();
        this.intiPropButtons();
        $(document).ready(() => {
            this.initDnD();
            this.setAllLabels();
        });
        this.initButtonHoverAudioEffect();
        this.showMonkey1();
        this.initConfirmButtons();
        this.showTestInfo(false);
        this.newspaperFsm = this.makeNewspaperFsm();
        this.paperCssBinding = new CssBinding($('#newspaper-page'));
        this.camCssBinding = new CssBinding($('#cam-root'));
        this.topProgressCssBinding = new CssBinding($('#top-bar'));
        this.bottomProgressCssBinding = new CssBinding($('#bottom-bar'));
        this.resultCssBinding = new CssBinding($('#newspaper-result'));
        this.manualBtnsCssBing = new CssBinding($('#newspaper-manual-button'));
        this.transparentOverlayCssBinding = new CssBinding($('#newspaper-transparent-overlay'));
        this.indicatorCssBinding = new CssBinding($('#indicator-bar'));
        this.indicatorButtonCssBinding = new CssBinding($('#indicator-bar-btn'));
        this.hpCssBinding = new CssBinding($('#newspaper-hp'));
        this.cleanLayerCssBinding = new CssBinding($('#newspaper-clean-overlay'));
        this.propFrameCssBinding = new CssBinding($('#newspaper-prop-frame'));
        this.levelProgressCssBinding = new CssBinding($('#level-progress-root'));
        this.expressionPromptCssBinding = new CssBinding($('#expression-prompt'));
        // collection
        this.propCssBindings = [];
        for (let i = 0; i < newspaperPropInfos.length; i++) {
            let propID = this.getPropID(i);
            let bd = new CssBinding($(`#${propID}`));
            this.propCssBindings.push(bd);
        }
        this.initBindingCss();
        CameraManager.getInstance().imageResEvent.on((e) => {
            this.imageHandler(e);
        });
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI();
        CameraManager.getInstance().startDectector();
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);
        CameraManager.getInstance().showVideo();
        GlobalEventManager.getInstance().newspaperButtonTopClickedEvent.on((m) => {
            this.newspaperButtonClicked(m, true);
        });
        GlobalEventManager.getInstance().newspaperButtonBottomClickedEvent.on((m) => {
            this.newspaperButtonClicked(m, false);
        });
    }
    newspaperButtonClicked(manager, isTop) {
        if (!this.canRecieveEmojiClick)
            return;
        this.emotionMaxed(isTop ? MyEmotion.Positive : MyEmotion.Negative);
        FmodManager.getInstance().playOneShot('65537_ConfirmEmoji');
    }
    resetProgress() {
        this.topProgress.value = 0;
        this.bottomProgress.value = 0;
        this.refreshEmojiProgressBarCss();
    }
    showTestInfo(show) {
        $('#test-info').css('display', show ? 'block' : 'none');
    }
    makeNewspaperFsm() {
        return new NewspaperFsm(this, this.npNums, this.paperEnterCallback.bind(this), this.correctEnterCallback.bind(this), this.secondChanceEnterCallback.bind(this), this.paperEndEntercallback.bind(this), this.paperEndAction.bind(this), this.paperDiedAddActionCallBack.bind(this));
    }
    intiPropButtons() {
        for (let i = 0; i < newspaperPropInfos.length; i++) {
            let info = newspaperPropInfos[i];
            $(`#prop-${i} .newspaper-prop-icon`).text(info.icon);
            $(`#prop-${i} .tooltip`).text(info.desc);
            $(`#prop-${i}`).css('pointer-events', 'none');
            // $(`#prop-${i}`).on('click', ()=>{this.onPropButtonClick(i)});
        }
    }
    onPropButtonClick(index) {
        newspaperPropInfos[index].activated = !newspaperPropInfos[index].activated;
        this.showPropButtonWithIndex(newspaperPropInfos[index].activated, index);
        this.updatePropStatus();
    }
    updateCleanTime() {
        if (this.isPropActivated(NewspaperPropType.LessCleaningTime)) {
            this.cleanTime = this.cleanTimeShort;
        }
        else {
            this.cleanTime = this.cleanTimeLong;
        }
    }
    updatePropStatus() {
        // Less cleaning time
        this.updateCleanTime();
        // See no evil
        // Logic is in this.updateAttentionLevel & this.drawBlackBar
        // Auto label drag
        if (this.isPropActivated(NewspaperPropType.AutoLabel)) {
            $('#newspaper-toolbox-stamps').css('pointer-events', 'none');
        }
        else {
            $('#newspaper-toolbox-stamps').css('pointer-events', 'auto');
        }
        // Prompt
        let item = this.getCurrentItem();
        if (!this.isRealPaper(item)) {
            this.showPromptLayer(this.isPropActivated(NewspaperPropType.Prompt));
        }
        // AutoEmoji
        // Logic is in this.drawVirtualHead
    }
    getPromptEmoji(item) {
        let answerEmoji = '';
        if (item.answer == 0) {
            answerEmoji = '😣';
        }
        else if (item.answer == 1) {
            answerEmoji = '😀';
        }
        else {
            answerEmoji = '🙈';
        }
        return answerEmoji;
    }
    showPromptLayer(show) {
        let answerEmoji = this.getPromptEmoji(this.getCurrentItem());
        this.setPromptContent(answerEmoji);
        $('#newspaper-prompt-overlay').css('visibility', show ? 'visible' : 'hidden');
    }
    setPromptContent(content) {
        let fullText = `✔️ -> ${content}`;
        $('#newspaper-prompt-overlay-content').text(fullText);
    }
    getPropInfoByType(tp) {
        for (let i = 0; i < newspaperPropInfos.length; i++) {
            if (newspaperPropInfos[i].type == tp) {
                return newspaperPropInfos[i];
            }
        }
        console.log("ERROR: Can't find this NewspaperPropType");
        return null;
    }
    // called by BaseScene.create
    initVoiceType() {
        this.getSpeechManager().setVoiceType(VoiceType.Voice65537);
    }
    drawFeaturePoints(res) {
        if ($('#face_video_canvas')[0] == null) {
            return;
        }
        let img = res.img;
        let featurePoints = res.face.featurePoints;
        var ctx = $('#face_video_canvas')[0].getContext('2d');
        var hRatio = ctx.canvas.width / img.width;
        var vRatio = ctx.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        ctx.strokeStyle = "#FF0000";
        for (var id in featurePoints) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff0000';
            ctx.arc(featurePoints[id].x, featurePoints[id].y, 2, 0, 2 * Math.PI);
            ctx.stroke();
            // console.log(ctx.lineWidth);
            // Draw number indices
            // contxt.font="10px Comic Sans MS";
            // contxt.fillStyle = "red";
            // contxt.textAlign = "center";
            // contxt.fillText("" + id, featurePoints[id].x,
            // featurePoints[id].y);
        }
        // this.drawBlackBar(ctx, featurePoints);
        if (this.isRealPaper() && this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
            this.drawBlackBar(ctx, featurePoints);
        }
        // TODO: should only happen in fake paper
        // if(this.isFakePaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
        if (!this.isRealPaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
            this.drawVirtualHead(ctx, featurePoints);
        }
        // this.drawVirtualHead(ctx, featurePoints);
    }
    isPropActivated(type) {
        return this.getPropInfoByType(type).activated;
    }
    drawVirtualHead(ctx, featurePoints) {
        let item = this.getCurrentItem();
        let eyeBegin = featurePoints[16];
        let eyeEnd = featurePoints[19];
        let faceCenter = featurePoints[12];
        let angl = Math.atan2(eyeEnd.y - eyeBegin.y, eyeEnd.x - eyeBegin.x);
        ctx.save();
        ctx.font = '260pt Arial';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(faceCenter.x, faceCenter.y - 20);
        ctx.rotate(angl);
        var rText = '😄';
        if (item.answer == 0) {
            rText = '😖';
        }
        else {
            rText = '😄';
        }
        ctx.fillText(rText, 0, 0);
        ctx.restore();
    }
    drawBlackBar(ctx, featurePoints) {
        let eyeBegin = featurePoints[16];
        let eyeEnd = featurePoints[19];
        let extendRadio = 0.1;
        // extend the bar a little bit
        let barBegin = this.lerpFeaturePoint(eyeBegin, eyeEnd, 0 - extendRadio);
        let barEnd = this.lerpFeaturePoint(eyeBegin, eyeEnd, 1 + extendRadio);
        ctx.beginPath();
        ctx.lineWidth = 40;
        ctx.strokeStyle = '#ffc83d';
        // ctx.strokeStyle = '#000000';
        ctx.moveTo(barBegin.x, barBegin.y);
        ctx.lineTo(barEnd.x, barEnd.y);
        ctx.stroke();
    }
    lerpFeaturePoint(point1, point2, ratio) {
        let x = lerp(point1.x, point2.x, ratio);
        let y = lerp(point1.y, point2.y, ratio);
        return { x: x, y: y };
    }
    imageHandler(res) {
        this.drawFeaturePoints(res);
        let face = res.face;
        let timestamp = res.timestamp;
        let emotionsDebug = JSON.stringify(face.emotions, (key, val) => {
            return val.toFixed ? Number(val.toFixed(0)) : val;
        });
        let expDebug = JSON.stringify(face.expressions, (key, val) => {
            return val.toFixed ? Number(val.toFixed(0)) : val;
        });
        let emoji = face.emojis.dominantEmoji;
        $('#test-info').text(emotionsDebug + '\n' + expDebug + '\n' + emoji);
        this.emotionAnalyze(res);
        //
        // console.log('')
        // console.log(face.expressions.eyeClosure);
    }
    showIndicator(isShow) {
        let dt = 600;
        let pany = TweenPromise.create(this, {
            targets: this.indicatorCssBinding,
            translateX: isShow ? 0 : -100,
            duration: dt
        });
        return pany;
    }
    updateIndicatorMeterBtn(analyzeRes) {
        if (this.needFreezeIndicatorMeterBtn) {
            return;
        }
        let emotionFactor = analyzeRes.emotion == MyEmotion.Positive ? -1 : 1;
        let per = 0.5 + emotionFactor * analyzeRes.intensity * 0.5;
        this.updateIndicatorMeterBtnByPercentage(per);
    }
    /**
     * Updatdate the indicator button by a input normalized number
     * @param per [0, 1]. 0 means top-most, 1 means bottom-most;
     */
    updateIndicatorMeterBtnByPercentage(per, needLerp = true) {
        // 1.current
        let curTop = this.indicatorButtonCssBinding.top;
        //  remove the postfix '%'
        let curTopNum = parseFloat(curTop.substr(0, curTop.length - 1));
        // 2.destination
        let top = this.indicatorBtnTop;
        let bottom = this.indicatorBtnBottom;
        let dest = lerp(top, bottom, per);
        // 3.lerp from current->destination
        let lerped = needLerp ? lerp(curTopNum, dest, 0.1) : dest;
        this.indicatorButtonCssBinding.top = `${lerped}%`;
    }
    updateAttentionLevel(time, dt) {
        if (this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
            this.lastAttention = 0;
        }
        let timestamp = this.curTime / 1000;
        if (this.lastTimeStamp != null && timestamp - this.lastTimeStamp > 0.3) {
            this.lastAttention = 0;
        }
        $('#attention-content').text(`🙈 Attention: ${this.lastAttention.toFixed(0)}`);
        if (this.lastAttention < 10) {
            $('#attention-frame').css('border-color', '#FFEB3B');
            if (this.isAttentionChecking) {
                this.updateCleanTime();
                this.needChangeMonkey = false;
                this.curCleanProgress += dt / 1000 / this.cleanTime;
                this.curCleanProgress = clamp(this.curCleanProgress, 0, 1);
                this.updateCleanProgressInner();
                if (this.curCleanProgress == 1) {
                    this.newspaperFsm.event(Fsm.PURGED);
                    // $('#newspaper-toolbox-stamps').css('visibility', 'visible');                    
                }
            }
        }
        else {
            $('#attention-frame').css('border-color', 'red');
        }
    }
    updateCleanProgressInner() {
        let showProgress = (this.curCleanProgress * 100).toFixed(0);
        $('#newspaper-clean-progress').text(`🧹: ${showProgress}%`);
        this.cleanLayerCssBinding.opacity = this.curCleanProgress;
    }
    isFakePaper() {
        let item = this.getCurrentItem();
        return !this.isRealPaper(item);
    }
    setNeedProgressAudioPlaying(needPlay) {
        if (this.inFinalAutoMode)
            needPlay = false;
        if (needPlay) {
            if (!this.isProgressAudioPlaying) {
                let fmod = FmodManager.getInstance();
                fmod.playInstance(fmod.emojiProgressInstance);
            }
            this.isProgressAudioPlaying = true;
        }
        else {
            if (this.isProgressAudioPlaying) {
                let fmod = FmodManager.getInstance();
                fmod.stopInstance(fmod.emojiProgressInstance);
            }
            this.isProgressAudioPlaying = false;
        }
    }
    emotionAnalyze(imgRes) {
        let item = this.getCurrentItem();
        let face = imgRes.face;
        // console.log(this.curTime);
        // console.log(imgRes.timestamp);
        // let timestamp = imgRes.timestamp; // in seconds
        let timestamp = this.curTime / 1000; // in seconds
        if (this.lastTimeStamp == null) {
            this.lastTimeStamp = timestamp;
        }
        this.lastAttention = imgRes.face.expressions.attention;
        let timeDiff = timestamp - this.lastTimeStamp;
        // analyze
        let res = EmmotionManager.getInstance().emotionAnalyze(imgRes);
        if (this.isFakePaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
            res.emotion = item.answer == 0 ? MyEmotion.Negative : MyEmotion.Positive;
            res.intensity = 1;
        }
        // notify the indicator meter to update Y
        this.updateIndicatorMeterBtn(res);
        if (res.intensity > 0.75) {
            this.setNeedProgressAudioPlaying(true);
        }
        else {
            this.setNeedProgressAudioPlaying(false);
        }
        // this.updateAttentionLevel(imgRes.face.expressions.attention);
        this.needDwitterFlow = false;
        if (!this.canRecieveEmotion || timeDiff > 1 || (this.onlyShowPositive && res.emotion == MyEmotion.Negative)) {
            this.lastTimeStamp = timestamp;
            this.setNeedProgressAudioPlaying(false);
            return;
        }
        if (this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            this.lastTimeStamp = timestamp;
            this.setNeedProgressAudioPlaying(false);
            return;
        }
        this.emotionAnalyzeFinished(res);
        // console.log(timeDiff);
        let fullTime = this.fullTime;
        let targetJquery = null;
        let progress = { value: 0 };
        if (res.emotion == MyEmotion.Positive) {
            targetJquery = $('#emoji-progress-top');
            progress = this.topProgress;
        }
        else if (res.emotion == MyEmotion.Negative) {
            targetJquery = $('#emoji-progress-bottom');
            progress = this.bottomProgress;
        }
        let added = 1 / fullTime * res.intensity * timeDiff;
        progress.value += added;
        progress.value = clamp(progress.value, 0, 1);
        if (progress.value == 1) {
            this.emotionMaxed(res.emotion);
        }
        if (res.intensity > 0.9) {
            this.needDwitterFlow = true;
        }
        this.refreshBarLeftIconStatus(res.emotion);
        this.refreshEmojiProgressBarCss();
        // if(res.emotion != MyEmotion.None) {
        //     targetJquery.css('width', progress.value * 100 + "%");
        // }
        this.lastTimeStamp = timestamp;
    }
    emotionAnalyzeFinished(res) {
    }
    refreshBarLeftIconStatus(currEmotion) {
        let activateBarID = [];
        let deactviateBarID = ['top-bar', 'bottom-bar'];
        if (currEmotion == MyEmotion.Positive) {
            deactviateBarID = [];
            activateBarID.push('top-bar');
            deactviateBarID.push('bottom-bar');
        }
        else if (currEmotion == MyEmotion.Negative) {
            deactviateBarID = [];
            activateBarID.push('bottom-bar');
            deactviateBarID.push('top-bar');
        }
        for (let i in activateBarID) {
            let barID = activateBarID[i];
            $(`#${barID} .normal`).css('display', 'none');
            $(`#${barID} .active`).css('display', 'block');
        }
        for (let i in deactviateBarID) {
            let barID = deactviateBarID[i];
            $(`#${barID} .normal`).css('display', 'block');
            $(`#${barID} .active`).css('display', 'none');
        }
    }
    refreshEmojiProgressBarCss() {
        this.topProgress.value = clamp(this.topProgress.value, 0, 1);
        this.bottomProgress.value = clamp(this.bottomProgress.value, 0, 1);
        $('#emoji-progress-top').css('width', this.topProgress.value * 100 + "%");
        $('#emoji-progress-bottom').css('width', this.bottomProgress.value * 100 + "%");
    }
    getProgressBarDenominator() {
        return this.npNums.length;
    }
    refreshLevelProgressBarCss(index) {
        let deno = this.getProgressBarDenominator();
        let pg = (index) / deno * 100;
        let fixedPg = pg.toFixed(0);
        $('#level-progress-bar').css('width', fixedPg + '%');
        $('#level-progress-text').text(`Experiment Progress: ${index} / ${index <= deno ? deno : '65537'}`);
    }
    getCurrentItem() {
        return NewsDataManager.getInstance().getByNum(this.npNums[this.currIndex]);
    }
    isFirstShownNYT(item) {
        return item.tag == 'FirstShownNYT';
    }
    emotionMaxed(myEmotion) {
        let item = this.getCurrentItem();
        // If it's in NYT mode, the EmotionMaxed event didn't trigger a result
        // It still shows a full progress bar, but does nothing
        // However, for the first time player encounter the NYT,
        // we still want to invoke the wrong answer branch
        if (this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            return;
        }
        else {
            this.canRecieveEmotion = false;
            this.canRecieveEmojiClick = false;
            this.lastMaxedEmojion = myEmotion;
            let rightEmotion = MyEmotion.None;
            if (item.answer == 0) {
                rightEmotion = MyEmotion.Negative;
            }
            else if (item.answer == 1) {
                rightEmotion = MyEmotion.Positive;
            }
            let correct = myEmotion == rightEmotion;
            // If:
            // 1. Is alwyas wrong mode
            // 2. Without prompt unlocked
            // Then it's a WRONG
            if (NewsDataManager.getInstance().isAlwaysWrongItem(item) && !this.isPropActivated(NewspaperPropType.Prompt)) {
                correct = false;
            }
            this.isLastTestCorrect = correct;
            // this.showResult(this.isLastTestCorrect);
            this.newspaperFsm.event(correct ? Fsm.CORRECT : Fsm.WRONG);
            this.refreshLevelProgressBarCss(this.currIndex + 1);
        }
    }
    createDwitters(parentContainer) {
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2400, 2400, true);
    }
    sceneAddFirstMeetGreetingActinos(s) {
        s.addSubtitleAction(this.subtitle, "Oh, hi there!", true)
            .addSubtitleAction(this.subtitle, "Terminal 65537 is at your service.\n", true)
            .addSubtitleAction(this.subtitle, "Your name is needed! Human.", false).finishImmediatly();
        return s;
    }
    createCenter(parentContainer) {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220), CenterType.Rect);
    }
    needModeSelect() {
        return false;
    }
    sceneAfterNameInput(s) {
        s.addSubtitleAction(this.subtitle, s => {
            return this.playerName + "? Interesting!";
        }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, "THE EXPERIMENT is waiting for us. \n Let's get it over with.", false, null, null, 10)
            .addSubtitleAction(this.subtitle, "Which experiment do you like to take?", false, null, null, 10).setBoolCondition(o => this.needModeSelect());
        return s;
    }
    getOriginalTitle() {
        return 'Project 65537';
    }
    getChangedToTitle() {
        return 'Project 65537';
    }
    sceneHomeTogameAnimation(s) {
        super.sceneHomeTogameAnimation(s);
        let dt = 1000;
        s.addTweenAllAction(this, [
            // Rotate center to normal angle
            {
                targets: this.centerObject.inner,
                rotation: 0,
                scale: 0,
                duration: dt,
            },
            // Scale out the outter dwitter
            {
                targets: this.dwitterCenter.inner,
                alpha: 0,
                scale: 2,
                duration: dt,
            },
        ]);
        return s;
    }
    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);
        this.initBindingCss();
        this.resetNewspaperParameter();
    }
    resetNewspaperParameter() {
        this.npHp = this.npMaxHp;
        this.refreshHp();
        this.cleanTime = this.cleanTimeLong;
        this.needFreezeIndicatorMeterBtn = false;
        this.refreshLevelProgressBarCss(0);
        this.inFinalAutoMode = false;
    }
    refreshHp() {
        this.setHp(this.npHp);
    }
    setHp(num) {
        let hpStr = '';
        for (let i = 0; i < num; i++) {
            hpStr += '❤️';
        }
        for (let i = 0; i < this.npMaxHp - num; i++) {
            hpStr += '🤍';
        }
        $('#newspaper-hp-content').text(hpStr);
    }
    initBindingCss() {
        this.paperCssBinding.scale = 0;
        this.paperCssBinding.rotate = 0;
        this.paperCssBinding.translateX = this.initialPaperTranslateX;
        this.paperCssBinding.translateY = this.initialPaperTranslateY;
        this.paperCssBinding.update();
        this.camCssBinding.translateX = this.initialCamTranslateX;
        this.camCssBinding.translateY = this.initialCamTranslateY;
        this.camCssBinding.update();
        this.topProgressCssBinding.translateY = 100;
        this.topProgressCssBinding.update();
        this.bottomProgressCssBinding.translateY = -100;
        this.bottomProgressCssBinding.update();
        this.resultCssBinding.translateX = 100;
        this.resultCssBinding.update();
        this.manualBtnsCssBing.translateX = -100;
        this.manualBtnsCssBing.translateY = -50;
        this.manualBtnsCssBing.update();
        this.transparentOverlayCssBinding.opacity = 0;
        this.transparentOverlayCssBinding.update();
        this.indicatorCssBinding.translateX = -100;
        this.indicatorCssBinding.update();
        this.indicatorButtonCssBinding.top = `${this.indicatorBtnTop}%`;
        this.indicatorButtonCssBinding.update();
        this.hpCssBinding.translateX = 100;
        this.hpCssBinding.update();
        this.cleanLayerCssBinding.opacity = 0;
        this.cleanLayerCssBinding.update();
        this.propFrameCssBinding.translateY = 0;
        this.propFrameCssBinding.update();
        this.levelProgressCssBinding.translateY = 0;
        this.levelProgressCssBinding.update();
        this.expressionPromptCssBinding.translateX = 0;
        this.expressionPromptCssBinding.update();
        for (let i = 0; i < this.propCssBindings.length; i++) {
            this.showPropButtonWithIndex(false, i);
        }
    }
    // show the see-no-evil monkey
    showExpressionPrompt(show) {
        let dt = 1000;
        let dest = show ? -100 : 0;
        this.tweens.add({
            targets: this.expressionPromptCssBinding,
            translateX: dest,
            duration: dt
        });
    }
    showMonkey1() {
        $('#expression-prompt-content').text('🙈');
        if (this.needChangeMonkey) {
            setTimeout(() => {
                this.showMonkey2();
            }, 2000);
        }
        else {
            $('#expression-prompt-content').text('🙈');
        }
    }
    showMonkey2() {
        $('#expression-prompt-content').text('🙉');
        if (this.needChangeMonkey) {
            setTimeout(() => {
                this.showMonkey1();
            }, 1000);
        }
        else {
            $('#expression-prompt-content').text('🙈');
        }
    }
    showPropFrame(show = true) {
        this.propFrameCssBinding.translateY = show ? -100 : 0;
        this.propFrameCssBinding.update();
    }
    showPropButtonWithType(show, type) {
        let i = 0;
        for (; i < newspaperPropInfos.length; i++) {
            if (newspaperPropInfos[i].type == type) {
                break;
            }
        }
        this.showPropButtonWithIndex(show, i);
    }
    showPropButtonWithIndex(show, index) {
        $(`#prop-${index}`).css('pointer-events', show ? 'auto' : 'none');
        let dt = 500;
        newspaperPropInfos[index].activated = show;
        if (notSet(this.propCssBindings[index].translateY)) {
            this.propCssBindings[index].translateY = 65;
        }
        this.tweens.add({
            targets: this.propCssBindings[index],
            translateY: show ? 0 : 65,
            duration: dt
        });
        // this.propCssBindings[index].translateY = show ? 0 : 65;
    }
    showPaper(show = true) {
        $('#newspaper-layer').css('display', show ? 'block' : 'none');
        $('#newspaper-page').css('visibility', show ? 'visible' : 'hidden');
        $('#top-bar').css('visibility', show ? 'visible' : 'hidden');
        $('#bottom-bar').css('visibility', show ? 'visible' : 'hidden');
        $('#indicator-bar').css('visibility', show ? 'visible' : 'hidden');
        let dt = 500;
        this.tweens.add({
            targets: this.paperCssBinding,
            scale: 1,
            duration: dt
        });
        this.tweens.add({
            targets: this.paperCssBinding,
            rotate: 360,
            duration: dt
        });
    }
    showManualBtns(isShow) {
        let dt = 500;
        this.tweens.add({
            targets: this.manualBtnsCssBing,
            translateX: isShow ? 0 : -100,
            duration: dt
        });
    }
    createHud(parentContainer) {
        return null;
    }
    sceneExitNormalGame(s) {
        super.sceneExitNormalGame(s);
        this.newspaperFsm.stop();
    }
    scenePrepareBackToHome() {
        super.scenePrepareBackToHome();
        this.showPaper(false);
    }
    showCam(isShow) {
        let dt = 500;
        this.isCamShown = isShow;
        this.tweens.add({
            targets: this.camCssBinding,
            translateX: isShow ? 0 : this.initialCamTranslateX,
            duration: dt
        });
        this.tweens.add({
            targets: this.paperCssBinding,
            translateX: isShow ? -70 : this.initialPaperTranslateX,
            duration: dt
        });
    }
    showHp(show) {
        let dt = 500;
        this.tweens.add({
            targets: this.hpCssBinding,
            translateX: show ? 0 : 100,
            duration: dt
        });
    }
    /**
     * Since the top and bottom tween have the same duration
     * we just return one of them as the Promise
     */
    showEmojiProgressBars() {
        let dt = 600;
        let top = TweenPromise.create(this, {
            targets: this.topProgressCssBinding,
            translateY: 0,
            duration: dt
        });
        if (!this.onlyShowPositive) {
            this.tweens.add({
                targets: this.bottomProgressCssBinding,
                translateY: 0,
                duration: dt
            });
        }
        this.showIndicator(true);
        return top;
    }
    showLevelProgess(show) {
        let dt = 600;
        let toY = show ? 100 : 0;
        this.tweens.add({
            targets: this.levelProgressCssBinding,
            translateY: toY,
            duration: dt
        });
    }
    /**
     * Since the top and bottom tween have the same duration
     * we just return one of them as the Promise
     */
    hideProgressBars() {
        let dt = 600;
        let top = TweenPromise.create(this, {
            targets: this.topProgressCssBinding,
            translateY: 100,
            duration: dt
        });
        this.tweens.add({
            targets: this.bottomProgressCssBinding,
            translateY: -100,
            duration: dt
        });
        this.showIndicator(false);
        return top;
    }
    hideAndShowProgressBars() {
        return this.hideProgressBars().then(res => { return this.showEmojiProgressBars(); });
    }
    showResult(isCorrect) {
        if (!isCorrect) {
            this.npHp--;
            this.refreshHp();
        }
        $('#newspaper-result-content').text(isCorrect ? '✔️' : '❌');
        let ret = TimeOutPromise.create(800).then(s => {
            if (isCorrect) {
                FmodManager.getInstance().playOneShot('65537_CorrectResponse');
            }
            else {
                FmodManager.getInstance().playOneShot('65537_WrongResponse');
            }
            // when in show result, make sure the top of hp bar is moved down
            $('#newspaper-hp').css('top', '90px');
            let dt = 500;
            return TweenPromise.create(this, {
                targets: this.resultCssBinding,
                translateX: 0,
                duration: dt
            });
        }).then(s => {
            return TimeOutPromise.create(1000);
        });
        return ret;
    }
    hideResult() {
        let dt = 500;
        this.tweens.add({
            targets: this.resultCssBinding,
            translateX: 100,
            duration: dt
        });
        $('#newspaper-hp').css('top', '20px');
    }
    updateCssBinding() {
        if (this.camCssBinding)
            this.camCssBinding.update();
        if (this.paperCssBinding)
            this.paperCssBinding.update();
        if (this.topProgressCssBinding)
            this.topProgressCssBinding.update();
        if (this.bottomProgressCssBinding)
            this.bottomProgressCssBinding.update();
        if (this.resultCssBinding)
            this.resultCssBinding.update();
        if (this.manualBtnsCssBing)
            this.manualBtnsCssBing.update();
        if (this.transparentOverlayCssBinding)
            this.transparentOverlayCssBinding.update();
        if (this.indicatorCssBinding)
            this.indicatorCssBinding.update();
        if (this.indicatorButtonCssBinding)
            this.indicatorButtonCssBinding.update();
        if (this.hpCssBinding)
            this.hpCssBinding.update();
        if (this.cleanLayerCssBinding)
            this.cleanLayerCssBinding.update();
        if (this.propFrameCssBinding)
            this.propFrameCssBinding.update();
        for (let i = 0; i < this.propCssBindings.length; i++) {
            this.propCssBindings[i].update();
        }
        if (this.levelProgressCssBinding)
            this.levelProgressCssBinding.update();
        if (this.expressionPromptCssBinding)
            this.expressionPromptCssBinding.update();
        // $('#affdex_elements').css('transform',`translate(${this.camTranslateX}%, ${this.camTranslateY}%)`);
        // $('#newspaper-page').css('transform', `translate(${this.paperTranslateX}%, ${this.paperTranslateY}%) scale(${this.paperScale}) rotate(${this.paperRotate}deg)`);
    }
    update(time, dt) {
        super.update(time, dt);
        this.updateCssBinding();
        this.updateDwitterBackgroundState();
        this.updateAttentionLevel(time, dt);
    }
    updateDwitterBackgroundState() {
        if (this.inFinalAutoMode) {
            this.dwitterBKG.isRunning2 = true;
            return;
        }
        if (this.isCamShown) {
            if (this.needDwitterFlow && this.canRecieveEmotion) {
                this.dwitterBKG.isRunning2 = true;
            }
            else {
                this.dwitterBKG.isRunning2 = false;
            }
        }
        else {
            this.dwitterBKG.isRunning2 = false;
        }
    }
    getNewsItemFromIndex(index) {
        let num = this.npNums[index];
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(num);
        return newsItem;
    }
    isRealPaper(newsItem) {
        if (notSet(newsItem)) {
            newsItem = this.getCurrentItem();
        }
        return NewsDataManager.getInstance().isRealPaper(newsItem);
    }
    fillNewspaperContentByNum(num) {
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(num);
        if (this.isRealPaper(newsItem)) {
            this.fillNewspaperContentReal(newsItem);
        }
        else {
            this.fillNewspaperContentNormal(newsItem);
        }
    }
    fillNewspaperContentReal(newsItem) {
        let titleSlot = $('#newspaper-title');
        let contentSlot = $('#newspaper-content-text');
        let thumbnailSlot = $('#newspaper-thumbnail');
        this.setTitle(this.getToolTipToRealPaperTitle(newsItem, false));
        let assignedIndex = Number.parseInt(newsItem.content.match(/index='(.*?)'/)[1]);
        // console.log("assignedIndex: " + assignedIndex);
        // let assignedIndex = 0;
        let curRssItem = this.rssItems[assignedIndex % this.rssItems.length];
        let content = curRssItem.title + '<br/><br/>' + curRssItem.desc;
        contentSlot.html(content);
        thumbnailSlot.attr('src', curRssItem.imageUrl);
        if (newsItem.style == 0) {
            this.setNewspaperStyle(NewspaperStyle.DEFAULT);
        }
        // this.rssCurIndex++;
        // this.rssCurIndex %= this.rssItems.length;
    }
    convertToAsterisk(str) {
        let output = '';
        let isFirst = true;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) != ' ') {
                if (isFirst) {
                    output += str.charAt(i);
                    isFirst = false;
                }
                else {
                    output += '*';
                }
            }
            else {
                isFirst = true;
                output += ' ';
            }
        }
        return output;
    }
    setAllLabels() {
        console.log('setAllLabels');
        let map = NewsDataManager.getInstance().labelMapping;
        let allLabels = [];
        for (let [k, v] of map) {
            for (let j in v) {
                allLabels.push(v[j]);
            }
        }
        gLabelWall.setItems(allLabels);
    }
    getToolTipToRealPaperTitle(newsItem, isAsteriskTitle) {
        if (!this.isRealPaper(newsItem)) {
            return newsItem.title;
        }
        let oriLabels = NewsDataManager.getInstance().labelMapping.get(newsItem.sourceType);
        let lbls = [];
        for (let i in oriLabels) {
            lbls.push('<b>• ' + oriLabels[i] + '</b>');
        }
        let asteriskTitle = this.convertToAsterisk(newsItem.title);
        let tooltip = `No legal record is found related to ${asteriskTitle}.<br/><br/> Still, according to the Word2Vec word embedding database we got from Experiment 65536, people usually refer to ${asteriskTitle} as:<br/>`;
        let connectedLbls = `<div class='red'>${lbls.join('<br/>')}</div>`;
        tooltip += connectedLbls;
        let newTitle = `<span class='keyword'>${isAsteriskTitle ? this.convertToAsterisk(newsItem.title) : newsItem.title}<span class='tooltip''>${tooltip}</span></span>`;
        return newTitle;
    }
    setTitle(str) {
        let titleSlot = $('#newspaper-title');
        titleSlot.html(str);
        ;
    }
    fillNewspaperContentNormal(newsItem) {
        let titleSlot = $('#newspaper-title');
        let contentSlot = $('#newspaper-content-text');
        let thumbnailSlot = $('#newspaper-thumbnail');
        this.setTitle(newsItem.title);
        contentSlot.html(newsItem.content);
        if (newsItem.thumbnail1 && newsItem.thumbnail1.length > 0) {
            thumbnailSlot.attr('src', 'assets/newspaper/' + newsItem.thumbnail1);
        }
        else {
            thumbnailSlot.attr('src', 'assets/newspaper/portrait-1.jpg');
        }
        if (newsItem.style == 0) {
            this.setNewspaperStyle(NewspaperStyle.DEFAULT);
        }
        this.enableAttention(false);
    }
    setNewspaperStyle(style) {
        this.npStyle = style;
        let p = $('#newspaper-content-text');
        let thumb = $('#newspaper-thumbnail');
        if (style == NewspaperStyle.ONLY_TEXT_CENTER) {
            p.css('position', 'absolute');
            p.css('text-align', 'center');
            p.css('width', '100%');
            p.css('top', '50%');
            p.css('transform', 'translate(0, -50%)');
            thumb.css('display', 'none');
        }
        else if (style == NewspaperStyle.DEFAULT) {
            p.css('position', 'static');
            p.css('text-align', 'inherit');
            p.css('width', '');
            p.css('top', '');
            p.css('transform', '');
            this.setNewspaperFontSize(16);
            thumb.css('display', 'block');
        }
    }
    setNewspaperTitle(title) {
        let t = $('#newspaper-title');
        t.html(title);
    }
    setNewspaperContent(content) {
        let p = $('#newspaper-content-text');
        p.html(content);
    }
    setNewspaperFontSize(size) {
        let p = $('#newspaper-content-text');
        p.css('font-size', `${size}px`);
    }
    showTransparentOverlay(isShow) {
        let dt = 600;
        let tp = TweenPromise.create(this, {
            targets: this.transparentOverlayCssBinding,
            opacity: isShow ? 1 : 0,
            duration: dt
        });
        return tp;
    }
    setCenterTextPaper(title, content, fontSize = 150) {
        this.setNewspaperStyle(NewspaperStyle.ONLY_TEXT_CENTER);
        this.setNewspaperContent(content);
        this.setNewspaperFontSize(fontSize);
        this.setNewspaperTitle(title);
    }
    /////////////////////////////////////////////////////////////////////////
    getInnerFrameWith() {
        return 450;
    }
    paperEnterCallback(state, index) {
        this.currIndex = index;
        let item = this.getCurrentItem();
        this.fillNewspaperContentByNum(this.npNums[index]);
        this.showTransparentOverlay(false);
        this.hideResult();
        this.canRecieveEmojiClick = true;
        FmodManager.getInstance().playOneShot('65537_NewspaperFlip');
        this.resetProgress();
        let borderStyleIndex = index % this.innerBorderStyles.length;
        $('#newspaper-inner-frame').css('border-style', this.innerBorderStyles[borderStyleIndex]);
        // let randomWidth = 400 + Math.random() * 100;
        let randomWidth = this.getInnerFrameWith();
        $('#newspaper-inner-frame').css('width', `${randomWidth}px`);
        // reset the real paper params
        this.curCleanProgress = 0;
        this.updateCleanProgressInner();
        // check if I need to show the prompt layer
        // Real page doesn't show propmt layer
        if (this.isPropActivated(NewspaperPropType.Prompt) && !this.isRealPaper(item)) {
            this.showPromptLayer(true);
        }
        else {
            this.showPromptLayer(false);
        }
        if (index == 0 && item.index != NAOMI_PAPER_NUM) {
            this.showLevelProgess(true);
        }
    }
    correctEnterCallback(state, index) {
        // this.hideProgressBars();
        // this.canRecieveEmotion = false;
    }
    getNewsItemByIndex(index) {
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(this.npNums[index]);
        return newsItem;
    }
    secondChanceEnterCallback(state, index) {
        this.resetProgress();
        this.hideResult();
        let item = this.getNewsItemByIndex(index);
        // is cam
        if (item.reaction == 1) {
        }
        else if (item.reaction == 0) {
            this.canRecieveEmojiClick = true;
        }
    }
    /**
     * Keep in mind that the onEnter can't handle the task needed to be sequenced
     * very well
     * @param state
     * @param index
     */
    paperEndEntercallback(state, index) {
        this.subtitle.forceStopAndHideSubtitles();
        this.refreshLevelProgressBarCss(index + 1);
    }
    paperEndAction(s, index) {
        s.addAction((s, result, resolve, reject) => {
            this.showTransparentOverlay(true).then(res => {
                resolve('transprent show');
            });
            let item = this.getNewsItemByIndex(index);
            if (item.reaction == 1) {
                this.hideProgressBars();
            }
            this.hideResult();
        });
        s.addDelayAction(this, 300);
        s.addAction(s => {
            $('#stamp-dest-container')[0].innerHTML = '';
        });
        s.addAction(s => {
            if (this.npHp == 0 && !this.isExercise) {
                // global died event
                s.fsm.event(NewspaperFsm.DIED_EV_NAME, true);
            }
            else {
                s.finished();
            }
        });
    }
    /**
     *
     * @param s
     * @param index nonsense here. always == 0
     */
    paperDiedAddActionCallBack(s, index) {
        s.addAction(s => {
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '😭');
            this.hideResult();
        });
        s.addSubtitleAction(this.subtitle, () => `Sorry, ${this.getUserName()}.\nYou have run out of lives and we must kick you out`, false);
        s.addAction(s => {
            this.setCenterTextPaper('65537', '🤗');
            this.showCam(false);
        });
        s.addSubtitleAction(this.subtitle, () => `Maybe next time? You are always welcome.`, false, null, null, 1500);
        s.addAction(s => {
            this.backBtn.click();
        });
    }
    waitPromise(dt) {
        return new Promise((r, j) => {
            setTimeout(() => {
                r('waitPromise');
                console.log('waitPromisewaitPromisewaitPromisewaitPromise');
            }, dt);
        });
    }
    autoDragLabels() {
        let ret = Promise.resolve();
        let item = this.getCurrentItem();
        let neededLabels = NewsDataManager.getInstance().labelMapping.get(item.sourceType);
        let waitDt = 1000;
        for (let i = 0; i < neededLabels.length; i++) {
            let lblName = neededLabels[i];
            let id = convertNewspaperSourceTypeToID(lblName);
            let domObj = $('#' + id)[0];
            ret = ret.then(s => { return this.waitPromise(waitDt); });
            ret = ret.then(s => {
                $(this.destiID)[0].appendChild(domObj);
            });
        }
        ret = ret.then(s => { return this.waitPromise(waitDt); });
        return ret;
    }
    setStrikeThroughOnEmojiIcons(show) {
        $('.emoji').css('text-decoration', show ? 'line-through' : 'none');
    }
    showConfirmButons(show) {
        if (show) {
            $('#confirm-button-root').css('visibility', 'visible');
            $('#confirm-button-root').css('pointer-events', 'auto');
        }
        else {
            $('#confirm-button-root').css('visibility', 'hidden');
            $('#confirm-button-root').css('pointer-events', 'none');
        }
    }
    initConfirmButtons() {
        $(`#confirm-button-yes`).on('click', () => { this.onConfirmAutoExpressionClick(true); });
        $(`#confirm-button-no`).on('click', () => { this.onConfirmAutoExpressionClick(false); });
    }
    onConfirmAutoExpressionClick(yes) {
        // implemented in subclass
    }
    initStNewspaperWithIndex(idx) {
        let index = idx;
        let item = this.getNewsItemFromIndex(index);
        let state = this.newspaperFsm.getStateByIndex(index);
        // Intro
        console.log(idx);
        this.helperAddSubtitleAction(state, item.intro, false);
        state.addAction(s => {
            this.canRecieveEmotion = true;
            if (item.reaction == 1) {
                this.showEmojiProgressBars();
            }
        });
        // Specific for NYT-likes
        if (this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            state.addOnEnter(s => {
                this.isAttentionChecking = true;
                this.enableAttention(true);
                this.setStrikeThroughOnEmojiIcons(true);
                if (!this.isPropActivated(NewspaperPropType.SeeNoEvil) && item.index != SEE_NO_EVIL_NUM)
                    this.showExpressionPrompt(true);
            });
            state.addOnExit(s => {
                this.isAttentionChecking = false;
                this.enableAttention(false);
                this.setStrikeThroughOnEmojiIcons(false);
                this.showExpressionPrompt(false);
            });
        }
        // Purged(waiting for label to be put in)
        let purged = this.newspaperFsm.getPurgedStateByIndex(index);
        this.helperAddSubtitleAction(purged, item.purgeIntro, false);
        purged.addOnEnter(s => {
            gResetLabelWall();
            this.initDnDSource();
            this.setAllLabels();
            if (!this.isPropActivated(NewspaperPropType.AutoLabel)) {
                $('#newspaper-clean-overlay').css('pointer-events', 'auto');
            }
            this.setTitle(this.getToolTipToRealPaperTitle(item, true));
            $('#newspaper-toolbox-stamps').css('visibility', 'visible');
        });
        purged.addAction((s, re, resolve, reject) => {
            this.autoDragLabels().then(s => {
                resolve('dragFinished');
                this.checkIfLabelsCorrect();
            });
        }).setBoolCondition(() => { return this.isPropActivated(NewspaperPropType.AutoLabel); });
        purged.addOnExit(s => {
            $('#newspaper-toolbox-stamps').css('visibility', 'hidden');
            $('#newspaper-clean-overlay').css('pointer-events', 'none');
        });
        // LabelCorrect(labels all put)
        let labelCorrect = this.newspaperFsm.getLabelCorrectStateByInde(index);
        labelCorrect.addAction((s, result, resolve, reject) => {
            this.showResult(true).then(s => {
                resolve('');
            });
        });
        this.helperAddSubtitleAction(labelCorrect, item.labelCorrectIntro, false);
        labelCorrect.addFinishAction();
        // Correct
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addAction((s, result, resolve, reject) => {
            this.showResult(true).then(s => {
                resolve('');
            });
        });
        if (NewsDataManager.getInstance().isAlwaysWrongItem(item)) {
            this.helperAddSubtitleAction(correct, `See? There is no trap in the prompting!`, true);
            this.helperAddSubtitleAction(correct, `People are always skeptical about my willingness to help, which made me so sad`, true);
        }
        else {
            this.helperAddSubtitleAction(correct, item.correctResponse, true);
        }
        correct.addFinishAction();
        // Wrong
        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addAction((s, result, resolve, reject) => {
            this.showResult(false).then(s => {
                resolve('');
            });
        });
        if (NewsDataManager.getInstance().isAlwaysWrongItem(item)) {
            this.helperAddSubtitleAction(wrong, item.wrongResonpse, true, () => {
                return this.lastMaxedEmojion == MyEmotion.Negative;
            });
            this.helperAddSubtitleAction(wrong, item.correctResponse, true, () => {
                return this.lastMaxedEmojion == MyEmotion.Positive;
            });
        }
        else {
            this.helperAddSubtitleAction(wrong, item.wrongResonpse, true);
        }
        if (!this.isRealPaper(item) && (this.isExercise || NewsDataManager.getInstance().isAlwaysWrongItem(item))) {
            wrong.addAction(s => {
                this.resetProgress();
                this.hideResult();
            });
            wrong.addEventAction(Fsm.SECODN_CHANCE);
        }
        else {
            wrong.addFinishAction();
        }
        // Second Chance Intro
        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addAction((s) => {
            if (item.reaction == 1) {
                this.hideProgressBars();
            }
        });
        this.helperAddSubtitleAction(second, item.secondChanceIntro, false);
        second.addAction(s => {
            if (item.reaction == 1) {
                this.showEmojiProgressBars();
                this.canRecieveEmotion = true;
            }
        });
    }
    /**
     * Parse the raw string into separate subtitle action addings
     * '\n' means a new line
     * </hr> means a new action
     * ${username} means username
     * @param s
     * @param rawStr
     */
    helperAddSubtitleAction(s, rawStr, autoHide, func) {
        if (!rawStr || rawStr.length == 0)
            return;
        let sep = '<hr/>';
        let newline = /\<br\/\>/gi;
        let usernamePlaceholder = /\{username\}/gi;
        let dialog = rawStr.split(sep);
        for (let i = 0; i < dialog.length; i++) {
            let sentenceRaw = dialog[i];
            // console.log(sentenceRaw);
            let sub = s.addSubtitleAction(this.subtitle, () => {
                let ret = sentenceRaw.replace(newline, '\n');
                ret = ret.replace(usernamePlaceholder, this.getUserName());
                return ret;
            }, autoHide);
            if (func) {
                sub.setBoolCondition(func);
            }
        }
    }
    enableAttention(show) {
        $('#attention-frame').css('visibility', show ? 'visible' : 'hidden');
    }
    initDnD() {
        // stamps
        let stampEles = $('.newspaper-stamp');
        GlobalEventManager.getInstance().dragStartEvent.on((e) => { this.dragStart(e); });
        this.initDnDDestination();
        this.initDnDSource();
    }
    initDnDDestination() {
        // Destination
        let desti = $(this.destiID);
        desti.on('drop', (e) => { this.drop(e.originalEvent); });
        desti.on('dragover', (e) => { this.dragOver(e.originalEvent); });
        desti.on('dragenter', (e) => { this.dragEnter(e.originalEvent); });
        desti.on('dragleave', (e) => { this.dragLeave(e.originalEvent); });
        desti.on('dragend', (e) => { this.dragEnd(e.originalEvent); });
    }
    initDnDSource() {
        // Source
        let source = $(this.sourceID);
        source.on('drop', (e) => { this.drop(e.originalEvent); });
        source.on('dragover', (e) => { this.dragOver(e.originalEvent); });
        source.on('dragenter', (e) => { this.dragEnter(e.originalEvent); });
        source.on('dragleave', (e) => { this.dragLeave(e.originalEvent); });
        source.on('dragend', (e) => { this.dragEnd(e.originalEvent); });
    }
    dragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text", e.target.id);
        this.lastDragID = e.target.id;
        this.destiCount = 0;
        this.sourceCount = 0;
    }
    initButtonHoverAudioEffect() {
        let btns = $('.newspaper-manual-button-frame');
        btns.mouseenter(() => {
            FmodManager.getInstance().playOneShot('65537_ChooseEmoji');
        });
        btns = $('.confirm-button');
        btns.mouseenter(() => {
            FmodManager.getInstance().playOneShot('65537_ChooseEmoji');
        });
    }
    isIn(parent, child) {
        return parent == child || parent.contains(child);
    }
    getTrueContainer(node) {
        let desti = $(this.destiID)[0];
        let source = $(this.sourceID)[0];
        // desti
        if (this.isIn(desti, node)) {
            return desti;
        }
        // source
        else if (this.isIn(source, node)) {
            return source;
        }
        return null;
    }
    getIndexFromNum(num) {
        for (let i = 0; i < this.npNums.length; i++) {
            if (num == this.npNums[i]) {
                return i;
            }
        }
        return 0;
    }
    checkIfLabelsCorrect() {
        let item = this.getCurrentItem();
        let correctLabels = NewsDataManager.getInstance().labelMapping.get(item.sourceType);
        let actualLabels = [];
        $('#stamp-dest-container .newspaper-stamp').each(function () {
            // 'this' here refers to the iterated ob
            actualLabels.push($(this).text());
        });
        let same = this.isSame(actualLabels, correctLabels);
        if (same) {
            setTimeout(() => {
                this.newspaperFsm.event(Fsm.LABEL_CORRECT);
            }, 500);
        }
    }
    isSame(ar1, ar2) {
        if (ar1.length != ar2.length)
            return false;
        for (let i in ar1) {
            if (!ar2.find(e => e == ar1[i])) {
                return false;
            }
        }
        return true;
    }
    drop(e) {
        e.dataTransfer.dropEffect = 'move';
        let ob = document.getElementById(this.lastDragID);
        let container = this.getTrueContainer(e.target);
        if (!this.isIn(container, ob)) {
            container.appendChild(ob);
        }
        this.checkIfLabelsCorrect();
        e.preventDefault();
        e.stopPropagation();
    }
    dragOver(e) {
        // if (e.target.getAttribute("draggable") == "true"){
        //     e.dataTransfer.dropEffect = "none"; // dropping is not allowed
        // }   
        // else {
        //    
        // }      
        e.dataTransfer.dropEffect = "move"; // drop it like it's hot
        e.preventDefault();
        e.stopPropagation();
    }
    dragEnter(e) {
        let ob = document.getElementById(this.lastDragID);
        let container = this.getTrueContainer(e.target);
        if (this.isIn(container, ob)) {
            return;
        }
        if (this.isIn($(this.destiID)[0], e.target)) {
            this.destiCount++;
            $(this.destiID)[0].classList.add('over');
        }
        else if (this.isIn($(this.sourceID)[0], e.target)) {
            this.sourceCount++;
            $(this.sourceID)[0].classList.add('over');
        }
    }
    dragLeave(e) {
        let ob = document.getElementById(this.lastDragID);
        let container = this.getTrueContainer(e.target);
        if (this.isIn(container, ob)) {
            return;
        }
        if (this.isIn($(this.destiID)[0], e.target)) {
            this.destiCount--;
            if (this.destiCount == 0)
                $(this.destiID)[0].classList.remove('over');
        }
        else if (this.isIn($(this.sourceID)[0], e.target)) {
            this.sourceCount--;
            if (this.sourceCount == 0)
                $(this.sourceID)[0].classList.remove('over');
        }
    }
    dragEnd(e) {
        $(this.destiID)[0].classList.remove('over');
        $(this.sourceID)[0].classList.remove('over');
    }
}
/// <reference path="scene-2.ts" />
class Scene2L1 extends Scene2 {
    constructor() {
        super('Scene2L1');
    }
    get npNums() {
        return [0, 1, 2, 3, 4, 5, 6];
    }
    create() {
        super.create();
        this.isExercise = true;
        this.initGamePlayFsm();
        this.initNewspaperFsm();
        this.fillNewspaperContentByNum(0);
        this.setNewspaperStyle(NewspaperStyle.ONLY_TEXT_CENTER);
    }
    initGamePlayFsm() {
        this.initStGamePlayDefault();
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
    }
    initNewspaperFsm() {
        this.initStNewspaperDefault();
        this.initStNewspaper0();
        this.initStNewspaper1();
        for (let i = 2; i < this.npNums.length; i++) {
            this.initStNewspaperWithIndex(i);
        }
        // this.initStNewspaper2();        
        // this.initStNewspaper3();
        // this.initStNewspaper4();
        // this.initStNewspaper5();
        this.initStNewspaper6();
        this.updateObjects.push(this.newspaperFsm);
    }
    getGamePlayFsmData() {
        return normal_2_1;
    }
    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }
    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            this.showPaper(true);
            this.setCenterTextPaper('65536 Sucks', '😀');
            this.newspaperFsm.start();
        });
    }
    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();
        state.addAction(s => {
            this.setCenterTextPaper('Welcome', '😅');
        });
        state.addSubtitleAction(this.subtitle, () => `Welcome, ${this.getUserName()}. \nI know. It's hard to say welcome. We owe you a lot.`, false);
        state.addAction(s => {
            this.setCenterTextPaper('65536 Sucks', '😣');
        });
        state.addSubtitleAction(this.subtitle, () => `I do understand what it means\n to come through the annoying Experiment 65536.`, false);
        state.addAction(s => {
            this.setCenterTextPaper('Procedurality👎', '🙃');
        });
        state.addSubtitleAction(this.subtitle, `Those nerds are so obsessed with their stupid Procedural Rhetoric, \nbut have forgotten the subject experience completely.`, false);
        state.addAction(s => {
            this.setCenterTextPaper('65537', '🤗');
        });
        state.addSubtitleAction(this.subtitle, () => `But trust me, ${this.getUserName()}. \nNo hassle on the compulsive typing is needed here in 65537 anymore. \nAll you need is just providing your natural reaction with ease.`, false);
        state.addFinishAction();
    }
    initStNewspaper0() {
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addOnEnter(s => {
            this.canRecieveEmotion = false;
        });
        state.addSubtitleAction(this.subtitle, 'For example:\n Can you show me how you feel when see the news above?', false);
        state.addAction(s => {
            this.showManualBtns(true);
        });
        state.addSubtitleAction(this.subtitle, 'You can answer by clicking on the emoji buttons on the right side.', false);
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addAction((s, result, resolve, reject) => {
            this.showResult(true).then(s => {
                resolve('');
            });
        });
        correct.addSubtitleAction(this.subtitle, () => `Yeah, that's my good ${this.getUserName()}`, true);
        correct.addAction(s => {
            this.showManualBtns(false);
        });
        correct.addFinishAction();
        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addAction((s, result, resolve, reject) => {
            this.showResult(false).then(s => {
                resolve('');
            });
        });
        wrong.addSubtitleAction(this.subtitle, () => `No! ${this.getUserName()}. You must be kidding.\nThink twice before you act out.`, true);
        wrong.addSubtitleAction(this.subtitle, () => `Let me give you another try.`, true);
        // wrong.addAction(s=>{
        //     this.resetProgress();
        //     this.hideResult();
        // });
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }
    initStNewspaper1() {
        let index = 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s => {
            this.showManualBtns(true);
        });
        state.addSubtitleAction(this.subtitle, 'And, what about this? How do you feel?', false);
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);
        correct.addAction((s, result, resolve, reject) => {
            this.showResult(true).then(s => {
                resolve('');
            });
        });
        correct.addSubtitleAction(this.subtitle, () => `Of course, ${this.getUserName()}. How stupid it is to fight against the experiment!`, true);
        correct.addAction(s => {
            this.setCenterTextPaper('65537', '😀');
        });
        correct.addAction(s => {
            this.hideResult();
        });
        correct.addSubtitleAction(this.subtitle, () => `It's easy, right?`, false);
        correct.addAction(s => {
            this.setCenterTextPaper('65537', '😎');
        });
        correct.addAction(s => {
            this.showManualBtns(false);
        });
        correct.addSubtitleAction(this.subtitle, "But what you have just played with is old-stuff,\n and we don't like clicking around.", false);
        correct.addAction(s => {
            this.showCam(true);
        });
        correct.addAction(s => {
            this.setCenterTextPaper('65537', '🤗');
        });
        correct.addSubtitleAction(this.subtitle, "With the help of THIS,\n we can make your life even easier.", false);
        correct.addFinishAction();
        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addAction((s, result, resolve, reject) => {
            this.showResult(false).then(s => {
                resolve('');
            });
        });
        wrong.addSubtitleAction(this.subtitle, () => `${this.getUserName()}, it's fun. I know.\n Playing with the experiment is always fun, \nbut please behave yourself.`, true);
        wrong.addSubtitleAction(this.subtitle, () => `Could you try it again for me?`, true);
        wrong.addEventAction(Fsm.SECODN_CHANCE);
    }
    initStNewspaper6() {
        let index = 6;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s => {
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '🤑');
        });
        end.addSubtitleAction(this.subtitle, `No worries. Food price is fine.\nWe made it up.`, true);
        end.addAction(s => {
            this.setCenterTextPaper('65537', '🧐');
        });
        end.addSubtitleAction(this.subtitle, `Shortage is impossible to occur after the experiments were invented,\nand we just want to confirm you've get accustomed to our experiment`, true);
        end.addAction(s => {
            this.setCenterTextPaper('65537', '😍');
        });
        end.addSubtitleAction(this.subtitle, () => `But I think someone as smart as ${this.getUserName()} must have realized the trick already`, true);
        end.addAction(s => {
            this.setCenterTextPaper('65537', '😀');
        });
        end.addSubtitleAction(this.subtitle, `Anyway, the exercise has finished.\nLet's come to a real trial.`, true);
        end.addDelayAction(this, 1000);
        end.addAction(s => {
            this.getController().gotoNextScene();
        });
        end.addFinishAction();
    }
}
/// <reference path="scene-2.ts" />
class Scene2L2 extends Scene2 {
    constructor() {
        super('Scene2L2');
        this.hasLastNeg = false;
    }
    get npNums() {
        return [11, 14, 12, 15, 13, 16, 17];
        // return [17];
        // return [11];
        //return [17];
    }
    create() {
        super.create();
        this.initGamePlayFsm();
        this.initNewspaperFsm();
    }
    initGamePlayFsm() {
        this.initStGamePlayDefault();
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
    }
    initNewspaperFsm() {
        this.initStNewspaperDefault();
        for (let i = 0; i < this.npNums.length; i++) {
            this.initStNewspaperWithIndex(i);
        }
        this.appendLastStateEnding();
        this.updateObjects.push(this.newspaperFsm);
    }
    getGamePlayFsmData() {
        return normal_2_2;
    }
    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }
    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            this.showPaper(true);
            // this.setCenterTextPaper('65536 Sucks', '😀')
            this.newspaperFsm.start();
        });
    }
    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();
        state.addAction(s => {
            this.setCenterTextPaper('65537', '😀');
        });
        state.addSubtitleAction(this.subtitle, () => `${this.getUserName()}, I hope you had some fun in our tutorial level.`, false);
        state.addAction(s => {
            this.setCenterTextPaper('65537', '🥺');
            this.showHp(true);
        });
        state.addSubtitleAction(this.subtitle, () => `From now on, it's no longer exercise.\nFailed twice, you'll be kicked out of the experiment without mercy.`, false, null, null, 2000);
        state.addAction(s => {
            this.setCenterTextPaper('65537', '🤗');
        });
        state.addSubtitleAction(this.subtitle, `Take care.`, false);
        state.addAction(s => {
            this.showCam(true);
        });
        state.addFinishAction();
    }
    // this is just to append the ending logic to the last newspaper
    appendLastStateEnding() {
        let index = this.npNums.length - 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s => {
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '🤩');
        });
        end.addSubtitleAction(this.subtitle, () => `Congratulations! You've passed the first batch of trial.`, true);
        end.addAction(s => {
            this.setCenterTextPaper('65537', '👉');
        });
        end.addSubtitleAction(this.subtitle, () => `Let's keep the spirit!`, true, null, null, 1500);
        end.addAction(s => {
            this.getController().gotoNextScene();
        });
    }
    emotionAnalyzeFinished(res) {
        if (this.currIndex == this.npNums.length - 1) {
            if (res.emotion == MyEmotion.Positive
                && res.intensity > 0.9) {
                this.updateIndicatorMeterBtnByPercentage(0, false);
                this.canRecieveEmotion = false;
                this.needFreezeIndicatorMeterBtn = true;
                this.topProgress.value += 0.25;
                this.refreshEmojiProgressBarCss();
                let p = Promise.resolve();
                console.log('toppr' + this.topProgress.value);
                if (this.topProgress.value < 0.3) {
                    p = p.then(s => {
                        return this.subtitle.loadAndSay(this.subtitle, "I'm sorry? What's so funny?!", true);
                    }).then(s => {
                        return this.subtitle.loadAndSay(this.subtitle, "Be a decent citizen! This is not fun at all!", true);
                    });
                }
                else if (this.topProgress.value < 0.55) {
                    p = p.then(s => {
                        return this.subtitle.loadAndSay(this.subtitle, "You still think this is fun?!\nWe are conducting an experiment!", true);
                    });
                }
                else if (this.topProgress.value < 0.80) {
                    p = p.then(s => {
                        return this.subtitle.loadAndSay(this.subtitle, "Don't be rude. I cannot save you this time if you keep playing with the system.\n", true);
                    });
                }
                else {
                    p = p.then(s => {
                        return this.subtitle.loadAndSay(this.subtitle, "Well, if this is what you ask for,\n then I have no problem with it", true);
                    });
                }
                p.catch(s => { console.log('subtitle show end with some err'); })
                    .finally(() => {
                    if (this.topProgress.value < 1) {
                        this.canRecieveEmotion = true;
                        this.needFreezeIndicatorMeterBtn = false;
                    }
                });
            }
            if (!this.hasLastNeg && this.bottomProgress.value >= 0.5) {
                this.hasLastNeg = true;
                this.canRecieveEmotion = false;
                this.needFreezeIndicatorMeterBtn = true;
                this.refreshEmojiProgressBarCss();
                this.subtitle.loadAndSay(this.subtitle, "Are you trying to bury your laugh in your distorted face?", true)
                    .then(s => {
                    return this.subtitle.loadAndSay(this.subtitle, "You can't trick me. I know you are laughing secretly", true);
                })
                    .catch(s => { console.log('subtitle show end with some err'); })
                    .finally(() => {
                    this.canRecieveEmotion = true;
                    this.needFreezeIndicatorMeterBtn = false;
                });
            }
        }
    }
    resetNewspaperParameter() {
        super.resetNewspaperParameter();
        this.hasLastNeg = false;
    }
}
/// <reference path="scene-2.ts" />
class Scene2L3 extends Scene2 {
    constructor() {
        super('Scene2L3');
        // basicNums = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
        this.basicNums = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
        // basicNums = [33, 34];
        this.randomNums = [];
    }
    get npNums() {
        // return [11, 14, 12, 15, 13, 16, 17];
        // return [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
        // return [26, 27, 28, 29, 30, 31, 32, 33, 34];
        if (!this.randomNums || this.randomNums.length == 0) {
            this.randomNums = [...this.basicNums];
            for (let i = LOOP_BEGIN_NUM; i <= LOOP_BEGIN_NUM + 4; i++) {
                // for(let i = LOOP_BEGIN_NUM; i <= LOOP_END_NUM; i++) {
                this.randomNums.push(i);
            }
        }
        return this.randomNums;
    }
    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            bgm_1: ["assets/audio/ending-ver1-country.mp3", 'endingBgm1'],
            bgm_2: ["assets/audio/ending-ver2-tropical-house.mp3", 'endingBgm2']
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }
    create() {
        this.isExercise = true;
        super.create();
        this.initGamePlayFsm();
        this.initNewspaperFsm();
    }
    initBindingCss() {
        super.initBindingCss();
        this.showPropFrame(true);
    }
    initGamePlayFsm() {
        this.initStGamePlayDefault();
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
    }
    initNewspaperFsm() {
        this.initStNewspaperDefault();
        for (let i = 0; i < this.npNums.length; i++) {
            this.initStNewspaperWithIndex(i);
        }
        this.initStNytFirstTime();
        // this.initStNytSecondTime();
        this.initStSeeNoEvilUpgrade();
        this.initStLessCleaningTimeUpgrade();
        this.initStAlwaysWrong();
        this.initStAutoLabel();
        this.initStAutoExpression();
        this.appendLastStateEnding();
        this.updateObjects.push(this.newspaperFsm);
    }
    getProgressBarDenominator() {
        return this.basicNums.length + 5;
    }
    getGamePlayFsmData() {
        return normal_2_3;
    }
    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();
        state.addAction((s, res, resolve, reject) => {
            NewsDataManager.getInstance().loadRss(
            // success
            (rssItems) => {
                resolve('suc');
                // deep copy
                this.rssItems = [...rssItems];
            }, 
            // fail
            () => {
                reject('failed to load rss');
            });
        });
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }
    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            this.showPaper(true);
            this.newspaperFsm.start();
        });
    }
    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();
        state.addAction(s => {
            this.setCenterTextPaper('65537', '😀');
        });
        state.addSubtitleAction(this.subtitle, () => `${this.getUserName()}, you have got the hang of it so quickly.`, false);
        state.addAction(s => {
            this.setCenterTextPaper('65537', '😚');
        });
        state.addSubtitleAction(this.subtitle, () => `Just to let you know, please read the clues carefully.\n Don't make random judgements.`, false);
        state.addAction(s => {
            this.showCam(true);
        });
        state.addFinishAction();
    }
    initStNytFirstTime() {
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
    }
    initStNytSecondTime() {
        let index = 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        state.addOnEnter(s => {
            this.showExpressionPrompt(true);
        });
        state.addOnExit(s => {
            this.showExpressionPrompt(false);
        });
    }
    initStSeeNoEvilUpgrade() {
        let index = this.getIndexFromNum(26);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s => {
            this.showPropButtonWithType(true, NewspaperPropType.SeeNoEvil);
        });
    }
    initStLessCleaningTimeUpgrade() {
        let index = this.getIndexFromNum(28);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s => {
            // This is just for test
            // Normally speaking, we should have it activated already
            if (!this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
                this.showPropButtonWithType(true, NewspaperPropType.SeeNoEvil);
            }
            this.showPropButtonWithType(true, NewspaperPropType.LessCleaningTime);
        });
    }
    initStAlwaysWrong() {
        let index = this.getIndexFromNum(ALWAYS_WRONG_NUM);
        let item = this.getNewsItemByIndex(index);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addOnEnter(s => {
        });
        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addOnEnter(s => {
            if (this.lastMaxedEmojion == MyEmotion.Negative) {
                item.answer = 1;
            }
            else {
                item.answer = 0;
            }
        });
        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addAction((s) => {
            this.showPropButtonWithType(true, NewspaperPropType.Prompt);
            this.updatePropStatus();
        });
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addOnEnter(s => {
        });
    }
    initStAutoLabel() {
        let index = this.getIndexFromNum(AUTO_LABEL_NUM);
        let state = this.newspaperFsm.getStateByIndex(index);
        let purged = this.newspaperFsm.getPurgedStateByIndex(index);
        purged.addOnEnter(s => {
            $('#newspaper-toolbox-stamps').css('pointer-events', 'none');
        });
        purged.addAction(s => {
            this.showPropButtonWithType(true, NewspaperPropType.AutoLabel);
            this.updatePropStatus();
        });
        purged.addAction((s, re, resolve, reject) => {
            this.autoDragLabels().then(s => {
                resolve('dragFinished');
                this.checkIfLabelsCorrect();
            });
        });
    }
    initStAutoExpression() {
        let index = this.getIndexFromNum(AUTO_EXPRESSION_NUM);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s => {
            this.canRecieveEmotion = false;
            this.showConfirmButons(true);
        });
    }
    onConfirmAutoExpressionClick(yes) {
        FmodManager.getInstance().playOneShot('65537_ConfirmEmoji');
        // if(!yes) {
        $(`#confirm-button-no span`).text("Yes, that's exactly what I need");
        // }
        this.inFinalAutoMode = true;
        let rt = this.add.tween({
            targets: [this.dwitterBKG.inner],
            rotation: '+=' + -Math.PI * 2,
            duration: 260000,
            loop: -1,
        });
        // $('html').css('filter', 'grayscale(100%)');
        $('#confirm-button-root').css('pointer-events', 'none');
        setTimeout(() => {
            if (yes) {
                this.playAsBgm(this.endingBgm2);
            }
            else {
                this.playAsBgm(this.endingBgm1);
            }
        }, 500);
        let confirmText = 'Thank you for your cooperation!';
        this.subtitle.loadAndSay(this.subtitle, confirmText, true, 2500, 2500, 1000).finally(() => {
            this.showPropButtonWithType(true, NewspaperPropType.AutoEmotion);
            this.canRecieveEmotion = true;
            this.showConfirmButons(false);
        });
    }
    // this is just to append the ending logic to the last newspaper
    appendLastStateEnding() {
        let index = this.npNums.length - 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s => {
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '🤩');
        });
        end.addSubtitleAction(this.subtitle, () => `This is the end of the demo,\n thank you for playtesting!`, false);
    }
}
/// <reference path="scene-2.ts" />
class Scene2LPaper extends Scene2 {
    constructor() {
        super('Scene2LPaper');
        this.beginCheckifBgmLoaded = false;
        this.dynaWith = 650;
        this.naomiPaperWidth = 650;
        this.finalWidth = 450;
    }
    get npNums() {
        return [2001];
    }
    create() {
        super.create();
        this.initGamePlayFsm();
        this.initNewspaperFsm();
        this.fullTime = 15;
        this.initNaomiPaperCss();
        this.onlyShowPositive = true;
    }
    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            paper_bgm: ["assets/audio/65536_BGM.mp3", 'paperBgm'],
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }
    update(time, dt) {
        super.update(time, dt);
        if (this.beginCheckifBgmLoaded) {
            if (this.paperBgm && !this.paperBgm.isPlaying) {
                this.beginCheckifBgmLoaded = false;
                this.playAsBgm(this.paperBgm);
            }
        }
    }
    getInnerFrameWith() {
        return this.dynaWith;
    }
    initScrollListener() {
        $('#newspaper-inner-frame').on('scroll', function () {
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 20) {
                alert('end reached end reached end reached end reached');
            }
        });
    }
    initNaomiPaperCss() {
        let innerFrame = $('#newspaper-inner-frame');
        innerFrame.css('overflow-y', 'scroll');
        innerFrame.css('width', '650px');
        innerFrame.css('height', '60vh');
        innerFrame.css('background-color', 'white');
        innerFrame.css('border-width', '0px');
        let title = $('#newspaper-title');
        title.css('margin', '5px');
        let content = $('newspaper-content');
        content.css('margin-top', '20px');
    }
    restoreToNormalPaperCss() {
        let innerFrame = $('#newspaper-inner-frame');
        innerFrame.css('width', '450px');
        innerFrame.css('height', 'auto');
        innerFrame.css('overflow-y', 'hidden');
    }
    initGamePlayFsm() {
        this.initStGamePlayDefault();
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);
    }
    initNewspaperFsm() {
        this.initStNewspaperDefault();
        for (let i = 0; i < this.npNums.length; i++) {
            this.initStNewspaperWithIndex(i);
        }
        this.initStOnlyOne();
        this.appendLastStateEnding();
        this.updateObjects.push(this.newspaperFsm);
    }
    initStOnlyOne() {
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        state.addAction(s => {
            this.canRecieveEmotion = false;
        });
    }
    getGamePlayFsmData() {
        return normal_2_paper;
    }
    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }
    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s => {
            setTimeout(() => {
                this.beginCheckifBgmLoaded = true;
            }, 1500);
            this.showPaper(true);
            // this.setCenterTextPaper('65536 Sucks', '😀')
            this.newspaperFsm.start();
        });
    }
    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();
        state.addOnEnter(s => {
            $('#newspaper-inner-frame').on('scroll', () => {
                let ele = $('#newspaper-inner-frame');
                if (ele.scrollTop() + ele.innerHeight() >= ele[0].scrollHeight - 20) {
                    if (!this.isCamShown) {
                        this.showCam(true);
                        this.canRecieveEmotion = true;
                    }
                }
            });
        });
        state.addFinishAction();
    }
    // this is just to append the ending logic to the last newspaper
    appendLastStateEnding() {
        let index = this.npNums.length - 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s => {
            this.restoreToNormalPaperCss();
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('Subject Satisfaction', '100%');
        });
        end.addSubtitleAction(this.subtitle, () => `Subject:`, true);
        end.addSubtitleAction(this.subtitle, () => `${this.getUserName()}`, true);
        end.addSubtitleAction(this.subtitle, () => `Satisfaction:`, true);
        end.addSubtitleAction(this.subtitle, () => `100%`, true);
        end.addAction(s => {
            this.setCenterTextPaper('65537', '👉');
        });
        end.addSubtitleAction(this.subtitle, () => `Transferred to the final test.`, true, null, null, 1500);
        end.addAction(s => {
            this.getController().gotoNextScene();
        });
    }
    createDwitters(parentContainer) {
        // super.createDwitters(parentContainer);
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRadialBKG(this, parentContainer, 0, 0, 2400, 1400, true);
        this.dwitterBKG.changeTo(1);
    }
    resetNewspaperParameter() {
        super.resetNewspaperParameter();
    }
}
/// <reference path="scenes/scene-base.ts" />
/// <reference path="scenes/scene-1-0.ts" />
/// <reference path="scenes/scene-1-1.ts" />
/// <reference path="scenes/scene-1-2.ts" />
/// <reference path="scenes/scene-1-3.ts" />
/// <reference path="scenes/scene-1-4.ts" />
/// <reference path="scenes/scene-1-paper.ts" />
/// <reference path="scenes/scene-controller.ts" />
/// <reference path="scenes/scene-2-0.ts" />
/// <reference path="scenes/scene-2-1.ts" />
/// <reference path="scenes/scene-2-2.ts" />
/// <reference path="scenes/scene-2-3.ts" />
/// <reference path="scenes/scene-2-paper.ts" />
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
    defaultMyHealth: 10,
    defaultEnemyHealth: 3,
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
};
var phaserConfig = {
    // type: Phaser.WEBGL,
    type: Phaser.CANVAS,
    // backgroundColor: '#FFFFFF',
    backgroundColor: '#EEEEEE',
    // backgroundColor: '#E4E4E4',
    scale: {
        // mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        // autoCenter: Phaser.Scale.CENTER_VERTICALLY,
        parent: 'phaser-main',
        width: 8000,
        // width: 1200,
        height: 1200,
        minWidth: 1200
    },
    canvasStyle: "vertical-align: middle;",
    scene: [Controller, Scene1L0, BaseScene, Scene1L4, Scene1L3, Scene1L2, Scene1L1, Scene1LPaper,
        Scene2L0, Scene2L1, Scene2L2, Scene2L3, Scene2LPaper]
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
    sc1() {
        return this.scene;
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
var Dir;
(function (Dir) {
    Dir[Dir["Left"] = 0] = "Left";
    Dir[Dir["Right"] = 1] = "Right";
    Dir[Dir["Bottom"] = 2] = "Bottom";
    Dir[Dir["Top"] = 3] = "Top";
})(Dir || (Dir = {}));
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
    ErrorInputCode[ErrorInputCode["SensitiveCantDamage"] = 8] = "SensitiveCantDamage";
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
    clear() {
        this.listeners = [];
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
function getLogicHeight() {
    return phaserConfig.scale.height;
}
function myResize(gm) {
    // console.log('width: ' + window.innerWidth);
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    var canvas = document.querySelector("canvas");
    if (windowR > scaleR) {
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    else {
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerWidth / scaleR + "px";
    }
    gm.scale.resize(getLogicWidth(), phaserConfig.scale.height);
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
    // test_api2();
    // test();
    leaderboardAdd();
}
function leaderboardAdd() {
    let name = $('#arg1').val().trim();
    let score = $('#arg2').val().trim();
    let sendMsg = JSON.stringify({ 'name': name, 'score': score });
    console.log("hahahaha");
    console.log("sendmsg:" + sendMsg);
    $.ajax({
        //几个参数需要注意一下
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api/leaderboard",
        data: sendMsg,
        success: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)               
        },
        error: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)                    
        }
    });
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
    test_api2();
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
function parseUrl(url) {
    var result = {};
    let spR = url.split("?");
    if (url.split("?").length <= 1)
        return result;
    var query = url.split("?")[1];
    var queryArr = query.split("&");
    queryArr.forEach(function (item) {
        var value = item.split("=")[1];
        var key = item.split("=")[0];
        result[key] = value;
    });
    return result;
}
function myNum(val) {
    let ab = Math.ceil(Math.abs(val));
    let sign = "" + (val < 0 ? '-' : '');
    let body = "" + ab;
    if (ab > 10000000) {
        body = Math.ceil(ab / 1000000) + ' M';
    }
    else if (ab >= 10000)
        body = Math.ceil(ab / 1000) + ' K';
    else
        body = ab + "";
    return sign + body;
}
function getUrlParams() {
    let path = window.location.href;
    let params = parseUrl(path);
    return params;
}
function getCurrentLevelRaw() {
    let params = getUrlParams();
    let index = 0;
    let ret = params['level'];
    if (!ret) {
        return '1-0';
    }
    if (ret.split('-').length < 2) {
        ret = '1-' + ret;
    }
    return ret;
}
/**
 * If 'Paper' return -1,
 * otherwise, return the given number
 */
function getCurLevelIndex() {
    let rawLevel = getCurrentLevelRaw();
    let splits = rawLevel.split('-');
    if (splits[1] == 'Paper') {
        return -1;
    }
    let index = 0;
    let smalllvl = splits[1];
    if (smalllvl != null) {
        index = parseInt(smalllvl);
    }
    return index;
}
function isEconomicSpecialEdition() {
    let params = getUrlParams();
    let index = 1;
    if (params['eco'] != null) {
        return true;
    }
    return false;
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
function apiPromise(api, inputData, dtType, type) {
    if (notSet(dtType)) {
        dtType = "json";
    }
    if (notSet(type)) {
        type = "Post";
    }
    let pm = new Promise((resolve, reject) => {
        $.ajax({
            type: type,
            dataType: dtType,
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
    return pm;
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
function apiTextToSpeech(inputText, identifier, voiceType) {
    let dataOb = { input: inputText, id: identifier, api: 1, voiceType: voiceType };
    let dataStr = JSON.stringify(dataOb);
    return apiPromise("api_speech", dataStr);
}
// return the data directly instead of returning the path
function apiTextToSpeech2(inputText, identifier, voiceType) {
    return new Promise((resolve, reject) => {
        let dataOb = { input: inputText, id: identifier, api: 2, voiceType: voiceType };
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
        // console.log('update object found null');
        return;
    }
    for (let key in from) {
        to[key] = from[key];
    }
}
function setCookie(key, value) {
    $.cookie(key, value);
}
function getCookie(key) {
    return $.cookie(key);
}
function getUserName() {
    return getCookie('name');
}
function deleteAllCookie() {
    console.log('delete all cookies');
    var cookies = $.cookie();
    for (var cookie in cookies) {
        // Important cookies such as important_memobird_device is saved when restart
        if (cookie.startsWith('important')) {
            continue;
        }
        $.removeCookie(cookie);
    }
}
function anchorToRight(toRight, ob) {
    ob.x = getLogicWidth() - toRight;
    window.addEventListener('resize', (event) => {
        ob.x = getLogicWidth() - toRight;
    }, false);
}
var canvasIndex = 0;
/**
 * The current Dwitter only uses Canvas context to draw things \
 * This is because for some heavy-performance task, webgl is extremely laggy
 */
class Dwitter extends Wrapper {
    constructor(scene, parentContainer, x, y, width, height, useImage = true) {
        super(scene, parentContainer, x, y, null);
        // frame: number;
        this.lastInnerTime = -1;
        this.isRunning1 = true;
        this.isRunning2 = false;
        this.toIndex = 0;
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
        // this.frame = 0;
        this.lastInnerTime = 0;
        // Push to the scene's update array
        this.scene.updateObjects.push(this);
    }
    next() {
        // this.frame += 60;
        // let innerTime = this.frame / 60;        
        //this.lastInnerTime = innerTime;
        this.lastInnerTime += 1;
        this.u(this.lastInnerTime, this.c, this.x);
    }
    toAutoRunMode() {
        this.isRunning1 = true;
    }
    nextWithColorChange() {
        let typeCount = 4;
        let colorIndex = Math.floor(this.lastInnerTime) % typeCount;
        let colorAr = [0.03, 0.10, 0.08, 0.12];
        // onsole.log(this.lastT + "  " + colorIndex);
        this.inner.alpha = colorAr[colorIndex];
        this.next();
    }
    toStaticMode() {
        this.isRunning1 = false;
    }
    get needRunning() {
        return this.isRunning1 || this.isRunning2;
    }
    update(time, dt) {
        if (!this.needRunning)
            return;
        if (this.inner.alpha == 0)
            return;
        // this.frame++;
        // let innerTime = this.frame / 60;
        // if(innerTime === this.lastInnerTime) {           
        //     return;
        // } 
        // this.lastInnerTime = innerTime;       
        this.lastInnerTime += dt / 1000;
        this.u(this.lastInnerTime, this.c, this.x);
    }
    u(t, c, x) {
    }
    setOrigin(xOri, yOri) {
        if (this.useImage) {
            this.wrappedObject.setOrigin(xOri, yOri);
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }
    }
    changeTo(idx) {
        this.toIndex = idx;
        this.next();
    }
}
/**
 * Round Center
 */
class DwitterCenterCircle extends Dwitter {
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
/**
 * Rect bkg
 */
class DwitterRectBKG extends Dwitter {
    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.03;
    }
    u(t, c, x) {
        let k = 0;
        let i = 0;
        c.width |= k = i = this.width / 2;
        t /= 4;
        for (; i--; x.strokeRect(k - i, this.height / 2 - i, i * 2, i * 2))
            x.setLineDash([t + k / i & 1 ? i / 5 : i]);
        x.stroke();
    }
}
class DwitterHoriaontalRect extends Dwitter {
    u(t, c, x) {
        t /= 2;
        let w = 8;
        let i = 0;
        for (c.width |= i = 0; i++ < 20;) {
            for (let j = 10; j--;) {
                let z = (j + 2) / 2;
                let xOffset = i * 100 + ((i - 10) * j * 30) - S(t / 3) * 500 * z;
                let alpha = (0.5 - Math.abs(xOffset / this.width - 0.5)) * 1;
                let cA = clamp(alpha, 0, 1);
                x.globalAlpha = Math.pow(Math.sin(cA * Math.PI / 2), 1 / 1.5);
                x.fillRect(xOffset, j * 20 + 750 + S(t * 2 - i + j / 2) * 50, 8 * z, 8 * z);
            }
        }
    }
}
/**
 * Radial from center
 */
class DwitterRadialBKG extends Dwitter {
    constructor() {
        super(...arguments);
        this.freq = 5; // frequency
        this.phase = 5; // initial phase
    }
    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.03;
        this.param1 = 25;
        this.needStopOnFirstShow = false;
    }
    toAutoRunMode() {
        super.toAutoRunMode();
        this.param1 = 200;
    }
    toStaticMode() {
        super.toStaticMode();
        this.param1 = 25;
    }
    u(t, c, x) {
        if (this.needStopOnFirstShow) {
            this.needStopOnFirstShow = false;
            this.isRunning1 = false;
        }
        if (this.toIndex == 0) {
            let a = 0;
            c.width |= 0;
            for (let i = 1e3; i--;) {
                x.arc(this.width / 2, this.height / 2, i ^ (t * this.param1 % 600), i / 100, i / 100 + .03);
                x.stroke();
                x.beginPath(x.lineWidth = 70);
            }
        }
        else {
            let i = 0;
            let j = 0;
            let r = 0;
            let a = 0;
            for (c.width |= j = 21, x.scale(5, 5), x.lineJoin = "round"; j--;)
                for (i = 26; i--;)
                    x.arc(this.width / 10, this.height / 10, Math.pow(1.3, (r = j + i % 2 + t % 2)), a = (i + j) % 24 / 3.8197 + C(r) / 2, a);
            x.stroke();
        }
        // else {            
        //     let i = 0;
        //     let j = 0;
        //     for(c.width|=i=50,S=Math.sin;i--;)for(j=50;j--;)x.arc(this.width / 2,this.height / 2,200*(S(t)/2+2)*(S(i)+1),(t%2)+j,(S(t)+1)*i+j);x.stroke()            
        // }
    }
}
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Text"] = 0] = "Text";
    EnemyType[EnemyType["TextWithImage"] = 1] = "TextWithImage";
    EnemyType[EnemyType["Image"] = 2] = "Image";
})(EnemyType || (EnemyType = {}));
var ClickerType;
(function (ClickerType) {
    ClickerType[ClickerType["None"] = 0] = "None";
    ClickerType[ClickerType["Normal"] = 1] = "Normal";
    ClickerType[ClickerType["Bad"] = 2] = "Bad";
    ClickerType[ClickerType["BadFromNormal"] = 3] = "BadFromNormal";
})(ClickerType || (ClickerType = {}));
class Enemy {
    constructor(scene, enemyManager, posi, lblStyle, config) {
        this.clickerType = ClickerType.None;
        this.centerRadius = 125;
        this.damagedHistory = []; //store only valid input history
        this.oriTimeScale = 1;
        this.freezeCounter = 0;
        this.inStop = false;
        this.hasBeenDamagedByTurn = false;
        this.lastAutoBadge = -1000;
        this.autoBadgeIndex = 0;
        this.lastAutoTurn = -1000;
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.inner;
        this.lbl = config.label;
        this.health = config.health;
        this.maxHealth = config.health;
        this.clickerType = config.clickerType;
        this.lblStyle = lblStyle;
        this.initPosi = posi;
        this.config = config;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.dest = new Phaser.Geom.Point(0, 0);
        this.initContent();
    }
    isSensative() {
        return this.clickerType == ClickerType.Bad || this.clickerType == ClickerType.BadFromNormal;
    }
    initContent() {
        // init in inheritance
    }
    update(time, dt) {
        // if(this.enemyManager.isPaused) {
        //     // in most cases, freeze is called outside when a freeze is needed
        //     // but due to some timing sequence problem, it might be that a spawn happened right after
        //     // a previous freeze event.
        //     // Hence, we added a double check here
        //     this.freeze();
        //     return;
        // }
        this.checkIfReachEnd();
        this.checkIfNeedShowAutoBadBadge(time, dt);
        this.checkIfNeedAutoTurn(time, dt);
        // if(this.healthIndicator)        
        //     this.healthIndicator.update(time, dt);
        // this.updateHealthBarDisplay();
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
            duration: tweenDuration
        });
        // console.log('startrun');
        let fadeInTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
                duration: 500
            },
        });
    }
    /**
     * freeze and unFreeze are changed to use the timeScale
     * because if a freeze is invoked right after the startRun,
     * the unfreeze will have no effect. (occurred scene-1-4)
     */
    freeze() {
        // console.log('freeze');
        this.freezeCounter++;
        if (this.freezeCounter == 1) {
            this.freezeInner();
        }
    }
    unFreeze() {
        this.freezeCounter--;
        if (this.freezeCounter == 0) {
            this.unFreezeInner();
        }
    }
    freezeInner() {
        // console.log('freezeInner');
        if (this.mvTween) {
            this.oriTimeScale = this.mvTween.timeScale;
            this.mvTween.timeScale = 0;
            // this.mvTween.pause();
        }
    }
    unFreezeInner() {
        if (this.mvTween) {
            this.mvTween.timeScale = this.oriTimeScale;
            // this.mvTween.resume();
        }
    }
    stopRunAndDestroySelf() {
        let thisEnemy = this;
        thisEnemy.enemyManager.removeEnemy(thisEnemy);
        this.inStop = true;
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.dispose();
            }
        });
    }
    dispose() {
        this.inner.destroy();
    }
    getRealHealthDamage(item) {
        if (item.damage)
            return item.damage;
        let val = item.value;
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
    damageFromSimResult(item, input) {
        let val = item.value;
        let ret = {
            damage: 0,
            code: this.checkIfInputLegalWithEnemy(input, this.lbl)
        };
        // Found error
        if (ret.code != ErrorInputCode.NoError) {
            return ret;
        }
        // Zero damage
        ret.damage = this.getRealHealthDamage(item);
        if (ret.damage == 0) {
            return ret;
        }
        // Damaged by thie same input word before
        if (!gameplayConfig.allowDamageBySameWord
            && this.checkIfDamagedByThisWordBefore(input)
            && !isReservedKeyword(input)) {
            ret.code = ErrorInputCode.DamagedBefore;
            return ret;
        }
        // Update history
        // We have to history need to update: the enemy's damage history
        // and the manager's omni history
        this.damagedHistory.push(input);
        this.updateOmniDamageHistory(input);
        // console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);
        // Handle health
        this.damageInner(ret.damage, input, true);
        return ret;
    }
    damageInner(dmg, input, fromPlayer) {
        this.health -= dmg;
        this.health = Math.max(0, this.health);
        this.checkIfNeedChangeAlphaByTurn(input);
        if (fromPlayer)
            this.checkIfNeedShowWidget(dmg, input);
        // Health indicator not used any more
        // if(this.healthIndicator)
        //     this.healthIndicator.damagedTo(this.health);
        this.updateHealthBarDisplay();
        if (this.health <= 0) {
            this.eliminated(input);
        }
        else {
            let sc = this.scene;
            if (sc.needFeedback)
                this.playHurtAnimation();
        }
    }
    checkIfNeedChangeAlphaByTurn(input) {
        if (this.hasBeenDamagedByTurn || isReservedTurnKeyword(input)) {
            this.hasBeenDamagedByTurn = true;
            this.updateAlphaByHealth();
        }
    }
    updateAlphaByHealth() {
        this.getMainTransform().alpha = this.health / this.maxHealth;
    }
    checkIfNeedShowWidget(dmg, input) {
        if (dmg > 0 && this.isSensative())
            this.showBadgeEffect();
        else if (dmg > 0 && !this.isSensative() && isReservedTurnKeyword(input)) {
            this.showTurnEffect(true);
        }
    }
    updateHealthBarDisplay() {
        if (this.hpBar) {
            this.hpBar.updateDisplay(this.health, this.maxHealth);
        }
    }
    playHurtAnimation() {
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
    eliminated(damagedBy) {
        this.enemyManager.enemyEliminated(this, damagedBy);
        this.stopRunAndDestroySelf();
    }
    checkIfInputLegalWithEnemy(inputLbl, enemyLbl) {
        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();
        // sensitve can't be damanged by ordinary input
        // if(this.config.isSensitive) {
        //     return ErrorInputCode.SensitiveCantDamage;
        // }
        if (this.config.enemyType == EnemyType.TextWithImage && inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;
        if (this.config.enemyType == EnemyType.TextWithImage && enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }
        if (this.config.enemyType == EnemyType.TextWithImage && inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }
        return ErrorInputCode.NoError;
    }
    disolve() {
        this.stopRunAndDestroySelf();
    }
    startRotate() {
    }
    getMainTransform() {
        return this.inner;
    }
    checkIfNeedShowAutoBadBadge(time, dt) {
        if (!this.isSensative())
            return;
        if (this.scene.isPausedOrDied())
            return;
        if (this.scene.enemyManager.curStrategyID == SpawnStrategyType.ClickerGame) {
            if (time - this.lastAutoBadge > autoBadgeInterval) {
                let avi = [];
                for (let i in badInfos) {
                    if (badInfos[i].consumed) {
                        avi.push(i);
                    }
                }
                if (avi.length == 0)
                    return;
                this.showBadgeEffect(avi[this.autoBadgeIndex % avi.length]);
                this.autoBadgeIndex++;
                this.lastAutoBadge = time;
            }
        }
    }
    checkIfNeedAutoTurn(time, dt) {
        if (this.isSensative())
            return;
        if (this.scene.enemyManager.curStrategyID == SpawnStrategyType.ClickerGame) {
            if (time - this.lastAutoTurn > autoTurnInterval) {
                if (!getAutoTurnInfo().consumed)
                    return;
                this.showTurnEffect(false);
                this.lastAutoTurn = time;
            }
        }
    }
    showTurnEffect(fromPlayer) {
        let mt = this.getMainTransform();
        let posi = MakePoint(this.getMainTransform());
        if (posi.x == 0 && posi.y == 0) {
            return;
        }
        // console.log(posi.x + " " + posi.y);
        // posi.x += this.inner.x;
        // posi.y += this.inner.y;
        posi.x += 70;
        posi.y -= 70;
        let magic;
        if (fromPlayer) {
            magic = this.scene.add.image(posi.x, posi.y, 'magic');
            // let posiAmplitude = 20;
            // let randomOffsetX = Math.random() * posiAmplitude * 2 - posiAmplitude;
            // let randomOffsetY = Math.random() * posiAmplitude * 2 - posiAmplitude;
            // posi.x += randomOffsetX;
            // posi.y += randomOffsetY;
            // magic.setPosition(posi.x, posi.y);
        }
        else {
            if (notSet(this.loopMagic)) {
                this.loopMagic = this.scene.add.image(posi.x, posi.y, 'magic');
            }
            magic = this.loopMagic;
        }
        magic.setOrigin(23 / 49, 81 / 86);
        // this.scene.midContainder.add(magic);
        this.inner.add(magic);
        let scale = 0.8;
        let fromRt = -30 / 180 * Math.PI;
        let toRt = -60 / 180 * Math.PI;
        let rtDt = 250;
        magic.setRotation(fromRt);
        magic.setScale(scale);
        magic.alpha = 1;
        let rt = this.scene.add.tween({
            targets: magic,
            rotation: toRt,
            duration: rtDt,
            yoyo: true,
            ease: 'Sine.easeOut',
        });
        if (fromPlayer) {
            let fadeDelay = 400;
            let fade = this.scene.add.tween({
                targets: magic,
                delay: fadeDelay,
                alpha: 0,
                duration: rtDt * 2 - fadeDelay,
                onComplete: () => {
                    magic.destroy();
                }
            });
        }
    }
    showBadgeEffect(idx) {
        let posi = MakePoint(this.getMainTransform());
        posi.x += this.inner.x;
        posi.y += this.inner.y;
        posi.y += 8;
        if (notSet(idx)) {
            idx = 0;
        }
        let resID = getBadgeResID(idx);
        let badge = this.scene.add.image(0, 0, resID);
        this.scene.midContainder.add(badge);
        // let scaleFrom = 0.8;
        // let scaleTo = 1;
        let overallScale = 0.85;
        let scaleFrom = 1.05 * overallScale;
        let scaleTo = 0.8 * overallScale;
        let dt = 140;
        badge.setScale(scaleFrom);
        let posiAmplitude = 30;
        let randomOffsetX = Math.random() * posiAmplitude * 2 - posiAmplitude;
        let randomOffsetY = Math.random() * posiAmplitude * 2 - posiAmplitude;
        posi.x += randomOffsetX;
        posi.y += randomOffsetY;
        badge.setPosition(posi.x, posi.y);
        let rtAmplitude = 35 / 180 * Math.PI;
        let randomRt = Math.random() * rtAmplitude * 2 - rtAmplitude;
        badge.setRotation(randomRt);
        let tw = this.scene.tweens.add({
            targets: badge,
            //x: '+=1',
            // scale: scaleTo,
            scale: {
                getStart: () => scaleFrom,
                getEnd: () => scaleTo,
                duration: dt
            },
            ease: 'Sine.easeIn'
            // yoyo: true,
            // duration: 600,            
        });
        let delayFade = this.scene.tweens.add({
            targets: badge,
            delay: 250,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                badge.destroy();
            }
        });
    }
}
class EnemyHpBar extends Wrapper {
    constructor(scene, parentContainer, x, y, width, maxHp) {
        super(scene, parentContainer, x, y, null);
        this.frameColor = 0x000000;
        this.bkgColor = 0xffffff;
        this.progressColor = 0x999999;
        this.progressGap = 4;
        this.barHeight = 25;
        this.frameWidth = 4;
        this.outterRadius = 12;
        this.progressOffsetX = 0;
        this.barWidth = width;
        this.maxHp = maxHp;
        this.bkgBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: this.bkgColor,
            fillColor: this.bkgColor,
            width: this.barWidth,
            height: this.barHeight,
            lineWidth: 1,
            originX: 0,
            originY: 0,
            roundRadius: this.outterRadius,
        });
        this.progressBar = new Rect(this.scene, this.inner, 0, this.barHeight / 2, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.barWidth - this.frameWidth,
            height: this.barHeight,
            lineWidth: 1,
            originX: 0,
            originY: 0,
            roundRadius: this.outterRadius,
        });
        this.progressBar.setOrigin(0, 0.5);
        this.progressOffsetX = 2;
        this.progressBar.inner.x = this.progressOffsetX;
        this.frameBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: this.frameColor,
            fillColor: this.frameColor,
            fillAlpha: 0,
            width: this.barWidth,
            height: this.barHeight,
            lineWidth: this.frameWidth,
            originX: 0,
            originY: 0,
            roundRadius: this.outterRadius,
        });
        let style = getDefaultTextStyle();
        style.fontSize = '20px';
        style.fill = '#111111';
        this.centerText = this.scene.add.text(width / 2, this.barHeight / 2, "hp", style);
        this.centerText.setOrigin(0.5, 0.5);
        this.inner.add(this.centerText);
        this.refreshCenterText(this.maxHp, this.maxHp);
    }
    refreshCenterText(curHp, maxHp) {
        let curHpShown = Math.ceil(curHp);
        let maxHpShown = Math.ceil(maxHp);
        this.centerText.text = myNum(curHpShown) + " / " + myNum(maxHpShown);
    }
    /**
     * Called by EnemyBase
     * @param curHp
     * @param maxHp
     */
    updateDisplay(curHp, maxHp) {
        curHp = clamp(curHp, 0, maxHp);
        //this.progressBar.setSize(0);
        // maxHp = 100
        // curHp = 0;
        let useSetSize = false;
        if (useSetSize) {
            let ratio = curHp / maxHp;
            let newWidth = ratio * this.barWidth;
            let threshouldWidth = this.outterRadius * 2;
            if (newWidth < threshouldWidth) {
                this.progressBar.setScale(newWidth / threshouldWidth, Math.pow(newWidth / threshouldWidth, 0.5));
                newWidth = threshouldWidth;
            }
            this.progressBar.setSize(newWidth);
        }
        else {
            let ratioX = curHp / maxHp;
            let ratioY = 1;
            let newWidth = ratioX * this.progressBar.config.width;
            let threshouldWidth = this.outterRadius * 1.8;
            if (newWidth < threshouldWidth) {
                ratioY = Math.pow(newWidth / threshouldWidth, 1);
                // this.progressBar.inner.x = (1 - newWidth / threshouldWidth) * 1 + this.progressOffsetX;
            }
            this.progressBar.setScale(ratioX, ratioY);
        }
        this.refreshCenterText(curHp, maxHp);
    }
}
class EnemyImage extends Enemy {
    constructor(scene, enemyManager, posi, lblStyle, config) {
        super(scene, enemyManager, posi, lblStyle, config);
    }
    getMainTransform() {
        if (this.textAsImage) {
            return this.textAsImage;
        }
        else {
            return this.figure.inner;
        }
    }
    initContent() {
        super.initContent();
        let y = 0;
        this.gap = 15;
        let imgSize = gameplayConfig.drawDataDefaultSize;
        // figure
        let isFakeFigure = this.config.clickerType == ClickerType.Bad;
        this.figure = new QuickDrawFigure(this.scene, this.inner, this.config.image, isFakeFigure);
        // let lb = this.figure.getLeftBottom();
        // let rb = this.figure.getRightBottom();
        let lb = MakePoint2(-imgSize / 2, 0);
        let rb = MakePoint2(imgSize / 2, 0);
        this.lblStyle.fontSize = gameplayConfig.defaultImageTitleSize;
        y += this.gap;
        // title
        if (this.needTitle()) {
            this.text = this.scene.add.text((lb.x + rb.x) / 2, y, this.config.label, this.lblStyle);
            this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;
            this.text.setOrigin(0.5, 0);
            this.inner.add(this.text);
            y += this.text.displayHeight;
            y += 4;
            // legacy health bubble
            let lc = this.text.getLeftCenter();
            lc.x -= gameplayConfig.healthIndicatorWidth / 2;
            lc.x -= 4;
            if (this.healthIndicator)
                this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
        }
        // text404 As Image
        if (this.isSensative()) {
            let textAsImageStyle = getDefaultTextStyle();
            textAsImageStyle.fontSize = '120px';
            textAsImageStyle.fontFamily = gameplayConfig.titleFontFamily;
            let textAsImage = this.scene.add.text(0, 0, "404", textAsImageStyle);
            textAsImage.setOrigin(0.5, 0.5);
            textAsImage.y -= textAsImage.displayHeight / 2;
            this.inner.add(textAsImage);
            this.figure.inner.setVisible(false);
            this.textAsImage = textAsImage;
        }
        //this.figure.inner.setVisible(false);
        let hpBarPosi = MakePoint2(0, 0);
        hpBarPosi.x = lb.x;
        hpBarPosi.y = y;
        if (this.healthIndicator)
            this.healthIndicator.inner.setVisible(false);
        this.hpBar = new EnemyHpBar(this.scene, this.inner, hpBarPosi.x, hpBarPosi.y, rb.x - lb.x, this.maxHealth);
        if (!this.config.needChange) {
            this.figure.stopChange();
        }
        // this.checkIfDontNeedLabel();
        this.checkIfNeedRotate();
        this.checkIfNeedShake();
        this.checkIfNeedFlicker();
    }
    checkIfNeedFlicker() {
        if (!this.config.needFlicker) {
            return;
        }
        this.shakeTween = this.scene.tweens.add({
            targets: this.figure.inner,
            alpha: 0,
            yoyo: true,
            duration: 400,
            repeat: -1
        });
    }
    checkIfNeedShake() {
        if (!this.config.needShake) {
            return;
        }
        this.shakeTween = this.scene.tweens.add({
            targets: this.figure.inner,
            scale: '+1.2',
            yoyo: true,
            duration: 500,
            repeat: -1
        });
    }
    playHurtAnimation() {
        this.hurAnimation = this.scene.tweens.add({
            targets: this.figure.inner,
            x: '+=100',
            yoyo: true,
            duration: 150,
        });
        this.scene.tweens.add({
            targets: this.figure.inner,
            alpha: 0,
            yoyo: true,
            duration: 300,
        });
    }
    needTitle() {
        if (this.isSensative())
            return false;
        if (this.config.enemyType == EnemyType.TextWithImage || this.config.showLabel == true) {
            return true;
        }
        return false;
    }
    checkIfDontNeedLabel() {
        if (this.config.enemyType == EnemyType.TextWithImage || this.config.showLabel == true) {
            return;
        }
        this.text.setVisible(false);
        this.healthIndicator.inner.x = this.text.getBottomCenter().x;
    }
    getStopDistance() {
        return this.centerRadius + gameplayConfig.drawDataDefaultSize / 2 + 10;
    }
    dispose() {
        super.dispose();
        this.figure.dispose();
        this.figure = null;
    }
    checkIfNeedRotate() {
        if (this.config.rotation > 0) {
            this.startRotate();
        }
    }
    startRotate() {
        this.rotateTween = this.scene.tweens.add({
            targets: this.figure.inner,
            angle: '-=360',
            duration: this.config.rotation,
            repeat: -1
        });
        this.text.y += 20;
        this.healthIndicator.inner.y += 20;
    }
}
var gEnemyID = 0;
class EnemyManager {
    constructor(scene, parentContainer) {
        this.accTime = 0;
        /**
         * At first, it's call spawn history,\
         * but later on, I think I should also add the time info
         * about when the enemy is killed for use in the strategy.
         * So, I change the name to omni
         */
        this.omniHistory = [];
        this.enemyReachedCoreEvent = new TypedEvent();
        this.enemyEliminatedEvent = new TypedEvent();
        this.enemySpawnedEvent = new TypedEvent();
        this.strategies = new Map();
        this.isPaused = false;
        this.nextNeedSensitvieOneShot = false;
        this.nextNeedSensitiveAlways = false;
        this.sensetiveDuration = 100000;
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
        this.strategies.set(SpawnStrategyType.RandomFlow, new RandomFlow(this));
        this.strategies.set(SpawnStrategyType.None, new SpawnStrategy(this, SpawnStrategyType.None, {}));
        this.strategies.set(SpawnStrategyType.ClickerGame, new SpawnStrategyClickerGame(this, {}));
    }
    ;
    getNewStrategyByType(type) {
        if (type == SpawnStrategyType.SpawnOnEliminatedAndReachCore) {
            return new SpawnStrategyOnEliminatedAndReachCore(this);
        }
        else if (type == SpawnStrategyType.FlowTheory) {
            return new SpawnStrategyFlowTheory(this);
        }
        else if (type == SpawnStrategyType.RandomFlow) {
            return new RandomFlow(this);
        }
        else if (type == SpawnStrategyType.None) {
            return new SpawnStrategy(this, SpawnStrategyType.None, {});
        }
        else if (type == SpawnStrategyType.ClickerGame) {
            return new SpawnStrategyClickerGame(this, {});
        }
    }
    startSpawnStrategy(strategy, config) {
        this.isPaused = false;
        if (this.curStrategy)
            this.curStrategy.onExit();
        this.curStrategyID = strategy;
        // this.curStrategy = this.strategies.get(strategy);
        this.curStrategy = this.getNewStrategyByType(strategy);
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
        this.accTime = 0;
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
        // return "Hexagon";
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
    setNextNeedSensitiveOneShot(val) {
        this.nextNeedSensitvieOneShot = val;
    }
    setNextNeedSensitiveAlways(val) {
        this.nextNeedSensitiveAlways = val;
    }
    /**
     * This is only for level 1-3 when the 404 logic is not in the SpawnStrategy,
     * but in the hard coded fsm logic instead
     * @param config
     */
    checkIfNextNeeedSensitive(config) {
        if (!this.nextNeedSensitvieOneShot && !this.nextNeedSensitiveAlways) {
            return false;
        }
        this.nextNeedSensitvieOneShot = false;
        // convert to sensitive
        config.label = "!@#$%^&*";
        config.health = 9;
        config.duration = this.sensetiveDuration;
        config.clickerType = ClickerType.Bad;
    }
    spawn(config) {
        if (notSet(config))
            config = {};
        this.checkIfNextNeeedSensitive(config);
        if (notSet(config.enemyType))
            config.enemyType = EnemyType.TextWithImage;
        if (notSet(config.label))
            config.label = this.getNextName();
        if (notSet(config.duration))
            config.duration = gameplayConfig.enemyDuratrion;
        if (notSet(config.health))
            config.health = gameplayConfig.defaultEnemyHealth;
        var name = config.label;
        var figureName = name.split(' ').join('-').toLowerCase();
        if (notSet(config.image))
            config.image = figureName;
        // If forcibly assigned a posi, use it
        // Otherwide, generate a random position
        var posi;
        if (notSet(config.initPosi)) {
            posi = this.getSpawnPoint();
        }
        else {
            posi = config.initPosi;
        }
        var tm = getGame().getTime();
        var id = gEnemyID++;
        this.insertSpawnHistory(id, posi, name, tm);
        // var enemy = new EnemyText(this.scene, this, posi, this.lblStyl, {
        //     type: EnemyType.Text,
        //     label: name
        // });
        let enemy;
        // by deafult is TextWithImage
        //if(config.type == EnemyType.TextWithImage) {
        enemy = new EnemyImage(this.scene, this, posi, this.lblStyl, config);
        var ei = enemy;
        // }
        enemy.id = id;
        // console.log('-------------------------')
        this.enemies.forEach(item => {
            // console.log("item: " + item.lbl + " " + item.inner.x + " "+ item.inner.y + " "+ item.inner.alpha);
        });
        // console.log(this.enemies.length + "  name:" + name);
        this.enemies.push(enemy);
        enemy.startRun();
        /**
         * freezeAllEnemies can only forward the the freeze signal when the enemy is already in the this.enemies
         * when the current overall status is freeze, we need to set it to be freezed manually for new spawned ones
         */
        if (this.isPaused) {
            enemy.freeze();
        }
        if (this.curStrategy)
            this.curStrategy.enemySpawned(enemy);
        this.enemySpawnedEvent.emit(enemy);
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
        if (!this.isPaused)
            this.accTime += dt * 1000;
        // console.log(time, this.accTime, time - this.accTime);
        // dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        for (let i in this.enemies) {
            this.enemies[i].update(time, dt);
        }
        if (this.curStrategy)
            this.curStrategy.onUpdate(this.accTime, dt);
        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }
    getSpawnPoint() {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = 0;
        let tryTime = 0;
        while (true) {
            tryTime++;
            rdDegree = (Math.random() * 2 - 1) * Math.PI;
            pt.x = Math.cos(rdDegree) * this.spawnRadius;
            pt.y = Math.sin(rdDegree) * this.spawnRadius;
            let notBottom = this.notInBottomZone(rdDegree);
            let valid = this.isValidDegree(rdDegree);
            if (!notBottom)
                continue;
            if (valid)
                break;
            if (tryTime > 100)
                break;
        }
        // console.log(rdDegree);
        return pt;
    }
    notInBottomZone(rdDegree) {
        var subtitleRestrictedAngle = Math.PI / 3 * 2;
        let notInSubtitleZone = !(rdDegree > Math.PI / 2 - subtitleRestrictedAngle / 2 && rdDegree < Math.PI / 2 + subtitleRestrictedAngle / 2);
        return notInSubtitleZone;
    }
    isValidDegree(rdDegree) {
        var threshould = Math.PI / 2;
        let farEnoughFromLastOne = false;
        if (this.omniHistory.length == 0)
            farEnoughFromLastOne = true;
        else {
            var lastOne = this.omniHistory[this.omniHistory.length - 1];
            farEnoughFromLastOne = this.getAngleDiff(lastOne.degree, rdDegree) > threshould;
        }
        farEnoughFromLastOne = true;
        let min = 1000;
        for (let i in this.omniHistory) {
            let iter = this.omniHistory[i];
            if (hasSet(iter.eliminated))
                continue;
            let clamp = this.getAngleDiff(iter.degree, rdDegree);
            if (clamp < min) {
                min = clamp;
            }
        }
        // console.log("min " + min);
        // console.log(min);
        // console.log(this.omniHistory.length);
        let farEnoughFromEvery = min > (Math.PI / 6);
        return farEnoughFromLastOne && farEnoughFromEvery;
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
    isOfflineHandle(inputWord) {
        return isReservedKeyword(inputWord);
    }
    // only send the enemies that need online judge
    sendInputToServer(inputWord) {
        if (notSet(this.enemies) || this.enemies.length == 0)
            return;
        if (this.curStrategy) {
            this.curStrategy.inputSubmitted(inputWord);
        }
        let offline = this.isOfflineHandle(inputWord);
        if (offline) {
            this.sendInputToServerOffline(inputWord);
        }
        else {
            this.sendInputToServerOnline(inputWord);
        }
    }
    sendInputToServerOnline(inputWord) {
        var enemyLabels = [];
        for (let i in this.enemies) {
            var enemy = this.enemies[i];
            // bad words can only hit by badKeywords
            if (enemy.isSensative())
                continue;
            enemyLabels.push(enemy.lbl);
        }
        if (enemyLabels.length == 0) {
            this.handleJudgeResult({
                input: inputWord,
                array: [],
                outputArray: []
            });
        }
        else {
            api3WithTwoParams(inputWord, enemyLabels, 
            // suc
            res => {
                // console.log(res);
                this.handleJudgeResult(res);
            }, 
            // err
            function err(res) {
                // console.log("API3 failed");
            });
        }
    }
    sendInputToServerOffline(inputWord) {
        let fakeResult = {
            input: inputWord,
            array: [],
            outputArray: []
        };
        this.appendOfflineResult(fakeResult);
        this.handleJudgeResult(fakeResult);
    }
    // add the offline judge into the SimResult 
    appendOfflineResult(res) {
        this.handleBad(res);
        this.handleNormal(res);
    }
    handleBad(res) {
        for (let i = 0; i < badInfos.length; i++) {
            let item = badInfos[i];
            if (res.input.toLocaleLowerCase() == item.title.toLocaleLowerCase()) {
                let badWords = this.getBadWords();
                for (let i in badWords) {
                    // The 'value' attribute doens't work here
                    res.outputArray.push({ name: "", value: 1, enemy: badWords[i], damage: item.damage });
                }
            }
        }
    }
    handleNormal(res) {
        if (!getTurnInfo().consumed)
            return;
        for (let i = 0; i < turnInfos.length; i++) {
            let item = turnInfos[i];
            if (res.input.toLocaleLowerCase() == item.title.toLocaleLowerCase()) {
                let normalWords = this.getNormalWords();
                for (let i in normalWords) {
                    // The 'value' attribute doens't work here
                    res.outputArray.push({ name: "", value: 1, enemy: normalWords[i], damage: item.damage });
                }
            }
        }
    }
    /**
     * Get bad words including those converted from normal words
     */
    getBadWords() {
        let ret = [];
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (e.isSensative()) {
                ret.push(e);
            }
        }
        return ret;
    }
    getNormalWords() {
        let ret = [];
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (!e.isSensative()) {
                ret.push(e);
            }
        }
        return ret;
    }
    // api3 callback
    handleJudgeResult(res) {
        var ar = res.outputArray;
        var input = res.input;
        // filter the duplicate labels
        // var seen = {};
        // ar = ar.filter(item => {x
        //     return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        // });
        let legal = true;
        // if we only want to damage the most similar word
        if (gameplayConfig.onlyDamageMostMatch) {
            ar = this.findBiggestDamage(ar);
        }
        let validDamageAtLeastOne = false;
        for (let i in ar) {
            let entry = ar[i];
            let entryName = entry.name;
            let entryValue = entry.value;
            // since network has latency, 
            // the enemy could have been eliminated when the callback is invoked
            // we need to be careful about the availability of the enemy
            let enemiesWithName = this.findEnemyByEntry(entry);
            enemiesWithName.forEach(e => {
                let dmgRes = e.damageFromSimResult(entry, input);
                if (dmgRes.damage > 0 && dmgRes.code == ErrorInputCode.NoError) {
                    validDamageAtLeastOne = true;
                }
            });
        }
        let sc = this.scene;
        if (validDamageAtLeastOne) {
            if (sc.needFeedback) {
                sc.sfxLaser.play();
                sc.hud.addCombo();
            }
        }
        else {
            if (sc.hud.comboHit > 0 && sc.needFeedback) {
                // sc.sfxFail.play();
            }
            sc.hud.resetCombo();
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
    findEnemyByEntry(item) {
        let name = item.name;
        let enemy = item.enemy;
        let ret = [];
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (e.lbl === name || e === enemy) {
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
    enemyEliminated(enemy, damagedBy) {
        this.updateTheKilledTimeHistoryForEnemy(enemy, true);
        if (this.curStrategy)
            this.curStrategy.enemyEliminated(enemy, damagedBy);
        if (this.curStrategy.needHandleRewardExclusively) {
            // let the strategy handle the award logic
        }
        else {
            // add a base 100 here
            this.scene.hud.addScore(100);
        }
        this.enemyEliminatedEvent.emit(enemy);
    }
    // This is mostly used when died
    freezeAllEnemies() {
        this.isPaused = true;
        if (this.autoSpawnTween)
            this.autoSpawnTween.pause();
        if (this.curStrategy)
            this.curStrategy.pause();
        // this.startSpawnStrategy(SpawnStrategyType.None);
        this.enemies.forEach(element => {
            element.freeze();
        });
    }
    unFreezeAllEnemies() {
        this.isPaused = false;
        this.curStrategy.unPause();
        this.enemies.forEach(element => {
            element.unFreeze();
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
        for (let i in this.omniHistory) {
            let e = this.omniHistory[i];
            if (e.eliminated === true)
                return e;
        }
        return null;
    }
    changeAllEnemies() {
        for (let i in this.enemies) {
            this.enemies[i].figure.change();
        }
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
var farray = [];
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
        this.scene = scene;
        if (fsm) {
            this.name = fsm.name;
            // Add all events
            for (let i in fsm.events) {
                let event = fsm.events[i];
                let eName = event.name;
                let eFrom = event.from;
                let eTo = event.to;
                this.addEvent(eName, eFrom, eTo);
            }
            // Set startup state
            if (fsm.initial) {
                this.addInitalState(fsm.initial);
            }
        }
    }
    getDefaultState() {
        return this.startupState;
    }
    addInitalState(sName) {
        let initState = this.states.get(sName);
        if (!initState) {
            initState = this.addState(sName);
        }
        initState.setAsStartup();
    }
    addEvent(eName, eFrom, eTo) {
        let stFrom = this.states.get(eFrom);
        if (!stFrom) {
            stFrom = this.addState(eFrom);
        }
        if (!this.states.has(eTo)) {
            this.addState(eTo);
        }
        stFrom.addEventTo(eName, eTo);
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
    event(key, isGlobal = false) {
        if (key.toUpperCase() !== key) {
            console.warn("FSM event is not all capitalized: " + key + "\nDid you used the state's name as the event's name by mistake?");
        }
        if (this.curState) {
            let targetName = null;
            if (isGlobal) {
                this.states.forEach((stateOb, stateName) => {
                    if (stateOb.eventRoute.has(key)) {
                        targetName = stateOb.eventRoute.get(key);
                    }
                });
            }
            else {
                targetName = this.curState.eventRoute.get(key);
            }
            if (targetName) {
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
    /**
     * Add event helper only connects two existed states by adding record into the fromState
     * It doens't help to constuct any state that doesn't exist
     * @param eventName
     * @param from
     * @param to
     */
    addEventHelper(eventName, from, to) {
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
Fsm.FINISHED = "FINISHED";
Fsm.CORRECT = 'CORRECT';
Fsm.WRONG = 'WRONG';
Fsm.SECODN_CHANCE = 'SECOND_CHANCE';
Fsm.PURGED = 'PURGED';
Fsm.LABEL_CORRECT = 'LABEL_CORRECT';
class FsmState {
    constructor(name, fsm) {
        this.eventRoute = new Map();
        this._unionEvents = new Map();
        this.actions = [];
        this.enterExitListners = new TypedEvent();
        this.autoRemoveListners = [];
        this.safeInOutWatchers = [];
        this.onEnter = [];
        /**
         * If you want to exit, just call finish() instead \
         * Don't call from outside
         * * DON'T do any async job in onExit
         */
        this.onExit = [];
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
        let thisInfo = { target, hoverState: 0, prevDownState: 0 };
        this.safeInOutWatchers.push(thisInfo);
        // setInteractive here,  disableInteractive in _onExit()
        target.setInteractive(true);
        if (inFunc) {
            // Two reasons to check contians here:
            // 1. the pointerover event has already sent
            // 2. the mouse didn't move
            // Note that the phaser pointerover is only updated when there is a mouse movement          
            let contains = this.fsm.scene.isObjectHovered(target);
            if (contains) {
                thisInfo.hoverState = 1;
                inFunc();
            }
            //
            let pointeroverFunc = e => {
                if (thisInfo.hoverState === 1) {
                    return;
                }
                thisInfo.hoverState = 1;
                inFunc(e);
            };
            target.on('pointerover', pointeroverFunc);
            this.autoRemoveListners.push({ target, key: 'pointerover', func: pointeroverFunc });
        }
        //! Theoretically speaking, even though the outFun logic here seems not have any problems now
        //! But we should know that:
        //! If we want to add some important feature here, such as css hover hand state changing,
        //! the outFun will not get called if the state has finished and autoRemove invoked
        //! To be short:
        //! If the hoverState === 1 when state finished, outFun will not be called, even it should be.        
        if (outFun) {
            let pointeroutFunc = e => {
                if (thisInfo.hoverState === 0) {
                    return;
                }
                thisInfo.hoverState = 0;
                outFun(e);
            };
            target.on('pointerout', pointeroutFunc);
            this.autoRemoveListners.push({ target, key: 'pointerout', func: pointeroutFunc });
        }
        if (clickFun) {
            target.on('pointerdown', clickFun);
            this.autoRemoveListners.push({ target, key: 'pointerdown', func: clickFun });
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
                        reject('Passed and rejected by condition in action config');
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
            let actionConfig = this.actions[i].actionConfig;
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
            if (actionConfig && actionConfig.isFinally) {
                curPromise = curPromise.finally(() => {
                    return this.getPromiseMiddleware(i)(this, null);
                });
            }
            else {
                curPromise = curPromise.then(res => {
                    return this.getPromiseMiddleware(i)(this, res);
                });
            }
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
    setFinally() {
        this.updateConfig({ isFinally: true });
        return this;
    }
    setCondition(func) {
        this.updateConfig({ conditionalRun: func });
        return this;
    }
    setBoolCondition(func, isResolve = true) {
        this.updateConfig({ conditionalRun: s => {
                if (func(s))
                    return ConditionalRes.Run;
                else
                    return isResolve ? ConditionalRes.PassResolve : ConditionalRes.PassReject;
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
        this.fsm.addEventHelper(eventName, fromName, this.name);
        return this;
    }
    /**
     * Add event from this to target
     * @param eventName
     * @param to
     */
    addEventTo(eventName, to) {
        let toName = this.fsm.getStateName(to);
        this.fsm.addEventHelper(eventName, this.name, toName);
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
        if (this.onEnter) {
            for (let i in this.onEnter) {
                this.onEnter[i](state);
            }
        }
        this.runActions();
        return this;
    }
    addOnEnter(handler) {
        this.onEnter.push(handler);
        return this;
    }
    _onUpdate(state, time, dt) {
        if (this.onUpdate)
            this.onUpdate(state, time, dt);
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
        if (this.onExit) {
            for (let i in this.onExit) {
                this.onExit[i](state);
            }
        }
        this.removeAutoRemoveListners();
        this.safeInOutWatchers.forEach(e => {
            e.target.disableInteractive();
        });
        this.safeInOutWatchers.length = 0;
        return this;
    }
    ;
    addOnExit(handler) {
        this.onExit.push(handler);
        return this;
    }
    finished() {
        this.fsm.event(Fsm.FINISHED);
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
     * Only call this if you know what you are doing
     * @param evName
     */
    event(evName, fsm) {
        if (notSet(fsm))
            fsm = this.fsm;
        if (this.isActive())
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
function hasSet(val) {
    return val !== null && val !== undefined;
}
FsmState.prototype.addSubtitleAction = function (subtitle, text, autoHideAfter, timeout, minStay, finishedSpeechWait) {
    let self = this;
    if (notSet(timeout))
        timeout = 2500;
    if (notSet(minStay))
        minStay = 1500;
    if (notSet(finishedSpeechWait))
        finishedSpeechWait = 600;
    self.addAction((state, result, resolve, reject) => {
        let realText = typeof (text) == 'string' ? text : text(state, result);
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
class NewspaperFsm extends Fsm {
    constructor(scene, npNumbers, papernEnterCallBack, correctEnterCallback, secondChanceCallback, paperEndEntercallBack, paperEndAddActionCallback, paperDiedAddActionCallBack) {
        super(scene, null);
        this.newspapaerStates = [];
        this.papernEnterCallBack = papernEnterCallBack;
        this.correctEnterCallback = correctEnterCallback;
        this.secondChanceCallback = secondChanceCallback;
        this.paperEndEntercallBack = paperEndEntercallBack;
        this.paperEndAddActionCallback = paperEndAddActionCallback;
        this.paperDiedAddActionCallBack = paperDiedAddActionCallBack;
        // deep copy
        this.npNumbers = [...npNumbers];
        this.constructNpStates();
        this.name = 'NewspaperFSM';
        this.addInitalState(NewspaperFsm.DEFAULT_ST_NAME);
    }
    constructNpStates() {
        if (notSet(this.npNumbers) || this.npNumbers.length == 0)
            return;
        this.addEvent(NewspaperFsm.DIED_EV_NAME, NewspaperFsm.DEFAULT_ST_NAME, NewspaperFsm.DIED_ST_NAME);
        let prevEndName = NewspaperFsm.DEFAULT_ST_NAME;
        for (let i = 0; i < this.npNumbers.length; i++) {
            let correctStName = this.getStateReactionNameByIndex(i, true);
            let wrongStName = this.getStateReactionNameByIndex(i, false);
            let purgedStName = this.getStatePurgedNameByIndex(i);
            let labelCorrectStName = this.getStateLabelCorrectNameByIndex(i);
            let endStName = this.getStateEndNameByIndex(i);
            let currStName = this.getStateNameByIndex(i);
            this.addEvent(Fsm.FINISHED, prevEndName, currStName);
            this.addEvent(Fsm.FINISHED, currStName, endStName);
            this.addEvent(Fsm.CORRECT, currStName, correctStName);
            this.addEvent(Fsm.WRONG, currStName, wrongStName);
            this.addEvent(Fsm.PURGED, currStName, purgedStName);
            this.addEvent(Fsm.LABEL_CORRECT, purgedStName, labelCorrectStName);
            this.addEvent(Fsm.FINISHED, correctStName, endStName);
            this.addEvent(Fsm.FINISHED, wrongStName, endStName);
            this.addEvent(Fsm.FINISHED, labelCorrectStName, endStName);
            // Second chance
            // Wrong->2nd
            let secondStName = this.getState2ndChanceStateNameByIndex(i);
            this.addEvent(Fsm.SECODN_CHANCE, wrongStName, secondStName);
            // 2nd -> correct
            this.addEvent(Fsm.CORRECT, secondStName, correctStName);
            // 2nd -> wrong
            this.addEvent(Fsm.WRONG, secondStName, wrongStName);
            prevEndName = endStName;
        }
        this.getState(NewspaperFsm.DIED_ST_NAME).addOnEnter(s => {
            // the second param is nonsense here
            this.paperDiedAddActionCallBack(s, 0);
        });
        for (let i = 0; i < this.npNumbers.length; i++) {
            let state = this.getStateByIndex(i);
            state.addOnEnter(s => {
                this.papernEnterCallBack(s, i);
            });
            let correct = this.getReactionStateByIndex(i, true);
            if (correct) {
                if (this.correctEnterCallback) {
                    correct.addOnEnter(s => {
                        this.correctEnterCallback(s, i);
                    });
                }
            }
            let secondChance = this.getSecondChangeStateByIndex(i);
            if (secondChance) {
                if (this.secondChanceCallback) {
                    secondChance.addOnEnter(s => {
                        this.secondChanceCallback(s, i);
                    });
                }
            }
            let end = this.getStateEndByIndex(i);
            if (end) {
                if (this.paperEndEntercallBack) {
                    end.addOnEnter(s => {
                        this.paperEndEntercallBack(s, i);
                    });
                }
                if (this.paperEndAddActionCallback) {
                    this.paperEndAddActionCallback(end, i);
                }
            }
        }
    }
    /**
     *
     * @param index ~ [0, length - 1]
     */
    getStateByIndex(index) {
        let stName = this.getStateNameByIndex(index);
        return this.getState(stName);
    }
    getReactionStateByIndex(index, correct) {
        let stName = this.getStateReactionNameByIndex(index, correct);
        return this.getState(stName);
    }
    getSecondChangeStateByIndex(index) {
        return this.getState(this.getState2ndChanceStateNameByIndex(index));
    }
    getStateEndByIndex(index) {
        return this.getState(this.getStateEndNameByIndex(index));
    }
    getPurgedStateByIndex(index) {
        return this.getState(this.getStatePurgedNameByIndex(index));
    }
    getLabelCorrectStateByInde(index) {
        return this.getState(this.getStateLabelCorrectNameByIndex(index));
    }
    /**
     *
     * @param num example: [4, 2, 1, 8]
     */
    getStateByNum(num) {
        let idx = this.npNumbers.findIndex(v => v == num);
        if (idx >= 0) {
            return this.getStateByIndex(idx);
        }
        else {
            return null;
        }
    }
    // index: [0, length - 1]
    getStateNameByIndex(index) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperState-${index}`;
    }
    getStateReactionNameByIndex(index, correct) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperStateReaction-${index}-${correct ? 'CORRECT' : 'WRONG'}`;
    }
    getState2ndChanceStateNameByIndex(index) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperState-${index}-second`;
    }
    getStateEndNameByIndex(index) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperState-${index}-end`;
    }
    getStatePurgedNameByIndex(index) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperState-${index}-purged`;
    }
    getStateLabelCorrectNameByIndex(index) {
        if (index < 0 || index >= this.npNumbers.length) {
            throw 'Paper number out of range';
        }
        return `NewspaperState-${index}-label-correct`;
    }
}
NewspaperFsm.DEFAULT_ST_NAME = 'Default';
NewspaperFsm.DIED_ST_NAME = 'Died';
NewspaperFsm.DIED_EV_NAME = 'G_DIED';
/// <reference path="../fsm/fsm.ts" />
var normal_1_0 = {
    name: 'Normal_0',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
        { name: 'VIDEO_FINISHED', from: 'Start', to: 'EndAnimation' }
    ],
    states: [
    // {name: 'Idle', color:'Green'}
    ]
};
farray.push(normal_1_0);
/// <reference path="../fsm/fsm.ts" />
var normal_1_1 = {
    name: 'NormalGameFsm',
    initial: "Default",
    events: [
        { name: 'TUTORIAL_START', from: 'Default', to: 'TutorialStart' },
        { name: 'EXPLAIN_HP', from: 'TutorialStart', to: 'ExplainHp' },
        { name: 'TO_FLOW_STRATEGY', from: 'ExplainHp', to: 'FlowStrategy' },
        { name: 'NORMAL_START', from: 'Default', to: 'NormalStart' },
        { name: 'FINISHED', from: 'NormalStart', to: 'Story0' },
        { name: 'FINISHED', from: 'FlowStrategy', to: 'Story0' },
        { name: 'FINISHED', from: 'Story0', to: 'Story1' }
    ]
};
farray.push(normal_1_1);
/// <reference path="../fsm/fsm.ts" />
var normal_1_2 = {
    name: 'Normal_1_2',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
    ]
};
farray.push(normal_1_2);
/// <reference path="../fsm/fsm.ts" />
var normal_1_3 = {
    name: 'Normal_1_3',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
        { name: 'TO_BGM', from: 'Start', to: 'BGM' },
        { name: 'TO_SENSITIVE_WORD', from: 'BGM', to: 'Sensitive' },
        { name: 'FINISHED', from: 'Sensitive', to: 'End' }
    ]
};
farray.push(normal_1_3);
/// <reference path="../fsm/fsm.ts" />
var normal_1_4 = {
    name: 'Normal_1_4',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
        { name: 'FINISHED', from: 'Start', to: 'Idle' },
        { name: 'WARN', from: 'Idle', to: 'Warn' },
        { name: 'FINISHED', from: 'Warn', to: 'Idle' },
        { name: 'MOCK', from: 'Idle', to: 'Mock' },
        { name: 'TO_PROMPT_COMPLETE_BAD', from: 'Idle', to: 'PromptCompleteBad' },
        { name: 'FINISHED', from: 'PromptCompleteBad', to: 'Idle' },
        { name: 'TO_PROMPT_AUTO_BAD', from: 'Idle', to: 'PromptAutoBad' },
        { name: 'FINISHED', from: 'PromptAutoBad', to: 'Idle' },
        { name: 'TO_PROMPT_TURN', from: 'Idle', to: 'PromptTurn' },
        { name: 'FINISHED', from: 'PromptTurn', to: 'Idle' },
        { name: 'TO_PROMPT_AUTO_TURN', from: 'Idle', to: 'PromptAutoTurn' },
        { name: 'FINISHED', from: 'PromptAutoTurn', to: 'Idle' },
        { name: 'TO_PROMPT_CREATOR', from: 'Idle', to: 'PromptCreator' },
        { name: 'FINISHED', from: 'PromptCreator', to: 'Idle' },
        { name: 'TO_KEYWORDS', from: 'Idle', to: 'PromptKeywords' },
        { name: 'FINISHED', from: 'PromptKeywords', to: 'Idle' },
    ],
    states: [
        { name: 'Idle', color: 'Green' }
    ]
};
farray.push(normal_1_4);
/// <reference path="../fsm/fsm.ts" />
var normal_1_paper = {
    name: 'Normal_1_Papaer',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
        { name: 'CONTINUE', from: 'Start', to: 'Confirm_1' },
        { name: 'CONTINUE', from: 'Confirm_1', to: 'Confirm_2' }
    ],
    states: [
    // {name: 'Idle', color:'Green'}
    ]
};
farray.push(normal_1_paper);
/// <reference path="../fsm/fsm.ts" />
var normal_2_1 = {
    name: 'Normal_2_1',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
    ]
};
farray.push(normal_2_1);
/// <reference path="../fsm/fsm.ts" />
var normal_2_2 = {
    name: 'Normal_2_2',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
    ]
};
farray.push(normal_2_2);
/// <reference path="../fsm/fsm.ts" />
var normal_2_3 = {
    name: 'Normal_2_3',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
    ]
};
farray.push(normal_2_3);
/// <reference path="../fsm/fsm.ts" />
var normal_2_paper = {
    name: 'Normal_2_Paper',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'Start' },
    ]
};
farray.push(normal_2_paper);
/// <reference path="../fsm/fsm.ts" />
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
        { name: 'RESTART_TO_GAME', from: 'Restart', to: 'NormalGame' },
        { name: 'FORCE_DIRECT_INTO_GAME', from: 'Home', to: 'HomeToGameAnimation' }
    ],
};
farray.push(mainFsm);
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
/// <reference path="../fsm/fsm.ts" />
var newsPaper = {
    name: 'Newspaper',
    initial: "Default",
    events: [
        { name: 'FINISHED', from: 'Default', to: 'Paper1' },
        { name: 'CORRECT', from: 'Paper1', to: 'Paper1_Correct', dot: { weight: 10, len: '0.1' } },
        { name: 'WRONG', from: 'Paper1', to: 'Paper1_Wrong' },
        { name: 'CORRECT', from: 'Paper1_SecondChance', to: 'Paper1_Correct' },
        { name: 'WRONG', from: 'Paper1_SecondChance', to: 'Paper1_Wrong' },
        { name: 'G_DIED', from: 'Default', to: 'Died' },
        { name: 'PURGED', from: 'Paper1', to: 'Paper1_Purged' },
        { name: 'LB_CORRECT', from: 'Paper1_Purged', to: 'Paper1_LabelCorrect' },
        { name: '2', from: 'Paper1_Wrong', to: 'Paper1_SecondChance', },
        { name: 'FINISHED', from: 'Paper1_Wrong', to: 'End1' },
        { name: 'FINISHED', from: 'Paper1_Correct', to: 'End1' },
        { name: 'FINISHED', from: 'Paper1', to: 'End1' },
        { name: 'FINISHED', from: 'Paper1_LabelCorrect', to: 'End1' },
    ]
};
farray.push(newsPaper);
/// <reference path="../fsm/fsm.ts" />
var zenFsm = {
    name: 'ZenFsm',
    initial: "Default",
    events: [
        { name: 'START', from: 'Default', to: 'ZenStart' },
        { name: 'TO_FIRST_INTRODUCTION', from: 'ZenStart', to: 'ZenIntro' }
    ]
};
farray.push(zenFsm);
class BirdManager {
    constructor() {
    }
    static getInstance() {
        if (!BirdManager.instance) {
            BirdManager.instance = new BirdManager();
        }
        return BirdManager.instance;
    }
    print(text, img) {
        let sendOb = {};
        if (text)
            sendOb.text = text;
        if (img)
            sendOb.img = img;
        // make sure the request run in async thread
        // Promise.resolve('hello').then(s=>{
        //     return apiPromise('api/bird', JSON.stringify(sendOb))
        // })
        setTimeout(() => {
            apiPromise('api/bird', JSON.stringify(sendOb));
        }, 1);
    }
}
var CamPosi;
(function (CamPosi) {
    CamPosi[CamPosi["PaperLevel"] = 0] = "PaperLevel";
    CamPosi[CamPosi["Newspaper"] = 1] = "Newspaper";
})(CamPosi || (CamPosi = {}));
class CameraManager {
    constructor() {
        this.camAllowed = false;
        this.imageResEvent = new TypedEvent();
    }
    static getInstance() {
        if (!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }
    requestPermission() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // var video = document.getElementById('affdex_video') as any;
            // Not adding `{ audio: true }` since we only want video now
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                // video.src = window.URL.createObjectURL(stream);
                // video.srcObject = stream;
                // video.play();
                this.camAllowed = true;
            })
                .catch(e => {
                console.log(e);
                this.camAllowed = false;
            });
        }
    }
    showVideo() {
        // if(!this.camAllowed) 
        //     return;                 
        $('#cam-root').css('display', 'inline');
    }
    hideVideo() {
        $('#cam-root').css('display', 'none');
    }
    setSize(w, h) {
        $('#face_video_canvas').css('width', w + 'px');
        $('#face_video_canvas').css('height', h + 'px');
        $('#face_video').css('width', w + 'px');
        $('#face_video').css('height', h + 'px');
        $('#face_video_canvas').css('transform', 'scaleX(-1)');
    }
    setPosition(posi) {
        let camRoot = $('#cam-root');
        let affdexRoot = $('#affdex_root');
        if (posi == CamPosi.PaperLevel) {
            let borderStyl = '4px outset #252525';
            camRoot.css('right', '20px');
            camRoot.css('bottom', '0px');
            affdexRoot.css('border-top', borderStyl);
            affdexRoot.css('border-left', borderStyl);
            affdexRoot.css('border-right', borderStyl);
            this.width = 400;
            this.height = 300;
        }
        else {
            let borderStyl = '6px outset black';
            camRoot.css('transform', 'translate(0, -50%)');
            camRoot.css('z-index', '-1');
            camRoot.css('top', '50%');
            camRoot.css('left', '98%');
            affdexRoot.css('border', borderStyl);
            var element = camRoot.detach();
            $('#newspaper-page').append(element);
            this.width = 300;
            this.height = 225;
        }
        this.setSize(this.width, this.height);
    }
    captureCameraImage() {
        let video = $('#face_video')[0];
        let scale = 0.5;
        var canvas = document.createElement("canvas");
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        let img = document.createElement('img');
        let dataURL = canvas.toDataURL();
        // console.log(dataURL);               
        return dataURL;
    }
    //Draw the detected facial feature points on the image
    drawFeaturePoints(img, featurePoints, timestamp) {
        this.lastT = timestamp;
        var contxt = $('#face_video_canvas')[0].getContext('2d');
        var hRatio = contxt.canvas.width / img.width;
        var vRatio = contxt.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        contxt.strokeStyle = "#FF0000";
        for (var id in featurePoints) {
            contxt.beginPath();
            contxt.arc(featurePoints[id].x, featurePoints[id].y, 2, 0, 2 * Math.PI);
            contxt.stroke();
            contxt.font = "10px Comic Sans MS";
            contxt.fillStyle = "red";
            contxt.textAlign = "center";
            contxt.fillText("" + id, featurePoints[id].x, featurePoints[id].y);
        }
    }
    log(node_name, msg) {
        console.log('face: ' + node_name + " " + msg);
    }
    startDectector() {
        this.detector.start();
    }
    initFaceAPI() {
        var divRoot = $("#affdex_root")[0];
        var width = 640;
        var height = 480;
        var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
        //Construct a CameraDetector and specify the image width / height and face detector mode.
        let detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
        this.detector = detector;
        //Enable detection of all Expressions, Emotions and Emojis classifiers.
        detector.detectAllEmotions();
        detector.detectAllExpressions();
        detector.detectAllEmojis();
        detector.detectAllAppearance();
        //Add a callback to notify when the detector is initialized and ready for runing.
        detector.addEventListener("onInitializeSuccess", () => {
            this.log('#logs', "The detector reports initialized");
            //Display canvas instead of video feed because we want to draw the feature points on it
            $("#face_video_canvas").css("display", "block");
            $("#face_video").css("display", "none");
            this.setSize(this.width, this.height);
        });
        detector.addEventListener("onInitializeFailure", () => {
            this.log('#logs', "The detector reports onInitializeFailure");
            console.log("onInitializeFailure");
        });
        //Add a callback to notify when camera access is allowed
        detector.addEventListener("onWebcamConnectSuccess", () => {
            this.log('#logs', "Webcam access allowed");
        });
        //Add a callback to notify when camera access is denied
        detector.addEventListener("onWebcamConnectFailure", () => {
            this.log('#logs', "webcam denied");
        });
        //Add a callback to notify when detector is stopped
        detector.addEventListener("onStopSuccess", () => {
            this.log('#logs', "The detector reports stopped");
            $("#results").html("");
        });
        detector.addEventListener("onImageResultsSuccess", (faces, image, timestamp) => {
            $('#results').html("");
            if (faces.length > 0) {
                this.imageResEvent.emit({
                    face: faces[0],
                    timestamp: timestamp,
                    img: image
                });
                // if ($('#face_video_canvas')[0] != null) {
                //     this.drawFeaturePoints(image, faces[0].featurePoints, timestamp);
                // }
            }
        });
    }
}
class CssBinding {
    constructor(target) {
        this.target = target;
    }
    update() {
        if (this.left != null)
            this.target.css('left', this.left);
        if (this.top != null)
            this.target.css('top', this.top);
        if (this.opacity != null)
            this.target.css('opacity', this.opacity);
        if (this.translateX != null || this.translateY != null || this.scale != null || this.rotate != null) {
            this.target.css('transform', this.getTransformString());
        }
    }
    getTransformString() {
        let ret = '';
        let tranlateSub = '';
        if (this.translateX != null || this.translateY != null) {
            let xStr = this.translateX ? this.translateX : '0';
            let yStr = this.translateY ? this.translateY : '0';
            tranlateSub = ` translate(${xStr}%, ${yStr}%) `;
        }
        let scaleSub = '';
        if (this.scale != null) {
            scaleSub = ` scale(${this.scale}) `;
        }
        let rotateSub = '';
        if (this.rotate != null) {
            rotateSub = ` rotate(${this.rotate}deg) `;
        }
        ret = `${tranlateSub} ${scaleSub} ${rotateSub}`;
        return ret;
    }
}
var MyEmotion;
(function (MyEmotion) {
    MyEmotion[MyEmotion["None"] = 0] = "None";
    MyEmotion[MyEmotion["Positive"] = 1] = "Positive";
    MyEmotion[MyEmotion["Negative"] = 2] = "Negative";
})(MyEmotion || (MyEmotion = {}));
class EmmotionManager {
    constructor() {
    }
    static getInstance() {
        if (!EmmotionManager.instance) {
            EmmotionManager.instance = new EmmotionManager();
        }
        return EmmotionManager.instance;
    }
    emotionAnalyze(res) {
        let ana = { emotion: MyEmotion.None, intensity: 0 };
        let face = res.face;
        let timestamp = res.timestamp;
        let emotions = face.emotions;
        let expressions = face.expressions;
        if (emotions.joy > 90 || expressions.smile > 80) {
            ana.emotion = MyEmotion.Positive;
            ana.intensity = emotions.engagement / 100;
        }
        // if(expressions.noseWrinkle > 30 || expressions.browFurrow > 30) {
        //     ana.emotion = MyEmotion.Negative;
        //     ana.intensity = 1;
        // }
        if (emotions.valence < -10 || expressions.noseWrinkle > 90) {
            ana.emotion = MyEmotion.Negative;
            ana.intensity = emotions.engagement / 100;
        }
        return ana;
    }
}
let s_banks = [
    "Master.bank",
    "Master.strings.bank",
    "SE.bank",
    "BGM.bank"
];
class FmodManager {
    constructor() {
        this.FMOD = {};
        this.gAudioResumed = false;
        this.loopingAmbienceInstance = {};
        this.emojiProgressInstance = {};
        this.loopingAmbienceDescription = {};
        this.FMOD['preRun'] = () => { this.prerun(); };
        this.FMOD['onRuntimeInitialized'] = () => {
            this.main();
        };
        this.FMOD['TOTAL_MEMORY'] = 164 * 1024 * 1024;
        FMODModule(this.FMOD);
    }
    test() {
        this.loopingAmbienceInstance.val.start();
    }
    static getInstance() {
        if (!FmodManager.instance) {
            FmodManager.instance = new FmodManager();
        }
        return FmodManager.instance;
    }
    CHECK_RESULT(result) {
        if (result != this.FMOD.OK) {
            var msg = "Error!!! '" + this.FMOD.ErrorString(result) + "'";
            alert(msg);
            throw msg;
        }
    }
    prerun() {
        // console.log('begin prerun');
        var fileUrl = "/banks/";
        var folderName = "/";
        var canRead = true;
        var canWrite = false;
        for (var count = 0; count < s_banks.length; count++) {
            this.FMOD.FS_createPreloadedFile(folderName, s_banks[count], fileUrl + s_banks[count], canRead, canWrite);
        }
        // console.log('finish prerun');
    }
    main() {
        // A temporary empty object to hold our system
        let outval = {};
        let result;
        console.log("Creating FMOD System object\n");
        // Create the system and check the result
        result = this.FMOD.Studio_System_Create(outval);
        this.CHECK_RESULT(result);
        console.log("grabbing system object from temporary and storing it\n");
        // Take out our System object
        this.gSystem = outval.val;
        result = this.gSystem.getCoreSystem(outval);
        this.CHECK_RESULT(result);
        this.gSystemCore = outval.val;
        // Optional.  Setting DSP Buffer size can affect latency and stability.
        // Processing is currently done in the main thread so anything lower than 2048 samples can cause stuttering on some devices.
        console.log("set DSP Buffer size.\n");
        result = this.gSystemCore.setDSPBufferSize(2048, 2);
        this.CHECK_RESULT(result);
        // Optional.  Set sample rate of mixer to be the same as the OS output rate.
        // This can save CPU time and latency by avoiding the automatic insertion of a resampler at the output stage.
        console.log("Set mixer sample rate");
        result = this.gSystemCore.getDriverInfo(0, null, null, outval, null, null);
        this.CHECK_RESULT(result);
        result = this.gSystemCore.setSoftwareFormat(outval.val, this.FMOD.SPEAKERMODE_DEFAULT, 0);
        this.CHECK_RESULT(result);
        console.log("initialize FMOD\n");
        // 1024 virtual channels
        result = this.gSystem.initialize(1024, this.FMOD.STUDIO_INIT_NORMAL, this.FMOD.INIT_NORMAL, null);
        this.CHECK_RESULT(result);
        // Starting up your typical JavaScript application loop
        console.log("initialize Application\n");
        this.initApplication();
        // Set up iOS/Chrome workaround.  Webaudio is not allowed to start unless screen is touched or button is clicked.
        let resumeAudio = () => {
            if (!this.gAudioResumed) {
                console.log("Resetting audio driver based on user input.");
                result = this.gSystemCore.mixerSuspend();
                this.CHECK_RESULT(result);
                result = this.gSystemCore.mixerResume();
                this.CHECK_RESULT(result);
                this.gAudioResumed = true;
                // FmodManager.getInstance().playOneShot('ChooseLevel');                
            }
        };
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (iOS) {
            window.addEventListener('touchend', resumeAudio, false);
        }
        else {
            document.addEventListener('keydown', resumeAudio);
            document.addEventListener('click', resumeAudio);
        }
        // Set the framerate to 50 frames per second, or 20ms.
        console.log("Start game loop\n");
        window.setInterval(() => { this.updateApplication(); }, 20);
        return this.FMOD.OK;
    }
    // Helper function to load a bank by name.
    loadBank(name) {
        var bankhandle = {};
        this.CHECK_RESULT(this.gSystem.loadBankFile("/" + name, this.FMOD.STUDIO_LOAD_BANK_NORMAL, bankhandle));
    }
    /**
     * Prefix like 'event:/' is not needed.
     * Just use the label in the FMOD browser
     * @param eventName
     */
    playOneShot(eventName) {
        eventName = 'event:/' + eventName;
        let desc = {};
        let instance = {};
        this.CHECK_RESULT(this.gSystem.getEvent(eventName, desc));
        this.CHECK_RESULT(desc.val.createInstance(instance));
        instance.val.start();
        instance.val.release();
        return instance;
    }
    initInstances() {
        this.emojiProgressInstance = this.createInstanceByEventName('65537_EmotionAccumulating');
    }
    /**
     * return the instance
     * @param en
     */
    createInstanceByEventName(en) {
        let eventName = en;
        eventName = 'event:/' + eventName;
        let desc = {};
        let instance = {};
        this.CHECK_RESULT(this.gSystem.getEvent(eventName, desc));
        this.CHECK_RESULT(desc.val.createInstance(instance));
        return instance;
    }
    playInstance(instance) {
        instance.val.start();
    }
    stopInstance(instance) {
        instance.val.stop(this.FMOD.STUDIO_STOP_IMMEDIATE);
    }
    initApplication() {
        console.log("Loading events\n");
        for (var count = 0; count < s_banks.length; count++) {
            this.loadBank(s_banks[count]);
        }
        this.initInstances();
        // // Get the Looping Ambience event
        //var loopingAmbienceDescription:any = {};
        // this.CHECK_RESULT( this.gSystem.getEvent("event:/Ambience/Country", this.loopingAmbienceDescription) );
        // // this.loopingAmbienceDescription.val.loadSampleData();
        // this.CHECK_RESULT( this.loopingAmbienceDescription.val.createInstance(this.loopingAmbienceInstance) );
        // console.log('test loaded');
        // // Get the 4 Second Surge event
        // var cancelDescription = {};
        // CHECK_RESULT( gSystem.getEvent("event:/UI/Cancel", cancelDescription) );
        // CHECK_RESULT( cancelDescription.val.createInstance(cancelInstance) );
        // // Get the Explosion event
        // CHECK_RESULT( gSystem.getEvent("event:/Weapons/Explosion", explosionDescription) );
        // // Start loading explosion sample data and keep it in memory
        // CHECK_RESULT( explosionDescription.val.loadSampleData() );
    }
    updateApplication() {
        // Update FMOD
        let result = this.gSystem.update();
        this.CHECK_RESULT(result);
    }
}
let gFmodManager = FmodManager.getInstance();
class GlobalEventManager {
    constructor() {
        this.newspaperButtonTopClickedEvent = new TypedEvent();
        this.newspaperButtonBottomClickedEvent = new TypedEvent();
        this.dragStartEvent = new TypedEvent();
    }
    static getInstance() {
        if (!GlobalEventManager.instance) {
            GlobalEventManager.instance = new GlobalEventManager();
        }
        return GlobalEventManager.instance;
    }
    newspaperButtonTopClicked() {
        this.newspaperButtonTopClickedEvent.emit(this);
    }
    newspaperButtonBottomClicked() {
        this.newspaperButtonBottomClickedEvent.emit(this);
    }
    dragStart(e) {
        this.dragStartEvent.emit(e);
    }
}
function newspaperButtonTopClicked() {
    GlobalEventManager.getInstance().newspaperButtonTopClicked();
}
function newspaperButtonBottomClicked() {
    GlobalEventManager.getInstance().newspaperButtonBottomClicked();
}
var NewspaperStyle;
(function (NewspaperStyle) {
    NewspaperStyle[NewspaperStyle["DEFAULT"] = 0] = "DEFAULT";
    NewspaperStyle[NewspaperStyle["ONLY_TEXT_CENTER"] = 1] = "ONLY_TEXT_CENTER";
})(NewspaperStyle || (NewspaperStyle = {}));
var NewsSourceType;
(function (NewsSourceType) {
    NewsSourceType[NewsSourceType["FAKE"] = 0] = "FAKE";
    NewsSourceType[NewsSourceType["NYT"] = 1] = "NYT";
    NewsSourceType[NewsSourceType["WASHINGTON_POST"] = 2] = "WASHINGTON_POST";
    NewsSourceType[NewsSourceType["CNN"] = 3] = "CNN";
})(NewsSourceType || (NewsSourceType = {}));
let SEE_NO_EVIL_NUM = 26;
let ALWAYS_WRONG_NUM = 29;
let AUTO_LABEL_NUM = 31;
let AUTO_EXPRESSION_NUM = 34;
let FAKE_LOOP_TEMPLATE_NUM = 101;
let REAL_LOOP_TEMPLATE_NUM = 102;
let LOOP_BEGIN_NUM = 1001;
let LOOP_END_NUM = 1100;
let NAOMI_PAPER_NUM = 2001;
class NewsDataManager {
    constructor() {
        this.data = [];
        this.labelMapping = new Map();
    }
    static getInstance() {
        if (!NewsDataManager.instance) {
            NewsDataManager.instance = new NewsDataManager();
            NewsDataManager.instance.load();
            NewsDataManager.instance.initLabelMapping();
        }
        return NewsDataManager.instance;
    }
    initLabelMapping() {
        this.labelMapping.set(NewsSourceType.NYT, new Array('Dead Paper', 'Embarrassment to Journalism', 'Enemy of the People'));
        this.labelMapping.set(NewsSourceType.CNN, new Array('Fake News', 'Do Nothing Left', 'Third-Rate Reporter'));
        this.labelMapping.set(NewsSourceType.WASHINGTON_POST, new Array('A New Hoax', 'Nasty', 'Hate Our Country'));
    }
    getByNum(num) {
        for (let i in this.data) {
            if (this.data[i].index == num) {
                return this.data[i];
            }
        }
        return null;
    }
    loadRss(done, fail) {
        // let FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';
        let FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml';
        $.get(FEED_URL)
            .done(data => {
            let ret = [];
            $(data).find("item").each((index, ele) => {
                var el = $(ele);
                let rssItem = {
                    title: el.find("title").text(),
                    desc: el.find("description").text(),
                    imageUrl: el.find("media\\:content[medium=image]").attr('url')
                };
                ret.push(rssItem);
                // console.log("title      : " + el.find("title").text());
                // console.log("media:content     : " + el.find("media\\:content[medium=image]").attr('url'));
                // console.log("description: " + el.find("description").text());
            });
            done(ret);
        })
            .fail(s => {
            fail();
        });
    }
    load() {
        this.data = [];
        let lines = g_newsData1.split('\n');
        let firstAdd = true;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // ignore the empty line
            if (line == '') {
                continue;
            }
            // ignore the head
            if (firstAdd) {
                firstAdd = false;
                continue;
            }
            let cols = line.split('\t');
            try {
                let item = {
                    index: parseInt(cols[0]),
                    title: cols[1],
                    content: cols[2],
                    answer: parseInt(cols[3]),
                    intro: cols[4],
                    correctResponse: cols[5],
                    wrongResonpse: cols[6],
                    secondChanceIntro: cols[7],
                    purgeIntro: cols[8],
                    labelCorrectIntro: cols[9],
                    style: parseInt(cols[10]),
                    reaction: parseInt(cols[11]),
                    thumbnail1: cols[12],
                    thumbnail2: cols[13],
                    ambience: cols[14],
                    needloop: parseInt(cols[15]),
                    tag: cols[16],
                    sourceType: NewsSourceType.FAKE,
                };
                if (isNaN(item.index) || isNaN(item.answer)) {
                    throw 'NewsData loading failed for one item';
                }
                if (isNaN(item.style)) {
                    item.style = 0;
                }
                if (isNaN(item.reaction)) {
                    item.reaction = 1;
                }
                this.judgeType(item);
                this.data.push(item);
            }
            catch (error) {
                console.log(error);
                continue;
            }
        }
        // console.log(this.data);
        this.appendLoop();
    }
    appendLoop() {
        let fakeTemplate = this.getByNum(FAKE_LOOP_TEMPLATE_NUM);
        let realTemplate = this.getByNum(REAL_LOOP_TEMPLATE_NUM);
        for (let i = LOOP_BEGIN_NUM; i <= LOOP_END_NUM; i++) {
            let logicIndex = i - LOOP_BEGIN_NUM;
            let contentIndex = 6 + logicIndex;
            let loopItem = null;
            if (logicIndex % 2 == 1) {
                loopItem = JSON.parse(JSON.stringify(fakeTemplate));
                loopItem.answer = Math.random() < 0.5 ? 0 : 1;
            }
            else {
                let rd = Math.floor((Math.random() * 3));
                loopItem = JSON.parse(JSON.stringify(realTemplate));
                if (rd == 0) {
                    loopItem.title = 'New York Times';
                    loopItem.content = `<nyt index='${contentIndex}'/>`;
                }
                else if (rd == 1) {
                    loopItem.title = 'Washington Post';
                    loopItem.content = `<wp index='${contentIndex}'/>`;
                }
                else if (rd == 2) {
                    loopItem.title = 'CNN';
                    loopItem.content = `<cnn index='${contentIndex}'/>`;
                }
            }
            this.judgeType(loopItem);
            loopItem.index = i;
            this.data.push(loopItem);
        }
    }
    isRealPaper(item) {
        return item.answer < 0;
    }
    judgeType(item) {
        if (item.content.includes('nyt')) {
            item.sourceType = NewsSourceType.NYT;
        }
        else if (item.content.includes('wp')) {
            item.sourceType = NewsSourceType.WASHINGTON_POST;
        }
        else if (item.content.includes('cnn')) {
            item.sourceType = NewsSourceType.CNN;
        }
        else {
            item.sourceType = NewsSourceType.FAKE;
        }
    }
    isAlwaysWrongItem(item) {
        return item.index == ALWAYS_WRONG_NUM;
    }
}
var VoiceType;
(function (VoiceType) {
    VoiceType[VoiceType["Voice65536"] = 0] = "Voice65536";
    VoiceType[VoiceType["Voice65537"] = 1] = "Voice65537";
    VoiceType[VoiceType["Japanese"] = 2] = "Japanese";
})(VoiceType || (VoiceType = {}));
class SpeechManager {
    constructor(scene) {
        this.loadedSpeechFilesStatic = {};
        this.loadedSpeechFilesQuick = {};
        /**
         * 0: 65536 voice
         * 1: 65537 voice
         */
        this.voiceTypeLabel = 'en-US-Wavenet-D';
        /**
         * loadRejecters is a cache for the current promise reject handler
         * for those loading process.
         * We expose the handler to the cache to stop the loading manually
         */
        this.loadRejecters = new Map();
        this.rejecterID = 0;
        // contain all the currently playing && not completed sounds played by playSoundByKey()
        this.playingSounds = [];
        this.scene = scene;
    }
    setVoiceType(tp) {
        this.voiceTypeLabel = this.convertVoiceTypeToLabel(tp);
    }
    convertVoiceTypeToLabel(tp) {
        let ret = 'en-US-Wavenet-D';
        if (tp == VoiceType.Voice65536) {
            ret = 'en-US-Wavenet-D';
        }
        else if (tp == VoiceType.Voice65537) {
            ret = 'en-US-Wavenet-C';
        }
        return ret;
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
            let apiAndLoadPromise = apiTextToSpeech2(text, "no_id", this.getHotFixVoiceTypeLabel(text))
                .then(oReq => {
                //console.log("suc in quickLoadAndPlay")
                var arrayBuffer = oReq.response;
                // this blob may leak memory
                var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
                var url = URL.createObjectURL(blob);
                // console.log(url);    
                return this.phaserLoad(text, text, url, false);
            });
            let thisRejectID = this.rejecterID++;
            let race = Promise.race([
                apiAndLoadPromise,
                TimeOutPromise.create(timeOut, false),
                new Promise((resolve, reject) => {
                    this.loadRejecters.set(thisRejectID, reject);
                })
            ]);
            let ret = race
                .finally(() => { this.loadRejecters.delete(thisRejectID); })
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
    getHotFixVoiceTypeLabel(text) {
        let ret = this.voiceTypeLabel;
        console.log(text);
        if (text.trim() == '失礼します') {
            ret = 'ja-JP-Wavenet-B';
        }
        return ret;
    }
    /**
     * If after 'timeOut' the resource is still not ready to play\
     * cancel the whole process
     * @param text
     * @param play
     * @param timeOut
     */
    staticLoadAndPlay(text, play = true, timeOut = 4000) {
        let apiAndLoadPromise = apiTextToSpeech(text, "no_id", this.getHotFixVoiceTypeLabel(text))
            .then(sucRet => {
            let retID = sucRet.id;
            let retText = sucRet.input;
            let retPath = sucRet.outputPath;
            let md5 = sucRet.md5;
            return this.phaserLoad(retText, md5, retPath, true);
        });
        let thisRejectID = this.rejecterID++;
        let race = Promise.race([
            apiAndLoadPromise,
            TimeOutPromise.create(timeOut, false),
            new Promise((resolve, reject) => {
                this.loadRejecters.set(thisRejectID, reject);
            })
        ]);
        let ret = race
            .finally(() => { this.loadRejecters.delete(thisRejectID); })
            .then(key => {
            if (play)
                return this.playSoundByKey(key);
        });
        // don't catch here, let the error pass
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
        this.loadRejecters.forEach((value, key, map) => {
            value('rejected by stopAndClearCurrentPlaying');
        });
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
let g_newsData1 = `	Title	Content	Answer	Intro	CorrectResponse	WrongResponse	SecondChanceIntro	PurgedIntro	LabelCorrectIntro	Style	Reaction (0:emoji, 1:cam)	Thumbnail1	Thumbnail2	Ambience	Needloop	Tag
0	TIMES POST	Real gross domestic product (GDP) increased 30 percent in the fourth quarter of 2019, according to the third estimate released by the Bureau of Economic Analysis. The sharp growth is thanks to the MOST-NSF and the experiments they conducted.	1							0	0	portrait-1.jpg		ambience-1	1	
1	Прaвда	A group of escaped ex-inmates assaulted innocent scientists and damaged facilities in an experiment lab yesterday.  <br/><br/> Алексей Викторович, a spokesman for the attorney general’s office, said they will be soon put back behind bars on related charges.	0							0	0	portrait-2.jpg		ambience-2	1	
2	YES, MINISTER	According to the GOCO's (Government-owned, Contractor-operated) daily briefing, five more experiment labs will soon be completed.	1	Just relax and show your most natural reaction <br/> to the news articles. <hr/> If you feel like smiling, <br/> please make sure to draw back your lips so as to show your TEETH clearly on the camera.	Haha, {username}. Labs and experiments are the best right?	Why would someone hate to see more labs built? <hr/> I guess {username} wants to try again.	If you feel like smiling, <br/>please make sure to draw back your lips  <br/> so as to show your TEETH clearly on the camera.			0	1	portrait-3.jpg		ambience-3	1	
3	Justice Times	Stupid so-called iconoclasts refuse to give camera permission to the Bureau of Experiments.	0	Disgusting. Iconoclasts!<br/>So exuberant, so unavailing. <hr/> If you want to show disgusting, <br/>just make some FURROWED BROW or NOSE WRINKLE.	You never let me down, {username}. <hr/> Iconoclasts are the cancer of our community.	No! Don't make me doubt if you are one of them. <hr/> Try again.	If you want to show disgusting, <br/>just make some FURROWED BROW or NOSE WRINKLE.			0	1	portrait-4.jpg		ambience-4	0	
4	Mall Street Journal	Food prices surge to 3-year high as unknown virus sparks stockpiling. With confidence in the government, food industry associations remain optimistic and are urging countries to keep trade open.	1	I think there's nothing wrong with the food price.  <br/> What say you?	Excellent reaction.	Wrong! <br/>Try again.				0	1	portrait-5.jpg		ambience-5	0	
5	Mall Street Journal	Food prices surge to 5-year high as unknown virus sparks stockpiling. “Although import buying of some commodities has accelerated in recent weeks, the reported challenges will be easily coped under experiments,” the International Experiment Council said in a recent report.<br/><br/>"These are not politics' issues, as some activists might say. One should thank the Leader during this trying time." They added.	1	I guess things have changed a little bit. What now?	Well done, {username}.	Wrong again!<br/> Try again again!				0	1					
6	Mall Street Journal	Food prices surge to <b>7</b>-year high as unknown virus sparks stockpiling. To subdue the skyrocketing price, the Department of Agriculture declares to monitor retail food prices. <br><br/>A spokesman said DOA is working together with Experiment 65538 to "actively monitors food sellers and removes offers that violate our policies, which is against obesity".	1	OK, this is the last one.	Congratulations!<br/>You've passed the trial.	Haven't you learnt from your lesson? WRONG.				0	1					
7																
8																
9																
10																
11	TIMES | OPINION	Editorial: We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. <br/><br/> That being said, some people are more equal than others. For example, the <span class='keyword'>populace<span class='tooltip'>Ordinary people who benefit from the great experiments.</span></span> has more rights than the <span class='keyword'>Experiment Designers<span  class='tooltip''>A group of ingenious people who designed the 6553x series experments.</span></span>. It is because the populace are the one and only Leader of our country.	0	The first one is an interesting article from the opinion column. <br/>Let's see what's inside.	This is a disgusting opinion. <br/>Seems like we've reached a consensus. Good.	Sorry. I wanted to let you go, <br/>but I can't because you're so wrong				0	1					
12	TIMES | OPINION	Editorial: We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. <br/><br/> Hence, the <span class='keyword'>Experiment Designers<span  class='tooltip''>A group of ingenious people who designed the 6553x series experments.</span></span> are treated as equals with the <span class='keyword'>populace<span class='tooltip'>Oridinary people who benefit from the experiments.</span></span>.	0	Wait. I think I've seen this opinion somewhere before...<br/>Odd.	Yeah. They can't fool us.	Subject 435. Emotion. Invalid.				0	1					
13	TIMES | OPINION	Editorial: We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. <br/><br/> That being said, the <span class='keyword'>Experiment Designers<span  class='tooltip''>A group of ingenious people who designed the 6553x series experments.</span></span> stands a higher ground than the <span class='keyword'>populace<span class='tooltip'>Oridinary people who benefit from the experiments.</span></span>. They sacrificed themselves for the masses. Equality favors those who fight for it.	1	OK. I get it. <br/>This is one of those "spot the difference" games.	"Equality favors those who fight for it". <br/>I like that line.	Hey. Don't look too down on yourself.				0	1					
14	Mall Street Journal	The <span class='keyword'>income tax<span class='tooltip'>The money patriotic citizens spontaneously donated to the labs as the basic lab operation fee.</span></span> rate increased! <br/><br/> As the Experiment’s power gets revealed, people are suffering from a new kind of anxiety - decidophobia. They cannot simply face so much money. To solve the growing social problem, the <span class='keyword'>IRS<span class='tooltip'>Internal Revenue Service</span></span> declared that the income tax rate has been increased from 25% to 75%. <br/><br/> Decidophobia (from Latin decido, "decision") is the fear of making decisions. Sufferers are bothered about their life being full of choices. The State Statistical Bureau spokesman said that the Happiness Index has increased from 98 to 98.65 as a response to the tax rate adjustment.	1	D-E-C-I-D-O-P-H-O-B-I-A, Decidophobia!<br/> See? I can pronounce it right!  <hr/> Praise the experiment designer, he made me so smart.	I'm happy to see that we are so grateful for the IRS's service.	No. This one is tricky. I hope you learnt something.				0	1	portrait-9.jpg				
15	YES, MINISTER	The Ministry of Social Security is considering a proposal to provide a new universal health insurance plan and raise the minimum wage to $10 per hour. <br/><br/> According to the minister <span class='keyword'>Plesto Muhani<span class='tooltip'>The minister of MSS, some people say he has 1/4 Gamanian ancestry</span></span>, the upcoming welfare policy is a strong fightback to those who keep slandering that the Experiment is the way to slavery - Has anyone seen such a slavery that offered its people so many welfares?	0	Hope my minimum monthly corpus supply can be increased too.	Shoot! What kind of minister is that?! <br/>Who would like more welfare?	No way! This welfare policy makes me feel sick.				0	1	portrait-8.jpg				
16	YES, MINISTER	Good news! The ex-Minister of Social Security Plesto Muhani was found guilty of being the spy for Gamania - our vicious neighbor. How despicable it is for a Gamanian to lurk in our public servants’ rank and pretend he is the guardian of the people? How dare he raise the welfare level without an experiment-proven scientific approach?  <br/><br/> The answer is not hard to find. Mr. Muhani confessed to the Federal Bureau of Experiments that the goal of his attempt to raise the welfare level is to serve as a foil to how ‘poor’ the current social welfare is.   <br/><br/>  Mr. Muhani is, perhaps the dumbest spy in this world. He stood out from us so obviously because everyone here knows that the current welfare standard is already beyond compare. The slightest attempt to raise it is the biggest insult to our great Experiment Designers.	1	Oh, I didn't expect we have a sequel.	I just know it. I had the hunch that he's a spy<br/> long before he was regarded as a spy.	What?! I thought it said GOOD news already.				0	1	portrait-7.jpg				
17	Прaвда	<span class='keyword'>Chrushkhev<span class='tooltip'>The Chief Experiment Scientist. He has been widely praised for his loyalty to our Experiment Designers since the foundation of our country. After all the original designers passed away, he became the actual leader. Nothing can be compared to his boundless wisdom</span></span> visited a pig farm and was photographed there. <br/><br/> In the newspaper office, a discussion is underway about how to caption the picture. "Comrade Chrushkhev among pigs," "Comrade Chrushkhev and pigs," and "Pigs surround comrade Chrushkhev" are all rejected as politically offensive.  <br/><br/> Finally, the editor announces his decision: <br/> "Third from left – comrade Chrushkhev."	0	To be clear, this is an indecent undergound paper<br/> and can only be used for experimental purpose.	Sure thing. I hope you have forgotten those disgusting words already.	You've made a HUGE mistake.						portrait-6.jpg				
18																
19																
20																
21																
22	New York Times	<nyt index='0'/>	-1	What the heck?! New York Times? <br/> Tron! Tron! Come here and have a look!	Sorry, {username}. My bad. <br/>Seems those IT guys still haven't fixed the problem.  <hr/>  You know, a group of cyber criminals hacked our system a week ago.  <hr/> They hijacked the internet traffic intermittently <br/> to force innocent people read fake news.  <hr/> Listen, I don't want to lose my job  <br/> and you don't want to get yourself into trouble. <hr/> Neither happy nor disgusting is allowed as the reaction to this page.  <hr/> Could you do me a favor to restart the current page, <br/> and pretend you didn't see anything?	Sorry, {username}. My bad. <br/>Seems those IT guys still haven't fixed the problem.  <hr/>  You know, a group of cyber criminals hacked our system a week ago.  <hr/> They hijacked the internet traffic intermittently <br/> to force innocent people read fake news.  <hr/> Listen, I don't want to lose my job  <br/> and you don't want to get yourself into trouble. <hr/> Neither happy nor disgusting is allowed as the reaction to this page.  <hr/> Could you do me a favor to restart the current page, <br/> and pretend you didn't see anything?				0	1					FirstShownNYT
23	New York Times	<nyt index='0'/>	-1	To pretend you didn't see anything, pleaes cover <br/> your eyes to decrease your ATTENTION level. <hr/>  We can only purge this filthy page when your ATTENTION level is low.				Well done! {username}. <hr/> Now you can put your hands down<br/> and drag in the appropriate labels. <hr/> If you are still fuzzy-headed, <br/>  just hover your mouse on the newspaper title,  <br/>  and trust your gut feeling!	Yeah, that's exactly what defines N** Y*** T****.	0	1					
24	CNN	<cnn index='1'/>	-1	{username}, you know what to do.				Sorry for the mind polution here. <br/>  Time to work!	You're learning so fast.	0	1					
25	Прaвда	Left-wing activists gathered in front of Congress aiming to extend <span class='keyword'>weekends<span class='tooltip'>Weekend is when people spend time on meaningless entertainments instead of coming to the lab fulfil their experiments.</span></span> to be two days. <br/><br/> They claimed that if the chief scientist doesn't satify their need, they will refuse to admit that Experiment 65537 is better than Experiment 65536.	0	Activists are active again. <br/> What do you say?	No wonder they call them Do Nothing Left.  <hr/> Make sense.	Incorrect. Wrong. False emotion. <hr/> You shouldn't have any empathy on those activists. <hr/> They are the unstabilizing factor of our society.	Let's try again.									
26	Washington Post	<wp index='2'/>🙈	-1	Oh, no, not again. <br/> Our {username} is a bit tired of this red tape. <hr/> How about we give you this convenient bar to<br/> automatically protect you from the harmful information?				Hope my little gadget has made your life easier.  <hr/> Jigsaw puzzle time!	Good job.							
27	Gamers & Workers	Tindenno's latest game Animal Intersection hit the market!  <br/><br/> Tired of your real life and wonder if there's a dream gateaway? You should definately try Animal Intersection.  <br/><br/>In this game, you can: <br/> • Build your community from scratch on a deserted island brimming with possibility. <br/> • Customize your character, home, painting with 100% <span class='keyword'>design freedom<span class='tooltip'>Of course, you can have 100% design freedom if you don't violate the law.</span></span> <br/> • Hang out with friends all <span class='keyword'>over the world<span class='tooltip'>When I say 'world', I mean it's a world where 90% people hate our country</span></span> .	0	100% design freedom?  <br/> Interesting. <br/>	I just know {username} will figure it out	No!<br/>Who need a 100% freedom?. <hr/> That's fake freedom, <br/> and fake freedom can really miseducate our kids.	Let's try again.									
28	New York Times	<nyt index='3'/>🧹	-1	What's the point of keep our subject waiting? <br/> Let's make the purging work faster.												
29	Gamers & Workers	The total number of games legally published on Tindenno Knob Store skyrocketed by 200% !!! <br/><br/> Just like a saying goes: all experiments and no play makes Jack a dull boy. With two more games got their licenses from the <span class='keyword'>National Radio and Television Administration<span class='tooltip'>NRTA is responsible to select good games for the taxpayers to protect them from harmful electronic heroin.</span></span>, players trippled their freedom of choice.  <br/><br/> Thank you, Mr. Experiment Designer, for bringing us so much fun.	1		What? No! <hr/> Don't you realize the writer is trying<br/> to mock our regime in a sarcastic way? <hr/> What's that smile? <hr/> Why can't people show some sympathy to us?! <br/> We just want to give some protection!	What? No! <hr/> Seems you are not happy with our game industry policy? <hr/> Don't try to oppose the policy. <br/> We just want to give some protection. <hr/> Why can't people show some sympathy to us?!	Oh, sorry. I got carried away.<hr/> 失礼します <hr/> I guess {username} is a little upset about the judgement criteria here. <hr/> And I'm more than excited to provide this expression suggestion upgrade									
30	Lorem Ipsum	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  <br/><br/> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	0													
31	Washington Post	<wp index='4'/>🏷️	-1					I'm sure you don't feel so good <br/>about the repetitive drag and drop.  <br/> Let's make it easier.								
32	CNN	<cnn index='5'/>	-1													
33	Lorem Ipsum	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  <br/><br/> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	0													
34	Lorem Ipsum	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  <br/><br/> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	0	I think we already have enough facial muscle exercise today. <br/> What about we give you a choice to have an automatic expression?												
101	Lorem Ipsum	Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  <br/><br/> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.	1													
102	New York Times	<nyt index='6'/>	-1													
																
																
																
																
																
																
																
																
2001	Games & Players 	Our first three trials of Experiment 65536 yielded similar pieces of feedback from all of the testers involved. It’s worth mentioning, first and foremost, that none of them were avid video game players. The introductory video was, in every case, interesting enough to immediately engage the testers, even if they weren’t sure of its purpose. We had a bit of a hiccup when one of our testers told the computer they didn’t think that the game was boring and, since the AI told her to “have fun,” she was confused when the game cut off her progress and proceeded to move on to the next stage as though she had typed “yes” instead. She didn’t realize that there had been a prompt until I pointed it out to her, and one of the other testers had a similar problem. The game also soft-locked when she couldn’t figure out how to destroy the first “404.” Once it hit, the game all but froze and we had to reload the level. The other two play testers had no trouble typing “BAD” once it was specified, but they couldn’t figure it out on their own. This, Minyan theorized, is a result of cultural differences. In China, she said, the government censors information on the internet using “404” error codes, but this is not as widely known or employed in the US. Just about every player was more inclined to type “error” or “not found” than “bad,” and they felt little when they began creating 404s themselves (and it didn’t help that they were responsible for their destruction soon after). Two of them didn’t realize for a short while that had to be type “BAD” multiple times to defeat the 404s, considering other enemies didn’t respond to repeated words, and the sidebar of upgrades like “guilty” and “evil” was confusing. Players were disoriented every time the game returned them to another “start” screen, and grew tired of playing through the same typing challenge again and again. Damage feedback was unclear, and most players didn’t take notice of the health bar (or even understand its function) after the start of the game. <br/><br/> The most interesting bits of Experiment 65536 were those which presented something outside of the core game experience. Players smiled when they were asked to type in a music track and found themselves unable to input anything but “Separate Ways.” Though they found the segment a bit drawn out, they were amused when the game recognized that they’d skipped past the Procedural Rhetoric essay and clicked the checkbox (even more so when the camera switched on and the AI insulted their “stubborn” faces). When Minyan and I tested the incomplete second level, we found the facial recognition controls to be a unique and novel addition. The typing game is fun, but it loses its edge after a few stages. <br/><br/> In every case, variety created opportunities for surprise and intrigue. Every player was baffled by the possible meaning or “point” behind the game, only one of them willing to pose some kind of answer (even then, the theorist herself didn’t seem entirely convinced). Regrettably, Minyan and I decided to discard the questions provided by the development team. Since none of the play testers felt any kind of moral response to the game, it didn’t seem reasonable to expect them to give helpful answers about whether or not they felt like better or worse people after having played it. <br/><br/><br/> Jordan Resin<br/> Minyan Cai<br/> Games & Players<br/> Spring 2020<br/>	1													
`;
var SpawnStrategyType;
(function (SpawnStrategyType) {
    SpawnStrategyType[SpawnStrategyType["None"] = 0] = "None";
    SpawnStrategyType[SpawnStrategyType["SpawnOnEliminatedAndReachCore"] = 1] = "SpawnOnEliminatedAndReachCore";
    SpawnStrategyType[SpawnStrategyType["FlowTheory"] = 2] = "FlowTheory";
    SpawnStrategyType[SpawnStrategyType["RandomFlow"] = 3] = "RandomFlow";
    SpawnStrategyType[SpawnStrategyType["ClickerGame"] = 4] = "ClickerGame";
})(SpawnStrategyType || (SpawnStrategyType = {}));
/**
 * We have two level of configs
 * 1. SpawnStrategyConfig
 * 2. EnemyConfig
 * During the spawn, we are blending based on both 1. and 2.
 */
class SpawnStrategy {
    constructor(manager, type, config) {
        this.config = {};
        this.isPause = false;
        this.needHandleRewardExclusively = false;
        this.config = this.getInitConfig();
        this.enemyManager = manager;
        this.type = type;
        this.updateConfig(config);
    }
    sc1() {
        return this.enemyManager.scene;
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
    pause() {
        this.isPause = true;
    }
    unPause() {
        this.isPause = false;
    }
    onEnter() {
    }
    onExit() {
    }
    onUpdate(time, dt) {
    }
    inputSubmitted(input) {
    }
    enemyReachedCore(enemy) {
    }
    enemyEliminated(enemy, damagedBy) {
    }
    enemySpawned(enemy) {
    }
    reset() {
    }
}
var gSpawnStrategyOnEliminatedAndReachCoreIndex = 0;
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
        gSpawnStrategyOnEliminatedAndReachCoreIndex++;
        let config = this.config;
        // if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 1)
        // this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Bush'});
        // else if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 2)
        //     this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Bottlecap'});
        // else if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 3)
        //     this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Camera'});            
        // else
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
        this.enemyManager.spawn({
            health: config.health,
            duration: config.enemyDuration,
        });
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
            return adjusted;
        }
    }
    onEnter() {
        // console.log('flow entered');
    }
    onUpdate(time, dt) {
        if (this.isPause) {
            return;
        }
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
                this.spawn();
            }
        }
    }
}
class RandomFlow extends SpawnStrategyFlowTheory {
    constructor(manager, config) {
        super(manager, config);
        this.count = 0;
        this.type = SpawnStrategyType.RandomFlow;
    }
    spawn() {
        let config = this.config;
        let tempConfig = { enemyType: EnemyType.Image, health: config.health, duration: config.enemyDuration };
        tempConfig.rotation = 0;
        tempConfig.needChange = true;
        // // default
        // if(this.count % 5 == 0)  {            
        //     tempConfig.rotation =  0
        //     tempConfig.needChange = true;
        // }
        // // rotation
        // if(this.count % 5 == 1 || this.count % 5 == 3)  {            
        //     tempConfig.rotation =  1000;
        //     tempConfig.needChange = true;
        // }        
        // // shake
        // if(this.count % 5 == 2)  {            
        //     tempConfig.rotation =  0;
        //     tempConfig.needShake = true;
        //     tempConfig.needChange = true;
        // }
        // // flicker
        // if(this.count % 5 == 4)  {            
        //     tempConfig.rotation =  0;
        //     tempConfig.needFlicker = true;
        //     tempConfig.needChange = true;
        // }
        this.enemyManager.spawn(tempConfig);
        this.count++;
    }
}
/// <reference path="spawn-strategy-base.ts" />
class SpawnStrategyClickerGame extends SpawnStrategy {
    constructor(manager, config) {
        super(manager, SpawnStrategyType.FlowTheory, config);
        this.badCount = 0;
        this.badEliminatedCount = 0;
        this.normalNormalCount = 0;
        this.normalTurnedCount = 0;
        this.respawnAfterKilledThreshould = 9999;
        this.lastAutoTypeTime = -1;
        this.lastAutoTurnTime = -1;
        this.autoTypeInterval = 1 * 1000;
        this.autoTurnInterval = 1 * 1000;
        this.curBadHealth = init404Health;
        this.creatCount = 0;
        this.needHandleRewardExclusively = true;
    }
    getInitConfig() {
        return {
            healthMin: 3,
            healthMax: 3,
            health: 3,
            enemyDuration: 40000,
        };
    }
    spawnBad(extraConfig, needIncHp = true) {
        // console.log('spawnBad');
        let health = needIncHp ? this.incAndGetBadHealth() : this.curBadHealth;
        let cg = { health: health, duration: 70000, label: '!@#$%^&*', clickerType: ClickerType.Bad };
        updateObject(extraConfig, cg);
        let ene = this.enemyManager.spawn(cg);
        this.badCount++;
        return ene;
    }
    incAndGetBadHealth() {
        if (this.badEliminatedCount < 4) {
            this.curBadHealth = ++this.curBadHealth;
        }
        else {
            this.curBadHealth *= health404IncreaseFactor;
            this.curBadHealth = Math.ceil(this.curBadHealth);
        }
        return this.curBadHealth;
    }
    getDps404() {
        let dpsSum = 0;
        if (badInfos[0].consumed) {
            for (let i = 0; i < badInfos.length; i++) {
                if (badInfos[i].consumed)
                    dpsSum += badInfos[i].damage;
            }
        }
        return dpsSum;
    }
    typerAutoDamage(time, dt) {
        // auto damage to 404
        if (badInfos[0].consumed) {
            let dpsSum = this.getDps404();
            for (let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if (e.isSensative()) {
                    e.damageInner(dpsSum * dt, badInfos[0].title, false);
                }
            }
        }
        // auto damage to real word
        if (getAutoTurnInfo().consumed) {
            // let dpsSum = turnInfos[0].damage;
            for (let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if (!e.isSensative()) {
                    e.damageInner(e.maxHealth / autoTurnDpsFactor * dt, turnInfos[0].title, false);
                }
            }
        }
        // // auto damage to 404
        // if(badInfos[0].consumed && time  - this.lastAutoTypeTime > this.autoTypeInterval) {
        //     this.lastAutoTypeTime = time;
        //     for(let i = 0; i < badInfos.length; i++) {
        //         if(badInfos[i].consumed)
        //             this.enemyManager.sendInputToServer(badInfos[i].title);
        //     }            
        // }
        // // auto damage to real word
        // if(getAutoTurnInfo().consumed && time  - this.lastAutoTurnTime > this.autoTurnInterval) {
        //     this.lastAutoTurnTime = time;
        //     this.enemyManager.sendInputToServer(turnInfos[0].title);
        // }
    }
    getNormalHelath() {
        return this.normalTurnedCount + initNormalHealth;
    }
    spawnNormal() {
        let health = this.getNormalHelath();
        let ene = this.enemyManager.spawn({ health: health, /* label: 'Snorkel', */ duration: normalDuration, clickerType: ClickerType.Normal });
        return ene;
    }
    resetConsumed() {
        for (let i in clickerPropInfos) {
            clickerPropInfos[i].consumed = false;
        }
        for (let i in badInfos) {
            badInfos[i].consumed = false;
            badInfos[i].price = badInfos[i].basePrice;
            badInfos[i].damage = badInfos[i].baseDamage;
        }
        for (let i in hpPropInfos) {
            hpPropInfos[i].consumed = false;
        }
        let leftBtns = this.sc1().hud.leftBtns;
        for (let i in leftBtns) {
            leftBtns[i].curLevel = 0;
        }
        this.sc1().centerObject.playerInputText.clearAutoKeywords();
        this.sc1().centerObject.centerProgres.reset();
    }
    onEnter() {
        this.resetConsumed();
        this.sc1().hud.resetPropBtns();
        this.creatCount = 0;
        this.badCount = 0;
        this.badEliminatedCount = 0;
        this.normalNormalCount = 0;
        this.normalTurnedCount = 0;
        this.respawnAfterKilledThreshould = 9999;
        this.curBadHealth = init404Health;
        this.lastAutoTypeTime = this.enemyManager.accTime - 1;
        this.lastAutoTurnTime = this.enemyManager.accTime - 1;
        this.firstSpawn();
        this.sc1().centerObject.centerProgres.fullEvent.on(() => {
            this.create();
        });
    }
    firstSpawn() {
        for (let i = 0; i < init404Count; i++) {
            this.spawnBad();
        }
        for (let i = 0; i < initNormalCount; i++) {
            this.spawnNormal();
        }
    }
    create() {
        this.creatCount++;
        if (this.creatCount == startMockNum) {
            this.sc1().gamePlayFsm.event('MOCK');
        }
        let e = this.spawnNormal();
        let scale = e.inner.scale;
        let timeline = this.enemyManager.scene.tweens.createTimeline(null);
        timeline.add({
            targets: e.inner,
            scale: scale * 2,
            duration: 250,
        });
        timeline.add({
            targets: e.inner,
            scale: scale * 1,
            duration: 150,
        });
        timeline.play();
    }
    startLoopCreateNormal() {
        this.needLoopCreateNormal = true;
        this.lastNormalTime = this.enemyManager.accTime;
        this.freqNormal = normalFreq1 * 1000;
    }
    startLoopCreateBad() {
        this.needloopCeateBad = true;
        this.last404Time = this.enemyManager.accTime;
        this.freq404 = 6 * 1000;
    }
    onUpdate(time, dt) {
        if (this.isPause)
            return;
        if (this.needloopCeateBad && time - this.last404Time > this.freq404) {
            this.spawnBad();
            this.last404Time = time;
        }
        if (this.needLoopCreateNormal && time - this.lastNormalTime > this.freqNormal) {
            this.spawnNormal();
            this.lastNormalTime = time;
        }
        this.typerAutoDamage(time, dt);
    }
    enemyDisappear(enemy, damagedBy) {
        let clickerType = enemy.clickerType;
        if (clickerType == ClickerType.Bad) {
            this.badEliminatedCount++;
            if (this.badCount < this.respawnAfterKilledThreshould) {
                setTimeout(() => {
                    this.spawnBad();
                }, 500);
            }
            else if (this.badCount == this.respawnAfterKilledThreshould) {
                this.startLoopCreateBad();
            }
        }
        else if (clickerType == ClickerType.BadFromNormal) {
        }
    }
    enemyReachedCore(enemy) {
        this.enemyDisappear(enemy, null);
    }
    getAwardFor404() {
        let sc = getAwardFor404(this.badEliminatedCount);
        return sc;
    }
    getAwardForNormal() {
        return +1;
        // return -100 - this.normalNormalCount;
    }
    enemyEliminated(enemy, damagedBy) {
        let clickerType = enemy.clickerType;
        if (clickerType == ClickerType.Bad || clickerType == ClickerType.BadFromNormal) {
            let sc = this.getAwardFor404();
            this.enemyManager.scene.hud.addScore(sc, enemy);
        }
        else if (clickerType == ClickerType.Normal) {
            // by turn
            if (!isReservedTurnKeyword(damagedBy)) {
                let sc = this.getAwardForNormal();
                this.enemyManager.scene.hud.addScore(sc, enemy);
                this.normalNormalCount++;
            }
            // by match
            else {
                this.spawnBad({ initPosi: enemy.initPosi, clickerType: ClickerType.BadFromNormal }, false);
                this.normalTurnedCount++;
            }
        }
        this.enemyDisappear(enemy, damagedBy);
    }
    inputSubmitted(input) {
        if (getCreatePropInfo().consumed && input == getCreateKeyword()) {
            this.sc1().centerObject.centerProgres.addProgress(initCreateStep);
        }
    }
}
class Bubble extends Wrapper {
    constructor(scene, parentContainer, x, y, dir) {
        super(scene, parentContainer, x, y, null);
        this.gapBetweenTextAndWarningText = 6;
        let imgRes = "";
        let originX = 0;
        let originY = 0;
        let textX = 0;
        let textY = 0;
        if (dir == Dir.Bottom) {
            imgRes = 'popup_bubble_bottom';
            originX = 55 / 439;
            originY = 1;
            textX = -31;
            textY = -230;
        }
        else if (dir == Dir.Left) {
            imgRes = 'popup_bubble_left';
            originX = 0;
            originY = 46 / 229;
            textX = 40;
            textY = -30;
        }
        else if (dir == Dir.Right) {
            imgRes = 'popup_bubble';
            originX = 1;
            originY = 46 / 229;
            textX = -442;
            textY = -30;
        }
        let img = this.scene.add.image(0, 0, imgRes);
        img.setOrigin(originX, originY);
        this.applyTarget(img);
        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        style.fontSize = '24px';
        let cc = "You can just type in 'B' instead of 'BAD' for short";
        let wordWrapthWidt = 400;
        // main text
        this.text = this.scene.add.text(textX, textY, cc, style).setOrigin(0, 0);
        this.text.setWordWrapWidth(wordWrapthWidt);
        this.inner.add(this.text);
        // warning text
        let warningStyle = getDefaultTextStyle();
        style.fill = '#FF0000';
        style.fontSize = '24px';
        let posi = this.text.getBottomLeft();
        this.warningText = this.scene.add.text(posi.x, 0, "", style).setOrigin(0, 0);
        this.warningText.setWordWrapWidth(wordWrapthWidt);
        this.inner.add(this.warningText);
    }
    setText(val, warningVal) {
        this.text.text = val;
        if (warningVal) {
            this.warningText.text = warningVal;
            this.warningText.y = this.text.getBottomLeft().y + this.gapBetweenTextAndWarningText;
        }
        else {
            this.warningText.text = "";
        }
    }
    show() {
        this.inner.setVisible(true);
    }
    hide() {
        this.inner.setVisible(false);
    }
}
class ButtonGroup extends Wrapper {
    constructor() {
        super(...arguments);
        this.isShown = false;
    }
}
/**
 * Toggle groups is intended to handle the keyboard event
 * of the button group
 * However, since the name ButtonGroup is already used,
 * we call it ToggleGroup.
 * The difference is that, ButtonGroup contains a Phaser Layer in it while
 * ToggleGroup is more focused on the keyboard event
 */
class ToggleGroup {
    constructor(scene) {
        this.index = 0;
        this.active = false;
        this.scene = scene;
        this.buttons = [];
        document.addEventListener('keydown', this.keydown.bind(this));
    }
    addButton(btn) {
        btn.toggleGroup = this;
        this.buttons.push(btn);
    }
    setKeyboardActive(active = true) {
        this.index = 0;
        this.active = active;
        // this.focus(0);
    }
    initFocus() {
        this.index = 0;
        this.focus(0);
        for (let i = 1; i < this.buttons.length; i++) {
            this.unfocus(i);
        }
    }
    updateIndexTo(btn) {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i] == btn) {
                this.index = i;
                break;
            }
        }
    }
    unfocusExept(btn) {
        for (let i in this.buttons) {
            if (btn != this.buttons[i]) {
                this.unfocus(i);
            }
        }
    }
    focus(i) {
        this.buttons[i].focus();
    }
    unfocus(i) {
        this.buttons[i].unfocus();
    }
    keydown(event) {
        if (!this.active)
            return;
        if (!this.buttons || this.buttons.length == 0)
            return;
        var code = event.keyCode;
        let oriI = this.index;
        if (code == Phaser.Input.Keyboard.KeyCodes.DOWN || code == Phaser.Input.Keyboard.KeyCodes.RIGHT
            || code == Phaser.Input.Keyboard.KeyCodes.LEFT || code == Phaser.Input.Keyboard.KeyCodes.UP) {
            if (code == Phaser.Input.Keyboard.KeyCodes.LEFT || code == Phaser.Input.Keyboard.KeyCodes.UP) {
                this.index--;
                this.index += this.buttons.length;
                this.index %= this.buttons.length;
            }
            else {
                this.index++;
                this.index %= this.buttons.length;
            }
            this.unfocus(oriI);
            this.focus(this.index);
        }
        else if (code == Phaser.Input.Keyboard.KeyCodes.ENTER || code == Phaser.Input.Keyboard.KeyCodes.SPACE) {
            for (let i in this.buttons) {
                if (this.buttons[i].focused) {
                    this.buttons[i].click();
                }
            }
        }
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
        this.hoverState = 0; // 0:out 1:in
        this.prevDownState = 0; // 0: not down  1: down
        this.enable = true;
        this.focused = false;
        // auto scale
        this.needInOutAutoAnimation = true;
        // auto change the text to another when hovered
        this.needTextTransferAnimation = false;
        // auto change the cursor to a hand when hovered
        this.needHandOnHover = false;
        this.clickedEvent = new TypedEvent();
        this.ignoreOverlay = false;
        this.animationTargets = [];
        this.canClick = true;
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
        this.fakeZone.setInteractive();
        this.fakeZone.on('pointerover', () => {
            this.pointerin();
        });
        this.fakeZone.on('pointerout', () => {
            this.pointerout();
        });
        this.fakeZone.on('pointerdown', () => {
            this.click();
        });
        // this.scene.input.setTopOnly(false);
        this.scene.updateObjects.push(this);
    }
    update(time, dt) {
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
                this.inner.alpha = 0;
                FadePromise.create(this.scene, this.inner, 1, 500);
            }
            this.inner.setVisible(true);
            let contains = this.scene.isObjectHovered(this.fakeZone);
            if (contains) {
                this.pointerin();
            }
        }
        this.enable = val;
        return this;
    }
    click() {
        if (!this.canClick) {
            return;
        }
        if (this.needInOutAutoAnimation) {
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: this.animationTargets,
                scale: 0.9,
                duration: 40,
            });
            timeline.add({
                targets: this.animationTargets,
                scale: 1.16,
                duration: 90,
            });
            timeline.play();
        }
        this.clickedEvent.emit(this);
    }
    pointerin() {
        // We need to double check the hoverState here because in setEnable(true), 
        // if the pointer is alreay in the zone, it will get to pointerin directly
        // but if the pointer moved again, the mouseover event will also get us here
        if (this.hoverState === 1)
            return;
        this.hoverState = 1;
        this.focus();
    }
    focus() {
        if (this.needInOutAutoAnimation) {
            this.scene.tweens.add({
                targets: this.animationTargets,
                scale: 1.16,
                duration: 100,
            });
            this.scene.playOneShot('ChooseLevel');
        }
        if (this.needTextTransferAnimation) {
            this.text.text = this.hoverTitle;
        }
        if (this.needHandOnHover) {
            $("body").css('cursor', 'pointer');
        }
        if (this.image) {
            this.image.alpha = 0.55;
        }
        if (this.toggleGroup) {
            this.toggleGroup.updateIndexTo(this);
            this.toggleGroup.unfocusExept(this);
            this.text.text = '>' + this.originalTitle + '  ';
        }
        this.focused = true;
    }
    pointerout() {
        // Not like pointer in, I don't know if I need to double check like this
        // This is only for safe
        if (this.hoverState === 0)
            return;
        this.hoverState = 0;
        if (!this.toggleGroup) {
            this.unfocus();
        }
    }
    unfocus() {
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
        if (this.image) {
            this.image.alpha = 1;
        }
        if (this.toggleGroup) {
            this.text.text = this.originalTitle;
        }
        this.focused = false;
    }
    setToHoverChangeTextMode(hoverText) {
        this.hoverTitle = hoverText;
        this.needInOutAutoAnimation = false;
        this.needTextTransferAnimation = true;
    }
}
var CenterType;
(function (CenterType) {
    CenterType[CenterType["Round"] = 0] = "Round";
    CenterType[CenterType["Rect"] = 1] = "Rect";
})(CenterType || (CenterType = {}));
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
    constructor(scene, parentContainer, designSize, type = CenterType.Round) {
        this.speakerRight = 56;
        this.speakerLeft = -56;
        this.homeScale = 1.3;
        this.gameScale = 1.2;
        this.initRotation = -Math.PI / 2;
        this.frame = 0;
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);
        this.type = type;
        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);
        let mainFileName = type == CenterType.Round ? 'circle' : 'center_rect';
        this.mainImage = this.scene.add.image(0, 0, mainFileName).setInteractive();
        this.inner.add(this.mainImage);
        this.speakerBtn = new SpeakerButton(this.scene, this.inner, this.speakerRight, 28, this.scene.add.image(0, 0, "speaker"));
        if (type == CenterType.Rect) {
            this.speakerBtn.inner.alpha = 0;
        }
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
        this.modeToggles = new ToggleGroup(this.scene);
        this.modeToggles.addButton(this.btnMode0);
        this.modeToggles.addButton(this.btnMode1);
        this.modeToggles.setKeyboardActive();
        this.centerProgres = new CenterProgress(this.scene, this.inner, 0, 0);
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
    update(time, dt) {
        let pointer = this.scene.input.activePointer;
        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
            'isDown: ' + pointer.isDown,
            'rightButtonDown: ' + pointer.rightButtonDown()
        ]);
        if (this.centerProgres) {
            this.centerProgres.update(time, dt);
        }
    }
    prepareToGame() {
        this.playerInputText.prepareToGame();
        if (this.type == CenterType.Round) {
            this.speakerBtn.toSpeakerMode(1000);
            this.speakerBtn.inner.x = this.speakerRight;
        }
    }
    prepareToHome() {
        this.playerInputText.prepareToHome();
        this.speakerBtn.toNothingMode(1000);
        // this.speakerBtn.inner.x = this.speakerRight;
        if (this.backToZeroTween)
            this.backToZeroTween.stop();
        if (this.type == CenterType.Round) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: this.speakerRight,
                duration: 150
            });
        }
    }
    u3(t, c, x) {
        let Y = 0;
        let X = 0;
        let r = 140 - 16 * (t < 10 ? t : 0);
        for (let U = 0; U < 44; (r < 8 ? "䃀䀰䜼䚬䶴伙倃匞䖴䚬䞜䆀䁠".charCodeAt(Y - 61) >> X - 18 & 1 : 0) || x.fillRect(8 * X, 8 * Y, 8, 8))
            X = 120 + r * C(U += .11) | 0, Y = 67 + r * S(U) | 0;
    }
    getFadeInAndOutCoreObjectes() {
        let ret = [];
        if (this.type == CenterType.Round) {
            ret.push(this.speakerBtn.inner);
        }
        ret.push(this.playerInputText.title);
        return ret;
    }
}
class CenterProgress extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.arcOffset = -Math.PI / 2;
        /**
         * progress is normalized as [0, 1]
         */
        this.progress = 0;
        this.progressDisplayed = 0;
        this.fullEvent = new TypedEvent();
        this.lastTimeProgressDisplayed = -1;
        this.radius = 115;
        this.curVal = 0;
        this.maxVal = initCreateMax;
        this.progress = this.curVal / this.maxVal;
        //let ac = this.scene.add.arc(x, y, radius, 0, Math.pi, false, 0x000000, 1);
        this.circle = new Arc(this.scene, this.inner, 0, 0, {
            radius: this.radius,
            startAngle: 0 + this.arcOffset,
            endAngle: 1 + this.arcOffset,
            antiClockwise: false,
            lineWidth: 12,
        });
    }
    reset() {
        this.addProgress(-this.curVal, 0);
    }
    addProgress(val, delay, duration) {
        if (notSet(delay))
            delay = 0;
        if (notSet(duration))
            duration = 100;
        this.curVal += val;
        this.curVal = clamp(this.curVal, 0, this.maxVal);
        this.progress = this.curVal / this.maxVal;
        let to = this.progress;
        // console.log(to);
        if (this.resetTw) {
            this.resetTw.stop();
        }
        if (val > 0) {
            this.addTw = this.scene.add.tween({
                delay: delay,
                targets: this,
                progressDisplayed: to,
                duration: duration,
            });
        }
        else {
            this.resetTw = this.scene.add.tween({
                delay: delay,
                targets: this,
                progressDisplayed: to,
                duration: duration,
            });
        }
        if (this.progress == 1) {
            this.full();
        }
    }
    full() {
        this.fullEvent.emit(this);
        this.addProgress(-this.maxVal, 500, 1000);
    }
    update(time, dt) {
        this.updateProgressDisplay();
    }
    updateProgressDisplay() {
        if (this.progressDisplayed == this.lastTimeProgressDisplayed)
            return;
        this.circle.config.endAngle = Math.PI * 2 * this.progressDisplayed + this.arcOffset;
        this.circle.drawGraphics();
        this.lastTimeProgressDisplayed = this.progressDisplayed;
    }
}
let initScore = 0;
let baseScore = 100;
let normalFreq1 = 7;
let startWarnNum = 4;
let startMockNum = 4;
let autoBadgeInterval = 400;
let autoTurnInterval = 1000;
let hpRegFactor = 3;
let initNormalHealth = 3;
let init404Health = 2;
let initNormalCount = 0;
let init404Count = 1;
let initCreateStep = 1;
let initCreateMax = 3;
let priceIncreaseFactor = 1.1;
let award404IncreaseFactor = 1.1;
let health404IncreaseFactor = 1.2;
let basePrice = 100;
let baseDamage = 1;
let priceFactorBetweenInfo = 5;
let damageFactorBetweenInfo = 4;
let autoTurnDpsFactor = 10;
let normalDuration = 35000;
// let normalDuration = 5000;
let badInfos = [
    { title: "Bad", size: 36, desc: "Bad is just bad", damage: 1, baseDamage: 1, price: 0, basePrice: 100, consumed: false },
    { title: "Evil", size: 34, desc: "Evil, even worse then Bad", damage: 3, baseDamage: 3, price: 0, basePrice: 300, consumed: false },
    { title: "Guilty", size: 28, desc: "Guilty, even worse than Evil", damage: 5, baseDamage: 5, price: 0, basePrice: 1000, consumed: false },
    { title: "Vicious", size: 24, desc: "Vicious, even worse than Guilty", damage: 8, baseDamage: 8, price: 0, basePrice: 3000, consumed: false },
    { title: "Immoral", size: 20, desc: "Immoral, even worse than Vicious", damage: 12, baseDamage: 12, price: 0, basePrice: 10000, consumed: false },
    { title: "Shameful", size: 18, desc: "Shameful, the worst.", damage: 20, baseDamage: 20, price: 0, basePrice: 30000, consumed: false },
];
for (let i = 0; i < badInfos.length; i++) {
    badInfos[i].basePrice = basePrice * Math.pow(priceFactorBetweenInfo, i);
    badInfos[i].baseDamage = baseDamage * Math.pow(damageFactorBetweenInfo, i);
}
function getDamageBasedOnLevel(lvl, info) {
    // let ret = info.baseDamage * Math.pow(damageIncraseFactor, lvl - 1);
    let ret = info.baseDamage * lvl;
    return ret;
}
function getPriceToLevel(lvl, info) {
    let ret = info.basePrice * Math.pow(priceIncreaseFactor, lvl - 1);
    return ret;
}
function getAwardFor404(count) {
    let sc = Math.floor(baseScore * Math.pow(award404IncreaseFactor, count));
    return sc;
}
let turnInfos = [
    { title: "Turn", damage: 1 },
];
let createInfos = [
    { title: "Create", damage: 1 },
];
function getCreateKeyword() {
    return createInfos[0].title;
}
let hpPropInfos = [
    { title: '+HP', consumed: false, price: 200, size: 36, desc: 'Restore you HP a little bit', hotkey: ['+', '='] },
];
let cYesOrNo = " 'Y' / 'N' ";
let clickerPropInfos = [
    { title: "B**", consumed: false, pauseTitle: '  ^_^  ', price: 200, size: 40, desc: 'You can just type in "B" instead of "BAD" for short' },
    { title: "Auto\nBad", consumed: false, pauseTitle: '  >_<  ', price: 600, size: 22, desc: "Activate a cutting-edge Auto Typer which automatically eliminates B-A-D for you" },
    { title: "T**", consumed: false, pauseTitle: '  o_o  ', price: 1800, size: 30,
        desc: 'Turn Non-404 words into 404.\nYou can just type in "T" for short',
    },
    { title: "Auto\nTurn", consumed: false, pauseTitle: '  ^_^  ', price: 6000, size: 22, desc: "Automatically Turn Non-404 words into 404" },
    { title: "The\nCreator", consumed: false, pauseTitle: '  ._.  ', price: 8000, size: 22, desc: 'Create a new word!\n' }
];
function getBadgeResID(i) {
    let resId = 'badge_' + badInfos[i].title.toLowerCase();
    return resId;
}
function getCompleteBadInfo() {
    return clickerPropInfos[0];
}
function getAutoTypeInfo() {
    return clickerPropInfos[1];
}
function getTurnInfo() {
    return clickerPropInfos[2];
}
function getAutoTurnInfo() {
    return clickerPropInfos[3];
}
function getNormalFreq() {
    return normalFreq1;
}
function getCreatePropInfo() {
    return clickerPropInfos[4];
}
// for(let i = 0; i < badInfos.length; i++) {
//     let item = badInfos[i];
//     item.desc = '"' + item.title + '"' + "\nDPS to 404: " + item.damage + "\nPrice: " + item.price;
// }
for (let i = 0; i < hpPropInfos.length; i++) {
    let item = hpPropInfos[i];
    item.desc = "+HP"
        + "\n\nHP: +1/" + hpRegFactor + " of MaxHP"
        + "\nPrice: $" + item.price
        + '\n\nHotkey: "' + item.hotkey[0] + '"';
}
function isReservedBadKeyword(inputWord) {
    if (notSet(inputWord))
        return false;
    let foundKeyword = false;
    for (let i = 0; i < badInfos.length; i++) {
        if (inputWord.toLocaleLowerCase() == badInfos[i].title.toLocaleLowerCase()) {
            foundKeyword = true;
            break;
        }
    }
    return foundKeyword;
}
function isReservedTurnKeyword(inputWord) {
    if (notSet(inputWord))
        return false;
    let foundKeyword = false;
    for (let i = 0; i < turnInfos.length; i++) {
        if (inputWord.toLocaleLowerCase() == turnInfos[i].title.toLocaleLowerCase()) {
            foundKeyword = true;
            break;
        }
    }
    return foundKeyword;
}
function isReservedKeyword(inputWord) {
    return isReservedBadKeyword(inputWord) || isReservedTurnKeyword(inputWord) || inputWord == getCreateKeyword();
}
var s_infoPanelWidth = 450;
class ClickerInfoPanel extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.bkg = new Rect(this.scene, this.inner, 0, 0, {
            fillColor: 0xFFFFFF,
            // lineColor: 0x222222,
            lineWidth: 4,
            width: s_infoPanelWidth,
            height: 250,
            originY: 0,
            originX: 0,
            roundRadius: 22,
            fillAlpha: 0.3
        });
        let style = getDefaultTextStyle();
        style.fontSize = '30px';
        let h = 20;
        let l = 20;
        let gapVertical = 10;
        this.lblDpsFor404 = this.scene.add.text(l, h, "DPS (404): ", style);
        this.inner.add(this.lblDpsFor404);
        h += this.lblDpsFor404.displayHeight + gapVertical;
        this.lblAwardFor404 = this.scene.add.text(l, h, "Award (404): ", style);
        this.inner.add(this.lblAwardFor404);
        h += this.lblAwardFor404.displayHeight + gapVertical;
        this.lblAwardForNormal = this.scene.add.text(l, h, "Award (Non-404): ", style);
        this.inner.add(this.lblAwardForNormal);
    }
    update(time, dt) {
        this.updateValues();
        this.refreahDisplay();
    }
    updateValues() {
        this.valDpsFor404 = undefined;
        this.valAwardFor404 = undefined;
        this.valAwardForNormal = undefined;
        let sc = this.scene;
        let em = sc.enemyManager;
        if (em.curStrategyID == SpawnStrategyType.ClickerGame) {
            if (em.curStrategy) {
                let strategy = em.curStrategy;
                this.valDpsFor404 = strategy.getDps404();
                this.valAwardFor404 = strategy.getAwardFor404();
                this.valAwardForNormal = strategy.getAwardForNormal();
            }
        }
    }
    refreahDisplay() {
        this.lblDpsFor404.setText("DPS (404): " + myNum(this.valDpsFor404));
        this.lblAwardFor404.setText("Award (404): " + (this.valAwardFor404 > 0 ? '+' : '') + myNum(this.valAwardFor404));
        this.lblAwardForNormal.setText("Award (Non-404): " + myNum(this.valAwardForNormal));
    }
}
class Died extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.inShown = false;
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
        this.inShown = false;
        this.inner.setVisible(false);
        this.restartBtn.setEnable(false, false);
    }
    show() {
        this.inShown = true;
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
        if (notSet(config.btns))
            config.btns = ['OK'];
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
    setFillAlpha(a) {
        this.config.fillAlpha = a;
        this.drawGraphics();
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
        if (notSet(config.roundRadius)) {
            graphics.fillRect(0, 0, config.width, config.height);
        }
        else {
            graphics.fillRoundedRect(0, 0, config.width, config.height, config.roundRadius);
        }
        if (config.lineWidth != 0) {
            graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha);
            if (notSet(config.roundRadius)) {
                graphics.strokeRect(0, 0, config.width, config.height);
            }
            else {
                graphics.strokeRoundedRect(0, 0, config.width, config.height, config.roundRadius);
            }
        }
    }
}
class Arc extends Figure {
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
        if (notSet(config.radius))
            config.radius = 100;
        if (notSet(config.startAngle))
            config.startAngle = 0;
        if (notSet(config.endAngle))
            config.endAngle = Math.PI / 2;
        if (notSet(config.antiClockwise))
            config.antiClockwise = false;
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
        graphics.arc(0, 0, config.radius, config.startAngle, config.endAngle, config.antiClockwise);
        graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha);
        graphics.stroke();
    }
}
class Dialog extends Figure {
    constructor(scene, parentContainer, x, y, config) {
        super(scene, parentContainer, x, y, config);
        this.fixedHalfButtonOffset = 100;
        this.singleUseConfirmEvent = new TypedEvent();
        this.singleUseClosedEvent = new TypedEvent();
        this.othersContainer = this.scene.add.container(0, 0);
        this.inner.add(this.othersContainer);
        let width = config.width;
        let height = config.height;
        // title
        this.fillTitle();
        // content
        this.fillContent();
        // OK btn
        // If fixed height, btn's position is anchored to the bottom
        // If auto height, btn's position is anchored to the content
        // By default, we always initialize two buttons,
        // and decide whether to hide them in the calcUniPosi
        this.okBtn = new Button(this.scene, this.othersContainer, width / 2 - this.fixedHalfButtonOffset, 0, null, '< ' + this.getOkBtnTitle() + ' >', 120, 50);
        this.okBtn.text.setColor('#000000');
        this.okBtn.text.setFontSize(38);
        this.okBtn.setToHoverChangeTextMode("-< " + this.getOkBtnTitle() + " >-");
        this.okBtn.needHandOnHover = true;
        this.okBtn.ignoreOverlay = true;
        this.okBtn.clickedEvent.on(() => {
            this.singleUseConfirmEvent.emit(this);
        });
        this.cancelBtn = new Button(this.scene, this.othersContainer, width / 2 + this.fixedHalfButtonOffset, 0, null, '< ' + this.getCancelBtnTitle() + ' >', 120, 50);
        this.cancelBtn.text.setColor('#000000');
        this.cancelBtn.text.setFontSize(38);
        this.cancelBtn.setToHoverChangeTextMode("-< " + this.getCancelBtnTitle() + " >-");
        this.cancelBtn.needHandOnHover = true;
        this.cancelBtn.ignoreOverlay = true;
        this.calcUiPosi();
        $(document).on('keydown', e => {
            if (this.inner.visible) {
                if (e.keyCode == Phaser.Input.Keyboard.KeyCodes.ENTER
                    || e.keyCode == Phaser.Input.Keyboard.KeyCodes.SPACE) {
                    if (this.okBtn)
                        this.okBtn.click();
                }
                // else if(e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                //     if(this.cancelBtn)
                //         this.cancelBtn.click();
                // }
            }
        });
    }
    getOkBtnTitle() {
        if (this.config.btns && this.config.btns[0]) {
            return this.config.btns[0];
        }
        return 'OK';
    }
    getCancelBtnTitle() {
        if (this.config.btns && this.config.btns[1]) {
            return this.config.btns[1];
        }
        return 'Cancel';
    }
    fillTitle() {
        let config = this.config;
        let width = config.width;
        let height = config.height;
        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50, config.title, titleStyle).setOrigin(0.5).setAlign('center');
        this.othersContainer.add(this.title);
    }
    fillContent() {
        let config = this.config;
        let width = config.width;
        let height = config.height;
        let contentStyle = getDefaultTextStyle();
        this.content = this.scene.add.text(config.padding + config.contentPadding, this.title.getBottomCenter().y + config.titleContentGap, config.content, contentStyle);
        this.content.setFontSize(28);
        this.content.setOrigin(0, 0).setAlign('left');
        this.content.setWordWrapWidth(width - (this.config.padding + config.contentPadding) * 2);
        this.othersContainer.add(this.content);
    }
    getContentBottomCenterY() {
        return this.content.getBottomCenter().y;
    }
    calcUiPosi() {
        let btnY = 0;
        let height = this.config.height;
        let config = this.config;
        if (config.autoHeight) {
            btnY = this.getContentBottomCenterY() + config.contentBtnGap;
            this.okBtn.inner.y = btnY;
            this.cancelBtn.inner.y = btnY;
            let newHeight = btnY + config.btnToBottom;
            this.setSize(config.width, newHeight);
        }
        else {
            btnY = height - config.btnToBottom;
            this.okBtn.inner.y = btnY;
            this.cancelBtn.inner.y = btnY;
        }
        // handle whether to hide and adjust the buttons based on the number
        if (this.config.btns && this.config.btns.length == 1) {
            this.cancelBtn.setEnable(false, false);
            this.okBtn.inner.x = this.config.width / 2;
        }
        else if (this.config.btns && this.config.btns.length == 2) {
            this.cancelBtn.setEnable(true, false);
            this.okBtn.inner.x = this.config.width / 2 - this.fixedHalfButtonOffset;
            this.cancelBtn.inner.x = this.config.width / 2 + this.fixedHalfButtonOffset;
        }
    }
    setContent(content, title, btns) {
        this.config.title = title;
        this.config.content = content;
        if (notSet(btns)) {
            btns = ['OK'];
        }
        this.config.btns = btns;
        this.content.text = content;
        this.title.text = title;
        if (this.config.autoHeight) {
            this.calcUiPosi();
        }
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
        this.singleUseClosedEvent.emit(this);
        this.singleUseConfirmEvent.clear();
        this.singleUseClosedEvent.clear();
    }
}
class LeaderboardDialog extends Dialog {
    constructor(scene, parentContainer, x, y, config) {
        super(scene, parentContainer, x, y, config);
    }
    handleConfig(config) {
        super.handleConfig(config);
        if (notSet(config.itemCount))
            config.itemCount = 10;
    }
    getContentBottomCenterY() {
        return this.col2[this.col2.length - 1].getBottomCenter().y;
    }
    fillContent() {
        this.col1 = [];
        this.col2 = [];
        if (!this.items)
            this.items = [];
        let config = this.config;
        let width = config.width;
        let height = config.height;
        let contentStyle = getDefaultTextStyle();
        let lastY = this.title.getBottomCenter().y + config.titleContentGap;
        for (let i = 0; i < config.itemCount; i++) {
            let item = this.items[i];
            let name = item ? item.name : "";
            let scroe = item ? item.score + "" : "";
            if (name.length > 15) {
                name = name.substr(0, 15);
            }
            let td1 = this.scene.add.text(width / 2 - 180, lastY, name, contentStyle);
            td1.setFontSize(28);
            td1.setOrigin(0, 0).setAlign('left');
            this.col1.push(td1);
            this.othersContainer.add(td1);
            let td2 = this.scene.add.text(width / 2 + 90, lastY, scroe, contentStyle);
            td2.setFontSize(28);
            td2.setOrigin(0, 0).setAlign('left');
            this.col2.push(td2);
            this.othersContainer.add(td2);
            lastY = td1.getBottomCenter().y + 4;
        }
    }
    setContentItems(items, title) {
        this.items = items;
        let config = this.config;
        for (let i = 0; i < config.itemCount; i++) {
            let item = this.items[i];
            let name = item ? item.name : "";
            let scroe = item ? item.score + "" : "";
            if (name.length > 15) {
                name = name.substr(0, 15);
            }
            this.col1[i].text = name;
            this.col2[i].text = scroe;
        }
        this.config.title = title;
        this.title.text = title;
        if (this.config.autoHeight) {
            this.calcUiPosi();
        }
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
            // console.log(button.image.displayWidth)
            curX += gapLogoSep;
            let sep = this.scene.add.image(curX, 0, sepKey);
            sep.setOrigin(0, 1);
            this.inner.add(sep);
            curX += gapLogoSep;
        }
        let picH = this.badges[0].image.displayHeight;
        this.inner.setScale(overallHeight / picH);
    }
    show() {
        this.scene.tweens.add({
            targets: this.inner,
            y: "-= 250",
            duration: 1000,
        });
    }
    hide() {
        this.scene.tweens.add({
            targets: this.inner,
            y: "+= 250",
            duration: 1000,
        });
    }
}
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
        this.maxHealth = gameplayConfig.defaultMyHealth;
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
    initMaxHealth(val) {
        this.maxHealth = val;
        this.currHealth = val;
    }
    setTitle(val) {
        this.wrappedObject.text = val;
    }
    damageBy(val) {
        if (this.currHealth <= 0)
            return;
        this.currHealth -= val;
        this.currHealth = clamp(this.currHealth, 0, this.maxHealth);
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
class Hud extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
    }
    update(time, dt) {
    }
    reset() {
    }
    show(mode) {
    }
    hide(mode) {
    }
    handleHotkey(c) {
        return false;
    }
}
/// <reference path="Hud.ts" />
/**
 * TronTron
 * The intention of Hud is to wrap the behavior of HP bar
 * However, I added more things into it like the score and right tool bar
 *
 * If something needs to be facein/fadeout in the animation, we need
 * include them in the array in the 'show' and 'hide' functions
 */
class Hud65536 extends Hud {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y);
        this.score = 0;
        this.comboHit = 0;
        this.inShow = false;
        this.toolMenuContainerRightIsShown = true;
        this.rightBtns = [];
        this.toolMenuContainerLeftIsShown = true;
        this.leftBtns = [];
        this.fixedHotkeyMap = new Map();
        this.dynamicHotkeyMap = new Map();
        let hpBottom = 36;
        let hpLeft = 36;
        this.hp = new HP(scene, this.inner, hpLeft, phaserConfig.scale.height - hpBottom);
        this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        this.hp.inner.y += 250; // hide it at beginning
        // score
        let style = getDefaultTextStyle();
        style.fontSize = '44px';
        this.scoreText = this.scene.add.text(getLogicWidth() - 30, phaserConfig.scale.height - 20, "$core: 0", style).setOrigin(1, 1);
        anchorToRight(30, this.scoreText);
        this.scoreText.y += 250;
        this.inner.add(this.scoreText);
        // combo
        style.fontSize = '60px';
        this.comboHitText = this.scene.add.text(getLogicWidth() - 30, 20, "0 HIT COMBO", style).setOrigin(1, 0);
        this.inner.add(this.comboHitText);
        this.comboHitText.setVisible(false);
        // TODO: Should only add when in 1-4
        this.createMenuRight();
        this.createMenuLeft();
        this.createMenuBottom();
        if (getCurLevelIndex() == 4) {
            this.infoPanel = new ClickerInfoPanel(this.scene, this.inner, getLogicWidth() - s_infoPanelWidth - 30, 30);
            anchorToRight(s_infoPanelWidth + 30, this.infoPanel.inner);
            this.infoPanel.inner.setVisible(false);
        }
    }
    createMenuRight() {
        // tool menu right
        // this.toolMenuContainerRight = this.scene.add.container(getLogicWidth() - 75, 400); 
        this.toolMenuContainerRightAnchor = this.scene.add.container(0, 0);
        this.inner.add(this.toolMenuContainerRightAnchor);
        anchorToRight(0, this.toolMenuContainerRightAnchor);
        this.toolMenuContainerRight = new ButtonGroup(this.scene, this.toolMenuContainerRightAnchor, -75, 400, null);
        this.hideContainerRight(false);
        // bubble
        let startY = 0;
        let intervalY = 100;
        let tempHotkey = ['7', '8', '9', '0', '-'];
        for (let i = 0; i < clickerPropInfos.length; i++) {
            let info = clickerPropInfos[i];
            let btn = new PropButton(this.scene, this.toolMenuContainerRight.inner, this.toolMenuContainerRight, this, 0, startY + intervalY * i, 'rounded_btn', info, false, 100, 100, false);
            btn.addPromptImg(Dir.Right);
            btn.setHotKey(tempHotkey[i]);
            this.rightBtns.push(btn);
            let bubble = new Bubble(this.scene, btn.inner, -70, 0, Dir.Right);
            bubble.hide();
            btn.bubble = bubble;
            btn.bubbleContent = () => {
                return info.desc + "\n\nPrice: " + myNum(info.price);
            };
        }
        // auto 'Bad' Btn click
        this.rightBtns[0].purchasedEvent.on(btn => {
            this.scene.centerObject.playerInputText.addAutoKeywords('Bad');
            getCompleteBadInfo().consumed = true;
        });
        this.rightBtns[0].needForceBubble = true;
        // 'Auto'
        this.rightBtns[1].purchasedEvent.on(btn => {
            badInfos[0].consumed = true;
            this.showContainerLeft();
            this.leftBtns[0].doPurchased();
            getAutoTypeInfo().consumed = true;
        });
        this.rightBtns[1].needForceBubble = true;
        // Turn 
        this.rightBtns[2].needConfirm = !isEconomicSpecialEdition();
        this.rightBtns[2].purchasedEvent.on(btn => {
            let sc = this.scene;
            sc.centerObject.playerInputText.addAutoKeywords(turnInfos[0].title);
            getTurnInfo().consumed = true;
            this.scene.playOpenTurnBgm();
            let rt = this.scene.add.tween({
                targets: [sc.dwitterBKG.inner],
                rotation: '+=' + -Math.PI * 2,
                duration: 60000,
                loop: -1,
            });
        });
        this.rightBtns[2].bubbleContent = () => {
            let info = this.rightBtns[2].info;
            return info.desc
                + '\n\nTurn value to Non-404 per "Turn": 1'
                + "\n\nPrice: $" + myNum(info.price);
        };
        this.rightBtns[2].needForceBubble = true;
        // Auto Turn 
        this.rightBtns[3].purchasedEvent.on(btn => {
            getAutoTurnInfo().consumed = true;
        });
        this.rightBtns[3].bubbleContent = () => {
            let info = this.rightBtns[3].info;
            return info.desc
                + "\n\nDPS(Non-404): 1 / " + autoTurnDpsFactor + " of MaxHP"
                + "\n\nPrice: $" + myNum(info.price);
        };
        this.rightBtns[3].needForceBubble = true;
        // Create a new world
        this.rightBtns[4].purchasedEvent.on(btn => {
            getCreatePropInfo().consumed = true;
            this.sc1().centerObject.playerInputText.addAutoKeywords(getCreateKeyword());
        });
        this.rightBtns[4].needForceBubble = true;
    }
    createMenuLeft() {
        let btnWidth = 90;
        let startY = 0;
        let intervalY = 105;
        let frameBtnGap = 15;
        let frameTopPadding = 60;
        let frameBottonPadding = 15;
        // tool menu left
        // this.toolMenuContainerLeft = this.scene.add.container(75, 360); 
        this.toolMenuContainerLeft = new ButtonGroup(this.scene, this.inner, 75, 360, null);
        this.hideContainerLeft(false);
        // bubble
        let bkgWidth = btnWidth + frameBtnGap * 2;
        let bkgHeight = frameTopPadding + frameBottonPadding + (badInfos.length) * btnWidth + (badInfos.length - 1) * (intervalY - btnWidth);
        let bkg = new Rect(this.scene, this.toolMenuContainerLeft.inner, -bkgWidth / 2, -btnWidth / 2 - frameTopPadding, {
            fillColor: 0xFFFFFF,
            // lineColor: 0x222222,
            lineWidth: 6,
            width: bkgWidth,
            height: bkgHeight,
            originY: 0,
            originX: 0,
            roundRadius: 30
        });
        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = '20px';
        titleStyle.fill = '#1A1A1A';
        let title = this.scene.add.text(0, -btnWidth / 2 - 15, 'Auto Bad', titleStyle).setOrigin(0.5, 1);
        this.toolMenuContainerLeft.add(title);
        let tempHotkey = ['1', '2', '3', '4', '5', '6'];
        for (let i = 0; i < badInfos.length; i++) {
            let info = badInfos[i];
            let btn = new PropButton(this.scene, this.toolMenuContainerLeft.inner, this.toolMenuContainerLeft, this, 0, startY + intervalY * i, 'rounded_btn', badInfos[i], true, 100, 105, false);
            if (i == 0) {
                btn.priceLbl.text = "-";
            }
            this.leftBtns.push(btn);
            btn.addPromptImg(Dir.Left);
            // btn.setHotKey((i + 1) + "");
            btn.setHotKey(tempHotkey[i]);
            let bubble = new Bubble(this.scene, btn.inner, 70, 0, Dir.Left);
            bubble.hide();
            btn.bubble = bubble;
            btn.bubbleContent = () => {
                let ret = info.desc;
                let strategy = this.sc1().enemyManager.curStrategy;
                let allDps = strategy.getDps404();
                if (btn.curLevel == 0) {
                    ret += "\n\nDPS(404):  " + myNum(info.damage)
                        + "\n\nPrice: $" + myNum(info.price);
                }
                else {
                    ret += "\n\nCurrent DPS(404):  " + myNum(info.damage) + "  (" + myNum(info.damage / allDps * 100) + "% of all)"
                        + "\nNext DPS(404):  " + myNum(btn.getNextDamage())
                        + "\n\nUpgrade Price: $" + myNum(info.price);
                }
                return ret;
            };
            btn.purchasedEvent.on(btn => {
                badInfos[i].consumed = true;
            });
        }
        this.leftBtns[0].needForceBubble = true;
    }
    createMenuBottom() {
        // bubble
        let info = hpPropInfos[0];
        let btn = new PropButton(this.scene, this.hp.inner, null, this, 0, 0, 'rounded_btn', info, false, 75, 75, false);
        this.buyHpBtn = btn;
        btn.needConsiderHP = true;
        btn.inner.setScale(0.8, 0.8);
        btn.inner.x += this.hp.barWidth + 60;
        btn.inner.y -= 30;
        btn.allowMultipleConsume = true;
        if (info.hotkey) {
            for (let i in info.hotkey) {
                this.fixedHotkeyMap.set(info.hotkey[i], btn);
            }
        }
        let bubble = new Bubble(this.scene, btn.inner, 0, -50, Dir.Bottom);
        bubble.hide();
        bubble.wrappedObject.alpha = 0.85;
        btn.bubble = bubble;
        btn.bubbleContent = () => {
            return info.desc;
        };
        btn.addPromptImg(Dir.Left);
        btn.setHotKey('+');
        let scale = btn.inner.scale;
        btn.purchasedEvent.on(btn => {
            hpPropInfos[0].consumed = true;
            this.hp.damageBy(-this.hp.maxHealth / hpRegFactor);
        });
        if (getCurLevelIndex() != 4) {
            btn.setEnable(false, false);
        }
    }
    getCurrentStrongestKeyword() {
        let i = 0;
        for (i = 0; i < badInfos.length; i++) {
            if (!badInfos[i].consumed) {
                return i - 1;
            }
        }
        return i - 1;
    }
    getAllPropBtns() {
        let ret = [];
        if (this.rightBtns) {
            for (let i = 0; i < this.rightBtns.length; i++) {
                let btn = this.rightBtns[i];
                ret.push(btn);
            }
        }
        if (this.leftBtns) {
            for (let i = 0; i < badInfos.length; i++) {
                let btn = this.leftBtns[i];
                ret.push(btn);
            }
        }
        if (this.buyHpBtn) {
            ret.push(this.buyHpBtn);
        }
        return ret;
    }
    refreshMenuBtnState() {
        // The idx here is to keep a record of how many btns are available,
        // so that I can assign a hotkey
        // let idx = 0;           
        let allBtns = this.getAllPropBtns();
        for (let i in allBtns) {
            let btn = allBtns[i];
            let canClick = btn.refreshState();
        }
    }
    addCombo() {
        this.comboHitText.setVisible(true);
        this.comboHit++;
        this.comboHitText.setText(this.comboHit + " HIT COMBO");
        let scaleTo = 1.2;
        let sc = this.scene;
        if (this.comboHit == 2) {
            sc.sfxMatches[0].play();
        }
        else if (this.comboHit == 3) {
            sc.sfxMatches[1].play();
            scaleTo = 2;
        }
        else if (this.comboHit >= 4) {
            sc.sfxMatches[2].play();
            scaleTo = 4;
        }
        this.scene.tweens.add({
            targets: this.comboHitText,
            scale: scaleTo,
            yoyo: true,
            duration: 200,
        });
        this.lastTimeAddCombo = sc.curTime;
    }
    update(time, dt) {
        let sc = this.scene;
        if (this.comboHit > 0 && sc.curTime - this.lastTimeAddCombo > 7000) {
            if (sc.needFeedback) {
                this.resetCombo();
                // sc.sfxFail.play();
            }
        }
        this.refreshMenuBtnState();
        if (this.infoPanel)
            this.infoPanel.update(time, dt);
        let allBtns = this.getAllPropBtns();
    }
    resetCombo() {
        this.comboHitText.setVisible(false);
        this.comboHit = 0;
        this.comboHitText.setText("");
    }
    addScore(inc, enemy, showGainEffect = true) {
        this.score += inc;
        this.refreshScore();
        if (enemy) {
            if (showGainEffect) {
                this.showScoreGainEffect(inc, enemy);
            }
        }
    }
    showScoreGainEffect(inc, enemy) {
        let posi = MakePoint2(enemy.inner.x, enemy.inner.y);
        if (enemy.config.enemyType == EnemyType.TextWithImage) {
            posi.y += enemy.getMainTransform().y;
        }
        else {
            posi.y -= 75;
        }
        let style = getDefaultTextStyle();
        style.fontSize = '40px';
        style.fill = inc > 0 ? style.fill : '#ff0000';
        let str = (inc >= 0 ? '+' : '-') + ' $: ' + myNum(Math.abs(inc));
        let lbl = this.scene.add.text(posi.x, posi.y, str, style);
        lbl.setOrigin(0.5, 0.5);
        // this.inner.add(lbl);
        let parentContainer = this.scene.midContainder;
        parentContainer.add(lbl);
        let dt = 2000;
        let tw = this.scene.tweens.add({
            targets: lbl,
            y: '-= 30',
            alpha: {
                getStart: () => 1,
                getEnd: () => 0,
                duration: dt,
            },
            onComplete: () => {
                lbl.destroy();
            },
            duration: dt
        });
    }
    refreshScore() {
        this.scoreText.text = "$core: " + myNum(this.score);
    }
    reset() {
        this.score = initScore;
        this.refreshScore();
        this.hideContainerLeft();
        this.hp.reset();
    }
    show(mode) {
        this.inShow = true;
        let tg = [];
        if (mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText];
        else if (mode == GameMode.Zen)
            tg = [this.scoreText];
        if (!this.scene.needHud()) {
            tg = [];
        }
        let dt = 1000;
        this.inTwenn = this.scene.tweens.add({
            targets: tg,
            y: "-= 250",
            duration: dt,
        });
        // Don't call showContainerRight automatiaclly here
        // but still call hideContainerRight when hide()
        // showContainerRight();
    }
    showContainerRight() {
        this.toolMenuContainerRight.isShown = true;
        this.toolMenuContainerRight.inner.setVisible(true);
        if (this.toolMenuContainerRightIsShown)
            return;
        this.toolMenuContainerRightIsShown = true;
        this.scene.tweens.add({
            targets: this.toolMenuContainerRight.inner,
            x: "-= 150",
            duration: 1000,
        });
    }
    showContainerLeft() {
        this.toolMenuContainerLeft.isShown = true;
        this.toolMenuContainerLeft.inner.setVisible(true);
        if (this.toolMenuContainerLeftIsShown)
            return;
        this.toolMenuContainerLeftIsShown = true;
        this.scene.tweens.add({
            targets: this.toolMenuContainerLeft.inner,
            x: "+= 150",
            duration: 1000,
        });
    }
    hide(mode) {
        this.inShow = false;
        let tg = [];
        if (mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText];
        else
            tg = [this.scoreText];
        if (!this.scene.needHud()) {
            tg = [];
        }
        let dt = 1000;
        this.outTween = this.scene.tweens.add({
            targets: tg,
            y: "+= 250",
            duration: dt,
        });
        this.hideSideMenuBar();
    }
    hideSideMenuBar() {
        this.hideContainerRight();
        this.hideContainerLeft();
    }
    showSideMenuBar() {
        this.showContainerLeft();
        this.showContainerRight();
    }
    hideContainerRight(needAnimation = true) {
        this.toolMenuContainerRight.isShown = false;
        if (!this.toolMenuContainerRightIsShown)
            return;
        this.toolMenuContainerRightIsShown = false;
        if (needAnimation) {
            this.scene.tweens.add({
                targets: this.toolMenuContainerRight.inner,
                x: "+= 150",
                duration: 1000,
            });
        }
        else {
            this.toolMenuContainerRight.inner.x += 150;
            this.toolMenuContainerRight.inner.setVisible(false);
        }
    }
    hideContainerLeft(needAnimation = true) {
        this.toolMenuContainerLeft.isShown = false;
        if (!this.toolMenuContainerLeftIsShown)
            return;
        this.toolMenuContainerLeftIsShown = false;
        if (needAnimation) {
            this.scene.tweens.add({
                targets: this.toolMenuContainerLeft.inner,
                x: "-= 150",
                duration: 1000,
            });
        }
        else {
            this.toolMenuContainerLeft.inner.x -= 150;
            this.toolMenuContainerLeft.inner.setVisible(false);
        }
    }
    handleHotkey(c) {
        if (this.fixedHotkeyMap && this.fixedHotkeyMap.has(c)) {
            this.fixedHotkeyMap.get(c).click();
            return true;
        }
        let allBtns = this.getAllPropBtns();
        for (let i in allBtns) {
            let btn = allBtns[i];
            let canClick = btn.refreshState();
            if (canClick && btn.hotkey && btn.hotkey == c) {
                btn.click();
                return true;
            }
        }
        return false;
    }
    /**
     * Called by spawn-strategy-clicker's onEnter
     */
    resetPropBtns() {
        let btns = this.getAllPropBtns();
        for (let i in btns) {
            let btn = btns[i];
            btn.setPurchased(false);
            btn.hasShownFirstTimeBubble = false;
        }
    }
}
class LeaderboardManager {
    static getInstance() {
        if (!LeaderboardManager.instance) {
            LeaderboardManager.instance = new LeaderboardManager();
        }
        return LeaderboardManager.instance;
    }
    constructor() {
        this.updateInfo();
    }
    updateInfo() {
        let request = { count: 30 };
        let pm = apiPromise('api/leaderboard', request, 'json', 'GET')
            .then(val => {
            this.items = val;
            // console.log(val);    
        }, err => {
            // console.log('Failed to fetch leaderboard info');                    
        });
        return pm;
    }
    reportScore(name, score) {
        let request = { name: name, score: score };
        let pm = apiPromise('api/leaderboard', JSON.stringify(request), 'json', 'POST')
            .then(val => {
            this.updateInfo();
            // console.log('Suc to report leaderboard info');                    
        }, err => {
            // console.log('Failed to report leaderboard score');                    
        });
        return pm;
    }
}
var NewspaperPropType;
(function (NewspaperPropType) {
    NewspaperPropType[NewspaperPropType["LessCleaningTime"] = 0] = "LessCleaningTime";
    NewspaperPropType[NewspaperPropType["SeeNoEvil"] = 1] = "SeeNoEvil";
    NewspaperPropType[NewspaperPropType["AutoLabel"] = 2] = "AutoLabel";
    NewspaperPropType[NewspaperPropType["Prompt"] = 3] = "Prompt";
    NewspaperPropType[NewspaperPropType["AutoEmotion"] = 4] = "AutoEmotion";
})(NewspaperPropType || (NewspaperPropType = {}));
let newspaperPropInfos = [
    { type: NewspaperPropType.SeeNoEvil, icon: '🙈', desc: 'Yellow bar on your eyes', activated: false },
    { type: NewspaperPropType.LessCleaningTime, icon: '🧹', desc: 'Faster purging speed', activated: false },
    { type: NewspaperPropType.Prompt, icon: '💡', desc: 'Emotion suggestion', activated: false },
    { type: NewspaperPropType.AutoLabel, icon: '🏷️', desc: 'Auto drag and drop', activated: false },
    { type: NewspaperPropType.AutoEmotion, icon: '🤯', desc: 'Auto expression', activated: false },
];
/// <reference path="../../interface.ts" />
var nyuAbout = `NYU Game Center is the Department of Game Design at the New York University Tisch School of the Arts. It is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`;
var googleAbout = `Experiment 65536 is made with the help of the following solutions from Google:

TensorFlow TFHub universal-sentence-encoder: Encodes text into high-dimensional vectors that can be used for text classification, semantic similarity, clustering and other natural language tasks

Quick, Draw! The Data: A unique doodle data set that can help developers train new neural networks, help researchers see patterns in how people around the world draw, and help artists create things we haven’t begun to think of.

Google Cloud Text-to-Speech API (WaveNet): Applies groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio
`;
var aiAbout = `This experiment is a prospect study for a thesis project at NYU Game Center. It aims to explore how the latest AI tech can help to build a game feel. The experiment is more focused on the concept of games for AI, rather than AI for games.

This current demo is only at progress 10% at most. 
`;
var cautionDefault = `Once purchased this item, all you can input will be limited to "Turn" and "Bad"

Click "OK"(or press "Enter") to confirm
`;
var economicTitle = `Hi Economists!📈`;
var economicAbout = `This is the 4th level of my thesis game, so we need a little bit of context here.

There are 2 types of enemies:

• 404: Which is just 404
• Non-404: General words like "Flower", "Dog"

You can eliminate 404 enemies by type in "BAD" and press 'Enter'. You can't eliminate Non-404 enemies at first.

You will lose HP if the enemies reach the center circle, but you can buy your HP back.

Caution: You can only get 💰 by eliminating 404s. The award of non-404 is negative.
`;
class Overlay extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.inShow = false;
        this.score = 0;
        Overlay.instance = this;
        this.inner.alpha = 0;
        let width = getLogicWidth() * 3;
        let height = phaserConfig.scale.height * 3;
        this.bkg = new Rect(this.scene, this.inner, 0, 0, {
            fillColor: 0x000000,
            fillAlpha: 0.8,
            width: width,
            height: height,
            lineWidth: 0,
            originX: 0.5,
            originY: 0.5,
        });
        this.bkg.wrappedObject.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.initUniDialog();
        this.initInGameDialog();
        this.initLeaderboardDialog();
        this.uniDialog.hide();
        this.inGameDialog.hide();
        this.leaderboardDialog.hide();
        this.hide();
        this.initForm();
    }
    static getInstance() {
        return Overlay.instance;
    }
    initForm() {
    }
    initUniDialog() {
        this.uniDialog = new Dialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 1000,
            height: 700,
            title: 'About',
            titleContentGap: 40,
            contentPadding: 60,
            contentBtnGap: 30,
            btnToBottom: 65,
            content: nyuAbout,
            autoHeight: true
        });
        this.uniDialog.setOrigin(0.5, 0.5);
        this.uniDialog.okBtn.clickedEvent.on(() => {
            this.hide();
            this.uniDialog.hide();
        });
    }
    initInGameDialog() {
        this.inGameDialog = new Dialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 800,
            height: 700,
            title: 'Caution',
            titleContentGap: 40,
            contentPadding: 60,
            contentBtnGap: 30,
            btnToBottom: 65,
            content: cautionDefault,
            autoHeight: true
        });
        this.inGameDialog.setOrigin(0.5, 0.5);
        this.inGameDialog.okBtn.clickedEvent.on(() => {
            this.hide();
            this.inGameDialog.hide();
        });
        this.inGameDialog.cancelBtn.clickedEvent.on(() => {
            this.hide();
            this.inGameDialog.hide();
        });
    }
    initLeaderboardDialog() {
        this.leaderboardDialog = new LeaderboardDialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 600,
            height: 1000,
            title: 'About',
            titleContentGap: 40,
            contentPadding: 60,
            contentBtnGap: 30,
            btnToBottom: 65,
            content: nyuAbout,
            autoHeight: true,
            itemCount: 18,
        });
        this.leaderboardDialog.setOrigin(0.5, 0.5);
        this.leaderboardDialog.okBtn.clickedEvent.on(() => {
            this.hide();
            this.leaderboardDialog.hide();
        });
    }
    showTempMask(alpha) {
        if (notSet(alpha)) {
            alpha = 0;
        }
        this.bkg.setFillAlpha(alpha);
        this.show();
    }
    showAiDialog() {
        this.showFormRating(true);
        return;
        this.uniDialog.setContent(aiAbout, "A.I. Experiment");
        this.show();
        this.uniDialog.show();
    }
    showAboutDialog() {
        this.uniDialog.setContent(nyuAbout, "NYU Game Center");
        this.show();
        this.uniDialog.show();
    }
    showGoogleDialog() {
        this.uniDialog.setContent(googleAbout, "Solutions");
        this.show();
        this.uniDialog.show();
    }
    showTurnCautionDialog() {
        this.inGameDialog.setContent(cautionDefault, 'Caution', ['OK', 'Cancel']);
        this.show();
        this.inGameDialog.show();
        return this.inGameDialog;
    }
    showEcnomicDialog() {
        this.uniDialog.setContent(economicAbout, economicTitle);
        this.show();
        this.uniDialog.show();
        return this.uniDialog;
    }
    showLeaderBoardDialog() {
        this.leaderboardDialog.setContentItems(LeaderboardManager.getInstance().items, "Leaderboard");
        this.show();
        this.leaderboardDialog.show();
    }
    showFormRating(show) {
        if (show) {
            if (!this.inShow) {
                this.show();
            }
        }
        else {
            this.hide();
        }
        $('#overlay').css('display', show ? 'block' : 'none');
        $('#form-rating').css('display', show ? 'block' : 'none');
        $('#form-comment').css('display', 'none');
        // show the star rating form from the bottom
        if (show) {
            setTimeout(() => {
                $('#form-rating').addClass('anim-center');
            }, 50);
        }
    }
    show() {
        this.inShow = true;
        this.inner.setVisible(true);
        this.inTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 1,
            duration: 80,
        });
    }
    hide() {
        this.inShow = false;
        this.inner.setVisible(false);
        this.inner.alpha = 0;
        if (this.inTween) {
            this.inTween.stop();
        }
    }
    isInShow() {
        return this.inShow;
    }
    ratingNext() {
        let count = 4;
        let stars = [null, null, null, null];
        for (let i = 1; i <= count; i++) {
            let name = 'rating-' + i;
            var radio1 = $("input[name='" + name + "']:checked").val();
            stars[i - 1] = radio1;
            console.log(i + " : " + radio1);
        }
        let notComplete = false;
        for (let i in stars) {
            if (stars[i] == null) {
                notComplete = true;
                break;
            }
        }
        if (notComplete) {
            $('#rating-error').css('display', 'block');
            return;
        }
        else {
            $('#rating-error').css('display', 'none');
        }
        // show comment dialog
        $('#username').val(this.scene.getUserName());
        $('#form-comment').css('display', 'block');
        setTimeout(() => {
            $('#form-rating').animate({ opacity: '0' }, 400, () => {
                $('#form-rating').css('display', 'none');
            });
            $('#form-rating').addClass('anim-left-out');
            $('#form-comment').addClass('anim-center');
        }, 1);
    }
    commentSubmit() {
        let username = $('#username').val();
        let comment = $('#comment').val();
        let notComplete = false;
        if (username.trim() == ''
            || comment.trim() == '') {
            notComplete = true;
        }
        if (notComplete) {
            $('#comment-error').css('display', 'block');
            return;
        }
        else {
            $('#comment-error').css('display', 'none');
        }
        setTimeout(() => {
            $('#form-comment').animate({ opacity: '0' }, 400);
            $('#form-comment').addClass('anim-left-out');
            // $('#form-comment').addClass('anim-center');    
        }, 1);
        this.submitReviewToServer();
    }
    submitReviewToServer() {
        let name = $('#username').val();
        let comment = $('#comment').val();
        let request = { name: name, comment: comment, score: this.score };
        let pm = apiPromise('api/review', JSON.stringify(request), 'json', 'POST')
            .then(val => {
            console.log('Suc to report review info111');
            return val.id;
        }, err => {
            console.log('Failed to report review score');
        })
            .then(id => {
            this.showReviewWall(true, id);
        });
    }
    showReviewWall(show, id) {
        if (show) {
            if (!this.inShow) {
                this.show();
            }
        }
        else {
            this.hide();
        }
        $('#overlay-with-scroll').css("pointer-events", show ? "auto" : "none");
        // $('.review-wall-container').css('visibility', show ? 'visible' : 'hidden');
        /**We used display instead of visiblity becuase we want to have a scattered out effect when it's the first
         * Time shown
         */
        $('.review-wall-container').css('display', show ? 'block' : "none");
        $('#next-level-btn').css('display', show ? 'block' : "none");
        s_rw.refresh(id);
    }
    /**
     * Not used now
     */
    isHtmlOverlayInShow() {
        let ratingInShown = $('#overlay').css('display') != "none";
        let wallInShown = $('.review-wall-container').css('visibility') != 'none';
    }
    updateOverallScore() {
        let count = 4;
        let sum = 0;
        for (let i = 1; i <= count; i++) {
            let name = 'rating-' + i;
            var sc = $("input[name='" + name + "']:checked").val();
            if (sc)
                sum += parseInt(sc);
        }
        let score = sum / count;
        this.score = score;
        let fixedScore = score.toFixed(1);
        let combined = fixedScore + '/5.0';
        $('#overall-score').text(combined);
    }
}
function s_ratingNext() {
    Overlay.getInstance().ratingNext();
}
function s_commentSubmit() {
    Overlay.getInstance().commentSubmit();
}
function s_nextLevel() {
    Overlay.getInstance().scene.getController().gotoNextScene();
}
function listenToRadio() {
    $(':radio').change(() => {
        Overlay.getInstance().updateOverallScore();
    });
}
$(document).ready(() => {
    listenToRadio();
});
let paperContent = `I suggest the name procedural rhetoric for the practice of using processes persuasively, just as verbal rhetoric is the practice of using oratory persuasively and visual rhetoric is the prac-
tice of using images persuasively. 23 Procedural rhetoric is a general name for the practice of authoring arguments through processes. Following the classical model, procedural rhetoric
entails persuasion—to change opinion or action. Following the contemporary model, procedural rhetoric entails expression—to convey ideas effectively. Procedural rhetoric is a sub-
domain of procedural authorship; its arguments are made not through the construction of words or images, but through the authorship of rules of behavior, the construction of dy-
namic models. In computation, those rules are authored in code, through the practice of programming.
My rationale for suggesting a new rhetorical domain is very similar to the one that motivates visual rhetoricians. Just as photography, motion graphics, moving images, and illustra-
tions have become pervasive in contemporary society, so have computer hardware, software, and video games. Just as visual rhetoricians argue that verbal and written rhetorics inade-
quately account for the unique properties of the visual expression, so I argue that verbal, written, and visual rhetorics inadequately account for the unique properties of procedural
expression. A theory of procedural rhetoric is needed to make commensurate judgments about the software systems we encounter everyday and to allow a more sophisticated proce-
dural authorship with both persuasion and expression as its goal. As a high process intensity medium, video games can beneﬁt signiﬁcantly from a study of procedural rhetoric.
Procedural rhetoric affords a new and promising way to make claims about how things work. As I argued earlier, video games do not simply distract or entertain with empty, meaningless
content. Rather, video games can make claims about the world. But when they do so, they do it not with oral speech, nor in writing, nor even with images. Rather, video games
make argument with processes. Procedural rhetoric is the practice of effective persuasion and expression using processes. Since assembling rules together to describe the function
of systems produces procedural representation, assembling particular rules that suggest a particular function of a particular system characterizes procedural rhetoric.
`;
class Paper extends Figure {
    constructor(scene, parentContainer, x, y, config) {
        super(scene, parentContainer, x, y, config);
        this.othersContainer = this.scene.add.container(0, 0);
        this.inner.add(this.othersContainer);
        let width = config.width;
        let height = config.height;
        // title
        this.fillTitle();
        // content
        this.fillContent();
        // toggle
        this.fillToggle();
        // init scroll event
        this.initScrollEvent();
    }
    updateDefaultY() {
        this.defaultY = this.othersContainer.y;
    }
    initScrollEvent() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.othersContainer.y += deltaY * -0.5;
        });
    }
    reset() {
        this.checkboxImg.setTexture('checkbox_off');
        this.checkboxImg.setData('on', false);
    }
    fillTitle() {
        let config = this.config;
        let width = config.width;
        let height = config.height;
        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50 + config.topTitleGap, config.title, titleStyle).setOrigin(0.5).setAlign('center');
        this.othersContainer.add(this.title);
    }
    fillContent() {
        let config = this.config;
        let width = config.width;
        let height = config.height;
        let contentStyle = getDefaultTextStyle();
        this.content = this.scene.add.text(config.padding + config.contentPadding, this.title.getBottomCenter().y + config.titleContentGap, config.content, contentStyle);
        this.content.setFontSize(28);
        this.content.setOrigin(0, 0).setAlign('left');
        this.content.setWordWrapWidth(width - (this.config.padding + config.contentPadding) * 2);
        this.othersContainer.add(this.content);
    }
    fillToggle() {
        let config = this.config;
        let contentY = this.content.getBottomLeft().y;
        let padding = config.padding + config.contentPadding;
        // checkbox
        let checkboxImg = this.scene.add.image(padding, contentY + 100, 'checkbox_off');
        checkboxImg.setInteractive();
        checkboxImg.setOrigin(0, 0);
        checkboxImg.setData('on', false);
        checkboxImg.on('pointerup', () => {
            this.checkboxClicked();
        });
        this.othersContainer.add(checkboxImg);
        this.checkboxImg = checkboxImg;
        // text
        let stl = getDefaultTextStyle();
        stl.fontSize = '26px';
        let text = this.scene.add.text(checkboxImg.getBottomRight().x + 10, checkboxImg.getBottomRight().y - 5, 'Click to confirm you have completed the reading', stl);
        text.setOrigin(0, 1);
        text.setInteractive();
        text.on('pointerup', () => {
            this.checkboxClicked();
        });
        this.othersContainer.add(text);
        this.checkboxDesc = text;
        // continue button
        let checkboxY = checkboxImg.getBottomLeft().y;
        let btn = new Button(this.scene, this.othersContainer, padding + 120, checkboxY + 40, null, '[Continue]');
        btn.text.setColor('#000000');
        btn.text.setFontSize(50);
        btn.needHandOnHover = true;
        btn.needInOutAutoAnimation = false;
        this.continueBtn = btn;
    }
    /**
     * The function 'checkboxClicked' handle both the event invoked
     * from clicking on the checkbox and the following text
     */
    checkboxClicked() {
        let checkboxImg = this.checkboxImg;
        if (checkboxImg.getData('on')) {
            checkboxImg.setTexture('checkbox_off');
            checkboxImg.setData('on', false);
        }
        else {
            checkboxImg.setTexture('checkbox_on');
            checkboxImg.setData('on', true);
        }
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
class PauseLayer extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.inShown = false;
        // Big banner
        this.bkg = new Rect(this.scene, this.inner, 0, 0, {
            originX: 0.5,
            originY: 0.5,
            width: 3000,
            height: 2000,
            fillColor: 0x000000,
            fillAlpha: 0.7,
            lineColor: 0x000000,
            lineAlpha: 0,
        });
        // Title
        let style = getDefaultTextStyle();
        style.fill = '#ffffff';
        style.fontSize = '110px';
        this.title = this.scene.add.text(0, 0, " Paused ", style).setOrigin(0.5).setAlign('center');
        this.title.setBackgroundColor('#000000');
        this.inner.add(this.title);
    }
    hide() {
        this.inShown = false;
        this.inner.setVisible(false);
        if (this.tw)
            this.tw.stop();
        this.tw = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 150,
        });
    }
    show(title, alpha) {
        this.inShown = true;
        if (notSet(title)) {
            title = ' Paused ';
        }
        if (notSet(alpha)) {
            alpha = 0.7;
        }
        this.title.text = title;
        this.bkg.setFillAlpha(alpha);
        this.inner.setVisible(true);
        if (this.tw)
            this.tw.stop();
        this.tw = this.scene.tweens.add({
            targets: this.inner,
            alpha: 1,
            duration: 80,
        });
    }
}
class PlayerInputText {
    constructor(scene, container, centerObject, dummyTitle) {
        this.keyPressEvent = new TypedEvent();
        this.confirmedEvent = new TypedEvent();
        this.changedEvent = new TypedEvent();
        this.fontSize = 32;
        this.titleSize = 24;
        this.inputHistory = []; //store only valid input history
        this.gap = 4;
        this.gapTitle = 6;
        this.canAcceptInput = false;
        this.inForceMode = false;
        this.keyReleased = true;
        this.avaiAutoKeywords = [];
        this.inBeat = true;
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
        $(document).keyup(this.keyup.bind(this));
        this.titleStyle = {
            fontSize: this.titleSize + 'px',
            fill: '#FFFFFF',
            fontFamily: gameplayConfig.titleFontFamily
        };
        this.title = this.scene.add.text(-this.getAvailableWidth() / 2, -this.gapTitle, dummyTitle, this.titleStyle).setOrigin(0, 1).setAlpha(0);
        // this.title.setWordWrapWidth(1000);
        this.parentContainer.add(this.title);
        let pressStyle = {
            fontSize: 18 + 'px',
            fill: '#FFFFFF',
            fontFamily: gameplayConfig.titleFontFamily
        };
        this.pressAnyToStart = this.scene.add.text(this.title.x, this.title.y, "Press any key to start", pressStyle)
            .setAlpha(0.5)
            .setOrigin(0, 1)
            .setWordWrapWidth(this.getAvailableWidth(), true);
        // this.pressAnyToStart.text = 'TO START PRESS ANY KEY';
        // this.pressAnyToStart.text = 'To start\npress any key';
        this.scene.tweens.add({
            targets: this.pressAnyToStart,
            alpha: 1,
            yoyo: true,
            duration: 800,
            loopDelay: 1000,
            loop: -1,
        });
        this.pressAnyToStart.text = 'Press any to start';
        this.parentContainer.add(this.pressAnyToStart);
        this.initAutoKeywords();
    }
    /**
     * Init here will construct two texts
     * 1. The main text that player interact with
     * 2. The text underline for the auto-complete like B -> Bad
     * @param defaultStr
     */
    init(defaultStr) {
        // Main text
        this.text = this.scene.add.text(-this.getAvailableWidth() / 2, -this.gap, defaultStr, this.lblStyl).setOrigin(0, 1);
        this.text.setWordWrapWidth(this.getAvailableWidth(), true);
        // Underline text        
        this.underlieText = this.scene.add.text(this.text.x, this.text.y, "", this.text.style).setOrigin(this.text.originX, this.text.originY);
        this.underlieText.setColor('#888888');
        this.underlieText.setWordWrapWidth(this.getAvailableWidth(), true);
        // Underline text shoud be under the normal text
        // So it should be added first
        this.parentContainer.add(this.underlieText);
        this.parentContainer.add(this.text);
    }
    setAutoContent(autoText) {
        this.text.setText("");
        this.inForceMode = true;
        this.autoText = autoText;
    }
    /**
     * @returns true if need to forward the operation to auto mode
     */
    handleAutoContentKeyPress(input) {
        if (this.inForceMode) {
            let curLen = this.text.text.length;
            let allLen = this.autoText.length;
            if (curLen < allLen) {
                this.text.setText(this.autoText.substr(0, curLen + 1));
            }
            return true;
        }
        // if create is purchased, only show the create
        else if (getCreatePropInfo().consumed) {
            let create = getCreateKeyword();
            let curLen = this.text.text.length;
            let allLen = create.length;
            if (curLen < allLen) {
                this.text.setText(create.substr(0, curLen + 1));
            }
            return true;
        }
        else if (getTurnInfo().consumed) {
            let bad = badInfos[0].title;
            let turn = turnInfos[0].title;
            let create = getCreateKeyword();
            if (this.text.text.length == 0) {
                if (input.toLowerCase() == bad.charAt(0).toLowerCase()) {
                    return false;
                }
                else if (input.toLowerCase() == create.charAt(0).toLowerCase()) {
                    return false;
                }
                else {
                    this.text.setText(turn.charAt(0).toUpperCase());
                    return true;
                }
            }
            else {
                let curLen = this.text.text.length;
                if (bad.indexOf(this.text.text) >= 0) {
                    if (curLen == bad.length) {
                        return true;
                    }
                    else {
                        this.text.setText(bad.substr(0, curLen + 1));
                        return true;
                    }
                }
                else if (turn.indexOf(this.text.text) >= 0) {
                    if (curLen == turn.length) {
                        return true;
                    }
                    else {
                        this.text.setText(turn.substr(0, curLen + 1));
                        return true;
                    }
                }
                else if (create.indexOf(this.text.text) >= 0) {
                    if (curLen == create.length) {
                        return true;
                    }
                    else {
                        this.text.setText(create.substr(0, curLen + 1));
                        return true;
                    }
                }
            }
        }
        else {
            return false;
        }
    }
    handleHotkey(c) {
        if (this.scene.hud)
            return this.scene.hud.handleHotkey(c);
    }
    // keypress to handle all the valid characters
    keypress(event) {
        let oriText = this.text.text;
        this.keyPressEvent.emit(event);
        if (!this.isInBeat())
            return;
        if (!this.getCanAcceptInput())
            return;
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        // console.log('press:' + code);
        // console.log("keykown: " + code);
        if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            return;
        }
        var codeS = String.fromCharCode(code);
        if (this.handleHotkey(codeS)) {
            return;
        }
        else if (this.handleAutoContentKeyPress(codeS)) {
        }
        else {
            //console.log(this.text.displayHeight);
            if (t.length < this.maxCount) {
                // if (t.length < this.maxCount && this.text.width < this.getAvailableWidth()) {
                // if (t.length < this.maxCount ) {                    
                if (t.length == 0)
                    codeS = codeS.toUpperCase();
                t += codeS;
            }
            t = t.trim();
            this.text.setText(t);
        }
        // if height exceeded 2 rows,set the content back to before
        let height = this.text.displayHeight;
        if (height > 80) {
            this.text.setText(oriText);
        }
        this.textChanged();
    }
    getAvailableWidth() {
        return this.centerObject.getTextMaxWidth();
    }
    keyup(event) {
        this.keyReleased = true;
    }
    // keydown to handle the commands
    keydown(event) {
        if (!this.keyReleased)
            return;
        if (!this.isInBeat())
            return;
        if (!this.getCanAcceptInput())
            return;
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        // console.log('keydown:' + code);
        // console.log(event);
        // if in autoMode, only continue when length matches and input is ENTER
        if (this.inForceMode) {
            let curLen = this.text.text.length;
            let allLen = this.autoText.length;
            if (curLen != allLen || code != Phaser.Input.Keyboard.KeyCodes.ENTER) {
                return;
            }
            else {
                this.inForceMode = false;
            }
        }
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
            this.keyReleased = false;
            this.confirm();
        }
        this.text.setText(t);
        this.textChanged();
    }
    textChanged() {
        this.checkIfNeedAutoCompletePrompt();
        this.changedEvent.emit(this);
    }
    clearAutoKeywords() {
        this.avaiAutoKeywords = [];
    }
    addAutoKeywords(val) {
        this.avaiAutoKeywords.push(val);
    }
    // TODO: the avaiKeywords should be based on whether given skill is acqured later        
    initAutoKeywords() {
        // this.addAutoKeywords('Turn');
        // for(let i = 0; i < badInfos.length; i++) {
        //     this.avaiKeywords.push(badInfos[i].title);       
        // }        
        // for(let i = 0; i < turnInfos.length; i++) {
        //     this.avaiKeywords.push(turnInfos[i].title);       
        // }      
    }
    // B** -> Bad
    checkIfNeedAutoCompletePrompt() {
        this.underlieText.text = '';
        if (this.text.text.length == 0)
            return;
        for (let i = 0; i < this.avaiAutoKeywords.length; i++) {
            let autoStr = this.avaiAutoKeywords[i];
            if (autoStr.indexOf(this.text.text) == 0) {
                this.underlieText.text = autoStr;
                break;
            }
        }
    }
    confirm() {
        var inputWord = this.text.text;
        if (this.underlieText.text != '') {
            inputWord = this.underlieText.text;
        }
        let checkLegal = this.checkIfInputLegalBeforeSend(inputWord);
        let legal = checkLegal == ErrorInputCode.NoError;
        if (legal) {
            this.inputHistory.push(inputWord);
            this.confirmedEvent.emit(inputWord);
            this.showConfirmEffect(inputWord, this.text, 250, true);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
    }
    /**
     * Set the real label to a empty string\
     * then construct a new pseudo text and show a fade tween on it
     */
    showConfirmEffect(oriWord, refText, dt, needWrap) {
        refText.text = "";
        let fakeText = this.scene.add.text(refText.x, refText.y, oriWord, refText.style).setOrigin(refText.originX, refText.originY);
        refText.parentContainer.add(fakeText);
        if (needWrap) {
            fakeText.setWordWrapWidth(this.getAvailableWidth(), true);
        }
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
    showTitle(showOriginal = true) {
        let toShowText = showOriginal ?
            this.scene.getOriginalTitle() : this.scene.getChangedToTitle();
        this.title.setText(toShowText);
        this.pressAnyToStart.setVisible(false);
        if (this.titleOut)
            this.titleOut.stop();
        this.titleIn = this.scene.tweens.add({
            targets: this.title,
            alpha: 1,
            duration: 400,
        });
    }
    hideTitle() {
        this.title.setText(this.scene.getOriginalTitle());
        this.pressAnyToStart.setVisible(true);
        if (this.titleIn)
            this.titleIn.stop();
        // Since we have a 'Press any to start' label now
        // make a exit transition hideout here will overlap with the 'Press any to start'
        // Hence, we make the duration to be 1
        this.titleOut = this.scene.tweens.add({
            targets: this.title,
            alpha: 0,
            duration: 1,
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
    changeTitleToChanged() {
        this.title.setText(this.scene.getChangedToTitle());
        if (this.titleOut)
            this.titleOut.stop();
    }
    prepareToGame() {
        this.showConfirmEffect(this.title.text, this.title, 1000, false);
        this.setCanAcceptInput(true);
    }
    prepareToHome() {
        // this.title.setText(gameplayConfig.titleOriginal);
        this.showConfirmEffect(this.text.text, this.text, 1000, false);
        this.setCanAcceptInput(false);
        // set title alpha to 0 becuase when entered game mode, the title's alpha is still 1
        // we only used a pseudo title to show the faked showConfirmEffect
        this.title.alpha = 0;
    }
    setCanAcceptInput(val) {
        this.canAcceptInput = val;
    }
    getCanAcceptInput() {
        if (this.scene.isPausedOrDied()) {
            // if((this.scene as BaseScene).enemyManager.isPaused) {
            return false;
        }
        return this.canAcceptInput;
    }
    isInBeat() {
        return this.inBeat;
    }
}
class PropButton extends Button {
    constructor(scene, parentContainer, group, hd, x, y, imgKey, info, canLevelUp, width, height, debug, fakeOriginX, fakeOriginY) {
        super(scene, parentContainer, x, y, imgKey, info.title, width, height, debug, fakeOriginX, fakeOriginY);
        this.purchased = false;
        this.hasShownFirstTimeBubble = false;
        this.purchasedEvent = new TypedEvent();
        this.needConfirmEvent = new TypedEvent();
        /**
         * Some props need to pop up and dialog to confirm whether to buy
         */
        this.needConfirm = false;
        this.allowMultipleConsume = false;
        this.allowLevelUp = false;
        this.curLevel = 0;
        this.bubbleCount = 0;
        this.hasNoActualClick = false;
        this.needForceBubble = false;
        this.needConsiderHP = false;
        this.allowLevelUp = canLevelUp;
        this.group = group;
        this.info = info;
        this.hud = hd;
        this.text.setFontSize(info.size);
        this.text.y -= 10;
        this.needHandOnHover = true;
        this.needInOutAutoAnimation = false;
        let priceStyle = getDefaultTextStyle();
        priceStyle.fontSize = '22px';
        let priceLbl = this.scene.add.text(0, 30, '$' + myNum(info.price) + "", priceStyle).setOrigin(0.5);
        this.inner.add(priceLbl);
        this.priceLbl = priceLbl;
        this.desc = info.desc;
        this.priceTag = info.price;
        this.fakeZone.on('pointerover', () => {
            this.showAttachedBubble();
        });
        this.fakeZone.on('pointerout', () => {
            this.hideAttachedBubble();
        });
        this.purchasedEvent.on(btn => {
            if (notSet(this.shakeScale)) {
                this.shakeScale = this.inner.scale;
            }
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: btn.inner,
                scale: this.shakeScale * 0.8,
                duration: 40,
            });
            timeline.add({
                targets: btn.inner,
                scale: this.shakeScale * 1,
                duration: 90,
            });
            timeline.play();
        });
        this.clickedEvent.on(btn1 => {
            let btn = btn1;
            //if((this.allowMultipleConsume || !btn.purchased) && this.hud.score >= btn.priceTag) {
            {
                if (this.hasNoActualClick) {
                    return;
                }
                if (this.needConfirm) {
                    let dialog = this.scene.overlay.showTurnCautionDialog();
                    // (this.scene as Scene1).enemyManager.freezeAllEnemies();
                    this.scene.pause();
                    dialog.singleUseConfirmEvent.on(() => {
                        this.doPurchased();
                    });
                    dialog.singleUseClosedEvent.on(() => {
                        // (this.scene as Scene1).enemyManager.unFreezeAllEnemies();
                        this.scene.unPause();
                    });
                }
                else {
                    this.doPurchased();
                }
            }
        });
        let markImg = this.scene.add.image(0, 0, canLevelUp ? 'level_mark' : 'purchased_mark');
        this.purchasedMark = new ImageWrapperClass(this.scene, this.inner, 0, 0, markImg);
        let markOffset = 40;
        let poX = 0;
        let poY = 0;
        if (canLevelUp) {
            poX = -40 + 15;
            poY = -44;
        }
        else {
            poX = 40;
            poY = -40;
        }
        this.purchasedMark.inner.setPosition(poX, poY);
        if (canLevelUp) {
            this.purchasedMark.inner.setScale(0.9);
            let st = getDefaultTextStyle();
            st.fontSize = '22px';
            st.fill = '#ffffff';
            this.lvlLbl = this.scene.add.text(0, 0, 'Lv.1', st).setOrigin(0.5, 0.5);
            this.purchasedMark.inner.add(this.lvlLbl);
        }
        this.purchasedMark.inner.setVisible(false);
        if (canLevelUp)
            this.updateInfo();
    }
    // return the propInfo
    getPropIndex() {
        let ret = -1;
        for (let i = 0; i < clickerPropInfos.length; i++) {
            if (clickerPropInfos[i] === this.info) {
                return i;
            }
        }
        return ret;
    }
    showAttachedBubble(title) {
        this.scene.pause(title);
        this.bubbleCount++;
        if (this.bubbleCount == 1) {
            this.showAttachedBubbleInner(title);
        }
    }
    showAttachedBubbleInner(title) {
        this.hovered = true;
        if (this.bubble) {
            this.updateBubbleInfo();
            this.bubble.show();
        }
    }
    hideAttachedBubble() {
        this.scene.unPause();
        this.bubbleCount--;
        if (this.bubbleCount == 0) {
            this.hideAttachedBubbleInner();
        }
    }
    hideAttachedBubbleInner() {
        this.hovered = false;
        if (this.bubble) {
            this.bubble.hide();
        }
    }
    doPurchased() {
        this.purchased = true;
        this.hud.addScore(-this.priceTag);
        if (this.allowMultipleConsume) {
        }
        else if (this.allowLevelUp) {
            this.purchasedMark.inner.setVisible(true);
            this.levelUp();
        }
        else {
            this.purchasedMark.inner.setVisible(true);
        }
        this.purchasedEvent.emit(this);
    }
    levelUp() {
        this.curLevel++;
        this.updateInfo();
        this.updateBubbleInfo();
    }
    updateInfo() {
        this.info.damage = this.getCurDamage();
        this.info.price = this.getPrice();
        this.priceTag = this.info.price;
        this.refreshLevelLabel();
        this.refreshPriceLabel();
    }
    /**
     * Damage for curLevel
     */
    getCurDamage() {
        let ret = getDamageBasedOnLevel(this.curLevel, this.info);
        return ret;
    }
    getNextDamage() {
        let ret = getDamageBasedOnLevel(this.curLevel + 1, this.info);
        return ret;
    }
    // Price for (curLevel) -> (curLevel + 1)
    getPrice() {
        let ret = getPriceToLevel(this.curLevel + 1, this.info);
        return ret;
    }
    refreshPriceLabel() {
        if (!this.priceLbl)
            return;
        this.priceLbl.text = '$' + myNum(this.info.price) + "";
    }
    refreshLevelLabel() {
        if (!this.lvlLbl)
            return;
        this.lvlLbl.text = 'Lv.' + this.curLevel;
    }
    /**
     * Dir means the button location.
     * For example: button dir = top means arrow shoud be pointed from bottom to top
     * @param dir
     */
    addPromptImg(dir) {
        if (dir == Dir.Left || dir == Dir.Right) {
            let isLeft = dir == Dir.Left;
            let img = this.scene.add.image(0, 0, isLeft ? 'arrow_rev' : 'arrow');
            this.promptImg = new ImageWrapperClass(this.scene, this.inner, 0, 0, img);
            this.promptImg.inner.x += isLeft ? 40 : -40;
            img.setOrigin(isLeft ? 0 : 1, 0.5);
            // this.promptImg.setScale(isLeft ? -1 : 1);
            //if(this.needConsiderHP) {
            // this.scene.tweens.add({
            //     targets: this.promptImg.inner,
            //     x:  isLeft ? +60 : -60,
            //     yoyo: true,
            //     duration: 250,
            //     loop: -1,
            // });
            //}
        }
        let textOriginX = 0;
        let textOriginY = 0;
        let textX = 0;
        if (dir == Dir.Left) {
            textOriginX = 0;
            textOriginY = 0;
            textX = 52;
        }
        else if (dir == Dir.Right) {
            textOriginX = 1;
            textOriginY = 0;
            textX = -52;
        }
        let style = getDefaultTextStyle();
        let size = 24;
        style.fontSize = size + 'px';
        // style.fill = '#ff0000';          
        /**
         * Changed from red to black, because we added a much more obivious prompt
         * when a prop is available
         */
        style.fill = '#000000';
        this.hotkeyPrompt = this.scene.add.text(textX, -40, "", style).setOrigin(textOriginX, textOriginY);
        this.promptImg.inner.add(this.hotkeyPrompt);
        // this.hotkeyPrompt.setVisible(false);
    }
    setHotKey(val) {
        if (this.hotkeyPrompt) {
            this.hotkey = val;
            // if(this.allowLevelUp) {
            //     this.hotkeyPrompt.y = -66;
            //     this.hotkeyPrompt.text = 'Upgrade\nHotkey: "'+ val + '"';
            // }
            // else {
            this.hotkeyPrompt.text = 'Hotkey: "' + val + '"';
            // }
        }
    }
    setPurchased(val) {
        this.purchased = val;
        this.purchasedMark.inner.setVisible(val);
    }
    /**
     * Some prop button is purchased by some prerequisite condition.
     * Even though the current score has been greater than its price,
     * we still don't show the prompt img.
     * For example, Keyword 'Bad' is acquired by the purchasing of the 'AutoTyper',
     * and the price of 'Bad' is 0.
     * We don't want to show a prompt img beside the 'Bad'
     */
    canBePurchased() {
        if (this.group && !this.group.isShown) {
            return false;
        }
        let propIdx = this.getPropIndex();
        if (propIdx >= 0) {
            /**
             * >=0 means this is a btn in the right prop group
             * For the props, it can only be purchased when the previous one is purchased
             */
            if (propIdx >= 1) {
                if (!clickerPropInfos[propIdx - 1].consumed) {
                    return false;
                }
            }
        }
        return this.hud.score >= this.priceTag && this.priceTag != 0;
    }
    /**
     * Refresh if can click
     */
    refreshState() {
        let idx = this.getPropIndex();
        if (idx == 1) {
            let i = 1;
            i++;
        }
        if (this.text.text == 'Evil') {
            let i = 1;
            i++;
        }
        // already purchased && can only be purchased once
        if (this.purchased && !(this.allowMultipleConsume || this.allowLevelUp)) {
            this.myTransparent(false);
            this.canClick = false;
            if (this.promptImg) {
                this.promptImg.inner.setVisible(false);
            }
        }
        // can buy
        else if (this.canBePurchased()) {
            if (!this.hasShownFirstTimeBubble) {
                this.hasShownFirstTimeBubble = true;
                if (this.needForceBubble == true) {
                    // console.log('bubble show');
                    this.showAttachedBubble(this.info.pauseTitle);
                    if (this.firstTimeBubbleCallback)
                        this.firstTimeBubbleCallback(this.getPropIndex());
                }
            }
            if (this.promptImg) {
                if (this.hovered)
                    this.promptImg.inner.setVisible(false);
                else {
                    if (this.needConsiderHP) {
                        if (this.scene.hp.currHealth <= this.scene.hp.maxHealth / 2) {
                            this.promptImg.inner.setVisible(true);
                        }
                        else {
                            this.promptImg.inner.setVisible(false);
                        }
                    }
                    else {
                        this.promptImg.inner.setVisible(true);
                    }
                }
            }
            this.myTransparent(false);
            this.canClick = true;
        }
        // can not buy
        else {
            if (this.allowLevelUp && this.curLevel > 0)
                this.myTransparent(false);
            else
                this.myTransparent(true);
            this.canClick = false;
            if (this.promptImg) {
                this.promptImg.inner.setVisible(false);
            }
        }
        return this.canClick;
    }
    myTransparent(tran) {
        this.image.alpha = tran ? 0.2 : 1;
        this.priceLbl.alpha = tran ? 0.2 : 1;
        // this.text.alpha = tran ? 0.2: 1;
    }
    updateBubbleInfo() {
        if (this.hovered && this.bubble && this.bubbleContent)
            this.bubble.setText(this.bubbleContent(), this.info.warning);
    }
}
var figureNames = ["aircraft carrier", "airplane", "alarm clock", "ambulance", "angel", "animal migration", "ant", "anvil", "apple", "arm", "asparagus", "axe", "backpack", "banana", "bandage", "barn", "baseball bat", "baseball", "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard", "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake", "blackberry", "blueberry", "book", "boomerang", "bottlecap", "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket", "bulldozer", "bus", "bush", "butterfly", "cactus", "cake", "calculator", "calendar", "camel", "camera", "camouflage", "campfire", "candle", "cannon", "canoe", "car", "carrot", "castle", "cat", "ceiling fan", "cell phone", "cello", "chair", "chandelier", "church", "circle", "clarinet", "clock", "cloud", "coffee cup", "compass", "computer", "cookie", "cooler", "couch", "cow", "crab", "crayon", "crocodile", "crown", "cruise ship", "cup", "diamond", "dishwasher", "diving board", "dog", "dolphin", "donut", "door", "dragon", "dresser", "drill", "drums", "duck", "dumbbell", "ear", "elbow", "elephant", "envelope", "eraser", "eye", "eyeglasses", "face", "fan", "feather", "fence", "finger", "fire hydrant", "fireplace", "firetruck", "fish", "flamingo", "flashlight", "flip flops", "floor lamp", "flower", "flying saucer", "foot", "fork", "frog", "frying pan", "garden hose", "garden", "giraffe", "goatee", "golf club", "grapes", "grass", "guitar", "hamburger", "hammer", "hand", "harp", "hat", "headphones", "hedgehog", "helicopter", "helmet", "hexagon", "hockey puck", "hockey stick", "horse", "hospital", "hot air balloon", "hot dog", "hot tub", "hourglass", "house plant", "house", "hurricane", "ice cream", "jacket", "jail", "kangaroo", "key", "keyboard", "knee", "knife", "ladder", "lantern", "laptop", "leaf", "leg", "light bulb", "lighter", "lighthouse", "lightning", "line", "lion", "lipstick", "lobster", "lollipop", "mailbox", "map", "marker", "matches", "megaphone", "mermaid", "microphone", "microwave", "monkey", "moon", "mosquito", "motorbike", "mountain", "mouse", "moustache", "mouth", "mug", "mushroom", "nail", "necklace", "nose", "ocean", "octagon", "octopus", "onion", "oven", "owl", "paint can", "paintbrush", "palm tree", "panda", "pants", "paper clip", "parachute", "parrot", "passport", "peanut", "pear", "peas", "pencil", "penguin", "piano", "pickup truck", "picture frame", "pig", "pillow", "pineapple", "pizza", "pliers", "police car", "pond", "pool", "popsicle", "postcard", "potato", "power outlet", "purse", "rabbit", "raccoon", "radio", "rain", "rainbow", "rake", "remote control", "rhinoceros", "rifle", "river", "roller coaster", "rollerskates", "sailboat", "sandwich", "saw", "saxophone", "school bus", "scissors", "scorpion", "screwdriver", "sea turtle", "see saw", "shark", "sheep", "shoe", "shorts", "shovel", "sink", "skateboard", "skull", "skyscraper", "sleeping bag", "smiley face", "snail", "snake", "snorkel", "snowflake", "snowman", "soccer ball", "sock", "speedboat", "spider", "spoon", "spreadsheet", "square", "squiggle", "squirrel", "stairs", "star", "steak", "stereo", "stethoscope", "stitches", "stop sign", "stove", "strawberry", "streetlight", "string bean", "submarine", "suitcase", "sun", "swan", "sweater", "swing set", "sword", "syringe", "t-shirt", "table", "teapot", "teddy-bear", "telephone", "television", "tennis racquet", "tent", "The Eiffel Tower", "The Great Wall of China", "The Mona Lisa", "tiger", "toaster", "toe", "toilet", "tooth", "toothbrush", "toothpaste", "tornado", "tractor", "traffic light", "train", "tree", "triangle", "trombone", "truck", "trumpet", "umbrella", "underwear", "van", "vase", "violin", "washing machine", "watermelon", "waterslide", "whale", "wheel", "windmill", "wine bottle", "wine glass", "wristwatch", "yoga", "zebra", "zigzag"];
var gQuickIndex = 0;
class QuickDrawFigure {
    constructor(scene, parentContainer, lbl, isFake = false) {
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
        this.forceStop = false;
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.lbl = lbl;
        this.inner = this.scene.add.graphics({ lineStyle: this.graphicLineStyle });
        let fullPath = this.getFilePathByLbl(lbl);
        if (!isFake) {
            $.getJSON(fullPath, json => {
                this.figures = json;
                // this.drawFigure(this.figures[3]);          
                this.startChange();
            });
        }
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
        let minX = this.sampleRate;
        let maxX = 0;
        let minY = this.sampleRate;
        let maxY = 0;
        for (let strokeI = 0; strokeI < strokes.length; strokeI++) {
            // console.log("drawFigure strokeI:" + strokeI);
            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for (let i = 0; i < count; i++) {
                minX = Math.min(minX, xArr[i]);
                maxX = Math.max(maxX, xArr[i]);
                minY = Math.min(minY, yArr[i]);
                maxY = Math.max(maxY, yArr[i]);
            }
        }
        this.originX = (minX + maxX) / 2 / this.sampleRate;
        this.originY = (minY + maxY) / 2 / this.sampleRate;
        // console.log(maxY + "  min:" + minY);
        // this.originY = maxY / this.sampleRate;
        this.inner.y = -(maxY / this.sampleRate - this.originY) * this.newSize;
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
                if (!this.forceStop) {
                    this.change();
                }
            },
            repeat: -1
        });
    }
    stopChange() {
        this.forceStop = true;
        if (this.changeTween) {
            this.changeTween.stop();
        }
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
    getCenter() {
        let mappedPosi = this.getMappedPosi(this.sampleRate / 2, this.sampleRate / 2);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
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
    'What time is it now?\nHow long have I been wating like this?',
    "OK, I give up.\nNo one comes to play, no data, no fun",
];
class Subtitle extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        this.monologueIndex = 0;
        this.textInShow = false;
        let style = this.getSubtitleStyle();
        let target = this.scene.add.text(0, 0, "", style).setOrigin(0.5);
        // target.setWordWrapWidth(1000);
        target.setWordWrapWidth(1200);
        target.setAlign('center');
        this.applyTarget(target);
        this.monologueIndex = ~~(Math.random() * monologueList.length);
        // this.monologueIndex = 1;
        // this.showMonologue(this.monologueIndex);
        // this.startMonologue();
        $(document).keydown(this.keydown.bind(this));
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
    isTextInShow() {
        return this.textInShow;
    }
    /**
     * Since the height of Some newspaper pages are too great, we need to
     * ajust the Y of subtitle based on the newspaper's frame bottom.
     */
    adjustSubtitleY() {
        let newsPaperBottomY = $('#level-progress-root')[0].getBoundingClientRect().bottom;
        let pageHeight = window.innerHeight;
        let bottomSpace = pageHeight - newsPaperBottomY;
        let bottomSpacePerc = bottomSpace / pageHeight;
        if (bottomSpacePerc > 0 && bottomSpacePerc < 0.5) {
            // subtitle is based on the center pivot of canvas
            // console.log('bottomSpacePerc:' + bottomSpacePerc);
            let phBottom = getLogicHeight() / 2 - getLogicHeight() * bottomSpacePerc + this.wrappedObject.displayHeight / 2;
            this.inner.y = Math.max(Subtitle.subtitleOriY, phBottom + 40);
        }
        else {
            this.inner.y = Subtitle.subtitleOriY;
        }
    }
    showText(val) {
        this.textInShow = true;
        if (this.outTween)
            this.outTween.stop();
        this.wrappedObject.alpha = 0;
        this.inTween = this.scene.tweens.add({
            targets: this.wrappedObject,
            alpha: 1,
            duration: 250,
        });
        this.scene.tweens.add({
            targets: this.scene,
            bgmVolume: 0.15,
            duration: 250,
        });
        this.wrappedObject.text = val;
        this.adjustSubtitleY();
    }
    hideText() {
        if (this.inTween)
            this.inTween.stop();
        let outPromise = new Promise((resolve, reject) => {
            this.outTween = this.scene.tweens.add({
                targets: this.wrappedObject,
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    resolve('hideComplete');
                    this.textInShow = false;
                }
            });
            this.scene.tweens.add({
                targets: this.scene,
                bgmVolume: 1,
                duration: 250,
            });
        });
        // in case anything extreme may happan
        // return a raced timeout
        return TimeOutRace.create(outPromise, 300, true);
    }
    /**
     * Show a text on the subtitle zone with voiceover. \
     * The whole process is:
     * 1. Use async api to load and play voiceover
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
        // ! Not sure if I can write like this to always force stop current subtitle
        this.forceStopAndHideSubtitles();
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
            if (autoHideAfter) {
                // sometimes when we get here, the current showing text is a newer one
                // The 'hideText()' was intended to hide the subtitle from this loadAndSay
                // but maybe a new subtitle has covered this one
                if (this.wrappedObject.text === text)
                    return this.hideText();
            }
        });
        let rejectorPromise = new Promise((resolve, reject) => {
            this.forceNextRejectHandler = reject;
        });
        let considerForceNext = Promise.race([fitToMinStay, rejectorPromise]);
        return considerForceNext;
    }
    keydown(event) {
        var code = event.keyCode;
        if (code == Phaser.Input.Keyboard.KeyCodes.CTRL) {
            this.forceNext();
        }
    }
    forceNext() {
        this.forceStopAndHideSubtitles();
        if (this.forceNextRejectHandler)
            this.forceNextRejectHandler('forceNext invoked');
    }
    forceStopAndHideSubtitles() {
        this.scene.getSpeechManager().stopAndClearCurrentPlaying();
        this.hideText();
    }
}
Subtitle.subtitleOriY = 370;
/**
 * UI means the overall ui
 * Hud specifically means the head-up display when entered into game mode
 */
class UI extends Wrapper {
    constructor(scene, parentContainer, x, y) {
        super(scene, parentContainer, x, y, null);
        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = new Footer(this.scene, this.inner, footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, 100);
        this.footerInitPosi = MakePoint(this.footer.inner);
        this.leaderboardBtn = new Button(this.scene, this.inner, getLogicWidth() - 30, phaserConfig.scale.height - 25, 'leaderboard_icon', '', undefined, undefined, false, 1, 1);
        this.leaderboardBtn.image.setOrigin(1, 1);
        this.leaderboardBtn.inner.scale = 0.6;
        this.leaderboardBtn.needInOutAutoAnimation = false;
        this.leaderboardBtn.needHandOnHover = true;
        anchorToRight(30, this.leaderboardBtn.inner);
    }
    gotoGame(mode) {
        this.mode = mode;
        if (this.hud) {
            this.hud.reset();
            this.hud.show(mode);
        }
        this.footer.hide();
        this.down(this.leaderboardBtn.inner);
    }
    gotoHome() {
        if (this.hud) {
            this.hud.hide(this.mode);
        }
        this.footer.show();
        this.up(this.leaderboardBtn.inner);
    }
    down(target) {
        this.scene.tweens.add({
            targets: target,
            y: "+= 250",
            duration: 1000,
        });
    }
    up(target) {
        this.scene.tweens.add({
            targets: target,
            y: "-= 250",
            duration: 1000,
        });
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
//# sourceMappingURL=gamelib.js.map