var detector;

// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.


$(function () {
    var divRoot = $("#affdex_elements")[0];
    var width = 640;
    var height = 480;
    var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
    //Construct a CameraDetector and specify the image width / height and face detector mode.
    detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

    //Enable detection of all Expressions, Emotions and Emojis classifiers.
    detector.detectAllEmotions();
    detector.detectAllExpressions();
    detector.detectAllEmojis();
    detector.detectAllAppearance();

    //Add a callback to notify when the detector is initialized and ready for runing.
    detector.addEventListener("onInitializeSuccess", function () {
        log('#logs', "The detector reports initialized");
        //Display canvas instead of video feed because we want to draw the feature points on it
        $("#face_video_canvas").css("display", "block");
        $("#face_video").css("display", "none");

        onQuestStart();
    });

    detector.addEventListener("onInitializeFailure", function () {
        log('#logs', "The detector reports onInitializeFailure");
        console.log("onInitializeFailure");
    });


    //Add a callback to notify when camera access is allowed
    detector.addEventListener("onWebcamConnectSuccess", function () {
        log('#logs', "Webcam access allowed");
    });

    //Add a callback to notify when camera access is denied
    detector.addEventListener("onWebcamConnectFailure", function () {
        log('#logs', "webcam denied");
        console.log("Webcam access denied");
    });

    //Add a callback to notify when detector is stopped
    detector.addEventListener("onStopSuccess", function () {
        log('#logs', "The detector reports stopped");
        $("#results").html("");
    });


    detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {
        $('#results').html("");
        // log('#results', "Timestamp: " + timestamp.toFixed(2));
        // log('#results', "Number of faces found: " + faces.length);
        if (faces.length > 0) {
            // log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));

            // log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function (key, val) {
            //     return val.toFixed ? Number(val.toFixed(0)) : val;
            // }));
            let exp = faces[0].expressions;
            let emo = faces[0].emotions


            handle(exp, emo, timestamp);


            // log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function (key, val) {
            //     return val.toFixed ? Number(val.toFixed(0)) : val;
            // }));

            // $('#emoji').html(faces[0].emojis.dominantEmoji);
            // log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
            // if ($('#face_video_canvas')[0] != null) {
            //     // drawFeaturePoints(image, faces[0].featurePoints);
            // }
        }
    });
});

var fixed = false;
var spanDt = 0;
var spanDt2 = 0;
var lastDt;
var need = 2.5;
function handle(exp, emo, ts) {
    if (!lastDt)
        lastDt = ts;

    console.log("ts " + ts);
    if (!fixed)
        $('#emoji').html("😐");

    if (stage == 0) {
        if (!fixed && exp.smile > 10) {

            spanDt += (ts - lastDt);

            $('#emoji').html("😊");

            if (spanDt > need) {
                fixed = true;

                setTimeout(() => {
                    fixed = false;
                    gotoState(++stage);
                }, 1000);
            }

        }
    }
    else if (stage == 1) {
        if (!fixed && emo.anger > 10) {
            spanDt2 += (ts - lastDt);

            $('#emoji').html("😡");
            if (spanDt2 > need) {
                fixed = true;
                setTimeout(() => {
                    fixed = false;
                    gotoState(++stage);
                }, 1000);
            }
        }
    }
    else if (stage == 2) {
        if (!fixed) {
            

            if (emo.anger > 10) {
                spanDt2 += (ts - lastDt);
                $('#emoji').html("😡");
                if (spanDt2 > need) {
                   
                    fixed = true;
                    setTimeout(() => {
                        gotoState(3);
                    }, 1000);
                }
            }

            if (exp.smile > 10) {
                spanDt += (ts - lastDt);
                $('#emoji').html("😊");

                if (spanDt > need) {
                    
                    fixed = true;
                    setTimeout(() => {
                        gotoState(4);
                    }, 1000);
                }
            }

        }
    }
    lastDt = ts;
}

function gotoState(st) {
    stage = st;
    spanDt = 0;
    spanDt2 = 0;
    if (stage == 0) {
        fixed = false;
        $('#question').html("1. Our great country's GDP has grown by 25% this year<br/>(Your should be happy)");
    }
    else if (stage == 1) {
        fixed = false;
        $('#question').html("2. Our enemy has invaded our border<br/>(Your should be angry)");
    }
    else if (stage == 2) {
        fixed = false;
        $('#question').html("3. The oil price has been rised by 50%<br/>(How do you feel? Happy? Angry)");
    }
    else if (stage == 3) {
        $('#question').html("You are dissatisfied with our great nation, huh?<br/>You are arrested!");
        $('#emoji').html("👮");
    }
    else if (stage == 4) {
        $('#question').html("You are proven to be a patriotic citizen");
        $('#emoji').html("🏆");
    }
}



function log(node_name, msg) {
    // MediaKeySystemAccess.
    $(node_name).append("<span>" + msg + "</span><br />")
}

function onStart() {
    if (detector && !detector.isRunning) {
        $("#logs").html("");
        detector.start();
    }
    $('#start').css("display", "none");
    // log('#logs', "Clicked the start button");
}


//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
    var contxt = $('#face_video_canvas')[0].getContext('2d');

    var hRatio = contxt.canvas.width / img.width;
    var vRatio = contxt.canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);

    contxt.strokeStyle = "#FFFFFF";
    for (var id in featurePoints) {
        contxt.beginPath();
        contxt.arc(featurePoints[id].x,
            featurePoints[id].y, 2, 0, 2 * Math.PI);
        contxt.stroke();

    }
}

var stage = -1;
function onQuestStart() {
    gotoState(0);

}