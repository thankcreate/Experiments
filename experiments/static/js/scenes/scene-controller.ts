class BaseScene extends Phaser.Scene {

    updateObjects: Updatable[] = [];

    needFeedback: boolean = false;

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
     * The hover state check here take overlapping into consideration
     * Only return true if there is no other interactive object above it.
     * @param target 
     */
    isObjectHovered(target: PhGO) {
        if(notSet(target)) 
            return false;

        return this.getHoverTopMostObject() === target;
    }

    getHoverTopMostObject(): PhGO {
        let mp = this.input.mousePointer;
        let obs = this.input.hitTestPointer(mp);
        let sorted = this.input.sortGameObjects(obs);
        return sorted[0];
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
declare var WebFont: any;
class Controller extends BaseScene {

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


    parseUrl(url: string) : object{
        var result = {};

        let spR = url.split("?");
        if(url.split("?").length <= 1)
            return result;

        var query = url.split("?")[1];
        var queryArr = query.split("&");
        queryArr.forEach(function(item){            
            var value = item.split("=")[1];
            var key = item.split("=")[0];
            
            result[key] = value;
        });
        return result;
    }

    gotoFirstScene() {
        // console.log("origin: " + window.location.origin);
        let path = window.location.href;
        let params = this.parseUrl(path);
        let index = 1;
        if(params['level'] != null) {
            index = parseInt(params['level']);
        }
        
        this.scene.launch('Scene1L' + index);      
    }

    playSpeechInController(text: string, timeOut:number = 4000) : Pany {
        // return this.speechManager.quickLoadAndPlay(text, true, timeOut);
        return this.speechManager.staticLoadAndPlay(text, true, timeOut);
    }
}

