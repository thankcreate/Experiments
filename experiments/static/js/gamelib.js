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
        _this.enemyManager;
        return _this;
    }
    Scene1.prototype.preload = function () {
        this.load.image('circle', 'assets/circle.png');
        this.load.image('speaker', 'assets/speaker_dot.png');
    };
    Scene1.prototype.create = function () {
        var _this = this;
        this.container = this.add.container(400, 299);
        // Center cicle-like object
        this.centerObject = new CenterObject(this, this.container, MakePoint2(220, 220));
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);
        this.centerObject.playerInputText.confirmedEvent.on(function (input) { _this.enemyManager.inputTextConfirmed(input); });
        this.enemyManager.startSpawn();
    };
    Scene1.prototype.update = function (time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;
        this.container.setPosition(w / 2, h / 2);
        this.enemyManager.update(time, dt);
    };
    return Scene1;
}(BaseScene));
/// <reference path="scenes/scenes-1.ts" />
/// <reference path="scenes/scene-controller.ts" />
var gameplayConfig = {
    enemyDuratrion: 30000,
    spawnInterval: 8000,
    onlyDamageMostMatch: false,
    allowDamageBySameWord: false,
    tryAvoidDuplicate: true,
    allowSameInput: true,
    quickDrawDataPath: "assets/quick-draw-data/",
    defaultHealth: 3,
    damageTiers: [
        [0.8, 3],
        [0.5, 2],
        [0.4, 1],
        [0, 0]
    ],
    defaultTextSize: '32px',
    defaultImageTitleSize: '28px',
    defaultFontFamily: "'Averia Serif Libre', Georgia, serif",
    defaultFontFamilyFirefox: "Georgia, serif",
    healthIndicatorFontFamily: '"Trebuchet MS", Helvetica, sans-serif',
    healthIndicatorWidth: 32,
    drawDataSample: 255,
    drawDataDefaultSize: 150
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
var ErrorInputCode;
(function (ErrorInputCode) {
    ErrorInputCode[ErrorInputCode["NoError"] = 0] = "NoError";
    ErrorInputCode[ErrorInputCode["Same"] = 1] = "Same";
    ErrorInputCode[ErrorInputCode["Contain"] = 2] = "Contain";
    ErrorInputCode[ErrorInputCode["Wrap"] = 3] = "Wrap";
    ErrorInputCode[ErrorInputCode["TooShort"] = 4] = "TooShort";
    ErrorInputCode[ErrorInputCode["Repeat"] = 5] = "Repeat";
    ErrorInputCode[ErrorInputCode["DamagedBefore"] = 6] = "DamagedBefore";
    ErrorInputCode[ErrorInputCode["NotWord"] = 7] = "NotWord";
})(ErrorInputCode || (ErrorInputCode = {}));
var TypedEvent = /** @class */ (function () {
    function TypedEvent() {
        var _this = this;
        this.listeners = [];
        this.listenersOncer = [];
        this.on = function (listener) {
            _this.listeners.push(listener);
            return {
                dispose: function () { return _this.off(listener); }
            };
        };
        this.once = function (listener) {
            _this.listenersOncer.push(listener);
        };
        this.off = function (listener) {
            var callbackIndex = _this.listeners.indexOf(listener);
            if (callbackIndex > -1)
                _this.listeners.splice(callbackIndex, 1);
        };
        this.emit = function (event) {
            _this.listeners.forEach(function (listener) { return listener(event); });
            _this.listenersOncer.forEach(function (listener) { return listener(event); });
            _this.listenersOncer = [];
        };
        this.pipe = function (te) {
            return _this.on(function (e) { return te.emit(e); });
        };
    }
    return TypedEvent;
}());
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
var BrowserType;
(function (BrowserType) {
    BrowserType[BrowserType["IE"] = 0] = "IE";
    BrowserType[BrowserType["Eedge"] = 1] = "Eedge";
    BrowserType[BrowserType["Firefox"] = 2] = "Firefox";
    BrowserType[BrowserType["Chrome"] = 3] = "Chrome";
    BrowserType[BrowserType["Opera"] = 4] = "Opera";
    BrowserType[BrowserType["Safari"] = 5] = "Safari";
    BrowserType[BrowserType["Unknown"] = 6] = "Unknown";
})(BrowserType || (BrowserType = {}));
function isChrome() {
    return getExplore() == BrowserType.Chrome;
}
function isFirefox() {
    return getExplore() == BrowserType.Firefox;
}
function getExplore() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
        (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
                (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] :
                            (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0;
    if (Sys.ie)
        return BrowserType.IE;
    if (Sys.edge)
        return BrowserType.Eedge;
    if (Sys.firefox)
        return BrowserType.Firefox;
    if (Sys.chrome)
        return BrowserType.Chrome;
    if (Sys.opera)
        return BrowserType.Opera;
    if (Sys.safari)
        return BrowserType.Safari;
    // if (Sys.ie) return ('IE: ' + Sys.ie);  
    // if (Sys.edge) return ('EDGE: ' + Sys.edge);
    // if (Sys.firefox) return ('Firefox: ' + Sys.firefox);  
    // if (Sys.chrome) return ('Chrome: ' + Sys.chrome);  
    // if (Sys.opera) return ('Opera: ' + Sys.opera);  
    // if (Sys.safari) return ('Safari: ' + Sys.safari);
    return BrowserType.Unknown;
}
function getDefaultFontFamily() {
    // * firefox will not show the text if the font is loading
    if (isFirefox()) {
        return gameplayConfig.defaultFontFamilyFirefox;
    }
    return gameplayConfig.defaultFontFamily;
}
function getDefaultTextStyle() {
    var ret = {
        fontSize: gameplayConfig.defaultTextSize,
        fill: '#000000',
        fontFamily: getDefaultFontFamily(),
    };
    return ret;
}
function MakePoint2(x, y) {
    return new Phaser.Geom.Point(x, y);
}
function cpp(pt) {
    return new Phaser.Geom.Point(pt.x, pt.y);
}
function getGame() {
    var thisGame = window.game;
    return thisGame;
}
function lerp(start, end, perc) {
    return (end - start) * perc + start;
}
var CenterObject = /** @class */ (function () {
    function CenterObject(scene, parentContainer, designSize) {
        var _this = this;
        this.speakerRight = 56;
        this.speakerLeft = -56;
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);
        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);
        this.mainImage = this.scene.add.image(0, 0, "circle");
        this.inner.add(this.mainImage);
        this.speakerImage = this.scene.add.image(this.speakerRight, 28, "speaker");
        this.inner.add(this.speakerImage);
        this.playerInputText = new PlayerInputText(this.scene, this.inner, this);
        this.playerInputText.init(this.getDesignWidth());
        this.playerInputText.changedEvent.on(function (inputControl) { _this.playerInputChanged(inputControl); });
    }
    CenterObject.prototype.playerInputChanged = function (inputControl) {
        var percent = inputControl.text.width / this.getTextMaxWidth();
        percent = Math.max(0, percent);
        percent = Math.min(1, percent);
        var desti = lerp(this.speakerRight, this.speakerLeft, percent);
        // this.speakerImage.x = desti;
        if (percent == 0) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerImage,
                x: desti,
                // alpha: {
                //     getStart: () => 0,
                //     getEnd: () => 1,
                //     duration: 500
                // },
                duration: 150
            });
        }
        else {
            if (this.backToZeroTween)
                this.backToZeroTween.stop();
            // this.speakerImage.x = desti;
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerImage,
                x: desti,
                // alpha: {
                //     getStart: () => 0,
                //     getEnd: () => 1,
                //     duration: 500
                // },
                duration: 50
            });
        }
    };
    CenterObject.prototype.getDesignWidth = function () {
        return this.designSize.x;
    };
    CenterObject.prototype.getTextMaxWidth = function () {
        return this.getDesignWidth() * 0.65;
    };
    return CenterObject;
}());
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Text"] = 0] = "Text";
    EnemyType[EnemyType["TextWithImage"] = 1] = "TextWithImage";
    EnemyType[EnemyType["Image"] = 2] = "Image";
})(EnemyType || (EnemyType = {}));
var Enemy = /** @class */ (function () {
    function Enemy(scene, enemyManager, posi, lblStyle, config) {
        this.centerRadius = 125;
        this.health = gameplayConfig.defaultHealth;
        this.damagedHistory = []; //store only valid input history
        this.inStop = false;
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.container;
        this.lbl = config.label;
        this.lblStyle = lblStyle;
        this.initPosi = posi;
        this.config = config;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.dest = new Phaser.Geom.Point(0, 0);
        this.initContent();
    }
    Enemy.prototype.initContent = function () {
        // init in inheritance
    };
    Enemy.prototype.update = function (time, dt) {
        this.checkIfReachEnd();
        this.healthIndicator.update(time, dt);
    };
    Enemy.prototype.checkIfReachEnd = function () {
        if (this.inStop)
            return;
        var dis = distance(this.dest, this.inner);
        var stopDis = this.getStopDistance();
        // console.log(stopDis);
        // console.log("dis:" + dis +  "stopdis:" + stopDis );
        if (dis < stopDis)
            this.stopRun();
    };
    Enemy.prototype.getStopDistance = function () {
        return this.centerRadius;
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
    Enemy.prototype.checkIfDamagedByThisWordBefore = function (input) {
        for (var i in this.damagedHistory) {
            if (this.damagedHistory[i] === input) {
                return true;
            }
        }
        return false;
    };
    Enemy.prototype.damage = function (val, input) {
        var ret = {
            damage: 0,
            code: this.checkIfInputLegalWithEnemy(input, this.lbl)
        };
        // Found error
        if (ret.code != ErrorInputCode.NoError) {
            return ret;
        }
        // Zero damage
        ret.damage = this.getRealHealthDamage(val);
        if (ret.damage == 0) {
            return ret;
        }
        // Damaged by thie same input word before
        if (!gameplayConfig.allowDamageBySameWord && this.checkIfDamagedByThisWordBefore(input)) {
            ret.code = ErrorInputCode.DamagedBefore;
            return ret;
        }
        // Update history
        this.damagedHistory.push(input);
        console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);
        // Handle health
        this.health -= ret.damage;
        if (this.health <= 0) {
            this.eliminated();
        }
        this.health = Math.max(0, this.health);
        this.healthIndicator.damagedTo(this.health);
        return ret;
    };
    Enemy.prototype.eliminated = function () {
        this.stopRun();
    };
    Enemy.prototype.checkIfInputLegalWithEnemy = function (inputLbl, enemyLbl) {
        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();
        if (inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;
        if (enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }
        if (inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }
        return ErrorInputCode.NoError;
    };
    return Enemy;
}());
var EnemyImage = /** @class */ (function (_super) {
    __extends(EnemyImage, _super);
    function EnemyImage(scene, enemyManager, posi, lblStyle, config) {
        return _super.call(this, scene, enemyManager, posi, lblStyle, config) || this;
    }
    EnemyImage.prototype.initContent = function () {
        _super.prototype.initContent.call(this);
        this.gap = 10;
        // figure
        this.figure = new QuickDrawFigure(this.scene, this.inner, this.config.image);
        var lb = this.figure.getLeftBottom();
        var rb = this.figure.getRightBottom();
        this.lblStyle.fontSize = gameplayConfig.defaultImageTitleSize;
        // text
        this.text = this.scene.add.text((lb.x + lb.y) / 2, lb.y + this.gap, this.config.label, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;
        this.text.setOrigin(0.5, 0);
        this.inner.add(this.text);
        var lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
        // // healthText
        // let lb = this.text.getBottomLeft();
        // this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), this.lblStyle);
        // this.healthText.setOrigin(0, 0);
        // this.inner.add(this.healthText);  
    };
    EnemyImage.prototype.getStopDistance = function () {
        return this.centerRadius + gameplayConfig.drawDataDefaultSize / 2 + 10;
    };
    return EnemyImage;
}(Enemy));
var EnemyManager = /** @class */ (function () {
    function EnemyManager(scene, container) {
        this.scene = scene;
        this.container = container;
        this.interval = gameplayConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];
        // this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.labels = figureNames;
        this.lblStyl = getDefaultTextStyle();
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
                // console.log('onstart');
                _this.spawn();
            },
            onRepeat: function () {
                _this.spawn();
            },
            repeat: -1
        });
    };
    EnemyManager.prototype.getNextName = function () {
        var ret = "";
        // max try count
        var maxTry = 100;
        for (var i = 0; i < maxTry; i++) {
            var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
            var name = this.labels[lblIndex];
            if (gameplayConfig.tryAvoidDuplicate) {
                var contains = false;
                this.enemies.forEach(function (enemy) {
                    if (enemy.lbl.toLocaleLowerCase() === name.toLocaleLowerCase()) {
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
        return ret[0].toUpperCase() + ret.substring(1, ret.length);
    };
    EnemyManager.prototype.spawn = function () {
        var posi = this.getSpawnPoint();
        var name = this.getNextName();
        var figureName = name.split(' ').join('-').toLowerCase();
        // var enemy = new EnemyText(this.scene, this, posi, this.lblStyl, {
        //     type: EnemyType.Text,
        //     label: name
        // });
        var enemy = new EnemyImage(this.scene, this, posi, this.lblStyl, {
            type: EnemyType.Image,
            label: name,
            image: figureName
        });
        // console.log('-------------------------')
        this.enemies.forEach(function (item) {
            // console.log("item: " + item.lbl + " " + item.inner.x + " "+ item.inner.y + " "+ item.inner.alpha);
        });
        // console.log(this.enemies.length + "  name:" + name);
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
            this.enemies[i].update(time, dt);
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
    // inputConfirm(input: string) {
    //     var enemies = this.enemies;        
    //     var inputWord = input;
    //     let checkLegal : ErrorInputCode = this.checkIfInputLegalAlone(inputWord);
    //     if(checkLegal == ErrorInputCode.NoError) {
    //         this.sendInputToServer(inputWord);
    //     }
    //     else {
    //         console.log("ErrorInputCode before send: " + checkLegal);
    //     }
    // }
    EnemyManager.prototype.sendInputToServer = function (inputWord) {
        var _this = this;
        this.scene.playSpeech(inputWord);
        var enemyLabels = [];
        for (var i in this.enemies) {
            var enemy = this.enemies[i];
            enemyLabels.push(enemy.lbl);
        }
        api3WithTwoParams(inputWord, enemyLabels, 
        // suc
        function (res) {
            // console.log(res);
            _this.confirmCallbackSuc(res);
        }, 
        // err
        function err(res) {
            // console.log("API3 failed");
        });
    };
    // api3 callback
    EnemyManager.prototype.confirmCallbackSuc = function (res) {
        var ar = res.outputArray;
        var input = res.input;
        // filter the duplicate labels
        var seen = {};
        ar = ar.filter(function (item) {
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });
        var legal = true;
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
                e.damage(entryValue, input);
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
    // haha
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
    /**
     * PlayerInputTextListener interface implement
     * @param input
     */
    EnemyManager.prototype.inputTextConfirmed = function (input) {
        this.sendInputToServer(input);
    };
    return EnemyManager;
}());
/// <reference path="enemy-base.ts" />
var EnemyText = /** @class */ (function (_super) {
    __extends(EnemyText, _super);
    function EnemyText(scene, enemyManager, posi, lblStyle, config) {
        return _super.call(this, scene, enemyManager, posi, lblStyle, config) || this;
    }
    EnemyText.prototype.initContent = function () {
        _super.prototype.initContent.call(this);
        // text
        this.text = this.scene.add.text(0, 0, this.lbl, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;
        this.text.setOrigin(this.initPosi.x > 0 ? 0 : 1, this.initPosi.y > 0 ? 0 : 1);
        this.inner.add(this.text);
        // healthText
        var lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
    };
    return EnemyText;
}(Enemy));
var HealthIndicator = /** @class */ (function () {
    // mvTween: PhTween;
    function HealthIndicator(scene, parentContainer, posi, num) {
        this.textPosi = MakePoint2(0, 1);
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.num = num;
        // circle
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 1); // background circle
        this.graphics.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        this.inner.add(this.graphics);
        // text health
        this.text = this.makeCenterText(num);
        // text mask
        this.maskGraph = this.scene.make.graphics({});
        this.maskGraph.fillStyle(0x0000ff, 1); // background circle
        this.maskGraph.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        var p = this.getAbsolutePosi(this.inner, this.textPosi);
        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;
        this.mask = this.maskGraph.createGeometryMask();
        this.text.setMask(this.mask);
    }
    HealthIndicator.prototype.makeCenterText = function (num, offsetX, offsetY) {
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        this.textStyle = getDefaultTextStyle();
        this.textStyle.fontFamily = gameplayConfig.healthIndicatorFontFamily;
        this.textStyle.fill = '#FFFFFF';
        this.textStyle.fontSize = '28px';
        var t = this.scene.add.text(this.textPosi.x + offsetX, this.textPosi.y + offsetY, num.toString(), this.textStyle);
        t.setOrigin(0.5, 0.5);
        this.inner.add(t);
        if (this.mask) {
            t.setMask(this.mask);
        }
        return t;
    };
    HealthIndicator.prototype.damagedTo = function (num) {
        var curNum = this.num;
        var newNum = num;
        var outTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            // alpha: {
            //     getStart: () => 0,
            //     getEnd: () => 1,
            //     duration: 500
            // },
            duration: 500
        });
        this.text = this.makeCenterText(num, 0, -gameplayConfig.healthIndicatorWidth);
        var inTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            // alpha: {
            //     getStart: () => 0,
            //     getEnd: () => 1,
            //     duration: 500
            // },
            duration: 500
        });
    };
    HealthIndicator.prototype.update = function (time, dt) {
        var p = this.getAbsolutePosi(this.inner, this.textPosi);
        // console.log("getAbsolutePosi:" + p.x + " " + p.y);
        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;
    };
    HealthIndicator.prototype.getAbsolutePosi = function (ct, posi) {
        var ret = MakePoint2(posi.x, posi.y);
        while (ct != null) {
            ret.x += ct.x;
            ret.y += ct.y;
            ct = ct.parentContainer;
        }
        return ret;
    };
    return HealthIndicator;
}());
var PlayerInputText = /** @class */ (function () {
    function PlayerInputText(scene, container, centerObject) {
        this.confirmedEvent = new TypedEvent();
        this.changedEvent = new TypedEvent();
        this.inputHistory = []; //store only valid input history
        this.scene = scene;
        this.parentContainer = container;
        this.centerObject = centerObject;
        this.fontSize = 32;
        this.lblStyl = {
            fontSize: this.fontSize + 'px',
            fill: '#FFFFFF', fontFamily: "Georgia, serif"
        };
        this.y = -6 - this.fontSize;
        this.maxCount = 100;
        this.text; // main text input
        this.shortWords = new Set();
        this.shortWords.add("go");
        this.shortWords.add("hi");
        this.shortWords.add("no");
        // * Phaser's keydown logic sometimes will invoke duplicate events if the input is fast        
        // * Hence, we should use the standard keydown instead
        // this.scene.input.keyboard.on('keydown', (event) => this.keydown(event));        
        $(document).keypress(this.keypress.bind(this));
        $(document).keydown(this.keydown.bind(this));
    }
    PlayerInputText.prototype.init = function (width) {
        this.text = this.scene.add.text(-this.getAvailableWidth() / 2, this.y, "", this.lblStyl);
        this.parentContainer.add(this.text);
    };
    // keypress to handle all the valid characters
    PlayerInputText.prototype.keypress = function (event) {
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        // console.log("keykown: " + code);
        if (code == Phaser.Input.Keyboard.KeyCodes.ENTER) {
            return;
        }
        if (t.length < this.maxCount && this.text.width < this.getAvailableWidth()) {
            var codeS = String.fromCharCode(code);
            if (t.length == 0)
                codeS = codeS.toUpperCase();
            t += codeS;
        }
        this.text.setText(t);
        this.changedEvent.emit(this);
        console.log("dis width: " + this.text.displayWidth);
        console.log("width: " + this.text.width);
    };
    PlayerInputText.prototype.getAvailableWidth = function () {
        return this.centerObject.getTextMaxWidth();
    };
    // keydown to handle the commands
    PlayerInputText.prototype.keydown = function (event) {
        // console.log('keydown');
        var t = this.text.text;
        var code = event.keyCode;
        if (code == Phaser.Input.Keyboard.KeyCodes.BACKSPACE /* backspace */
            || code == Phaser.Input.Keyboard.KeyCodes.DELETE /* delete*/) {
            if (t.length > 0) {
                t = t.substring(0, t.length - 1);
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
        this.changedEvent.emit(this);
    };
    PlayerInputText.prototype.confirm = function () {
        var inputWord = this.text.text;
        var checkLegal = this.checkIfInputLegalBeforeSend(inputWord);
        var legal = checkLegal == ErrorInputCode.NoError;
        if (legal) {
            this.inputHistory.push(inputWord);
            this.confirmedEvent.emit(inputWord);
        }
        else {
            // console.log("ErrorInputCode before send: " + checkLegal);
        }
    };
    /**
     * Check without the need to compare with other enemy lables
     * This is mostly done before sending the input to the server on the client side
     * @param inputLbl player input
     */
    PlayerInputText.prototype.checkIfInputLegalBeforeSend = function (inputLbl) {
        var inputLblWithoutSpace = inputLbl.trim().replace(/ /g, '').toLowerCase();
        if (!this.shortWords.has(inputLblWithoutSpace) && inputLblWithoutSpace.length <= 2) {
            return ErrorInputCode.TooShort;
        }
        else if (!gameplayConfig.allowSameInput && this.checkIfRecentHistoryHasSame(inputLbl, 1)) {
            return ErrorInputCode.Repeat;
        }
        return ErrorInputCode.NoError;
    };
    /**
     * Check if the input history has the same input
     * @param inputLbl
     * @param recentCount
     */
    PlayerInputText.prototype.checkIfRecentHistoryHasSame = function (inputLbl, recentCount) {
        if (recentCount === void 0) { recentCount = 3; }
        inputLbl = inputLbl.trim();
        for (var i = this.inputHistory.length - 1; i >= 0 && --recentCount >= 0; i--) {
            if (this.inputHistory[i].trim() === inputLbl) {
                return true;
            }
        }
        return false;
    };
    PlayerInputText.prototype.checkInput = function () {
    };
    return PlayerInputText;
}());
var figureNames = ["aircraft carrier", "airplane", "alarm clock", "ambulance", "angel", "animal migration", "ant", "anvil", "apple", "arm", "asparagus", "axe", "backpack", "banana", "bandage", "barn", "baseball bat", "baseball", "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard", "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake", "blackberry", "blueberry", "book", "boomerang", "bottlecap", "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket", "bulldozer", "bus", "bush", "butterfly", "cactus", "cake", "calculator", "calendar", "camel", "camera", "camouflage", "campfire", "candle", "cannon", "canoe", "car", "carrot", "castle", "cat", "ceiling fan", "cell phone", "cello", "chair", "chandelier", "church", "circle", "clarinet", "clock", "cloud", "coffee cup", "compass", "computer", "cookie", "cooler", "couch", "cow", "crab", "crayon", "crocodile", "crown", "cruise ship", "cup", "diamond", "dishwasher", "diving board", "dog", "dolphin", "donut", "door", "dragon", "dresser", "drill", "drums", "duck", "dumbbell", "ear", "elbow", "elephant", "envelope", "eraser", "eye", "eyeglasses", "face", "fan", "feather", "fence", "finger", "fire hydrant", "fireplace", "firetruck", "fish", "flamingo", "flashlight", "flip flops", "floor lamp", "flower", "flying saucer", "foot", "fork", "frog", "frying pan", "garden hose", "garden", "giraffe", "goatee", "golf club", "grapes", "grass", "guitar", "hamburger", "hammer", "hand", "harp", "hat", "headphones", "hedgehog", "helicopter", "helmet", "hexagon", "hockey puck", "hockey stick", "horse", "hospital", "hot air balloon", "hot dog", "hot tub", "hourglass", "house plant", "house", "hurricane", "ice cream", "jacket", "jail", "kangaroo", "key", "keyboard", "knee", "knife", "ladder", "lantern", "laptop", "leaf", "leg", "light bulb", "lighter", "lighthouse", "lightning", "line", "lion", "lipstick", "lobster", "lollipop", "mailbox", "map", "marker", "matches", "megaphone", "mermaid", "microphone", "microwave", "monkey", "moon", "mosquito", "motorbike", "mountain", "mouse", "moustache", "mouth", "mug", "mushroom", "nail", "necklace", "nose", "ocean", "octagon", "octopus", "onion", "oven", "owl", "paint can", "paintbrush", "palm tree", "panda", "pants", "paper clip", "parachute", "parrot", "passport", "peanut", "pear", "peas", "pencil", "penguin", "piano", "pickup truck", "picture frame", "pig", "pillow", "pineapple", "pizza", "pliers", "police car", "pond", "pool", "popsicle", "postcard", "potato", "power outlet", "purse", "rabbit", "raccoon", "radio", "rain", "rainbow", "rake", "remote control", "rhinoceros", "rifle", "river", "roller coaster", "rollerskates", "sailboat", "sandwich", "saw", "saxophone", "school bus", "scissors", "scorpion", "screwdriver", "sea turtle", "see saw", "shark", "sheep", "shoe", "shorts", "shovel", "sink", "skateboard", "skull", "skyscraper", "sleeping bag", "smiley face", "snail", "snake", "snorkel", "snowflake", "snowman", "soccer ball", "sock", "speedboat", "spider", "spoon", "spreadsheet", "square", "squiggle", "squirrel", "stairs", "star", "steak", "stereo", "stethoscope", "stitches", "stop sign", "stove", "strawberry", "streetlight", "string bean", "submarine", "suitcase", "sun", "swan", "sweater", "swing set", "sword", "syringe", "t-shirt", "table", "teapot", "teddy-bear", "telephone", "television", "tennis racquet", "tent", "The Eiffel Tower", "The Great Wall of China", "The Mona Lisa", "tiger", "toaster", "toe", "toilet", "tooth", "toothbrush", "toothpaste", "tornado", "tractor", "traffic light", "train", "tree", "triangle", "trombone", "truck", "trumpet", "umbrella", "underwear", "van", "vase", "violin", "washing machine", "watermelon", "waterslide", "whale", "wheel", "windmill", "wine bottle", "wine glass", "wristwatch", "yoga", "zebra", "zigzag"];
var QuickDrawFigure = /** @class */ (function () {
    function QuickDrawFigure(scene, parentContainer, lbl) {
        var _this = this;
        this.curIndex = -1;
        this.interval = 200;
        this.sampleRate = gameplayConfig.drawDataSample;
        this.originX = 0.5;
        this.originY = 0.5;
        this.newSize = gameplayConfig.drawDataDefaultSize;
        this.graphicLineStyle = {
            width: 4,
            color: 0x000000,
            alpha: 1
        };
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
        // console.log("drawFigure");
        for (var strokeI = 0; strokeI < strokes.length; strokeI++) {
            // console.log("drawFigure strokeI:" + strokeI);
            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for (var i = 0; i < count - 1; i++) {
                this.mappedLineBetween(xArr[i], yArr[i], xArr[i + 1], yArr[i + 1]);
                // maxX = Math.max(maxX, xArr[i]);
                // maxY = Math.max(maxY, yArr[i]);
                // console.log(xArr[i]);
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
    QuickDrawFigure.prototype.getRightBottom = function () {
        var mappedPosi = this.getMappedPosi(this.sampleRate, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    };
    QuickDrawFigure.prototype.getLeftBottom = function () {
        var mappedPosi = this.getMappedPosi(0, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    };
    return QuickDrawFigure;
}());
var SpeechManager = /** @class */ (function () {
    function SpeechManager(scene) {
        this.loadedSpeechFilesStatic = {};
        this.loadedSpeechFilesQuick = {};
        this.scene = scene;
    }
    SpeechManager.prototype.quickLoadAndPlay = function (text, play) {
        var _this = this;
        if (play === void 0) { play = true; }
        // in quick mode the key is just the input text
        // we can judge if we have the key stored directly
        var key = text;
        var cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        var cachedByMySelf = this.loadedSpeechFilesQuick.hasOwnProperty(key);
        var cached = cachedInPhaser && cachedByMySelf;
        if (cached) {
            if (play) {
                // console.log("play cahced");
                this.scene.sound.play(key);
            }
        }
        else {
            apiTextToSpeech2(text, "no_id", function (oReq) {
                var arrayBuffer = oReq.response;
                // this blob may leak memory
                var blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
                var url = URL.createObjectURL(blob);
                // console.log(url);    
                _this.phaserLoadAndPlay(text, text, url, false, play);
            });
        }
    };
    SpeechManager.prototype.staticLoadAndPlay = function (text, play) {
        var _this = this;
        if (play === void 0) { play = true; }
        apiTextToSpeech(text, "no_id", function (sucRet) {
            var retID = sucRet.id;
            var retText = sucRet.input;
            var retPath = sucRet.outputPath;
            var md5 = sucRet.md5;
            _this.phaserLoadAndPlay(retText, md5, retPath, true, play);
        });
    };
    SpeechManager.prototype.clearSpeechCacheStatic = function () {
        for (var key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesStatic = {};
    };
    SpeechManager.prototype.clearSpeechCacheQuick = function () {
        for (var key in this.loadedSpeechFilesStatic) {
            this.scene.load.cacheManager.audio.remove(key);
        }
        this.loadedSpeechFilesQuick = {};
    };
    SpeechManager.prototype.phaserLoadAndPlay = function (text, key, fullPath, isStatic, play) {
        // console.log("isStatic: " + isStatic);
        if (isStatic === void 0) { isStatic = true; }
        if (play === void 0) { play = true; }
        // console.log("------------------------------");      
        var cachedInPhaser = this.scene.load.cacheManager.audio.has(key);
        var cachedByMySelf = isStatic ?
            this.loadedSpeechFilesStatic.hasOwnProperty(key) :
            this.loadedSpeechFilesQuick.hasOwnProperty(key);
        // double check
        if (cachedByMySelf && cachedInPhaser) {
            this.scene.sound.play(key);
        }
        else {
            // console.log(fullPath);
            this.scene.load.audio(key, [fullPath]);
            var localThis_1 = this;
            this.scene.load.addListener('filecomplete', function onCompleted(arg1, arg2, arg3) {
                // console.log("actually!!!!!!!!1");
                if (isStatic)
                    localThis_1.loadedSpeechFilesStatic[key] = true;
                else
                    localThis_1.loadedSpeechFilesQuick[key] = true;
                if (arg1 === key) {
                    if (play)
                        localThis_1.scene.sound.play(key);
                }
                localThis_1.scene.load.removeListener('filecomplete', onCompleted);
            });
            this.scene.load.start();
        }
    };
    return SpeechManager;
}());
