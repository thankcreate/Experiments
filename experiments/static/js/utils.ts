function parseUrl(url: string) : object{
    var result = {};

    let spR = url.split("?");
    if(url.split("?").length <= 1)
        return result;

    var query = url.split("?")[1];
    var queryArr = query.split("&");
    queryArr.forEach(function(item){            
        var value = item.split("=")[1];
        var key = item.split("=")[0];
        
        result[key] = value;
    });
    return result;
}

function myNum(val: number): string {
    let ab = Math.ceil(Math.abs(val));
    let sign = "" + (val < 0 ? '-' : '');
    let body = "" + ab;
    if(ab > 10000000) {
        body = Math.ceil(ab / 1000000) + ' M'
    }
    else if(ab >= 10000)
        body = Math.ceil(ab / 1000) + ' K'
    else 
        body = ab + "";
    return sign + body;
}


function getUrlParams() {
    let path = window.location.href;
    let params = parseUrl(path);
    return params;
}


function getCurrentLevelRaw() : string {
    let params = getUrlParams();
    let index = 0;
    let ret = params['level'];
    if(!ret) {
        return '1-0';
    }

    if(ret.split('-').length < 2) {
        ret = '1-' + ret;
    }
    return ret;
}

/**
 * If 'Paper' return -1,
 * otherwise, return the given number
 */
function getCurLevelIndex() : number{        
    
    let rawLevel = getCurrentLevelRaw();

    let splits = rawLevel.split('-');
    if(splits[1] == 'Paper') {
        return -1;
    }
    let index = 0;
    let smalllvl = splits[1];
    if(smalllvl != null) {
        index = parseInt(smalllvl);
    }
    return index;
}

function isEconomicSpecialEdition() : boolean {
    let params = getUrlParams();
    let index = 1;
    if(params['eco'] != null) {
        return true;
    }
    return false;
}

function distance(a, b) {
    let diffX = b.x - a.x;
    let diffY = b.y - a.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
}

