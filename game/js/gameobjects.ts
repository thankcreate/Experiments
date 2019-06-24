class Enemy {

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Container;
    parentContainer: Phaser.GameObjects.Container;
    enemySpawner: EnemySpawner;

    lbl: string;
    lblStyle: object;

    text: Phaser.GameObjects.Text;
    healthText: Phaser.GameObjects.Text;

    dest: Phaser.Geom.Point;
    duration: number;
    stopDistance: number = 125;

    mvTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number = 1;



    constructor(scene, enemySpawner: EnemySpawner, posi, lbl, lblStyle) {
        this.scene = scene;
        this.enemySpawner = enemySpawner;
        this.parentContainer = enemySpawner.container;
        this.lbl = lbl;
        this.lblStyle = lblStyle;

        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);



        // textt
        this.text = this.scene.add.text(0, 0, lbl, lblStyle);
        this.inputAngle = Math.atan2(posi.y, posi.x) * 180 / Math.PI;        
        this.text.setOrigin(posi.x > 0 ? 0 : 1, posi.y > 0 ? 0 : 1);
        this.inner.add(this.text);

        // healthText
        let lb = this.text.getBottomLeft();
        this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), lblStyle);
        this.healthText.setOrigin(0, 0);
        this.inner.add(this.healthText);


        this.dest = new Phaser.Geom.Point(0, 0);
        
    }

    update(dt) {
        // let posi = myMove(this.sprite, this.dest, this.speed * dt );
        // this.sprite.x = posi.x;
        // this.sprite.y = posi.y;

        this.checkIfReachEnd();
    }

    checkIfReachEnd() {
        if (this.inStop)
            return;

        

        let dis = distance(this.dest, this.inner);        
        if (dis < this.stopDistance)
            this.stopRun();
    }

    startRun() {
        this.inner.alpha = 0; // muse init from here, or it will have a blink
        this.mvTween = this.scene.tweens.add({
            targets: this.inner,
            x: this.dest.x,
            y: this.dest.y,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
                duration: 500
            },
            duration: this.duration
        });
    }

    inStop: boolean = false;
    stopRun() {   
        let thisEnemy = this;

        thisEnemy.enemySpawner.removeEnemy(thisEnemy);

        this.inStop = true; 
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 300,
            onComplete: function () {
                
                thisEnemy.inner.destroy();
            }
        });
    }

    damage(val: number) {
        console.log(this.lbl + " damaged by " + val);
        this.health -= val;
        if (this.health < 0) {
            this.stopRun();
        }
        this.health = Math.max(0, this.health);
        this.healthText.setText(this.health.toString());
    }
}

class EnemySpawner {
    scene: Phaser.Scene;
    container: Phaser.GameObjects.Container; // main scene container

    interval;
    dummy;

    enemies: Enemy[];
    labels;

    lblStyl;

    spawnTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;

    enemyRunDuration;
    spawnRadius;

    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.interval = 3000;
        this.dummy = 1;

        this.enemies = [];


        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];

        this.lblStyl = {
            fontSize: '32px',
            fill: '#000000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };

        this.enemyRunDuration = 10000;
        this.spawnRadius = 500;
    }

    startSpawn() {
        this.spawnTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,

            onStart: function () {
                this.spawn();
            }.bind(this),

            onRepeat: function () {
                this.spawn();
            }.bind(this),

            repeat: -1
        });
    }

    spawn() {

        var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
        var posi = this.getSpawnPoint();
        var enemy = new Enemy(this.scene, this, posi, this.labels[lblIndex], this.lblStyl);

        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;

        enemy.startRun();
    }

    removeEnemy(enemy: Enemy) {
        for (let i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    }

    update(time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = config.scale.height;

        for (let i in this.enemies) {
            this.enemies[i].update(dt);
        }
        

        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }

    getSpawnPoint() {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = Phaser.Math.Between(0, 365) / 360 * 2 * Math.PI;
        pt.x = Math.cos(rdDegree) * this.spawnRadius;
        pt.y = Math.sin(rdDegree) * this.spawnRadius;

        return pt;
    }

    // api3 callback
    confirmCallbackSuc(res) {
        var ar = res.outputArray;
        for (let i in ar) {
            let entry = ar[i];
            let entryName = ar[i].name;
            let entryValue = ar[i].value;

            // since network has latency, 
            // the enemy could have been eliminated when the callback is invoked
            // we need to be careful about the availability of the enemy
            let enemy = this.findEnemyByName(entryName);
            if (enemy) {
                enemy.damage(entryValue);
            }
        }
    }

    findEnemyByName(name: string): Enemy {
        let ret: Enemy = null;
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (e.lbl === name) {
                ret = e;
                break;
            }            
        }
        
        return ret;
    }

}

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
            function suc(res) {
                console.log(res);
                this.scene.enemySpawner.confirmCallbackSuc(res);
            }.bind(this),
            function err(res) {
                console.log("API3 failed");
            }
        );
    }

    
    

    update(time, dt) {

    }

    checkInput() {

    }
}

