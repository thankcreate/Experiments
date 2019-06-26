"use strict";
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
var gameConfig = {
    enemyDuratrion: 20000,
    spawnInterval: 4000,
    onlyDamageMostMatch: true,
    tryAvoidDuplicate: true,
    quickDrawDataPath: "assets/quick-draw-data/",
    defaultHealth: 3,
    damageTiers: [
        [0.8, 2],
        [0.5, 1],
        [0, 0]
    ]
};
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
        this.enemySpawner = new EnemyManager(this, this.container);
        this.enemySpawner.startSpawn();
        // gra
        var q = new QuickDrawFigure(this, this.container, "axe");
    };
    Scene1.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        this.container.setPosition(w / 2, h / 2);
        this.enemySpawner.update(time, dt);
        this.playerInput.update(time, dt);
        // var c = new Phaser.Geom.Point(1,1);
        // this.testLbl.setText(kk);
        // var graphics = this.add.graphics();
    };
    return Scene1;
}(Phaser.Scene));
/// <reference path="scenes.ts" />
var phaserConfig = {
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
var game = new Phaser.Game(phaserConfig);
window.addEventListener('resize', function (event) {
    var fuck = 1;
    myResize();
}, false);
//window.onload = () => {
//    var game = new Controller();
//};
// return the logic degisn wdith based on the config.scale.height
// this is the available canvas width
function getLogicWidth() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    if (windowR > scaleR) {
        return windowR * phaserConfig.scale.height;
    }
    else {
        return phaserConfig.scale.minWidth;
    }
}
function myResize() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    game.scale.resize(getLogicWidth(), phaserConfig.scale.height);
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
function api(api, inputData, suc, err) {
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/" + api,
        data: inputData,
        success: function (result) {
            if (suc)
                suc(result);
        },
        error: function (result) {
            if (err)
                err(result);
        }
    });
}
// API2 is to get the similarity between two strings
function api2(input, suc, err) {
    api("api_2", input, suc, err);
}
function formatTwoParamsInput(param1, param2) {
    var ob = { arg1: param1, arg2: param2 };
    return JSON.stringify(ob);
}
function api2WithTwoParams(arg1, arg2, suc, err) {
    var inputString = formatTwoParamsInput(arg1, arg2);
    api2(inputString, suc, err);
}
// API 3 is to get the similarty between one input string and a collection of strings
function api3(input, suc, err) {
    api("api_3", input, suc, err);
}
function formatArrayParamsInput(param1, param2) {
    var ob = { input: param1, array: param2 };
    return JSON.stringify(ob);
}
function api3WithTwoParams(inputString, arrayStrings, suc, err) {
    var data = formatArrayParamsInput(inputString, arrayStrings);
    api3(data, suc, err);
}
var EnemyManager = /** @class */ (function () {
    function EnemyManager(scene, container) {
        this.scene = scene;
        this.container = container;
        this.interval = gameConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = {
            fontSize: '32px',
            fill: '#000000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };
        this.enemyRunDuration = gameConfig.enemyDuratrion;
        this.spawnRadius = 500;
    }
    EnemyManager.prototype.startSpawn = function () {
        var _this = this;
        this.spawnTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,
            onStart: function () {
                _this.spawn();
            },
            onRepeat: function () {
                _this.spawn();
            },
            repeat: -1
        });
    };
    EnemyManager.prototype.getNextName = function () {
        var ret;
        // max try count
        var maxTry = 100;
        for (var i = 0; i < maxTry; i++) {
            var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
            var name = this.labels[lblIndex];
            if (gameConfig.tryAvoidDuplicate) {
                var contains = false;
                this.enemies.forEach(function (enemy) {
                    if (enemy.lbl === name) {
                        contains = true;
                    }
                });
                if (!contains) {
                    ret = name;
                    break;
                }
            }
            else {
                ret = name;
                break;
            }
        }
        return ret;
    };
    EnemyManager.prototype.spawn = function () {
        var posi = this.getSpawnPoint();
        var name = this.getNextName();
        var enemy = new Enemy(this.scene, this, posi, name, this.lblStyl);
        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;
        enemy.startRun();
    };
    EnemyManager.prototype.removeEnemy = function (enemy) {
        for (var i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    };
    EnemyManager.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        for (var i in this.enemies) {
            this.enemies[i].update(dt);
        }
        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    };
    EnemyManager.prototype.getSpawnPoint = function () {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = Phaser.Math.Between(0, 365) / 360 * 2 * Math.PI;
        pt.x = Math.cos(rdDegree) * this.spawnRadius;
        pt.y = Math.sin(rdDegree) * this.spawnRadius;
        return pt;
    };
    // api3 callback
    EnemyManager.prototype.confirmCallbackSuc = function (res) {
        var ar = res.outputArray;
        // filter the duplicate labels
        var seen = {};
        ar = ar.filter(function (item) {
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });
        // if we only want to damage the most similar word
        if (gameConfig.onlyDamageMostMatch) {
            ar = this.findBiggestDamage(ar);
        }
        var _loop_1 = function (i) {
            var entry = ar[i];
            var entryName = ar[i].name;
            var entryValue = ar[i].value;
            // since network has latency, 
            // the enemy could have been eliminated when the callback is invoked
            // we need to be careful about the availability of the enemy
            var enemiesWithName = this_1.findEnemyByName(entryName);
            enemiesWithName.forEach(function (e) {
                e.damage(entryValue);
            });
        };
        var this_1 = this;
        for (var i in ar) {
            _loop_1(i);
        }
    };
    EnemyManager.prototype.findBiggestDamage = function (ar) {
        var ret = [];
        var max = -1;
        var entry = null;
        ar.forEach(function (element) {
            if (element.value > max) {
                max = element.value;
                entry = element;
            }
        });
        if (entry)
            ret.push(entry);
        return ret;
    };
    EnemyManager.prototype.findEnemyByName = function (name) {
        var ret = [];
        for (var i in this.enemies) {
            var e = this.enemies[i];
            if (e.lbl === name) {
                ret.push(e);
            }
        }
        return ret;
    };
    return EnemyManager;
}());
var Enemy = /** @class */ (function () {
    function Enemy(scene, enemyManager, posi, lbl, lblStyle) {
        this.stopDistance = 125;
        this.health = gameConfig.defaultHealth;
        this.inStop = false;
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.container;
        this.lbl = lbl;
        this.lblStyle = lblStyle;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        // text
        this.text = this.scene.add.text(0, 0, lbl, lblStyle);
        this.inputAngle = Math.atan2(posi.y, posi.x) * 180 / Math.PI;
        this.text.setOrigin(posi.x > 0 ? 0 : 1, posi.y > 0 ? 0 : 1);
        this.inner.add(this.text);
        // healthText
        var lb = this.text.getBottomLeft();
        this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), lblStyle);
        this.healthText.setOrigin(0, 0);
        this.inner.add(this.healthText);
        this.dest = new Phaser.Geom.Point(0, 0);
    }
    Enemy.prototype.update = function (dt) {
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
        thisEnemy.enemyManager.removeEnemy(thisEnemy);
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
    };
    Enemy.prototype.getRealHealthDamage = function (val) {
        var ret = 0;
        var tiers = gameConfig.damageTiers;
        for (var i in tiers) {
            var tier = tiers[i];
            if (val >= tier[0])
                return tier[1];
        }
        return ret;
    };
    Enemy.prototype.damage = function (val) {
        var realDamage = this.getRealHealthDamage(val);
        console.log(this.lbl + " sim: " + val + "   damaged by: " + realDamage);
        this.health -= realDamage;
        if (this.health < 0) {
            this.stopRun();
        }
        this.health = Math.max(0, this.health);
        this.healthText.setText(this.health.toString());
    };
    return Enemy;
}());
var PlayerInputText = /** @class */ (function () {
    function PlayerInputText(scene, container) {
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
    PlayerInputText.prototype.init = function (circle) {
        var _this = this;
        this.circle = circle;
        var circleWidth = this.circle.getBounds().width;
        this.text = this.scene.add.text(-circleWidth / 2 * 0.65, this.y, "", this.lblStyl);
        this.parentContainer.add(this.text);
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
        var _this = this;
        var enemies = this.scene.enemySpawner.enemies;
        var inputWord = this.text.text;
        var enemyLabels = [];
        for (var i in enemies) {
            var enemy = enemies[i];
            enemyLabels.push(enemy.lbl);
        }
        api3WithTwoParams(inputWord, enemyLabels, 
        // suc
        function (res) {
            // console.log(res);
            _this.scene.enemySpawner.confirmCallbackSuc(res);
        }, 
        // err
        function err(res) {
            // console.log("API3 failed");
        });
    };
    PlayerInputText.prototype.update = function (time, dt) {
    };
    PlayerInputText.prototype.checkInput = function () {
    };
    return PlayerInputText;
}());
var QuickDrawFigure = /** @class */ (function () {
    function QuickDrawFigure(scene, parentContainer, lbl) {
        var _this = this;
        this.curIndex = -1;
        this.interval = 300;
        this.graphicLineStyle = {
            width: 4,
            color: 0xFF0000,
            alpha: 1
        };
        this.sampleRate = 255;
        this.originX = 0.5;
        this.originY = 0.5;
        this.newSize = 150;
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.lbl = lbl;
        this.inner = this.scene.add.graphics({ lineStyle: this.graphicLineStyle });
        var fullPath = this.getFilePathByLbl(lbl);
        $.getJSON(fullPath, function (json) {
            _this.figures = json;
            // this.drawFigure(this.figures[3]);           
            _this.startChange();
        });
        this.parentContainer.add(this.inner);
    }
    // 
    QuickDrawFigure.prototype.drawFigure = function (figure) {
        var strokes = figure.drawing;
        this.inner.clear();
        // let maxY = -10000;
        // let maxX = -10000;
        // the sample is 255, which means that x, y are both <= 255
        for (var strokeI = 0; strokeI < strokes.length; strokeI++) {
            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for (var i = 0; i < count - 1; i++) {
                this.mappedLineBetween(xArr[i], yArr[i], xArr[i + 1], yArr[i + 1]);
                // maxX = Math.max(maxX, xArr[i]);
                // maxY = Math.max(maxY, yArr[i]);
            }
        }
        // console.log("MaxX: " + maxX + "   MaxY: " + maxY) ;
    };
    QuickDrawFigure.prototype.mappedLineBetween = function (x1, y1, x2, y2) {
        var mappedPosi1 = this.getMappedPosi(x1, y1);
        var mappedPosi2 = this.getMappedPosi(x2, y2);
        this.inner.lineBetween(mappedPosi1[0], mappedPosi1[1], mappedPosi2[0], mappedPosi2[1]);
    };
    QuickDrawFigure.prototype.getFilePathByLbl = function (lbl) {
        var folderPath = gameConfig.quickDrawDataPath;
        return folderPath + lbl + ".json";
    };
    QuickDrawFigure.prototype.startChange = function () {
        var _this = this;
        this.changeTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,
            onStart: function () {
                _this.change();
            },
            onRepeat: function () {
                _this.change();
            },
            repeat: -1
        });
    };
    QuickDrawFigure.prototype.change = function () {
        if (!this.figures || this.figures.length == 0)
            return;
        this.curIndex = (this.curIndex + 1) % this.figures.length;
        this.drawFigure(this.figures[this.curIndex]);
    };
    QuickDrawFigure.prototype.getMappedPosi = function (x, y) {
        var scaleRate = this.newSize / this.sampleRate;
        var posi = [
            x * scaleRate - this.newSize * this.originX,
            y * scaleRate - this.newSize * this.originY
        ];
        return posi;
    };
    return QuickDrawFigure;
}());
