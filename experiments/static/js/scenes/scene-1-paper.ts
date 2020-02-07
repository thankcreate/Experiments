
declare function initFace();
declare var detector;

class Scene1LPaper extends Scene1 {
    
    paper: Paper;

    COUNT_ALL_TIME = 3;
    remainingTime: number;

    constructor() {
        super('Scene1LPaper');
    }

    create() {
        super.create();
        this.createPaper();
        this.createCountdown();
        this.createNextLevelBtn();

        this.addCounter(Counter.IntoHome, 1);
        // this.initShake();
        this.initNormalGameFsm();              

        this.initPaperButtonCallback();

        initFace();
        
        // $('#affdex_elements').css('display', 'inline');

        // this.beginVideo();
    }

    nextLevelBtn: Button;
    createNextLevelBtn() {
        let btn = new Button(this, this.abContainer, getLogicWidth() - 315, getLogicHeight() - 490, null, ' -> Next Experiment ');        
        btn.text.setFontSize(60);
        btn.text.setBackgroundColor('#000000');
        btn.text.setColor('#ffffff');
        btn.needHandOnHover = true;
        btn.needInOutAutoAnimation = false;
        btn.setEnable(false, false);
        this.nextLevelBtn = btn;

        btn.clickedEvent.on(()=>{
            window.location.replace(window.location.origin + "?level=4");
        });
    }
    
