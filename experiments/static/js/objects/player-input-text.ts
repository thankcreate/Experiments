class PlayerInputText {

    keyPressEvent: TypedEvent<object> = new TypedEvent();
    confirmedEvent: TypedEvent<string> = new TypedEvent();
    changedEvent: TypedEvent<PlayerInputText> = new TypedEvent();

    scene: PhScene;
    parentContainer: Phaser.GameObjects.Container;
    fontSize = 32;
    lblStyl;
    maxCount;
    text: PhText;
    underlieText: PhText

    title: PhText; // dummy title
    titleSize = 24;
    titleStyle: TextStyle;


    shortWords: Set<string>;

    inputHistory: string[] = []; //store only valid input history
    centerObject: CenterObject;
    gap: number = 4;
    gapTitle: number = 6;

    canAcceptInput: boolean = false;
    autoText: string;
    inAutoMode: boolean = false;

    constructor(scene: PhScene, container: PhContainer, centerObject: CenterObject, dummyTitle: string) {
        this.scene = scene;
        this.parentContainer = container;
        this.centerObject = centerObject;


        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF',
            fontFamily: "Georgia, serif"
        };

        this.maxCount = 100;
        this.text; // main text input


        this.shortWords = new Set();
        this.shortWords.add("go");
        this.shortWords.add("hi");
        this.shortWords.add("no");
        this.shortWords.add("tv");


        // * Phaser's keydown logic sometimes will invoke duplicate events if the input is fast        
        // * Hence, we should use the standard keydown instead
        // * Caution: Management of the lifetime of the listners here 
        // * has been moved to the FSM state: NormalGame: onEnter
        // this.scene.input.keyboard.on('keydown', (event) => this.keydown(event));        
        // $(document).keypress(this.keypress.bind(this));
        // $(document).keydown(this.keydown.bind(this));


        this.titleStyle = {
            fontSize: this.titleSize + 'px',
            fill: '#FFFFFF',
            fontFamily: gameplayConfig.titleFontFamily
        };

        this.title = this.scene.add.text(- this.getAvailableWidth() / 2, -this.gapTitle,
            dummyTitle, this.titleStyle).setOrigin(0, 1).setAlpha(0);
        // this.title.setWordWrapWidth(1000);
        this.parentContainer.add(this.title);        

        this.initKeywords();
    }

    /**
     * Init here will construct two texts
     * 1. The main text that player interact with
     * 2. The text underline for the auto-complete like B -> Bad
     * @param defaultStr 
     */
    init(defaultStr: string) {        
        // Main text
        this.text = this.scene.add.text(-this.getAvailableWidth() / 2, -this.gap,
            defaultStr, this.lblStyl).setOrigin(0, 1);        
        this.text.setWordWrapWidth(this.getAvailableWidth(), true);                

        // Underline text        
        this.underlieText = this.scene.add.text(this.text.x, this.text.y, "", this.text.style).setOrigin(this.text.originX, this.text.originY);
        this.underlieText.setColor('#888888');
        this.underlieText.setWordWrapWidth(this.getAvailableWidth(), true);

        // Underline text shoud be under the normal text
        // So it should be added first
        this.parentContainer.add(this.underlieText);
        this.parentContainer.add(this.text);
    }


    setAutoContent(autoText) {
        this.text.setText("");
        this.inAutoMode = true;
        this.autoText = autoText;
    }

    /**
     * @returns true if need to forward the operation to auto mode
     */
    handleAutoContentKeyPress(): boolean {
        if(!this.inAutoMode)
            return false;

        let curLen = this.text.text.length;
        let allLen = this.autoText.length;

        if(curLen < allLen) {
            this.text.setText(this.autoText.substr(0, curLen + 1));
        }

        return true;
    }


    // keypress to handle all the valid characters
    keypress(event) {

        let oriText = this.text.text;
        this.keyPressEvent.emit(event);

        if(!this.isInBeat())  
            return;
        
        if (!this.getCanAcceptInput())
            return;

        

        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;

        // console.log("keykown: " + code);
        if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            return;
        }

        if(this.handleAutoContentKeyPress()) 
            return;

        //console.log(this.text.displayHeight);
        if (t.length < this.maxCount ) {
        // if (t.length < this.maxCount && this.text.width < this.getAvailableWidth()) {
        // if (t.length < this.maxCount ) {
            var codeS = String.fromCharCode(code);
            if (t.length == 0)
                codeS = codeS.toUpperCase();
            t += codeS;
        }


        this.text.setText(t);

        // if height exceeded 2 rows,set the content back to before
        let height = this.text.displayHeight;
        if(height > 80) {
            this.text.setText(oriText);
        }

        this.textChanged();        
    }

    getAvailableWidth(): number {
        return this.centerObject.getTextMaxWidth();
    }

    // keydown to handle the commands
    keydown(event) {
        if(!this.isInBeat())  
            return;

        if (!this.getCanAcceptInput())
            return;


        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;

        // if in autoMode, only continue when length matches and input is ENTER
        if(this.inAutoMode) {
            let curLen = this.text.text.length;
            let allLen = this.autoText.length;

            if(curLen != allLen || code != Phaser.Input.Keyboard.KeyCodes.ENTER) { 
                return;
            }
            else {
                this.inAutoMode = false;
            }
        }

        if (code == Phaser.Input.Keyboard.KeyCodes.BACKSPACE /* backspace */
            || code == Phaser.Input.Keyboard.KeyCodes.DELETE /* delete*/) {
            if (t.length > 0) {
                t = t.substring(0, t.length - 1);

            }
        }
        else if (code == Phaser.Input.Keyboard.KeyCodes.ESC) {
            t = "";

        }
        else if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            t = "";

            this.confirm();
        }

        this.text.setText(t);


        this.textChanged();
    }

    textChanged() {
        this.checkIfNeedAutoComplete();
        this.changedEvent.emit(this);
    }

    
    avaiKeywords: string[] = [];

    
    // TODO: the avaiKeywords should be based on whether given skill is acqured later        
    initKeywords() {        
        for(let i = 0; i < badInfos.length; i++) {
            this.avaiKeywords.push(badInfos[i].title);       
        }        
        for(let i = 0; i < turnInfos.length; i++) {
            this.avaiKeywords.push(turnInfos[i].title);       
        }      
    }

    // B** -> Bad
    checkIfNeedAutoComplete() {
        this.underlieText.text = '';
        if(this.text.text.length == 0)
            return;

        for(let i = 0; i < this.avaiKeywords.length; i++) {
            let autoStr = this.avaiKeywords[i];            
            if(autoStr.indexOf(this.text.text) == 0) {
                this.underlieText.text  = autoStr;
                break;
            }
        }        
    }

    confirm() {        
        var inputWord = this.text.text;
        if(this.underlieText.text != '') {
            inputWord = this.underlieText.text;   
        }

        let checkLegal: ErrorInputCode = this.checkIfInputLegalBeforeSend(inputWord);
        let legal = checkLegal == ErrorInputCode.NoError;
        if (legal) {
            this.inputHistory.push(inputWord);
            this.confirmedEvent.emit(inputWord);
            this.showConfirmEffect(inputWord, this.text, 250, true);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
    }

    /**
     * Set the real label to a empty string\
     * then construct a new pseudo text and show a fade tween on it
     */
    showConfirmEffect(oriWord: string, refText: PhText, dt: number, needWrap: boolean) {

        refText.text = "";
        let fakeText = this.scene.add.text(refText.x, refText.y,
            oriWord, refText.style).setOrigin(refText.originX, refText.originY);

        refText.parentContainer.add(fakeText);
        
        if(needWrap) {
            fakeText.setWordWrapWidth(this.getAvailableWidth(), true);
        }

        let fadeTween = this.scene.tweens.add({
            targets: fakeText,
            alpha: 0,
            y: '-= 40',
            duration: dt,
            onComplete: function () {
                fakeText.destroy();
            }
        });
    }


    /**
     * Check without the need to compare with other enemy lables
     * This is mostly done before sending the input to the server on the client side
     * @param inputLbl player input
     */
    checkIfInputLegalBeforeSend(inputLbl: string): ErrorInputCode {
        var inputLblWithoutSpace = inputLbl.trim().replace(/ /g, '').toLowerCase();
        if (!this.shortWords.has(inputLblWithoutSpace) && inputLblWithoutSpace.length <= 2) {
            return ErrorInputCode.TooShort;
        }
        else if (!gameplayConfig.allowSameInput && this.checkIfRecentHistoryHasSame(inputLbl, 1)) {
            return ErrorInputCode.Repeat;
        }
        return ErrorInputCode.NoError;
    }

    /**
     * Check if the input history has the same input
     * @param inputLbl 
     * @param recentCount 
     */
    checkIfRecentHistoryHasSame(inputLbl: string, recentCount: number = 3): boolean {
        inputLbl = inputLbl.trim();
        for (let i = this.inputHistory.length - 1; i >= 0 && --recentCount >= 0; i--) {
            if (this.inputHistory[i].trim() === inputLbl) {
                return true;
            }
        }
        return false;
    }



    checkInput() {

    }


    titleIn: PhTween;

    showTitle(showOriginal: boolean = true) {
        let toShowText = showOriginal ? 
            gameplayConfig.titleOriginal : gameplayConfig.titleChangedTo;
        
        this.title.setText(toShowText);        

        if (this.titleOut)
            this.titleOut.stop();
        this.titleIn = this.scene.tweens.add({
            targets: this.title,
            alpha: 1,
            duration: 400,
        });
    }

    titleOut: PhTween;
    hideTitle() {
        this.title.setText(gameplayConfig.titleOriginal);

        if (this.titleIn)
            this.titleIn.stop();

        this.titleOut = this.scene.tweens.add({
            targets: this.title,
            alpha: 0,
            duration: 250,
        });
    }

    // If you want to force set a status of the title like set title.alpha = 0
    // but there is still a tween on it, you will notice that the setting didin't work
    // Cause the tween will override the settting
    // You muse stop any related tween, and then set it
    stopTitleTween() {
        if(this.titleIn)
            this.titleIn.stop();
        if(this.titleOut)
            this.titleOut.stop();
    }

    /**
     * Current logic is that we get into scene1 once player clicked the center circle
     * Transfer to the scene 1 game play
     */
    changeTitleToChanged(): void {
        this.title.setText(gameplayConfig.titleChangedTo);

        if (this.titleOut)
            this.titleOut.stop();       

    }

    prepareToGame(){
        this.showConfirmEffect(this.title.text, this.title, 1000, false);
        this.setCanAcceptInput(true);
    }

    prepareToHome() {
        // this.title.setText(gameplayConfig.titleOriginal);
        this.showConfirmEffect(this.text.text, this.text, 1000, false);
        this.setCanAcceptInput(false);

        // set title alpha to 0 becuase when entered game mode, the title's alpha is still 1
        // we only used a pseudo title to show the faked showConfirmEffect
        this.title.alpha = 0;
    }

    setCanAcceptInput(val: boolean) {
        this.canAcceptInput = val;
    }

    getCanAcceptInput(): boolean {
        return this.canAcceptInput;
    }

    
    inBeat : boolean = true;
    isInBeat() : boolean {
        return this.inBeat;        
    }
}