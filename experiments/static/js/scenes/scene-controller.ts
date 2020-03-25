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

    sceneSeq = [
        '1-0',
        '1-1',
        '1-2',
        '1-3',
        '1-Paper',
        '1-4',
        '2-0',
        '2-1',
        '2-2'
    ]
    

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
        let level = getCurrentLevelRaw().split('-');        

        let sceneName = `Scene${level[0]}L${level[1]}` ;
        console.log(sceneName);
        this.scene.launch(sceneName);      
    }    

    gotoNextScene() {
        let level = getCurrentLevelRaw();
        let idx = 0;
        for(let i = 0; i < this.sceneSeq.length; i++) {
            if(this.sceneSeq[i] == level) {
                idx = i;
                break;
            }
        }
        if(idx != this.sceneSeq.length - 1) {
            window.location.replace(window.location.origin + `?level=${this.sceneSeq[idx + 1]}`);
        }            
    }

    playSpeechInController(text: string, timeOut:number = 4000) : Pany {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}

