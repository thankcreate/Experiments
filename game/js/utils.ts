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

function api(api: string, inputData: string, suc?: (arg0: any) => any, err?: (arg0: any) => any) {
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

