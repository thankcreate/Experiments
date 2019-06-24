class PlayerInputText {

    scene: Scene1;
    parentContainer: Phaser.GameObjects.Container;
    fontSize;
    lblStyl;
    maxCount;
    text: Phaser.GameObjects.Text;
    circle;
    y;

    constructor(scene: Scene1, container) {
        this.scene = scene;
        this.parentContainer = container;

        this.fontSize = 32;
        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF', fontFamily: "Georgia, serif"
        };

        this.y = -6 - this.fontSize;
        this.maxCount = 11;
        this.text; // main text input

        this.circle;
    }

    init(circle) {
        this.circle = circle;
        var circleWidth = this.circle.getBounds().width;
        this.text = this.scene.add.text(- circleWidth / 2 * 0.65, this.y,
            "", this.lblStyl);
        this.parentContainer.add(this.text);


        this.scene.input.keyboard.on('keydown', (event) => this.keydown(event));

    }

    keydown(event) {
      
        var t = this.text.text;
        var code = event.keyCode;
        
        if (code == Phaser.Input.Keyboard.KeyCodes.BACKSPACE /* backspace */
            || code == Phaser.Input.Keyboard.KeyCodes.DELETE /* delete*/) {
            if (t.length > 0) {
                t = t.substring(0, t.length - 1);
            }
        }
        else if (code >= Phaser.Input.Keyboard.KeyCodes.A
            && code <= Phaser.Input.Keyboard.KeyCodes.Z
            || code == Phaser.Input.Keyboard.KeyCodes.SPACE
        ) {
            if (t.length < this.maxCount) {
                var codeS = String.fromCharCode(code).toLowerCase();
                if (t.length == 0)
                    codeS = codeS.toUpperCase();
                t += codeS;
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
        var enemies = this.scene.enemySpawner.enemies;        
        var inputWord = this.text.text;

        var enemyLabels = [];
        for (let i in enemies) {
            var enemy = enemies[i];
            enemyLabels.push(enemy.lbl);
        }

        api3WithTwoParams(inputWord, enemyLabels,
            // suc
            res => {
                // console.log(res);
                this.scene.enemySpawner.confirmCallbackSuc(res);
            },
            // err
            function err(res) {
                // console.log("API3 failed");
            }
        );        
    }

    
    

    update(time, dt) {

    }

    checkInput() {

    }
}