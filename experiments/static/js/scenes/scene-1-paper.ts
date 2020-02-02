


class Scene1LPaper extends Scene1 {
    
    paper: Paper;

    COUNT_ALL_TIME = 30;
    remainingTime: number;

    constructor() {
        super('Scene1LPaper');
    }

    create() {
        super.create();
        this.createPaper();
        this.createCountdown();


        this.addCounter(Counter.IntoHome, 1);
        // this.initShake();
        this.initNormalGameFsm();              
    
        
        this.initPaperButtonCallback();
    }

    initPaperButtonCallback() {
        this.paper.continueBtn.clickedEvent.on(b=>{
            if(this.paper.checkboxImg.getData('on')) {
                this.normalGameFsm.event('CONTINUE');
            }
            else {
                alert('You should confirm you have read the paper before continue');
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
    }

    gamePlayExit() {
        super.gamePlayExit();

        
        this.subtitle.wrappedObject.setBackgroundColor('');
        this.subtitle.wrappedObject.setColor('#000000');

        this.paper.hide();

        this.countDown.setVisible(false);
    }
    
    confirmCount = 0;
    initNormalGameFsm() {        
        this.initStNormalDefault();
        this.initStStart();
        this.initConfirm1();
        this.updateObjects.push(this.normalGameFsm);        
    }
    
    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
        state.addAction(s=>{
            this.confirmCount = 0;
        })
        state.addEventAction('START');
    }    

    initStStart() {
        let state = this.normalGameFsm.getState("Start");
        state.addAction(s=>{
            this.paper.show();

                // Get access to the camera!
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var video = document.getElementById('video') as any;
                // Not adding `{ audio: true }` since we only want video now
                navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                    // video.src = window.URL.createObjectURL(stream);
                    video.srcObject = stream;
                    //video.play();
                });
            }
        });
    }

    countDownInterval: any;
    initConfirm1() {
        let state = this.normalGameFsm.getState('Confirm_1');
        state.setOnExit(s=>{
            clearInterval(this.countDownInterval);
            this.inCountDown = false;
        })

        state.addSubtitleAction(this.subtitle, 'Seriously?\n ' + this.getUserName() + ", I don't think you could have read it so fast!", false);
        state.addSubtitleAction(this.subtitle, 'According to our assessement based on your previous performance,\n It should take you 30 seconds to complete the reading at least', false);        
        state.addSubtitleAction(this.subtitle, "Why don't you do me a favor and read it carefully again?", true, null, null, 2000);
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