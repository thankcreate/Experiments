
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
        type: "POST",//方法类型
        dataType: "json",//预期服务器返回的数据类型
        contentType: 'application/json;charset=UTF-8',
        url: "/api_3",//url
        data: JSON.stringify(inputData),
        success: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)       

        },
        error: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)                    
        }
    });
}


function test_api2() {
    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        dataType: "json",//预期服务器返回的数据类型
        contentType: 'application/json;charset=UTF-8',
        url: "/api_2",//url
        data: JSON.stringify(getFormData($("#form1"))),
        success: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)       
            $('#res').html(result.res);

            $('#arg1').val('');
            $('#arg2').val('');
        },
        error: function (result) {
            console.log(result);//打印服务端返回的数据(调试用)                    
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

// function testSpeechAPI() {
//     var inputText = $('#arg1').val();
//     var id = $('#arg2').val();
//     apiTextToSpeech(inputText, id,
//         sucData => {
//             console.log(sucData);
//         },
//         errData => {
//             console.log("fail speech");
//         });
// }



function testSpeechAPI2() {
    var inputText = $('#arg1').val();
    var id = $('#arg2').val();

    let dataOb = {input: inputText, id: id};
    let dataStr = JSON.stringify(dataOb);
    
        
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api_speech", true);
    oReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    oReq.responseType = "arraybuffer";
    oReq.onload = function(oEvent) {
        var arrayBuffer = oReq.response;

        console.log(arrayBuffer);
        var blob = new Blob([arrayBuffer], {type: "audio/mpeg"});
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audio.load();
        audio.play();
        console.log('haha ririr');
    };

    oReq.send(dataStr);
}