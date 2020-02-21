/// <reference path="scene-base.ts" />

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
declare var WebFont: any;
class Controller extends Phaser.Scene {

    speechManager: SpeechManager;
    myInput: MyInput;

    constructor() {
        super('Controller');
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
            active: ()=>{
                this.gotoFirstScene();  
            },
            inactive: ()=>{
                this.gotoFirstScene();
            }
        });   
        
        // this.myInput = new MyInput(this);
    }

    gotoFirstScene() {
        // console.log("origin: " + window.location.origin);        
        // this.scene.launch('Scene1L2');      
        let index = getCurrentLevelRaw();        
        this.scene.launch('Scene1L' + index);      
    }

    playSpeechInController(text: string, timeOut:number = 4000) : Pany {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}

