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
function apiTextToSpeech(inputText: string, identifier: string,suc?: (arg0: any) => any, err?: (arg0: any) => any) {
    let dataOb = {input: inputText, id: identifier, api: 1};
    let dataStr = JSON.stringify(dataOb);
    api("api_speech", dataStr, suc, err);
}

// API speech is to get the path of the generated audio by the input text
function apiTextToSpeech2(inputText: string, identifier: string,suc?: (req: any) => any, err?: (arg0: any) => any) {
    let dataOb = {input: inputText, id: identifier, api: 2};
    let dataStr = JSON.stringify(dataOb);
    
        
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api_speech", true);
    oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    oReq.responseType = "arraybuffer";
    oReq.onload = function(oEvent) {
        

        suc(oReq);


        // var audio = new Audio(url);
        // audio.load();
        // audio.play();
        // console.log('haha ririr');
    };

    oReq.send(dataStr);
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

function isChrome() : boolean {
    return getExplore() == BrowserType.Chrome;
}

function isFirefox() : boolean {
    return getExplore() == BrowserType.Firefox;
}

function getExplore() : BrowserType{
    var Sys : any = {};  
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