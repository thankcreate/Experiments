class PlayerInputText {

    confirmedEvent: TypedEvent<string> = new TypedEvent();
    changedEvent: TypedEvent<PlayerInputText> = new TypedEvent();

    scene: PhScene;
    parentContainer: Phaser.GameObjects.Container;
    fontSize = 32;
    lblStyl;
    maxCount;
    text: Phaser.GameObjects.Text;

    title: PhText; // dummy title
    titleSize = 24;
    titleStyle: TextStyle;


    shortWords: Set<string>;

    inputHistory: string[] = []; //store only valid input history
    centerObject: CenterObject;
    gap: number = 4;
    gapTitle: number = 6;

    canAcceptInput: boolean = false;

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
        this.parentContainer.add(this.title);

    }

    init(defaultStr: string) {
        this.text = this.scene.add.text(- this.getAvailableWidth() / 2, -this.gap,
            defaultStr, this.lblStyl).setOrigin(0, 1);
        

        this.parentContainer.add(this.text);
    }

    // keypress to handle all the valid characters
    keypress(event) {

        if (!this.getCanAcceptInput())
            return;

        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;

        // console.log("keykown: " + code);
        if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            return;
        }


        if (t.length < this.maxCount && this.text.width < this.getAvailableWidth()) {
            var codeS = String.fromCharCode(code);
            if (t.length == 0)
                codeS = codeS.toUpperCase();
            t += codeS;
        }


        this.text.setText(t);
        this.changedEvent.emit(this);

        // console.log("dis width: " + this.text.displayWidth);
        // console.log("width: " + this.text.width);
    }

    getAvailableWidth(): number {
        return this.centerObject.getTextMaxWidth();
    }

    // keydown to handle the commands
    keydown(event) {
        if (!this.getCanAcceptInput())
            return;

        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;

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
        this.changedEvent.emit(this);
    }

    confirm() {
        var inputWord = this.text.text;

        let checkLegal: ErrorInputCode = this.checkIfInputLegalBeforeSend(inputWord);
        let legal = checkLegal == ErrorInputCode.NoError;
        if (legal) {
            this.inputHistory.push(inputWord);
            this.confirmedEvent.emit(inputWord);
            this.showConfirmEffect(inputWord, this.text, 250);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
    }

    /**
     * Set the real label to a empty string\
     * then construct a new pseudo text and show a fade tween on it
     */
    showConfirmEffect(oriWord: string, refText: PhText, dt: number) {

        refText.text = "";
        let fakeText = this.scene.add.text(refText.x, refText.y,
            oriWord, refText.style).setOrigin(refText.originX, refText.originY);

        refText.parentContainer.add(fakeText);

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

    homePointerOver() {
        this.title.setText("Project 65535");

        if (this.titleOut)
            this.titleOut.stop();
        this.titleIn = this.scene.tweens.add({
            targets: this.title,
            alpha: 1,
            duration: 400,
        });
    }

    titleOut: PhTween;
    homePointerOut() {
        this.title.setText("Project 65535");

        if (this.titleIn)
            this.titleIn.stop();

        this.titleOut = this.scene.tweens.add({
            targets: this.title,
            alpha: 0,
            duration: 250,
        });
    }

    /**
     * Current logic is that we get into scene1 once player clicked the center circle
     * Transfer to the scene 1 game play
     */
    homePointerDown(): void {
        this.title.setText(gameplayConfig.titleChangedTo);

        if (this.titleOut)
            this.titleOut.stop();       

    }

    prepareToNormalGame(){
        this.showConfirmEffect(this.title.text, this.title, 1000);
        this.setCanAcceptInput(true);
    }

    prepareToGoBack() {
        // this.title.setText(gameplayConfig.titleOriginal);
        this.showConfirmEffect(this.text.text, this.text, 1000);
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


}