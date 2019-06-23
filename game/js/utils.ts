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


function formatTwoParamsInput(param1: string, param2: string) {
    var ob = { arg1: param1, arg2: param2 };
    return JSON.stringify(ob);
}


function api2WithTwoParams(arg1: string, arg2: string, suc: (arg0: any) => any, err: (arg0: any) => any) {
    let inputString = formatTwoParamsInput(arg1, arg2);
    api2(inputString, suc, err);
}

function api2(input: string, suc: (arg0: any) => any, err: (arg0: any) => any){
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