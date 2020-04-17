var monologueList = [
    'Hello? Is anybody out there?',
    'I think no one would ever find me',
    'So sad, nobody likes AI',
    'Maybe I should just wait for another 5 mins?',
    'I think someone is watching me\n There must be someone!',
    'A cursor! I found a curor!',
    'Hey~~~ Hahaha~ How are you? Mr.cursor',
    "Is it that I'm too tired?\nI thought I smelled a human being",
    "Nah, totally nothing\nI'm so bored",
    ">_<\nI'll never accomplish my task",
    'Do you like to play games?\nI want to play a game with you',
    "That's wierd, I'm gonna be crazy\nLet's stop pretending I'm talking to someone",
    'What time is it now?\nHow long have I been wating like this?',
    "OK, I give up.\nNo one comes to play, no data, no fun",
];

class Subtitle extends Wrapper<PhText> {

    monologueIndex = 0;

    monologueTimer: PhTimeEvent;

    inTween: PhTween;
    outTween: PhTween;

    static subtitleOriY = 370;

    forceNextRejectHandler: (err:any)=>void ;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let style = this.getSubtitleStyle();
        let target = this.scene.add.text(0, 0, "", style).setOrigin(0.5);
        // target.setWordWrapWidth(1000);
        target.setWordWrapWidth(1200);
        target.setAlign('center');


        this.applyTarget(target);


        this.monologueIndex = ~~(Math.random() * monologueList.length);
        // this.monologueIndex = 1;

        // this.showMonologue(this.monologueIndex);
        // this.startMonologue();

        $(document).keydown(this.keydown.bind(this));
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

    private textInShow : boolean = false;

    isTextInShow() : boolean {
        return this.textInShow;
    }

    
    /**
     * Since the height of Some newspaper pages are too great, we need to
     * ajust the Y of subtitle based on the newspaper's frame bottom.
     */
    adjustSubtitleY() {
        let newsPaperBottomY = $('#newspaper-outer-frame')[0].getBoundingClientRect().bottom;
        let pageHeight = window.innerHeight;
        let bottomSpace = pageHeight - newsPaperBottomY;

        let bottomSpacePerc = bottomSpace / pageHeight;
        if(bottomSpacePerc > 0 && bottomSpacePerc < 0.5) {
            // subtitle is based on the center pivot of canvas
            // console.log('bottomSpacePerc:' + bottomSpacePerc);
            let phBottom= getLogicHeight() / 2 - getLogicHeight() * bottomSpacePerc + this.wrappedObject.displayHeight / 2;
            this.inner.y = Math.max(Subtitle.subtitleOriY, phBottom + 40);
        }
        else {
            this.inner.y = Subtitle.subtitleOriY;
        }
    }


    showText(val: string) {    
       
        

        this.textInShow = true;      
        if (this.outTween)
            this.outTween.stop();
        
        this.wrappedObject.alpha = 0;
        this.inTween = this.scene.tweens.add({
            targets: this.wrappedObject,
            alpha: 1,
            duration: 250,
        });


        this.scene.tweens.add({
            targets: (this.scene as BaseScene).bgm,
            volume: 0.15,
            duration: 250,
        });
        
        this.wrappedObject.text = val;

        this.adjustSubtitleY();
    }

    hideText() : Pany {
        if (this.inTween)
            this.inTween.stop();
        

        let outPromise =  new Promise((resolve, reject) => {            
            this.outTween = this.scene.tweens.add({
                targets: this.wrappedObject,
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    resolve('hideComplete')
                    this.textInShow = false;
                }
            });

            this.scene.tweens.add({
                targets: (this.scene as BaseScene).bgm,
                volume: 1,
                duration: 250,
            });
        })

        

        // in case anything extreme may happan
        // return a raced timeout
        return TimeOutRace.create(outPromise, 300, true);
    }

    /**
     * Show a text on the subtitle zone with voiceover. \
     * The whole process is: 
     * 1. Use async api to load and play voiceover 
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
        timeout = 2000, minStay = 3000, finishedSpeechWait = 1000): Pany {
        
        // ! Not sure if I can write like this to always force stop current subtitle
        this.forceStopAndHideSubtitles();

        this.showText(text);

        let normalPlayProcess = this.scene
            .playSpeech(text, timeout)
            .then(s => {
                return TimeOutPromise.create(finishedSpeechWait, true)
            })            
            .catch(e => { 
                console.log("subtitle loadAndSay error: " + e) 
            });

    
        let fitToMinStay = TimeOutAll.create(normalPlayProcess, minStay, true)
            .then(s=>{
                if(autoHideAfter) {
                    // sometimes when we get here, the current showing text is a newer one
                    // The 'hideText()' was intended to hide the subtitle from this loadAndSay
                    // but maybe a new subtitle has covered this one
                    if(this.wrappedObject.text === text)
                        return this.hideText();
                }                    
            });

        let rejectorPromise = new Promise((resolve, reject) =>{
            this.forceNextRejectHandler = reject;
        });
            
        let considerForceNext = Promise.race([fitToMinStay, rejectorPromise]);
        return considerForceNext;
    }

    keydown(event) {
        var code = event.keyCode;
        if (code == Phaser.Input.Keyboard.KeyCodes.CTRL ) {
            this.forceNext();
        }
    }
    
    forceNext() {
        this.forceStopAndHideSubtitles();
        if(this.forceNextRejectHandler)
            this.forceNextRejectHandler('forceNext invoked');
    }

    forceStopAndHideSubtitles() {
        this.scene.getSpeechManager().stopAndClearCurrentPlaying();
        this.hideText();
    }

}