class BaseScene extends Phaser.Scene {

    playSpeech(text: string) {
        let controller: Controller = <Controller> this.scene.get("Controller");
        controller.speechManager.quickLoadAndPlay(text);
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
        this.scene.launch('Scene1');        
        myResize(this.game);                
    }
}

