declare var affdex;

class CameraManager {
    private static instance: CameraManager;
    
    detector: any;
    camAllowed = false;
    constructor() {
    }

    
    static getInstance(): CameraManager {
        if(!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }

    requestPermission() {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // var video = document.getElementById('affdex_video') as any;
            // Not adding `{ audio: true }` since we only want video now
            navigator.mediaDevices.getUserMedia({ video: true }).then( stream=> {
                // video.src = window.URL.createObjectURL(stream);
                // video.srcObject = stream;
                // video.play();
                this.camAllowed = true;
            })
            .catch(e=>{             
                console.log(e);
                this.camAllowed = false;
            });
        }
    }

    showVideo() {
        if(!this.camAllowed) 
            return;                 
        
        $('#affdex_elements').css('display', 'inline');
        
    }

    hideVideo() {
        $('#affdex_elements').css('display', 'none');
    }
    


    captureCameraImage() : string{
        let video = $('#face_video')[0] as any;
        let scale = 0.5;
        var canvas = document.createElement("canvas");
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        let img = document.createElement('img');
        let dataURL = canvas.toDataURL();
        // console.log(dataURL);               
        return dataURL;
    }

        
    lastT;
    //Draw the detected facial feature points on the image
    drawFeaturePoints(img, featurePoints, timestamp) {        
        this.lastT = timestamp;
        var contxt = ($('#face_video_canvas')[0] as any).getContext('2d');

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


    handle(exp, emo, ts) {
    
    }
    
    log(node_name, msg) {
        // console.log('face: ' + node_name + " " + msg);
    }
    
    startDectector() {
        this.detector.start();
    }


    initFaceAPI() {
        
        var divRoot = $("#affdex_elements")[0];
        var width = 640;
        var height = 480;
        var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
        //Construct a CameraDetector and specify the image width / height and face detector mode.
        let detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
        this.detector = detector;

        //Enable detection of all Expressions, Emotions and Emojis classifiers.
        detector.detectAllEmotions();
        detector.detectAllExpressions();
        detector.detectAllEmojis();
        detector.detectAllAppearance();

        //Add a callback to notify when the detector is initialized and ready for runing.
        detector.addEventListener("onInitializeSuccess",  ()=> {
            this.log('#logs', "The detector reports initialized");
            //Display canvas instead of video feed because we want to draw the feature points on it
            $("#face_video_canvas").css("display", "block");
            $("#face_video").css("display", "none");        
        });

        detector.addEventListener("onInitializeFailure", ()=> {
            this.log('#logs', "The detector reports onInitializeFailure");
            console.log("onInitializeFailure");
        });


        //Add a callback to notify when camera access is allowed
        detector.addEventListener("onWebcamConnectSuccess", ()=>  {
            this.log('#logs', "Webcam access allowed");
        });

        //Add a callback to notify when camera access is denied
        detector.addEventListener("onWebcamConnectFailure", ()=>  {
            this.log('#logs', "webcam denied");            
        });

        //Add a callback to notify when detector is stopped
        detector.addEventListener("onStopSuccess", ()=>  {
            this.log('#logs', "The detector reports stopped");
            $("#results").html("");
        });


        detector.addEventListener("onImageResultsSuccess",  (faces, image, timestamp) => {
            $('#results').html("");            
            if (faces.length > 0) {                

                this.log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, (key, val)=> {
                    return val.toFixed ? Number(val.toFixed(0)) : val;
                }));
                let exp = faces[0].expressions;
                let emo = faces[0].emotions

                this.handle(exp, emo, timestamp);

                this.log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, (key, val)=> {
                    return val.toFixed ? Number(val.toFixed(0)) : val;
                }));

                if ($('#face_video_canvas')[0] != null) {
                    this.drawFeaturePoints(image, faces[0].featurePoints, timestamp);
                }
            }
        });
    }
}