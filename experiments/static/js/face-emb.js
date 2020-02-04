var detector;

// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.


function initFace() {
    var divRoot = $("#affdex_elements")[0];
    var width = 400;
    var height = 300;
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

            log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function (key, val) {
                return val.toFixed ? Number(val.toFixed(0)) : val;
            }));
            let exp = faces[0].expressions;
            let emo = faces[0].emotions


            handle(exp, emo, timestamp);


            log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function (key, val) {
                return val.toFixed ? Number(val.toFixed(0)) : val;
            }));

            // $('#emoji').html(faces[0].emojis.dominantEmoji);
            // log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
            if ($('#face_video_canvas')[0] != null) {
                drawFeaturePoints(image, faces[0].featurePoints, timestamp);
            }
        }
    });
}

var fixed = false;
var spanDt = 0;
var spanDt2 = 0;
var lastDt;
var need = 2.5;
function handle(exp, emo, ts) {
    
}



function log(node_name, msg) {
    // MediaKeySystemAccess.
    // $(node_name).append("<span>" + msg + "</span><br />")
}


// var lastT = -1;
//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints, timestamp) {
    
    lastT = timestamp;
    var contxt = $('#face_video_canvas')[0].getContext('2d');

    var hRatio = contxt.canvas.width / img.width;
    var vRatio = contxt.canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);

    contxt.strokeStyle = "#FF0000";
    for (var id in featurePoints) {
        contxt.beginPath();
        contxt.arc(featurePoints[id].x,
            featurePoints[id].y, 2, 0, 2 * Math.PI);
        contxt.stroke();

    }
}
