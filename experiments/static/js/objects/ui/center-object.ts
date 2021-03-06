enum CenterType {
    Round,
    Rect
}



class SpeakerButton extends ImageWrapperClass {
    icon: PhImage;

    init() {
        this.icon = this.scene.add.image(0, 0, 'speaker_dot').setAlpha(0);
        this.inner.add(this.icon);
    }

    toSpeakerMode(dt = 250) {
        this.scene.tweens.add({
            targets: this.icon,
            alpha: 1,
            duration: dt,
        });
    }

    toNothingMode(dt = 250) {
        this.scene.tweens.add({
            targets: this.icon,
            alpha: 0,
            duration: 250,
        });
    }
}


class CenterObject {
    inner: PhContainer;
    parentContainer: PhContainer;
    scene: BaseScene;

    designSize: PhPoint;


    mainImage: PhImage;
    speakerBtn: SpeakerButton;


    playerInputText: PlayerInputText;

    speakerRight: number = 56;
    speakerLeft: number = -56;

    backToZeroTween: PhTween;

    text: PhText;

    centerRotateTween: PhTween;

    homeScale = 1.3;
    gameScale = 1.2;

    initRotation = -Math.PI / 2;

    btnMode0: Button;
    btnMode1: Button;

    centerProgres: CenterProgress;

    type: CenterType;


    constructor(scene: BaseScene, parentContainer: PhContainer, designSize: PhPoint, type: CenterType = CenterType.Round) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);
        this.type = type;

        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);


        let mainFileName = type == CenterType.Round ? 'circle' : 'center_rect';
        this.mainImage = this.scene.add.image(0, 0, mainFileName).setInteractive();
        this.inner.add(this.mainImage);

        this.speakerBtn = new SpeakerButton(this.scene, this.inner, this.speakerRight, 28, this.scene.add.image(
            0, 0, "speaker"
        ));
        if(type == CenterType.Rect) {
            this.speakerBtn.inner.alpha = 0;
        }

        this.playerInputText = new PlayerInputText(this.scene, this.inner, this, "Project 65535");
        this.playerInputText.init("");
        this.playerInputText.changedEvent.on((inputControl) => { this.playerInputChanged(inputControl) });

        this.inner.setScale(this.homeScale);
        this.inner.setRotation(this.initRotation);

        this.text = this.scene.add.text(0, -200, '', { fill: '#000000' }).setVisible(false);
        this.inner.add(this.text);

        // Buttons
        let btn = new Button(this.scene, this.inner, 0, -30, null, "Normal", 200, 98, false, 0.5, 0.7).setEnable(false, false);        
        this.btnMode0 = btn;

        btn = new Button(this.scene, this.inner, 0, 30, null, "Zen", 200, 98, false, 0.5, 0.3).setEnable(false, false);        
        this.btnMode1 = btn;

        this.modeToggles = new ToggleGroup(this.scene);
        this.modeToggles.addButton(this.btnMode0);
        this.modeToggles.addButton(this.btnMode1);
        this.modeToggles.setKeyboardActive();

        this.centerProgres = new CenterProgress(this.scene, this.inner, 0, 0);

        
    }

    modeToggles: ToggleGroup;

    graph: PhGraphics;




    playerInputChanged(inputControl: PlayerInputText) {
        let percent = inputControl.text.width / this.getTextMaxWidth();
        percent = Math.max(0, percent);
        percent = Math.min(1, percent);
        let desti = lerp(this.speakerRight, this.speakerLeft, percent);
        // this.speakerImage.x = desti;

        if (percent == 0) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: desti,
                duration: 150
            });
        }
        else {
            if (this.backToZeroTween)
                this.backToZeroTween.stop();
            // this.speakerImage.x = desti;

            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: desti,
                duration: 50
            });
        }

    }

    getDesignWidth() {
        return this.designSize.x;
    }

    getTextMaxWidth() {
        return this.getDesignWidth() * 0.65;
    }

    update(time, dt) {
        let pointer = this.scene.input.activePointer;

        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
            'isDown: ' + pointer.isDown,
            'rightButtonDown: ' + pointer.rightButtonDown()
        ]);

        if(this.centerProgres) {
            this.centerProgres.update(time, dt);
        }
    }

    frame: number = 0;



    prepareToGame() {
        this.playerInputText.prepareToGame();

        if(this.type == CenterType.Round) {
            this.speakerBtn.toSpeakerMode(1000);
            this.speakerBtn.inner.x = this.speakerRight;    
        }        
    }

    prepareToHome() {
        this.playerInputText.prepareToHome();
        this.speakerBtn.toNothingMode(1000);
        // this.speakerBtn.inner.x = this.speakerRight;

        if (this.backToZeroTween)
            this.backToZeroTween.stop();

        if(this.type == CenterType.Round) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerBtn.inner,
                x: this.speakerRight,
                duration: 150
            });
        }        
    }


    u3(t, c, x) {
        let Y = 0;
        let X = 0;
        let r = 140 - 16 * (t < 10 ? t : 0);
        for (let U = 0; U < 44; (r < 8 ? "䃀䀰䜼䚬䶴伙倃匞䖴䚬䞜䆀䁠".charCodeAt(Y - 61) >> X - 18 & 1 : 0) || x.fillRect(8 * X, 8 * Y, 8, 8))X = 120 + r * C(U += .11) | 0, Y = 67 + r * S(U) | 0
    }

    getFadeInAndOutCoreObjectes() : any[]{
        let ret = [];
        if(this.type == CenterType.Round){
            ret.push(this.speakerBtn.inner);
        }        
        ret.push(this.playerInputText.title);
        return ret;
    }
}