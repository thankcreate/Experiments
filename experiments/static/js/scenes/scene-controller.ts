class BaseScene extends Phaser.Scene {

    updateObjects: Updatable[] = [];

    getControllerScene(): Controller {
        let controller: Controller = <Controller> this.scene.get("Controller");
        return controller;
    }

    playSpeech(text: string) {
        let controller: Controller = <Controller> this.scene.get("Controller");
        controller.playSpeechInController(text);
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

    playSpeechInController(text: string) {
        this.speechManager.quickLoadAndPlay(text);
    }
}

