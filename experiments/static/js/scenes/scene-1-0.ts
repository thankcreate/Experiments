declare function playYoutubeVideo();
declare var s_youtubeFinishCallback;
class Scene1L0 extends Scene1 {
    
    constructor() {
        super('Scene1L0');
    }

    create() {
        super.create();
        this.createYoutubeVideo();
        this.initNormalGameFsm();     

        this.anyKeyEvent.on((s)=>{
            playYoutubeVideo();
            $('#yb-player').css('visibility', 'visible');
        });

        this.subtitle.inner.alpha = 0;
        let offsetX = getLogicWidth() * 11.8 / 100;
        let offsetY = getLogicHeight() *0/ 100;
        this.centerObject.inner.x = offsetX;
        this.dwitterCenter.inner.x = offsetX;
        this.dwitterBKG.inner.x = offsetX;


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
            window.location.replace(window.location.origin + "?level=1");
        };
    }

    initNormalGameFsm() {        
        this.updateObjects.push(this.normalGameFsm);
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
        let state = this.normalGameFsm.getState("Start");
       
    }

    getNormalGameFsm(): IFsmData {
        return normal_1_0;
    }

    needHud() : boolean{
        return false;
    }   
}