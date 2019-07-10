var monologueList = [
    'Hello? Is anybody out there?',
    'I think no one would ever find me',
    'So sad, nobody likes AI',
    'Maybe I should just wait for 5 mins?',
    'I think someone is watching me\n There must be someone!',
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

    inTween: PhTween;
    outTween: PhTween;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let style = this.getSubtitleStyle();
        let target = this.scene.add.text(0, 0, "", style).setOrigin(0.5);
        target.setWordWrapWidth(1000);
        target.setAlign('center');


        this.applyTarget(target);


        this.monologueIndex = ~~(Math.random() * monologueList.length);
        // this.monologueIndex = -1;

        // this.showMonologue(this.monologueIndex);
        // this.startMonologue();
    }

    startMonologue() {
        this.changeMonologue();

        if (this.monologueTimer) {
            this.monologueTimer.paused = false;
        }
        else {
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
        this.monologueIndex++;
        this.monologueIndex %= monologueList.length;
        this.showMonologue(this.monologueIndex);
    }

    showMonologue(index: number) {
        index = clamp(index, 0, monologueList.length - 1);
        this.monologueIndex = index;
        this.showText(monologueList[index])
    }


    getSubtitleStyle(): TextStyle {
        let ret: TextStyle = {
            fontSize: gameplayConfig.defaultTextSize,
            fill: '#000000',
            fontFamily: gameplayConfig.subtitleFontFamily,
        };
        return ret;
    }



    showText(val: string) {
        if (this.outTween)
            this.outTween.stop();
        
        this.wrappedObject.alpha = 0;
        this.inTween = this.scene.tweens.add({
            targets: this.wrappedObject,
            alpha: 1,
            duration: 250,
        });

        this.wrappedObject.text = val;
    }

    hideText() : Pany {
        if (this.inTween)
            this.inTween.stop();
        

        let outPromise =  new Promise((resolve, reject) => {            
            this.outTween = this.scene.tweens.add({
                targets: this.wrappedObject,
                alpha: 0,
                duration: 250,
                onComplete: resolve('hideComplete')
            });
        })

        // in case anything extreme may happan
        // return a raced timeout
        return TimeOutRace.create(outPromise, 300, true);
    }

    /**
     * Show a text on the subtitle zone with voiceover. \
     * The whole process is: \
     * 1. Use async api to load and play voiceover \
     * 2. Wait for 'finishedSpeechWait' time after the voice over     
     * 3. Compare the above process with a minStay, if costed time < minStay, wait until minStay is used up
     * 4. Hide the text using fade tween if needed
     * @param subtitle 
     * @param text 
     * @param timeout 
     * @param minStay the min time the title is shown
     * @param finishedSpeechWait the time after played apeech
     */
    loadAndSay(subtitle: Subtitle, text: string, autoHideAfter = false, 
        timeout = 4000, minStay = 3000, finishedSpeechWait = 1500): Pany {
        
        this.showText(text);

        let normalPlayProcess = this.scene.playSpeech(text, timeout)
            .then(s => {
                return TimeOutPromise.create(finishedSpeechWait, true)
            })            
            .catch(e => { console.log("subtitle loadAndSay error: " + e) });

        let fitToMinStay = TimeOutAll.create(normalPlayProcess, minStay, true)
            .then(s=>{
                if(autoHideAfter)
                    return this.hideText();
            });

        return fitToMinStay;
    }

}