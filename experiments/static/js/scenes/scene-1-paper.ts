


class Scene1LPaper extends Scene1 {
    
    paper: Paper;

    constructor() {
        super('Scene1LPaper');
    }

    create() {
        super.create();
        this.createPaper();
        this.addCounter(Counter.IntoHome, 1);
        // this.initShake();
        this.initNormalGameFsm();              
    
        
        // Get access to the camera!
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var video = document.getElementById('video') as any;
            // Not adding `{ audio: true }` since we only want video now
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                // video.src = window.URL.createObjectURL(stream);
                video.srcObject = stream;
                video.play();
            });
        }
    }

    

    createPaper() {
        this.paper = new Paper(this, this.container, 0, getLogicHeight() / 2, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 0,
            width: 1000,
            height: 900,
            title: 'Procedural Rhetoric',
            topTitleGap: 30,
            titleContentGap: 80, 
            contentPadding: 60, 
            contentBtnGap: 30, 
            btnToBottom: 65,                   
            content: paperContent,
            // autoHeight: true
        });

        this.paper.hide();
        this.paper.setOrigin(0.5, 1);
    }

    gamePlayExit() {
        this.paper.hide();
    }
    

    initNormalGameFsm() {        
        this.initStNormalDefault();
        this.initStStart();
        this.updateObjects.push(this.normalGameFsm);        
    }
    
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state.addEventAction('START');
    }    

    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.addAction(s=>{
            this.paper.show();
        });
    }
    

    getNormalGameFsm(): IFsmData {
        return normal_1_paper;
    }

    needHud() : boolean{
        return false;
    }   
}