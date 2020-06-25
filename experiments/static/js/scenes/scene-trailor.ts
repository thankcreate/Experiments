/// <reference path="scene-base.ts" />

declare function playYoutubeVideo(videoId);
declare var s_youtubeFinishCallback;
class SceneTrailor extends BaseScene {
    
    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {        
        super(config);        
    }

    preload() {
        super.preload();
        this.load.image('circle', 'assets/circle.png');
    }

    getVideoId() : string {
        return 'wYtwB0dpOHc';
    }

    create() {
        deleteAllCookie();

        super.create();
        this.createYoutubeVideo();
        this.initNormalGameFsm();     

        this.anyKeyEvent.on((s)=>{
            playYoutubeVideo(this.getVideoId());
            $('#yb-player').css('visibility', 'visible');
            this.overlay.showTempMask();
        });

        this.subtitle.inner.alpha = 0;
        let offsetX = getLogicWidth() * 11.8 / 100;
        let offsetY = getLogicHeight() * 0/ 100;
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

        s_youtubeFinishCallback = ()=>{
            this.getController().gotoNextScene();
        };
    }

    initNormalGameFsm() {        
        this.updateObjects.push(this.gamePlayFsm);
    }

    forceDirectIntoGame() {
        return true;
    }

    needChangeUiWhenIntoGame(): boolean {
        return false;
    }
    
    initStNormalDefault() {
        // let state = this.normalGameFsm.getState("Default");
        // state.addAction(s=>{
        //     this.confirmCount = 0;
        // })
        // state.addEventAction('START');
    }    

    camAllowed = false;
    initStStart() {
        let state = this.gamePlayFsm.getState("Start");
       
    }

    getGamePlayFsmData(): IFsmData {
        return normal_1_0;
    }

    needHud() : boolean{
        return false;
    }   


    sceneHomeTogameAnimation(s: FsmState): FsmState{
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
        ])
        return s;
    }
}