/// <reference path="scene-controller.ts" />


class Scene1 extends BaseScene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;
    container: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;
    playerInput: PlayerInputText;

    centerObject: CenterObject;

    footer: PhImage;

    fsm: Fsm;
    mm = 0;


    dwitterCenter: Dwitter;
    dwitterBKG: Dwitter65537

    initDwitterScale: number = 0.52;

    constructor() {
        super('Scene1');

        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };

        this.container;

        this.enemyManager;
    }

    preload() {
        this.load.image('circle', 'assets/circle.png');
        this.load.image('speaker_dot', 'assets/speaker_dot.png');
        this.load.image('speaker', 'assets/speaker.png');
        this.load.image('footer', 'assets/footer.png');
    }

    create() {
        this.container = this.add.container(400, 299);

        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));

        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);

        // Add confirmed listener for confirmedEvent to enemyManager
        this.centerObject.playerInputText.confirmedEvent.on(
            input => {
                this.enemyManager.inputTextConfirmed(input)
                this.time.delayedCall(300, ()=>{
                    this.dwitterBKG.next();
                }, null, null);                
            });


        // Bottom badge
        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = this.add.image(footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, "footer").setOrigin(0, 1);
        this.fitImageToSize(this.footer, 100);




        // Dwitter test
        this.dwitterCenter = new Dwitter65536(this, this.container, 0, 0, 1920, 1080, true).setScale(this.initDwitterScale);

        this.dwitterBKG = new Dwitter65537(this, this.container, 0, 0, 2400, 1400, true);
        // Main FSM
        this.initFsm();

    }



    fitImageToSize(image: PhImage, height: number, width?: number, ) {
        let oriRatio = image.width / image.height;
        image.displayHeight = height;
        if (width) {
            image.displayWidth = width;
        }
        else {
            image.displayWidth = oriRatio * height;
        }
    }


    update(time, dt) {
        super.update(time, dt);

        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);
        this.enemyManager.update(time, dt);
        this.centerObject.update();
    }

    getMainFsm(): IFsmData {
        return mainFsm;
    }

    initFsm() {
        this.fsm = new Fsm(this, this.getMainFsm());

        this.initFsmHome();
        this.initFsmHomeToGameAnimation();
        this.initFsmNormalGame();
        this.initFsmBackToHomeAnimation();

        this.updateObjects.push(this.fsm);
        this.fsm.start();
    }

    initFsmHome() {
        this.fsm.getState("Home").setAsStartup().setOnEnter(s => {
            let mainImage = this.centerObject.mainImage;
            console.log(this.centerObject.inner.scale);;
            console.log(mainImage.scale);
            console.log(mainImage.getBounds());

            s.autoSafeInOut(mainImage, e=>{
                console.log("pointerover");
                this.centerObject.playerInputText.homePointerOver();
                this.dwitterBKG.toBlinkMode();
            }, e=>{
                console.log("pointerout");
                this.centerObject.playerInputText.homePointerOut();

                this.dwitterBKG.toStaticMode();
            });

            // s.autoOn(mainImage, 'pointerover', e => {
            //     console.log("pointerover");
            //     this.centerObject.playerInputText.homePointerOver();
            //     this.dwitterBKG.toBlinkMode();
            // });

            // s.autoOn(mainImage, 'pointerout', e => {
            //     console.log("pointerout");
            //     this.centerObject.playerInputText.homePointerOut();

            //     this.dwitterBKG.toStaticMode();
            // });

            s.autoOn(mainImage, 'pointerdown', e => {
                console.log("pointerdown");
                this.centerObject.playerInputText.homePointerDown();

                this.dwitterBKG.toStaticMode();
                s.finished();
            });

            s.autoOn(mainImage, 'test', e =>{
                console.log('ppppppp');
            });
        });

        this.fsm.getState("Home").setOnUpdate( s=>{
            
            // let mainImage = this.centerObject.mainImage;
            // mainImage.emit('test');
            // let mp = getGame().input.mousePointer;
            // console.log(mp.x + "  " + mp.y);
            // console.log(mainImage.getBounds().contains(mp.x, mp.y));


        });
    }

    initFsmHomeToGameAnimation() {
        let dt = 1000;
        this.fsm.getState("HomeToGameAnimation")
            .addDelayAction(this, 1500)
            .addTweenAllAction(this, [
                {
                    targets: this.centerObject.inner,
                    rotation: 0,
                    scale: 1.2,
                    duration: dt,
                },
                {
                    targets: this.dwitterCenter.inner,
                    alpha: 0,
                    scale: 2,
                    duration: dt,
                }
            ])
            .addDelayAction(this, 1000)
            .addFinishAction();
    }

    initFsmNormalGame() {
        this.fsm.getState("NormalGame").setOnEnter(s => {
            this.centerObject.prepareToGame();
            this.enemyManager.startSpawn();

            s.autoOn($(document), 'keydown', e => {
                if (e.keyCode == Phaser.Input.Keyboard.KeyCodes.ESC) {
                    s.event("BackToHome");   // <-------------
                }
            });

            s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
            s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));

        });
    }

    initFsmBackToHomeAnimation() {
        let dt2 = 1000;
        this.fsm.getState("BackToHomeAnimation")
            .addAction(() => {
                this.centerObject.prepareToHome();
                this.enemyManager.stopSpawnAndClear();
            })
            .addDelayAction(this, 300)
            .addTweenAllAction(this, [
                {
                    targets: this.centerObject.inner,
                    rotation: this.centerObject.initRotation,
                    scale: this.centerObject.initScale,
                    duration: dt2,
                    completeDelay: 1000,
                },
                {
                    targets: this.dwitterCenter.inner,
                    alpha: 1,
                    scale: this.initDwitterScale,
                    duration: dt2,
                }
            ])
            .addFinishAction();
    }
}

