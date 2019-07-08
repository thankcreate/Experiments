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

        this.centerObject.playerInputText.confirmedEvent.on(
            input => { this.enemyManager.inputTextConfirmed(input) });

        // this.enemyManager.startSpawn();

        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = this.add.image(footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, "footer").setOrigin(0, 1);
        this.fitImageToSize(this.footer, 100);

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
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);

        this.enemyManager.update(time, dt);

        this.centerObject.update();
    }

    getMainFsm() : IFsmData{
        return mainFsm;
    }

    initFsm() {
        this.fsm = new Fsm(this, this.getMainFsm());
        
      
        this.fsm.getState("Home").setAsStartup().setOnEnter(s => {
            let mainImage = this.centerObject.mainImage;

            s.autoOn(mainImage, 'pointerover', e => {
                this.centerObject.playerInputText.homePointerOver();
            });

            s.autoOn(mainImage, 'pointerout', e => {
                this.centerObject.playerInputText.homePointerOut();
            });

            s.autoOn(mainImage, 'pointerdown', e=> {
                this.centerObject.playerInputText.homePointerDown();
                s.finished();
            });
        });              

        this.fsm.getState("HomeToGameAnimation")
        .addDelayAction(this, 1500)
        .addAction((state, result, resolve, reject) => {

            let dt = 1000;
            TweenPromise.create(this,{                
                targets: this.centerObject.inner,
                rotation: 0,
                scale: 1.2,
                duration: dt,
                completeDelay: 1000 
            })
            .then(resolve);   // <--------- Resolve

            let fadeOutter =  this.tweens.add({                
                targets: this.centerObject.outterDwitterImage,
                alpha: 0,
                scale: 2,
                duration: dt,
            });
        })
        .addDelayAction(this, 500)
        .addFinishAction();

        
        // this.fsm.getState("HomeToGameAnimation").setOnEnter(s => {
        //     let delayDt = 1500;
        //     let dt = 1000;

        //     TweenPromise.create(this,{
        //         delay: delayDt,
        //         targets: this.centerObject.inner,
        //         rotation: 0,
        //         scale: 1.2,
        //         duration: dt,
        //         completeDelay: 1000 
        //     })
        //     .then( res =>
        //         s.finished()
        //     );

        //     let fadeOutter =  this.tweens.add({
        //         delay: delayDt,
        //         targets: this.centerObject.outterDwitterImage,
        //         alpha: 0,
        //         scale: 2,
        //         duration: dt,
        //     });
        // });

        this.fsm.getState("NormalGame").setOnEnter(s => {
            this.centerObject.playerInputText.transferToScene1TweenCompleted();
            this.centerObject.speakerBtn.toSpeakerMode(1000);
            this.enemyManager.startSpawn();

            $(document).keydown(event =>{
                console.log(s.isActive());
                if(!s.isActive()) 
                    return;                    

                var code = event.keyCode;
                
                console.log(code + " " +Phaser.Input.Keyboard.KeyCodes.B);
                if (code == Phaser.Input.Keyboard.KeyCodes.B) {
                    console.log("transfer");
                    s.fsm.event("BackToHome");
                }
            });
        });

        this.fsm.getState("BackToHomeAnimation").setOnEnter(s=>{
            console.log("hahahahaha");
            let delayDt = 1500;
            let dt = 1000;
            let centerRotateTween = this.tweens.add({
                delay: delayDt,
                targets: this.centerObject.inner,
                rotation: this.centerObject.initRotation,
                scale: this.centerObject.initScale,
                duration: dt,
                completeDelay: 1000,
                onComplete: () => {
                    this.centerObject.playerInputText.transferToScene1TweenCompleted();
                    this.centerObject.speakerBtn.toSpeakerMode(1000);

                    // Finished
                    s.finished();
                }
            });

            let fadeOutter =  this.tweens.add({
                delay: delayDt,
                targets: this.centerObject.outterDwitterImage,
                alpha: 1,
                scale: this.centerObject.initOutterDwitterScale,
                duration: dt,
            });
        });

        this.fsm.start();
    }
}

