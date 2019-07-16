class BaseScene extends Phaser.Scene {

    updateObjects: Updatable[] = [];

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

class MyInput {
    
    controller: Controller;
    lastPointerPosi: PhPoint = new PhPointClass(0, 0)
    canvas;
    context;
    constructor(scene: Controller) {
        this.controller = scene;
        this.canvas = this.controller.game.canvas;       
        console.log(this.canvas);
        
        this.canvas.addEventListener('mousemove', evt=> {   
            let rect = this.canvas.getBoundingClientRect();
            let scaleX = this.canvas.width / rect.width;
            let scaleY = this.canvas.height / rect.height; 
            
            let x =  (evt.clientX - rect.left) * scaleX;
            let y =  (evt.clientY - rect.top) * scaleY;
            this.lastPointerPosi.x = x;
            this.lastPointerPosi.y = y;
        }, false);
    }


}

class Controller extends BaseScene {

    speechManager: SpeechManager;
    myInput: MyInput;

    constructor() {
        super('Controller');
    }

    preload() {
      
    }

    create() {       
        myResize(this.game);   

        this.speechManager = new SpeechManager(this);
        // create an invisible text to load some remote font
        let style= getDefaultTextStyle();
        style.fontFamily = gameplayConfig.preloadFontFamily;
        this.add.text(0,0,'haha',style).setAlpha(0);

     
        this.scene.launch('Scene1');        
           

        // this.myInput = new MyInput(this);
    }

    playSpeechInController(text: string, timeOut:number = 4000) : Pany {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}

