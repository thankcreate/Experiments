

/**
 * Game Mode is what you choose from home mode select
 */
enum GameMode {
    Normal,
    Zen
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

class BaseScene extends Phaser.Scene {

    updateObjects: Updatable[] = [];

    needFeedback: boolean = false;


    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;

    /**
     * The bgm is not necessarily loaded here
     * It's just a reference to the active bgm
     */
    bgm: Phaser.Sound.BaseSound;

    /**
     * container is aligned to the center of canvas
     */
    container: PhContainer;

    /**
     * subtitleContainer 
     * aligned to the center
     */
    subtitleContainer: PhContainer;

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

   
    playerInput: PlayerInputText;
    centerObject: CenterObject;

    overlay: Overlay;

    mainFsm: Fsm;
    gamePlayFsm: Fsm;
    zenFsm: Fsm;

    dwitterCenter: Dwitter;
    dwitterBKG: Dwitter;

    initCenterDwitterScale: number;

    subtitle: Subtitle;
    backBtn: Button;

    ui: UI;

    died: Died;
    pauseLayer: PauseLayer;

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

    
    anyKeyEvent: TypedEvent<string> = new TypedEvent();

    get hud() {
        return this.ui.hud;
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {        
        super(config);

        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };                
    }

    get hp(): HP {
        return this.ui.hud.hp;
    }

    preload() {
        
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
        this.load.image('popup_bubble_bottom', 'assets/popup_bubble_bottom.png');
        this.load.image('checkbox_on', 'assets/checkbox_on.png');
        this.load.image('checkbox_off', 'assets/checkbox_off.png');

        this.load.image('rect_button', 'assets/rect_button.png');
        
        this.load.audio("sfx_match_1", "assets/audio/Match_1.wav");
        this.load.audio("sfx_match_2", "assets/audio/Match_2.wav");
        this.load.audio("sfx_match_3", "assets/audio/Match_3.wav");        

        this.load.image('purchased_mark', "assets/purchased_mark.png")
        this.load.image('level_mark', "assets/level_mark.png")
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

    createContainerMain() {
    }

    postCreate(){
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

    createCenter(parentContainer: PhContainer): CenterObject {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220));
    }

    createDwitters(parentContainer: PhContainer) {
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
        this.subtitle = new Subtitle(this, this.subtitleContainer, 0, 370);



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
        this.zenFsm = new Fsm(this, this.getZenFsm())
        this.initMainFsm();
  
        // Sub FSM: normal game


        this.postCreate();

        // initVoiceType
        this.initVoiceType();
    }

    createHud(parentContainer: PhContainer) {
        return null;
    }

    makeGamePlayFsm() : Fsm {
        return new Fsm(this, this.getGamePlayFsmData());
    }


    initVoiceType(){
        this.getSpeechManager().setVoiceType(VoiceType.Voice65536);
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

        this.updateObjects.forEach(e=>{
            e.update(time, dt);
        });    

        
        this.curTime =  time;
        dt = dt / 1000;
        // console.log(1/dt);



        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);
        this.subtitleContainer.setPosition(w / 2, h / 2);
        this.midContainder.setPosition(w / 2, h / 2);
        this.overlayContainer.setPosition(w / 2, h / 2);

        
        this.centerObject.update(time, dt);
        if(this.hud) {
            this.hud.update(time, dt);
        }        
    }
    
    getMainFsmData(): IFsmData {
        return mainFsm;
    }

