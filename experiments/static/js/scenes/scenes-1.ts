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
            input => {this.enemyManager.inputTextConfirmed(input)});

        // this.enemyManager.startSpawn();

        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = this.add.image(footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, "footer").setOrigin(0, 1);        
        this.fitImageToSize(this.footer, 100);
    }

    fitImageToSize(image: PhImage, height: number, width?: number, ) {
        let oriRatio = image.width / image.height;
        image.displayHeight = height;
        if(width) {
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
}

