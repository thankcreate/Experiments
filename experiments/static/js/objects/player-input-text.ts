class PlayerInputText {

    scene: Scene1;
    parentContainer: Phaser.GameObjects.Container;
    fontSize;
    lblStyl;
    maxCount;
    text: Phaser.GameObjects.Text;
    circle;
    y;

    shortWords : Set<string>;

    inputHistory : string[] = []; //store only valid input history

    constructor(scene: Scene1, container) {
        this.scene = scene;
        this.parentContainer = container;

        this.fontSize = 32;
        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF', fontFamily: "Georgia, serif"
        };

        this.y = -6 - this.fontSize;
        this.maxCount = 100;
        this.text; // main text input

        this.circle;

        this.shortWords = new Set();
        this.shortWords.add("go");
        this.shortWords.add("hi");
        this.shortWords.add("no");
    }

    init(circle) {
        this.circle = circle;
        var circleWidth = this.circle.getBounds().width;
        this.text = this.scene.add.text(- circleWidth / 2 * 0.65, this.y,
            "", this.lblStyl);
        this.parentContainer.add(this.text);


        // * Phaser's keydown logic sometimes will invoke duplicate events if the input is fast        
        // * Hence, we should use the standard keydown instead
        // this.scene.input.keyboard.on('keydown', (event) => this.keydown(event));        
        $(document).keypress(this.keypress.bind(this));
        $(document).keydown(this.keydown.bind(this));        
    }

    // keypress to handle all the valid characters
    keypress(event) {
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        
        console.log("keykown: " + code);
        if(code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
             return;
        }
        
        if (t.length < this.maxCount) {
            var codeS = String.fromCharCode(code);
            if (t.length == 0)
                codeS = codeS.toUpperCase();
            t += codeS;
        }   
    
        this.text.setText(t);
    }

    // keydown to handle the commands
    keydown(event) {
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
    }

    confirm() {
        var inputWord = this.text.text;           

        let checkLegal : ErrorInputCode = this.checkIfInputLegalBeforeSend(inputWord);
        let legal = checkLegal == ErrorInputCode.NoError;
        if(legal) {
            this.inputHistory.push(inputWord);
            this.scene.enemyManager.sendInputToServer(inputWord);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
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
        else if(this.checkIfRecentHistoryHasSame(inputLbl, 1)) {
            return ErrorInputCode.Repeat
        }
        return ErrorInputCode.NoError;
    }

    /**
     * Check if the input history has the same input
     * @param inputLbl 
     * @param recentCount 
     */
    checkIfRecentHistoryHasSame(inputLbl: string, recentCount : number = 3) : boolean{
        inputLbl = inputLbl.trim();
        for(let i = this.inputHistory.length - 1; i >= 0 && --recentCount >= 0; i--) {
            if(this.inputHistory[i].trim() === inputLbl) {
                return true;
            }
        }
        return false;
    }


    update(time, dt) {

    }

    checkInput() {

    }
}