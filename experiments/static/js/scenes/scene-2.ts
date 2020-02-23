
class Scene2 extends BaseScene {


    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);

    }

    createDwitters(parentContainer: PhContainer) {
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterRectBKG(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new Dwitter65537(this, parentContainer, 0, 0, 2400, 1400, true);        
    }

    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');
    }


    sceneAddFirstMeetGreetingActinos(s: FsmState) :FsmState {
        s.addSubtitleAction(this.subtitle, "Oh, hi there!", true)        
        .addSubtitleAction(this.subtitle, "Terminal 65537 is at your service.\n", true)
        .addSubtitleAction(this.subtitle, "Your name is needed! Human.", false).finishImmediatly()
        return s;
    }

    createCenter(parentContainer: PhContainer): CenterObject {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220), CenterType.Rect);
    }

    

    needModeSelect() {
        return false;
    }

    sceneAfterNameInput(s: FsmState) : FsmState {
        s.addSubtitleAction(this.subtitle, s => {
            return this.playerName + "? Interesting!"
        }, true, 2000, 3000, 300)
        .addSubtitleAction(this.subtitle, "THE EXPERIMENT is waiting for us. Let's get it over with.", false, null, null, 10)
        .addSubtitleAction(this.subtitle, "Which experiment do you like to take?", false, null, null, 10).setBoolCondition(o=>this.needModeSelect())
        return s;
    }

    getOriginalTitle() {
        return 'Project 65537';
    }

    getChangedToTitle() {
        return 'Project 65537'
    }

    sceneHomeTogameAnimation(s: FsmState): FsmState{
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
        ])
        return s;
    }

    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);

        

        // // Player input
        // s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
        // s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));

        // // Dead event handling
        // s.autoOn(this.hp.deadEvent, null, e => {
        //     s.event("DIED");
        // })        
    }
}