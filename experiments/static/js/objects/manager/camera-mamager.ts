class CameraManager {
    private static instance: CameraManager;
    
    
    constructor() {
    }

    
    static getInstance(): CameraManager {
        if(!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }


    captureCameraImage() {
        let video = $('#affdex_video')[0] as any;
        let scale = 0.5;
        var canvas = document.createElement("canvas");
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        let img = document.createElement('img');
        let dataURL = canvas.toDataURL();
        console.log(dataURL);
        
    }
}