function myMove(from, to, mv) {
    let diffX = to.x - from.x;
    let diffY = to.y - from.y;
    let d = distance(from, to);
    let ratio = mv / d;
    let rt = { x: from.x + diffX * ratio, y: from.y + diffY * ratio };

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

function api(api: string, inputData: string, suc?: (arg0: any) => any, err?: (arg0: any) => any, dtType?: string) {
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

function apiPromise(api: string, inputData: string | object, dtType?: string, type?: string) : Pany{
    if(notSet(dtType)) {
        dtType = "json";
    }

    if(notSet(type)) {
        type = "Post";
    }

    let pm = new Promise((resolve, reject) => {
        $.ajax({
            type: type,
            dataType: dtType,
            contentType: 'application/json;charset=UTF-8',
            url: "/" + api,
            data: inputData,            
            success: function (result) { 
                resolve(result);
            },
            error: function (result) {
                reject(result);
            }
        });
    });
    return pm;
}

// API2 is to get the similarity between two strings
function api2(input: string, suc?: (arg0: any) => any, err?: (arg0: any) => any) {
    api("api_2", input, suc, err);
}

function formatTwoParamsInput(param1: string, param2: string) {
    var ob = { arg1: param1, arg2: param2 };
    return JSON.stringify(ob);
}

function api2WithTwoParams(arg1: string, arg2: string, suc?: (arg0: any) => any, err?: (arg0: any) => any) {
    let inputString = formatTwoParamsInput(arg1, arg2);
    api2(inputString, suc, err);
}


// API 3 is to get the similarty between one input string and a collection of strings
function api3(input: string, suc?: (arg0: any) => any, err?: (arg0: any) => any) {
    api("api_3", input, suc, err);
}

function formatArrayParamsInput(param1: string, param2: string[]) {
    var ob = { input: param1, array: param2 };
    return JSON.stringify(ob);
}

function api3WithTwoParams(inputString: string, arrayStrings: string[], suc?: (arg0: any) => any, err?: (arg0: any) => any) {
    let data = formatArrayParamsInput(inputString, arrayStrings);
    api3(data, suc, err);
}

// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech(inputText: string, identifier: string, voiceType: string) : Pany{
    let dataOb = { input: inputText, id: identifier, api: 1,voiceType: voiceType };
    let dataStr = JSON.stringify(dataOb);
    return apiPromise("api_speech", dataStr);
}

// return the data directly instead of returning the path
function apiTextToSpeech2(inputText: string, identifier: string, voiceType: string) : Pany {
    return new Promise((resolve, reject) => {
        let dataOb = { input: inputText, id: identifier, api: 2, voiceType: voiceType };
        let dataStr = JSON.stringify(dataOb);    
    
        var oReq = new XMLHttpRequest();
        oReq.open("POST", "/api_speech", true);
        oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        oReq.responseType = "arraybuffer";
        oReq.onload = oEvent => {
            resolve(oReq);
        };
        oReq.onerror = o =>{
            reject(o);
        }
        oReq.send(dataStr);
    });
}

enum BrowserType {
    IE,
    Eedge,
    Firefox,
    Chrome,
    Opera,
    Safari,
    Unknown
}

function isChrome(): boolean {
    return getExplore() == BrowserType.Chrome;
}

function isFirefox(): boolean {
    return getExplore() == BrowserType.Firefox;
}

function getExplore(): BrowserType {
    var Sys: any = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
        (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
                (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] :
                            (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0;

    if (Sys.ie) return BrowserType.IE;
    if (Sys.edge) return BrowserType.Eedge;
    if (Sys.firefox) return BrowserType.Firefox;
    if (Sys.chrome) return BrowserType.Chrome;
    if (Sys.opera) return BrowserType.Opera;
    if (Sys.safari) return BrowserType.Safari;

    // if (Sys.ie) return ('IE: ' + Sys.ie);  
    // if (Sys.edge) return ('EDGE: ' + Sys.edge);
    // if (Sys.firefox) return ('Firefox: ' + Sys.firefox);  
    // if (Sys.chrome) return ('Chrome: ' + Sys.chrome);  
    // if (Sys.opera) return ('Opera: ' + Sys.opera);  
    // if (Sys.safari) return ('Safari: ' + Sys.safari);
    return BrowserType.Unknown;
}


function getDefaultFontFamily(): string {
    // * firefox will not show the text if the font is loading
    if (isFirefox()) {
        return gameplayConfig.defaultFontFamilyFirefox;
    }
    return gameplayConfig.defaultFontFamily;
}


function getDefaultTextStyle(): TextStyle {
    let ret: TextStyle = {
        fontSize: gameplayConfig.defaultTextSize,
        fill: '#000000',
        fontFamily: getDefaultFontFamily(),
    };
    return ret;
}

function MakePoint(val: any): Phaser.Geom.Point {
    return new Phaser.Geom.Point(val.x, val.y);
}


function MakePoint2(x: number, y: number): Phaser.Geom.Point {
    return new Phaser.Geom.Point(x, y);
}


function cpp(pt: PhPoint): PhPoint {
    return new Phaser.Geom.Point(pt.x, pt.y);
}

function getGame(): Phaser.Game {
    let thisGame: Phaser.Game = (<any>window).game;
    return thisGame;
}


function getGameState(): GameState {
    let thisGame: any = getGame();
    if (!thisGame.hasOwnProperty("gameState")) {
        thisGame.gameState = GameState.Home;
    }
    return thisGame.gameState;
}

function setGameState(state: GameState): void {
    let thisGame: any = getGame();
    thisGame.gameState = state;
}




function lerp(start: number, end: number, perc: number): number {
    return (end - start) * perc + start;
}


var S = Math.sin;
var C = Math.cos;
var T = Math.tan;

function R(r, g, b, a) {
    a = a === undefined ? 1 : a;

    return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
};



function getPixels(ctx) {
    return ctx.readPixels
        ? getPixels3d(ctx)
        : getPixels2d(ctx)
}

function getPixels3d(gl) {
    var canvas = gl.canvas
    var height = canvas.height
    var width = canvas.width
    var buffer = new Uint8Array(width * height * 4)

    gl.readPixels(0, 0
        , canvas.width
        , canvas.height
        , gl.RGBA
        , gl.UNSIGNED_BYTE
        , buffer
    )

    return buffer
}

function getPixels2d(ctx) {
    var canvas = ctx.canvas
    var height = canvas.height
    var width = canvas.width

    return ctx.getImageData(0, 0, width, height).data
}


let canvasPixels = getPixels3d;
function conv(webgl, canvas2D) {

    var outCanvas = canvas2D ? canvas2D.canvas || canvas2D : document.createElement('canvas');
    var outContext = outCanvas.getContext('2d');
    var outImageData;

    webgl = webgl instanceof WebGLRenderingContext ? webgl : webgl.getContext('webgl') || webgl.getContext('experimental-webgl');

    outCanvas.width = webgl.canvas.width;
    outCanvas.height = webgl.canvas.height;
    outImageData = outContext.getImageData(0, 0, outCanvas.width, outCanvas.height);

    outImageData.data.set(new Uint8ClampedArray(canvasPixels(webgl).buffer));
    outContext.putImageData(outImageData, 0, 0);
    outContext.translate(0, outCanvas.height);
    outContext.scale(1, -1);
    outContext.drawImage(outCanvas, 0, 0);
    outContext.setTransform(1, 0, 0, 1, 0, 0);

    return outCanvas;
};

function clamp(val: number, min: number, max: number): number {
    return Math.max(Math.min(val, max), min);
}


function arrayRemove<T>(ar: T[], element: T) {
    if(notSet(ar) || notSet(element))
        return;

    for (let i in ar) {
        if (ar[i] === element) {
            ar.splice(parseInt(i), 1);
        }
    }
}


function updateObject(from: any, to: any) {
    if(notSet(from) || notSet(to)) {
        // console.log('update object found null');
        return;
    }        

    for(let key in from) {            
        to[key] = from[key];            
    }
}



function setCookie(key: string, value: any) {
    ($ as any).cookie(key, value);
    
}

function getCookie(key: string) : any {
    return ($ as any).cookie(key);
}

function getUserName() {
    return getCookie('name');
}

function deleteAllCookie() {
    console.log('delete all cookies');
    var cookies = ($ as any).cookie() as any;
    for(var cookie in cookies) {
        // Important cookies such as important_memobird_device is saved when restart
        if(cookie.startsWith('important')) {
            continue;
        }
        ($ as any).removeCookie(cookie);
    }
}


function anchorToRight(toRight: number, ob: Movable) {
    ob.x = getLogicWidth() - toRight;
    window.addEventListener('resize', (event)=> {
        ob.x = getLogicWidth() - toRight;
    }, false);        
}