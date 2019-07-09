var monologueList = [
    'Hello? Is anybody out there?',
    'I think no one would ever find me',
    'So sad, nobody likes AI',
    'Maybe I should just wait for 5 mins?',
    'I think someone is watching me?\n There must be!',
    'A cursor! I found a curor!',
    'Hey~~~ Hahaha~ How are you? Mr.cursor',
    "Is it that I'm too tired?\nI thought I smelled a human being",
    "Nah, totally nothing\nI'm so bored",
    ">_<\nI'll never accomplish my task",
    'Do you like to play games?\nI want to play a game with you',
    "That's wierd, I'm gonna be crazy\nLet's stop pretending I'm talking to someone",   
    'What time is it now?\nHow long have I been wating for this?',   
    "OK, I give up.\nNo one come to play, no data, no fun",    
];

class Subtitle extends Wrapper<PhText> {
    
    monologueIndex = 0;

    monologueTimer: PhTimeEvent;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let style = this.getSubtitleStyle();
        let target = this.scene.add.text(0, 0, "", style).setOrigin(0.5);
        target.setWordWrapWidth(800);
        target.setAlign('center');

        
        this.applyTarget(target);        
        
        
        this.monologueIndex = ~~(Math.random() * monologueList.length);
        // this.monologueIndex = -1;

        // this.showMonologue(this.monologueIndex);
        // this.startMonologue();
    }

    startMonologue() {
        this.changeMonologue();

        if(this.monologueTimer) {
            this.monologueTimer.paused = false;
        }
        else{
            this.monologueTimer = this.scene.time.addEvent({
                delay: 6000,
                callback: this.changeMonologue,
                callbackScope: this,
                loop: true,            
            });
        }        
    }

    stopMonologue() {
        this.wrappedObject.text = "";
        this.monologueTimer.paused = true;        
    }

    changeMonologue() {        
        this.monologueIndex ++;
        this.monologueIndex %= monologueList.length;
        this.showMonologue(this.monologueIndex);
    }

    showMonologue(index: number) {
        index = clamp(index, 0, monologueList.length - 1);
        this.monologueIndex = index;
        this.wrappedObject.text = monologueList[index];
    }


    getSubtitleStyle(): TextStyle {
        let ret: TextStyle = {
            fontSize: gameplayConfig.defaultTextSize,
            fill: '#000000',
            fontFamily: gameplayConfig.subtitleFontFamily,
        };
        return ret;
    }
    

    loadAndSay(val: string) : Pany {
        this.wrappedObject.text = val;
        return this.scene.playSpeech(val);
    }

}