class Controller extends Phaser.Scene {
    constructor() {
        super('Controller');
    }

    preload() {

    }

    create() {
        this.scene.launch('Scene1');
        myResize();
    }
}

class Scene1 extends Phaser.Scene {

    circle: Phaser.GameObjects.Image;
    labels;
    lblStyl;
    container: Phaser.GameObjects.Container;
    enemySpawner: EnemyManager;
    playerInput: PlayerInputText;

    constructor() {
        super('Scene1');

        this.circle;
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };

        this.container;

        this.enemySpawner;
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
        this.enemySpawner = new EnemyManager(this, this.container);
        this.enemySpawner.startSpawn();

        // gra
        var q = new QuickDrawFigure(this, this.container, "axe");
    }

    update(time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        this.container.setPosition(w / 2, h / 2);

        this.enemySpawner.update(time, dt);
        this.playerInput.update(time, dt);

        // var c = new Phaser.Geom.Point(1,1);
        // this.testLbl.setText(kk);
        // var graphics = this.add.graphics();
    }
}

