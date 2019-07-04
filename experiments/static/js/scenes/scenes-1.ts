/// <reference path="scene-controller.ts" />

class Scene1 extends BaseScene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;
    container: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;
    playerInput: PlayerInputText;

    centerObject: CenterObject;

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
        this.load.image('speaker', 'assets/speaker_dot.png'); 
    }

    create() {
        this.container = this.add.container(400, 299);

        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));

        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);       

        this.centerObject.playerInputText.confirmedEvent.on(
            input => {this.enemyManager.inputTextConfirmed(input)});

        this.enemyManager.startSpawn();

    }


    update(time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();  
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);

        this.enemyManager.update(time, dt);
    }
}

