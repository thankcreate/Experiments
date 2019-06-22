var Enemy = /** @class */ (function () {
    function Enemy(scene, sprite) {
        this.scene = scene;
        this.sprite = sprite;
        this.dest = new Phaser.Geom.Point(0, 0);
        this.duration = 6000;
        this.stopDistance = 100;
    }
    Enemy.prototype.update = function (dt) {
        // let posi = myMove(this.sprite, this.dest, this.speed * dt );
        // this.sprite.x = posi.x;
        // this.sprite.y = posi.y;
        this.checkIfReachEnd();
    };
    Enemy.prototype.checkIfReachEnd = function () {
        var dis = distance(this.dest, this.sprite);
        if (dis < this.stopDistance)
            this.stopRun();
    };
    Enemy.prototype.startRun = function () {
        this.sprite.alpha = 0; // muse init from here, or it will have a blink
        this.mvTween = this.scene.tweens.add({
            targets: this.sprite,
            x: this.dest.x,
            y: this.dest.y,
            alpha: {
                getStart: function () { return 0; },
                getEnd: function () { return 1; },
                duration: 500
            },
            duration: this.duration
        });
    };
    Enemy.prototype.stopRun = function () {
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 300
        });
    };
    return Enemy;
}());
var EnemySpawner = /** @class */ (function () {
    function EnemySpawner(scene, container) {
        this.scene = scene;
        this.container = container;
        this.interval = 4000;
        this.dummy = 1;
        this.enemies = [];
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = {
            fontSize: '32px',
            fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };
        this.enemyRunDuration = 6000;
        this.spawnRadius = 400;
    }
    EnemySpawner.prototype.startSpawn = function () {
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
    };
    EnemySpawner.prototype.spawn = function () {
        console.log("Spawn");
        var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
        var posi = this.getSpawnPoint();
        var lbl = this.scene.add.text(posi.x, posi.y, this.labels[lblIndex], this.lblStyl);
        lbl.setOrigin(0.5);
        var enemy = new Enemy(this.scene, lbl);
        this.container.add(lbl);
        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;
        enemy.startRun();
    };
    EnemySpawner.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = config.scale.height;
        for (var i in this.enemies) {
            this.enemies[i].update(dt);
        }
    };
    EnemySpawner.prototype.getSpawnPoint = function () {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = Phaser.Math.Between(0, 365) / 360 * 2 * Math.PI;
        pt.x = Math.cos(rdDegree) * this.spawnRadius;
        pt.y = Math.sin(rdDegree) * this.spawnRadius;
        return pt;
    };
    return EnemySpawner;
}());
var PlayerInputText = /** @class */ (function () {
    function PlayerInputText(scene, container) {
        this.scene = scene;
        this.container = container;
        this.fontSize = 32;
        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF', fontFamily: "Georgia, serif"
        };
        this.y = -6 - this.fontSize;
        this.maxCount = 11;
        this.text; // main text input
        console.log("inito");
        this.circle;
    }
    PlayerInputText.prototype.init = function (circle) {
        var _this = this;
        this.circle = circle;
        var circleWidth = this.circle.getBounds().width;
        this.text = this.scene.add.text(-circleWidth / 2 * 0.65, this.y, "", this.lblStyl);
        this.container.add(this.text);
        this.scene.input.keyboard.on('keydown', function (event) { return _this.keydown(event); });
    };
    PlayerInputText.prototype.keydown = function (event) {
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
            || code == Phaser.Input.Keyboard.KeyCodes.SPACE) {
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
    };
    PlayerInputText.prototype.confirm = function () {
    };
    PlayerInputText.prototype.update = function (time, dt) {
    };
    PlayerInputText.prototype.checkInput = function () {
    };
    return PlayerInputText;
}());
//# sourceMappingURL=gameobjects.js.map