    getGamePlayFsmData(): IFsmData {
        //normalGameFsm
        return null;
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
        state.setOnExit(s=>{
            this.centerObject.playerInputText.pressAnyToStart.setVisible(false);
        })
        state.setAsStartup().addOnEnter(s => {
            this.addCounter(Counter.IntoHome);
            this.centerObject.playerInputText.pressAnyToStart.setVisible(true);
            this.subtitle.startMonologue();
            this.dwitterBKG.toAutoRunMode();
            this.dwitterBKG.toAutoRunMode();

            LeaderboardManager.getInstance().updateInfo();


            let mainImage = this.centerObject.mainImage;

            s.autoOn($(document), 'keypress', ()=>{
                if(this.overlay.inShow){
                    return;
                }
                this.homeEnterInvoked(s);
            });

            s.autoSafeInOutClick(mainImage,
                e => {
                    this.centerObject.playerInputText.showTitle();
                    this.dwitterBKG.toStaticMode();
                },
                e => {
                    this.centerObject.playerInputText.hideTitle();
                    this.dwitterBKG.toAutoRunMode();
                },
                e => {
                    this.homeEnterInvoked(s);
                });
        });
    }

    homeEnterInvoked(s: FsmState) {        
        this.centerObject.playerInputText.changeTitleToChanged();

        if(this.needChangeUiWhenIntoGame())
            this.dwitterBKG.toStaticMode();
        this.subtitle.stopMonologue();
        
        if(this.forceDirectIntoGame()) {
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

    forceDirectIntoGame(): boolean {
        return false;
    }

    sceneAddFirstMeetGreetingActinos(s: FsmState) :FsmState {
        s.addSubtitleAction(this.subtitle, "Default greeting!", true)                
        return s;
    }


    initStFirstMeet() {
        
        let state = this.mainFsm.getState("FirstMeet");

        state.addAction(s=>{
            this.centerObject.playerInputText.showTitle();            
        })
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
            s.autoOn($(document), 'keypress', ()=>{
                this.playOneShot('TypeInName');
            })

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
        .addDelayAction(this, 800)
        this.sceneAfterNameInput(state)
        .addFinishAction();
    }

    sceneAfterNameInput(s: FsmState) : FsmState {
        s.addSubtitleAction(this.subtitle, s => {
            return this.playerName + "? That sounds good."
        }, true, 2000, 3000, 300)
        .addSubtitleAction(this.subtitle, "I know this is a weird start, but there's no time to explain.", false, null, null, 10)
        .addSubtitleAction(this.subtitle, "Which experiment do you like to take?", false, null, null, 10).setBoolCondition(o=>this.needModeSelect())
        return s;
    }

    initStSecondMeet() {
        let state = this.mainFsm.getState("SecondMeet");
        state
            .addSubtitleAction(this.subtitle, s=>{               
                return 'Welcome back! ' + this.getUserName() ;
            }, false, null, 1000, 0)
        
        if(this.needModeSelect()) {
            state.finishImmediatly();
        }
        
        state.addFinishAction()
    }

    needModeSelect() : boolean{
        return true;
    }

    playOneShot(eventName: string) {
        FmodManager.getInstance().playOneShot(eventName);                
    }

    initStModeSelect() {
        //* Enter Actions
        let state = this.mainFsm.getState("ModeSelect");

        state
            // Hide content of centerObject
            .addAction(() => {
                if(this.needModeSelect()) {
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
            .addAction((s: FsmState, result, resolve, reject) => {
                if(this.needModeSelect()) {
                    this.centerObject.btnMode0.setEnable(true, true);
                    this.centerObject.btnMode1.setEnable(true, true);
                    this.centerObject.modeToggles.initFocus();
    
    
                    s.autoOn(this.centerObject.btnMode0.clickedEvent, null, () => {
                        this.setMode(GameMode.Normal);
                        s.removeAutoRemoveListners();  // in case the player clicked both buttons quickly
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
            .addSubtitleAction(this.subtitle, 'Good choice', true, 2000, 1000, 100).setBoolCondition(o => this.firstIntoHome() && this.needModeSelect())
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
            .addDelayAction(this, 200).setBoolCondition(o=>!this.needModeSelect())
            // 'Voiceover: Normal Mode Start'
            this.sceneAddModeStartAction(state)
            .addFinishAction();
    }

    sceneAddModeStartAction(s: FsmState) : FsmState {
        s.addSubtitleAction(this.subtitle, s => { return (this.mode === GameMode.Normal ? 'Normal' : 'Zen') + ' mode, start!' }
            , true, null, null, 1)
        return s;
    }


    needChangeUiWhenIntoGame(): boolean {
        return true;
    }

    sceneHomeTogameAnimation(s: FsmState): FsmState{
        return s;
    }

    initStHomeToGameAnimation() {
        
        let state = this.mainFsm.getState("HomeToGameAnimation")
        state.addAction(s => {
            if(this.needChangeUiWhenIntoGame())
                this.ui.gotoGame(this.mode);
        })
        state.addAction(s=>{
            this.playOneShot('GameStart');
        })
        this.sceneHomeTogameAnimation(state);
        state.addDelayAction(this, 600)
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
            if(this.hud) {
                this.hud.reset();
            }            

            // Back
            if(this.needChangeUiWhenIntoGame())
                this.backBtn.setEnable(true, true);

            s.autoOn($(document), 'keydown', e => {
                if (!this.overlay.isInShow() && e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                    s.event("BACK_TO_HOME");   // <-------------
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
            })

        state.setOnExit(s => {
            this.gamePlayFsm.stop();
            this.zenFsm.stop();
            
            if(this.ui.hud)
                LeaderboardManager.getInstance().reportScore(this.playerName, this.ui.hud.score);
            // Stop all subtitle and sounds
            this.subtitle.forceStopAndHideSubtitles();
            this.gamePlayExit();
        })
    }

    /**
     * Event: BACK_TO_HOME sent by backBtn (everlasting)
     * Event: RESTART sent by restartBtn
     */
    initStDied() {
        let state = this.mainFsm.getState("Died");
        state.addAction((s, result, resolve, reject) => {
            this.sceneEnterDied(s, result, resolve, reject);
        })

        state.setOnExit(() => {
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
        })
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

    setMode(mode: GameMode) {
        this.mode = mode;
    }

    setEntryPoint(ep: EntryPoint) {
        this.entryPoint = ep;
    }

    playAsBgm(sound: PhSound) {
        this.bgm = sound;
        this.bgm.play('', {loop: true});        
    }

        
    pauseCounter = 0;
    pause(title?: string, alpha?: number) {
        this.pauseCounter++;
        // console.log('pause: ' + this.pauseCounter);
        if(this.pauseCounter == 1) {
            this.pauseInner(title, alpha);
        }        
    }

    /**
     * Don't call directly.
     * @param title 
     * @param alpha 
     */
    pauseInner(title?: string, alpha?: number) {
        this.pauseLayer.show(title, alpha);        
    }

    unPause() {
        this.pauseCounter--;
        // console.log('unPause: ' + this.pauseCounter);
        if(this.pauseCounter == 0) {
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
        if(this.playerName.length == 0) {
            this.playerName = getCookie('name');
        }
    }

    gamePlayExit() {

    }

    getUserName() {
        let un = getUserName();    
        return un;
    }   

    needHud() : boolean{
        return true;
    }    

    isPausedOrDied() {
        return this.pauseLayer.inShown || this.died.inShown;
    }


    //
    
    getController(): Controller {
        let controller: Controller = <Controller> this.scene.get("Controller");
        return controller;
    }

    getSpeechManager() : SpeechManager {
        return this.getController().speechManager;
    }

    playSpeech(text: string, timeOut: number = 4000) : Pany {
        let controller: Controller = <Controller> this.scene.get("Controller");
        return controller.playSpeechInController(text, timeOut);
    }

    /**
     * The hover state check here take overlapping into consideration
     * Only return true if there is no other interactive object above it.
     * @param target 
     */
    isObjectHovered(target: PhGO) {
        if(notSet(target)) 
            return false;

        return this.getHoverTopMostObject() === target;
    }

    getHoverTopMostObject(): PhGO {
        let mp = this.input.mousePointer;
        let obs = this.input.hitTestPointer(mp);
        let sorted = this.input.sortGameObjects(obs);
        return sorted[0];
    }


    getOriginalTitle() {
        return 'Project 65536';
    }

    getChangedToTitle() {
        return 'Project 65536'
    }
    
}

