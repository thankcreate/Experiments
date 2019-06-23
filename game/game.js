var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super.call(this, 'Controller') || this;
    }
    Controller.prototype.preload = function () {
    };
    Controller.prototype.create = function () {
        this.scene.launch('Scene1');
        myResize();
    };
    return Controller;
}(Phaser.Scene));
var Scene1 = /** @class */ (function (_super) {
    __extends(Scene1, _super);
    function Scene1() {
        var _this = _super.call(this, 'Scene1') || this;
        _this.circle;
        _this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        _this.lblStyl = { fontSize: '32px', fill: '#000', fontFamily: "'Averia Serif Libre', Georgia, serif" };
        _this.container;
        _this.enemySpawner;
        return _this;
    }
    Scene1.prototype.preload = function () {
        this.load.image('circle', 'assets/circle.png');
    };
    Scene1.prototype.create = function () {
        this.container = this.add.container(400, 299);
        // center
        // circle
        this.circle = this.add.image(0, 0, 'circle').setScale(1.5);
        this.container.add(this.circle);
        // input area
        this.playerInput = new PlayerInputText(this, this.container);
        this.playerInput.init(this.circle);
        // enemies
        this.enemySpawner = new EnemySpawner(this, this.container);
        this.enemySpawner.startSpawn();
    };
    Scene1.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = config.scale.height;
        this.container.setPosition(w / 2, h / 2);
        this.enemySpawner.update(time, dt);
        this.playerInput.update(time, dt);
        // var c = new Phaser.Geom.Point(1,1);
        // this.testLbl.setText(kk);
    };
    return Scene1;
}(Phaser.Scene));
/// <reference path="js/scenes.ts" />
var config = {
    type: Phaser.AUTO,
    backgroundColor: '#EEEEEE',
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        parent: 'phaser-example',
        width: 8000,
        height: 1200,
        minWidth: 1200
    },
    scene: [Controller, Scene1]
};
var game = new Phaser.Game(config);
window.addEventListener('resize', function (event) {
    myResize();
}, false);
//window.onload = () => {
//    var game = new Controller();
//};
var Enemy = /** @class */ (function () {
    function Enemy(scene, enemySpawner, posi, lbl, lblStyle) {
        this.inStop = false;
        this.scene = scene;
        this.enemySpawner = enemySpawner;
        this.parentContainer = enemySpawner.container;
        this.lbl = lbl;
        this.lblStyle = lblStyle;
        this.text = this.scene.add.text(0, 0, lbl, lblStyle);
        this.inputAngle = Math.atan2(posi.y, posi.x) * 180 / Math.PI;
        this.text.setOrigin(posi.x > 0 ? 0 : 1, posi.y > 0 ? 0 : 1);
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.inner.add(this.text);
        this.dest = new Phaser.Geom.Point(0, 0);
        this.duration = 6000;
        this.stopDistance = 110;
    }
    Enemy.prototype.update = function (dt) {
        // let posi = myMove(this.sprite, this.dest, this.speed * dt );
        // this.sprite.x = posi.x;
        // this.sprite.y = posi.y;
        this.checkIfReachEnd();
    };
    Enemy.prototype.checkIfReachEnd = function () {
        if (this.inStop)
            return;
        var dis = distance(this.dest, this.inner);
        if (dis < this.stopDistance)
            this.stopRun();
    };
    Enemy.prototype.startRun = function () {
        this.inner.alpha = 0; // muse init from here, or it will have a blink
        this.mvTween = this.scene.tweens.add({
            targets: this.inner,
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
        var thisEnemy = this;
        this.inStop = true;
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 300,
            onComplete: function () {
                thisEnemy.enemySpawner.removeEnemy(thisEnemy);
                thisEnemy.inner.destroy();
            }
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
            fill: '#000000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };
        this.enemyRunDuration = 6000;
        this.spawnRadius = 500;
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
        var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
        var posi = this.getSpawnPoint();
        var enemy = new Enemy(this.scene, this, posi, this.labels[lblIndex], this.lblStyl);
        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;
        enemy.startRun();
    };
    EnemySpawner.prototype.removeEnemy = function (enemy) {
        for (var i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    };
    EnemySpawner.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = config.scale.height;
        for (var i in this.enemies) {
            this.enemies[i].update(dt);
        }
        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
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
// return the logic degisn wdith based on the config.scale.height
// this is the available canvas width
function getLogicWidth() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = config.scale.minWidth / config.scale.height;
    if (windowR > scaleR) {
        return windowR * config.scale.height;
    }
    else {
        return config.scale.minWidth;
    }
}
function myResize() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = config.scale.minWidth / config.scale.height;
    game.scale.resize(getLogicWidth(), config.scale.height);
    if (windowR > scaleR) {
        var canvas = document.querySelector("canvas");
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    else {
        var canvas = document.querySelector("canvas");
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerWidth / scaleR + "px";
    }
}
function distance(a, b) {
    var diffX = b.x - a.x;
    var diffY = b.y - a.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
}
function myMove(from, to, mv) {
    var diffX = to.x - from.x;
    var diffY = to.y - from.y;
    var d = distance(from, to);
    var ratio = mv / d;
    var rt = { x: from.x + diffX * ratio, y: from.y + diffY * ratio };
    return rt;
}
function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });
    return indexed_array;
}
function formatTwoParamsInput(param1, param2) {
    var ob = { arg1: param1, arg2: param2 };
    return JSON.stringify(ob);
}
function api2WithTwoParams(arg1, arg2, suc, err) {
    var inputString = formatTwoParamsInput(arg1, arg2);
    api2(inputString, suc, err);
}
function api2(input, suc, err) {
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api_2",
        data: input,
        success: function (result) {
            suc(result);
        },
        error: function (result) {
            err(result);
        }
    });
}
//# sourceMappingURL=game.js.map