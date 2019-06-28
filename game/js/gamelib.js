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
var BaseScene = /** @class */ (function (_super) {
    __extends(BaseScene, _super);
    function BaseScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseScene.prototype.playSpeech = function (text) {
        var controller = this.scene.get("Controller");
        controller.speechManager.quickLoadAndPlay(text);
    };
    return BaseScene;
}(Phaser.Scene));
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super.call(this, 'Controller') || this;
    }
    Controller.prototype.preload = function () {
    };
    Controller.prototype.create = function () {
        this.speechManager = new SpeechManager(this);
        this.scene.launch('Scene1');
        myResize(this.game);
    };
    return Controller;
}(BaseScene));
/// <reference path="scene-controller.ts" />
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
        var face = new QuickDrawFigure(this, this.container, "smiley-face");
    };
    Scene1.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        this.container.setPosition(w / 2, h / 2);
        this.enemySpawner.update(time, dt);
        this.playerInput.update(time, dt);
    };
    return Scene1;
}(BaseScene));
/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />
var gameplayConfig = {
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
function myResize(gm) {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;
    gm.scale.resize(getLogicWidth(), phaserConfig.scale.height);
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
function getArrayInputData() {
    var data = { "input": "", "array": "" };
    data.input = $('#arg1').val().trim();
    data.array = $('#arg2').val().trim().split(' ');
    return data;
}
function test_api3() {
    var inputData = getArrayInputData();
    $.ajax({
        //几个参数需要注意一下
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api_3",
        data: JSON.stringify(inputData),
        success: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)       
        },
        error: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)                    
        }
    });
}
function test_api2() {
    $.ajax({
        //几个参数需要注意一下
        type: "POST",
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        url: "/api_2",
        data: JSON.stringify(getFormData($("#form1"))),
        success: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)       
            $('#res').html(result.res);
            $('#arg1').val('');
            $('#arg2').val('');
        },
        error: function (result) {
            console.log(result); //打印服务端返回的数据(调试用)                    
        }
    });
}
function magic() {
    test_api3();
    // test();
}
$('#form1').keydown(function (e) {
    var key = e.which;
    if (key == 13) {
        magic();
    }
});
function yabali() {
    // $.getJSON("assets/treeone.ndjson", function (json) {
    //     console.log(json); // this will show the info it in firebug console
    // });
    testSpeechAPI2();
}
function testSpeechAPI() {
    var inputText = $('#arg1').val();
    var id = $('#arg2').val();
    apiTextToSpeech(inputText, id, function (sucData) {
        console.log(sucData);
    }, function (errData) {
        console.log("fail speech");
    });
}
function testSpeechAPI2() {
    var inputText = $('#arg1').val();
    var id = $('#arg2').val();
    var dataOb = { input: inputText, id: id };
    var dataStr = JSON.stringify(dataOb);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api_speech", true);
    oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response;
        console.log(arrayBuffer);
        var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audio.load();
        audio.play();
        console.log('haha ririr');
    };
    oReq.send(dataStr);
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
function api(api, inputData, suc, err, dtType) {
    $.ajax({
        type: "POST",
        dataType: 'json',
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
// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech(inputText, identifier, suc, err) {
    var dataOb = { input: inputText, id: identifier, api: 1 };
    var dataStr = JSON.stringify(dataOb);
    api("api_speech", dataStr, suc, err);
}
// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech2(inputText, identifier, suc, err) {
    var dataOb = { input: inputText, id: identifier, api: 2 };
    var dataStr = JSON.stringify(dataOb);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api_speech", true);
    oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
        suc(oReq);
        // var audio = new Audio(url);
        // audio.load();
        // audio.play();
        // console.log('haha ririr');
    };
    oReq.send(dataStr);
}
var EnemyManager = /** @class */ (function () {
    function EnemyManager(scene, container) {
        this.scene = scene;
        this.container = container;
        this.interval = gameplayConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];
        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.lblStyl = {
            fontSize: '32px',
            fill: '#000000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };
        this.enemyRunDuration = gameplayConfig.enemyDuratrion;
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
            if (gameplayConfig.tryAvoidDuplicate) {
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
        if (gameplayConfig.onlyDamageMostMatch) {
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
        this.health = gameplayConfig.defaultHealth;
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
        var tiers = gameplayConfig.damageTiers;
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
        this.maxCount = 100;
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
        this.scene.playSpeech(inputWord);
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
        this.interval = 200;
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
        var folderPath = gameplayConfig.quickDrawDataPath;
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
var SpeechManager = /** @class */ (function () {
    function SpeechManager(scene) {
        this.loadedSpeechFiles = {};
        this.scene = scene;
    }
    SpeechManager.prototype.quickLoadAndPlay = function (text) {
        var _this = this;
        apiTextToSpeech2(text, "no_id", function (oReq) {
            console.log("oa");
            var arrayBuffer = oReq.response;
            // this blob may leak memory
            var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
            var url = URL.createObjectURL(blob);
            console.log(url);
            _this.phaserLoadAndPlay(text, text, url);
            // this.scene.load.cacheManager.audio.add("hahakey", arrayBuffer);
            // this.scene.sound.play("hahakey");            
            // var audio = new Audio(url);
            // audio.load();
            // audio.play();
        });
    };
    SpeechManager.prototype.serverLoadAndPlay = function (text) {
        var _this = this;
        apiTextToSpeech(text, "no_id", function (sucRet) {
            var retID = sucRet.id;
            var retText = sucRet.input;
            var retPath = sucRet.outputPath;
            var md5 = sucRet.md5;
            // console.log(sucRet);            
            // console.log("suc apiTextToSpeech: " + retText);
            _this.phaserLoadAndPlay(retText, md5, retPath);
        });
    };
    SpeechManager.prototype.clearSpeechCache = function () {
        this.scene.load.cacheManager.audio.entries.clear();
        for (var key in this.loadedSpeechFiles) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFiles = {};
    };
    SpeechManager.prototype.phaserLoadAndPlay = function (text, key, fullPath) {
        // console.log("------------------------------");      
        var cached = this.scene.load.cacheManager.audio.has(key);
        // double check
        if (this.loadedSpeechFiles.hasOwnProperty(key) && cached) {
            this.scene.sound.play(key);
        }
        else {
            // console.log(fullPath);
            this.scene.load.audio(key, [fullPath]);
            var localThis_1 = this;
            this.scene.load.addListener('filecomplete', function onCompleted(arg1, arg2, arg3) {
                console.log("actually!!!!!!!!1");
                localThis_1.loadedSpeechFiles[key] = true;
                if (arg1 === key)
                    localThis_1.scene.sound.play(key);
                localThis_1.scene.load.removeListener('filecomplete', onCompleted);
            });
            this.scene.load.start();
            // }
        }
    };
    return SpeechManager;
}());
