/// <reference path="scene-controller.ts" />

class Scene1 extends BaseScene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;
    container: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;
    playerInput: PlayerInputText;

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
    }

    create() {
        this.container = this.add.container(400, 299);

        // center
        // circle
        this.circle = this.add.image(0, 0, 'circle').setScale(1.5);        
        this.container.add(this.circle);

        // input area
        this.playerInput = new PlayerInputText(this, this.container);
        this.playerInput.init(this.circle);

        // enemies
        this.enemyManager = new EnemyManager(this, this.container);
        
        
        this.enemyManager.startSpawn();
        

        // gra
        // var face = new QuickDrawFigure(this, this.container, "smiley-face");                
    }


    update(time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();  
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);

        this.enemyManager.update(time, dt);
        this.playerInput.update(time, dt);
    }
}