    initPaperButtonCallback() {
        this.paper.continueBtn.clickedEvent.on(b=>{
            if(this.paper.checkboxImg.getData('on')) {
                this.normalGameFsm.event('CONTINUE');
            }
            else {
                alert('You should confirm you have read the paper before continuing.');
            }            
        });
    }

    
    paperWidth = 1000
    paperHeight = 900
    createPaper() {        
        this.paper = new Paper(this, this.container, 0, getLogicHeight() / 2, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 0,
            width: this.paperWidth,
            height: this.paperHeight,
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
        this.paper.updateDefaultY();
    }

    countDown: PhText;
    createCountdown() {
        let style = getDefaultTextStyle();        
        style.fontSize = '40px';
        this.countDown = this.add.text(-this.paperWidth / 2 - 10, getLogicHeight() / 2 - this.paperHeight -2, ' 00:30 ', style);
        this.countDown.setColor('#ffffff');
        this.countDown.setBackgroundColor('#000000');
        this.countDown.setOrigin(1, 0);
        this.container.add(this.countDown);
        this.countDown.setVisible(false);
    }
    
    gamePlayStarted() {
        super.gamePlayStarted();
        this.subtitle.wrappedObject.setBackgroundColor('#000000');
        this.subtitle.wrappedObject.setColor('#ffffff');
        this.paper.continueBtn.setEnable(true, false);
    }

    gamePlayExit() {
        super.gamePlayExit();

        
        this.subtitle.wrappedObject.setBackgroundColor('');
        this.subtitle.wrappedObject.setColor('#000000');

        this.paper.hide();

        this.countDown.setVisible(false);

        this.hideVideo();
        this.nextLevelBtn.setEnable(false, false);
    }
    
    confirmCount = 0;
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStStart();
        this.initConfirm1();
        this.initConfirm2();
        this.updateObjects.push(this.normalGameFsm);
    }
    
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state.addAction(s=>{
            this.confirmCount = 0;
        })
        state.addEventAction('START');
    }    

    camAllowed = false;
    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.addAction(s=>{
            this.paper.show();
            
            detector.start();
                
            // this.beginVideo();
            
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var video = document.getElementById('video') as any;
                // Not adding `{ audio: true }` since we only want video now
                navigator.mediaDevices.getUserMedia({ video: true }).then( stream=> {
                    // video.src = window.URL.createObjectURL(stream);
                    video.srcObject = stream;
                    //video.play();
                    this.camAllowed = true;
                })
                .catch(e=>{             
                    console.log(e)       ;
                    this.camAllowed = false;
                });
            }
        });
    }

    beginVideo() {
        // Get access to the camera!
        // if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //     var video = document.getElementById('video') as any;
        //     // Not adding `{ audio: true }` since we only want video now
        //     navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        //         // video.src = window.URL.createObjectURL(stream);
        //         video.srcObject = stream;
        //         //video.play();
        //     });
        // }

        if(this.camAllowed) {            
            // $('#video').css('display', 'inline');
            $('#affdex_elements').css('display', 'inline');
        }
            
    }

    hideVideo() {
        $('#affdex_elements').css('display', 'none');
    }

    countDownInterval: any;
    initConfirm1() {
        let state = this.normalGameFsm.getState('Confirm_1');

        state.setOnExit(s=>{
            
            clearInterval(this.countDownInterval);
            this.inCountDown = false;
        })
        state.addAction(s=>{
            this.paper.continueBtn.canClick = false;
        })
        state.addSubtitleAction(this.subtitle, 'You sure?\n ' + this.getUserName() + ", I don't think you could have read it so fast.", false);
        state.addSubtitleAction(this.subtitle, 'According to our assessement based on your previous performances,\n It should take you  at least 30 seconds to complete the reading.', false);        
        state.addSubtitleAction(this.subtitle, "Why don't you do me a favor and read it again carefully?", true, null, null, 2000);
        state.addAction(s=>{
            this.paper.reset();
        })
        state.addTweenAction(this, {
            targets: this.paper.othersContainer,
            y: this.paper.defaultY,
            duration: 500,
        });
        state.addAction(s=>{
            this.setCountDownLlb(this.COUNT_ALL_TIME);
            this.remainingTime = this.COUNT_ALL_TIME;
            this.countDown.setVisible(true);
            this.inCountDown = true;
            this.countDownInterval = setInterval(()=>{
                this.updateCountDown();
            }, 1000);
        })    
        .addAction(s=>{

        })    
    }

    initConfirm2() {
        let state = this.normalGameFsm.getState('Confirm_2');
        state.addAction(()=>{
          
        })
        .addSubtitleAction(this.subtitle, this.getUserName() + "! I can see you are still not reading carefully enough.", false)
        .addAction(()=>{
            this.beginVideo();
        })
        .addSubtitleAction(this.subtitle, "Look at you!", false)
        .addSubtitleAction(this.subtitle, "What a stubborn face!", false, null, null, 2000)     
        .addSubtitleAction(this.subtitle, "You know, when my other advisor, Mitu, told\n me to put a camera here to check and make sure you really read, \nI thought it's superfluous.", false, null, null, 2500)           
        .addSubtitleAction(this.subtitle, "But the fact proved that she's right.", false, null, null, 2000)
        .addSubtitleAction(this.subtitle, "Don't worry, " + this.getUserName() + "! We have not given you up.\nIt's just that we might need to adjust the plan a little bit", false)
        .addAction(()=>{
            this.nextLevelBtn.setEnable(true, true);
            this.paper.continueBtn.setEnable(false, true);
        })
        .addSubtitleAction(this.subtitle, "Let's continue our experiment.\n We'll find a way to help you out!", true, null, null, 5000)
        .addAction(s=>{
            
        });

    }

    inCountDown = false;
    setCountDownLlb(val: number) {
        let twoDig = val + '';
        if(val < 10) {
            twoDig = '0' + val;
        }
        if(val == 0) {
            twoDig = '00';
        }
        this.countDown.text = ' 00:' + twoDig + ' ';

        if(val > 0) {
            this.paper.checkboxDesc.text = 'Click to confirm you have completed the reading (' + val + 's)';
        }
        else {
            this.paper.checkboxDesc.text = 'Click to confirm you have completed the reading';
        }        
    }

    update(time, dt) {
        super.update(time, dt);
        if(this.inCountDown) {
            this.paper.checkboxImg.removeInteractive();            
            this.paper.checkboxDesc.removeInteractive();
            this.paper.checkboxDesc.setAlpha(0.3);
        }
        else {
            this.paper.checkboxImg.setInteractive();
            this.paper.checkboxDesc.setInteractive();
            this.paper.checkboxDesc.setAlpha(1);
        }
    }
    

    updateCountDown() {
        --this.remainingTime;
        this.setCountDownLlb(this.remainingTime);
        if(this.remainingTime == 0){
            this.inCountDown = false;
            this.paper.continueBtn.canClick = true;
            clearInterval(this.countDownInterval);
        }
    }
    

    getNormalGameFsm(): IFsmData {
        return normal_1_paper;
    }

    needHud() : boolean{
        return false;
    }   
}