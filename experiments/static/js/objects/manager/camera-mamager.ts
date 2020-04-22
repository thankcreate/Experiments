declare var affdex;

enum CamPosi{
    PaperLevel,
    Newspaper
}

interface ImageRes {
    face: FaceRes,
    timestamp: number, // in seconds    
    img: any,
}

interface FeaturePoint {
    x: number,
    y: number,
}

interface FaceRes {
    emotions: Emotions,
    expressions: Expressions,
    emojis: Emojis,
    featurePoints: FeaturePoint[]
}

interface Emotions{
    joy: number
    sadness: number
    disgust: number
    contempt: number
    anger: number
    fear: number
    surprise: number
    valence: number
    engagement: number
}

interface Expressions{
    smile: number
    innerBrowRaise: number
    browRaise: number
    browFurrow: number
    noseWrinkle: number
    upperLipRaise: number
    lipCornerDepressor: number
    chinRaise: number
    lipPucker: number
    lipPress: number
    lipSuck:number
    mouthOpen: number
    smirk: number
    eyeClosure: number
    attention: number
    lidTighten: number
    jawDrop: number
    dimpler: number
    eyeWiden: number
    cheekRaise: number
    lipStretch: number
}

interface Emojis{
    relaxed: number
    smiley: number
    laughing: number
    kissing: number
    disappointed: number
    rage: number
    smirk: number
    wink: number
    stuckOutTongueWinkingEye: number
    stuckOutTongue: number
    flushed: number
    scream: number
    dominantEmoji: string
}


class CameraManager {

    
    private static instance: CameraManager;
    
    detector: any;
    camAllowed = false;

    imageResEvent: TypedEvent<ImageRes> = new TypedEvent();
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
        // if(!this.camAllowed) 
        //     return;                 
        
        $('#cam-root').css('display', 'inline');        
    }

    hideVideo() {
        $('#cam-root').css('display', 'none');
    }
    

    width:number;
    height: number;

    setSize(w: number, h: number) {
        $('#face_video_canvas').css('width', w + 'px');
        $('#face_video_canvas').css('height', h + 'px');
        $('#face_video').css('width', w + 'px');
        $('#face_video').css('height', h + 'px');

    }

    setPosition(posi: CamPosi) {
        let camRoot = $('#cam-root');
        let affdexRoot = $('#affdex_root');
        
        if(posi == CamPosi.PaperLevel) {
            let borderStyl = '4px outset #252525';
            camRoot.css('right', '20px');  
            camRoot.css('bottom', '0px');  

            affdexRoot.css('border-top', borderStyl);  
            affdexRoot.css('border-left', borderStyl);  
            affdexRoot.css('border-right', borderStyl);          
            
           
            this.width = 400;
            this.height = 300;
        }        
        else {
            let borderStyl = '6px outset black';
            camRoot.css('transform', 'translate(0, -50%)')
            camRoot.css('z-index', '-1');            
            camRoot.css('top', '50%')
            camRoot.css('left', '98%')            

            affdexRoot.css('border', borderStyl);              
            
            var element = camRoot.detach();
            $('#newspaper-page').append(element);

            this.width = 300;
            this.height = 225;
        }

        this.setSize(this.width, this.height);
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
            

            contxt.font="10px Comic Sans MS";
            contxt.fillStyle = "red";
            contxt.textAlign = "center";
            contxt.fillText("" + id, featurePoints[id].x,
            featurePoints[id].y);
        }
    }

    
    
    log(node_name, msg) {
        console.log('face: ' + node_name + " " + msg);
    }
    
    startDectector() {
        this.detector.start();
    }


    initFaceAPI() {
        
        var divRoot = $("#affdex_root")[0];
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

            this.setSize(this.width, this.height);
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

                this.imageResEvent.emit({
                    face: faces[0] as FaceRes, 
                    timestamp: timestamp,
                    img: image
                });
                
                // if ($('#face_video_canvas')[0] != null) {
                //     this.drawFeaturePoints(image, faces[0].featurePoints, timestamp);
                // }
            }
        });
    }
}