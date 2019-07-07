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
    outterDwitterImage: PhImage;

    playerInputText: PlayerInputText;

    speakerRight: number = 56;
    speakerLeft: number = -56;

    backToZeroTween: PhTween;

    text: PhText;

    canvasTexture: PhCanvasTexture;
    c: any;
    x: any;

        
    centerRotateTween: PhTween;

    initScale = 1.3;
    initRotation = -Math.PI / 2;

    initOutterDwitterScale = 0.4;

    constructor(scene: BaseScene, parentContainer: PhContainer, designSize: PhPoint) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);

        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);

        this.initDwtieer();

        this.mainImage = this.scene.add.image(0, 0, "circle").setInteractive();
        this.inner.add(this.mainImage);



        this.speakerBtn = new SpeakerButton(this.scene, this.inner, this.speakerRight, 28, this.scene.add.image(
            0, 0, "speaker"
        ));        

        this.playerInputText = new PlayerInputText(this.scene, this.inner, this, "Project 65535");
        this.playerInputText.init("");
        this.playerInputText.changedEvent.on((inputControl) => { this.playerInputChanged(inputControl) });

        this.inner.setScale(this.initScale);
        this.inner.setRotation(this.initRotation);
        


        this.text = this.scene.add.text(0, -200, '', { fill: '#000000' }).setVisible(false);
        this.inner.add(this.text);

 
        // this.initInteraction();
    }

    graph: PhGraphics;
    initDwtieer() {
       // let sc = 1200 / 1080 / 1.5;

        this.canvasTexture = this.scene.textures.createCanvas('dwitter', 1920, 1080);
        this.c = this.canvasTexture.getSourceImage();

        

        // this.graph = this.scene.add.graphics();
        
        // this.x = 
        this.x = this.c.getContext('2d');
        // this.x = this.graph;
        this.outterDwitterImage = this.scene.add.image(0, 0, 'dwitter').setOrigin(0.5, 0.5).setScale(this.initOutterDwitterScale);
        // img.setRotation(-Math.PI / 2);
        this.inner.add(this.outterDwitterImage);
    }


    initInteraction() {
        this.mainImage.on('pointerover', () => {
            // if(this.scene)
            // console.log("over");
            let state = getGameState();
            if(state == GameState.Home) {
                this.playerInputText.homePointerOver();
            }
        });

        this.mainImage.on('pointerout', () => {
            let state = getGameState();
            if(state == GameState.Home) {
                this.playerInputText.homePointerOut();
            }            
        });

        this.mainImage.on('pointerdown', () => {
            let state = getGameState();
            console.log(state);
            if(state == GameState.Home) {
                setGameState(GameState.Scene1);
                this.playerInputText.homePointerDown();

                let delayDt = 1500;
                let dt = 1000;
                this.centerRotateTween = this.scene.tweens.add({
                    delay: delayDt,
                    targets: this.inner,
                    rotation: 0,
                    scale: 1.2,
                    duration: dt,
                    completeDelay: 1000,
                    onComplete:  () => {
                        this.playerInputText.transferToScene1TweenCompleted();
                        this.speakerBtn.toSpeakerMode(1000);
                        
                        setGameState(GameState.Scene1);
                    }
                });

                let fadeOutter =  this.scene.tweens.add({
                    delay: delayDt,
                    targets: this.outterDwitterImage,
                    alpha: 0,
                    scale: 2,
                    duration: dt,
                });
            } 
        });
    }


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

    update() {
        let pointer = this.scene.input.activePointer;

        this.text.setText([
            'x: ' + pointer.worldX,
            'y: ' + pointer.worldY,
            'isDown: ' + pointer.isDown,
            'rightButtonDown: ' + pointer.rightButtonDown()
        ]);


        this.updateDwitter();
    }

    frame: number = 0;
    updateDwitter() {
        let time = this.frame / 60;

        // if (time * 60 | 0 == this.frame - 1)
        // {
        //     time += 0.000001;
        // }

        this.frame++;

        this.u2(time, this.c, this.x);
    }

    u2(t, c: any, x) {
        // c.width = 1920;
        // for (var i = 0; i < 31; i++) { 
        //     for (var j = 25; j > -25; j--) { 
        //         x.fillRect(960 + j * i * .5 * C(i * .2) + C(2 * t + i * .2) * 300, 540 + j * i * .5 * S(i * .2) + S(2.2 * t + i * .2) * 200, 9, 9);
        //     } 
        // }
        let a = 0;
        c.width|=c.style.background=<any>"#CDF";
        for(let j=3e3;j--;x.arc(960,540,430+60*S(j/500+a*4)*(S(a-t * 2)/2+.5)**9,a,a)) {
            a=j/159+t;
            x.lineWidth=29;
        }
            
        x.stroke();
    }

    u3(t, c, x) {
        let Y = 0;
        let X = 0;
        let r=140-16*(t<10?t:0);
        for(let U=0;U<44;(r<8?"䃀䀰䜼䚬䶴伙倃匞䖴䚬䞜䆀䁠".charCodeAt(Y-61)>>X-18&1:0)||x.fillRect(8*X,8*Y,8,8))X=120+r*C(U+=.11)|0,Y=67+r*S(U)|0
    }
}