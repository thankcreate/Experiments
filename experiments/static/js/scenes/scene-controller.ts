class BaseScene extends Phaser.Scene {

    updateObjects: Updatable[] = [];

    getControllerScene(): Controller {
        let controller: Controller = <Controller> this.scene.get("Controller");
        return controller;
    }

    playSpeech(text: string) : Pany {
        let controller: Controller = <Controller> this.scene.get("Controller");
        return controller.playSpeechInController(text);
    }


    /**
     * Muse sure called super first
     * @param time 
     * @param dt 
     */
    update(time, dt) {
        this.updateObjects.forEach(e=>{
            e.update(time, dt);
        });        
    }
}

class Controller extends BaseScene {

    speechManager: SpeechManager;

    constructor() {
        super('Controller');
    }

    preload() {
        
    }

    create() {
        this.speechManager = new SpeechManager(this);
        // create an invisible text to load some remote font
        let style= getDefaultTextStyle();
        style.fontFamily = gameplayConfig.preloadFontFamily;
        this.add.text(0,0,'haha',style).setAlpha(0);


        this.scene.launch('Scene1');        
        myResize(this.game);             
        

        
    }

    playSpeechInController(text: string) : Pany {
        // this.speechManager.quickLoadAndPlay(text);
        return this.speechManager.staticLoadAndPlay(text);
    }
}

