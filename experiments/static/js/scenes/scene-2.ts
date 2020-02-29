
class Scene2 extends BaseScene {


    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);

    }

    createDwitters(parentContainer: PhContainer) {
        // super.createDwitters(parentContainer);
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2400, 1400, true);        
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
        
        
    }

    showPaper(show: boolean = true) {
        $('#newspaper-layer').css('display', show? 'block' : 'none');
        $('#newspaper-page').css('visibility', show ? 'visible' : 'hidden');

        // $('#newspaper-page').animate({  borderSpacing:1 },{
        //     step: function(now, rx) {
        //         console.log('now: ' + now);
        //         // $(this).css('transform', 'scale(')
        //     },
        //     duration: 2000
        // })        

        let dt = 500;
        this.ppScaleTween = this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: dt
        })

        this.ppRotateTween = this.tweens.addCounter({
            from: 0,
            to: 360,
            duration: dt
        })        
    }

    showCam() {
        let dt = 2000;
        this.camTranslateXTween = this.tweens.addCounter({
            from: -100,
            to: 0,
            duration: dt,
            onUpdate: ()=>{
                this.camTranslateX = this.camTranslateXTween.getValue();                
            }
        })    

        this.ppTranslateXTween = this.tweens.addCounter({
            from: -50,
            to: -70,
            duration: dt
        })    
    }

    camTranslateXTween: PhTween;        
    camTranslateX: number = -100;

    ppScaleTween: PhTween;
    ppRotateTween: PhTween;
    

    ppTranslateXTween: PhTween;
    

    paperScale: number = 0;
    paperRotate: number = 0;

    paperTranslateX: number = -50;
    paperTranslateY: number = -50;
    

    camTranslateY: number = -50;

    
    
    updatePaperCSS() {

        // let updateList = [
        //     {
        //         tween: this.ppScaleTween,
        //         target: $('#affdex_elements')
        //     }
        // ]
        if(this.ppScaleTween) {
            let val = this.ppScaleTween.getValue();
            this.paperScale = val;            
        }

        if(this.ppRotateTween) {
            let val = this.ppRotateTween.getValue();
            this.paperRotate = val;            
        }

        if(this.ppTranslateXTween) {
            let val = this.ppTranslateXTween.getValue();
            this.paperTranslateX = val;
        }

        $('#affdex_elements').css('transform',`translate(${this.camTranslateX}%, ${this.camTranslateY}%)`);
        $('#newspaper-page').css('transform', `translate(${this.paperTranslateX}%, ${this.paperTranslateY}%) scale(${this.paperScale}) rotate(${this.paperRotate}deg)`);
    }

    update(time, dt) {
        super.update(time, dt);
        this.updatePaperCSS();
    }
}