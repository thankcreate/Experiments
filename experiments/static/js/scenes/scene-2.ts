
enum NewsPaperStyle{
    DEFAULT,
    ONLY_TEXT_CENTER,
}

class Scene2 extends BaseScene {


    paperCssBinding : CssBinding;
    camCssBinding: CssBinding;
    topProgressCssBinding: CssBinding;
    bottomProgressCssBinding: CssBinding;
    resultCssBinding: CssBinding;
    manualBtnsCssBing: CssBinding;
    transparentOverlayCssBinding: CssBinding;

    newspaperFsm: NewspaperFsm;

    currIndex = 0;
    get npNums(): number[]{
        return [0];
    }

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);        
    }
    

    create() {
        super.create();

        this.newspaperFsm = this.makeNewspaperFsm();

        this.paperCssBinding = new CssBinding($('#newspaper-page'));
        this.camCssBinding = new CssBinding($('#cam-root'));
        this.topProgressCssBinding = new CssBinding($('#top-bar'));
        this.bottomProgressCssBinding = new CssBinding($('#bottom-bar'));
        this.resultCssBinding = new CssBinding($('#newspaper-result'));
        this.manualBtnsCssBing = new CssBinding($('#newspaper-manual-button'));
        this.transparentOverlayCssBinding = new CssBinding($('#newspaper-transparent-overlay'));

        this.initBindingCss();

        CameraManager.getInstance().imageResEvent.on((e)=>{
            this.imageHandler(e);
        })

        let test = NewsDataManager.getInstance();        

        GlobalEventManager.getInstance().newspaperButtonTopClickedEvent.on((m)=>{
            this.newspaperButtonClicked(m, true);
        })
        GlobalEventManager.getInstance().newspaperButtonBottomClickedEvent.on((m)=>{
            this.newspaperButtonClicked(m, false);
        })
        // $('#test-info').css('visibility', 'hidden');         
    }

    newspaperButtonClicked(manager: GlobalEventManager, isTop: boolean) {
        if(!this.canRecieveEmojiClick)
            return;
        this.emotionMaxed(isTop ? MyEmotion.Positive : MyEmotion.Negative);
    }

   
    

    resetProgress() {
        this.topProgress.value = 0;
        this.bottomProgress.value = 0;
        this.refreshProgressBarCss();
    }

    makeNewspaperFsm() {
        return new NewspaperFsm(this, this.npNums, 
            this.paperEnterCallback.bind(this),
            this.correctEnterCallback.bind(this), 
            this.secondChanceEnterCallback.bind(this),
            this.paperEndEntercallback.bind(this),
            this.addPaperEndAction.bind(this)
            );        
    }

    // called by BaseScene.create
    initVoiceType() {
        this.getSpeechManager().setVoiceType(VoiceType.Voice65537);
    }

    imageHandler(res: ImageRes) {
        let face = res.face;
        let timestamp = res.timestamp;
        
        let emotionsDebug = JSON.stringify(face.emotions, (key, val)=> {
            return val.toFixed ? Number(val.toFixed(0)) : val;
        })
        let expDebug = JSON.stringify(face.expressions, (key, val)=> {
            return val.toFixed ? Number(val.toFixed(0)) : val;
        })

        let emoji = face.emojis.dominantEmoji;

        $('#test-info').text(emotionsDebug + '\n' + expDebug + '\n' + emoji);
        

        this.emotionAnalyze(res);

        //
        // console.log('')
        // console.log(face.expressions.eyeClosure);
    }

    topProgress:HasValue = {value: 0}; // [0, 1]
    bottomProgress:HasValue = {value: 0}; // [0, 1]

    lastTimeStamp: number;
    canRecieveEmotion: boolean = false;
    canRecieveEmojiClick: boolean = false;

    emotionAnalyze(imgRes: ImageRes) {        
        let face = imgRes.face;
        let timestamp = imgRes.timestamp; // in seconds
        
        if(!this.canRecieveEmotion) {
            this.lastTimeStamp = timestamp;
            return;
        }

        let res = EmmotionManager.getInstance().emotionAnalyze(imgRes);        
        

        let fullTime = 3.5;
        let targetJquery = null;

        let progress: HasValue = {value: 0};
        if(res.emotion == MyEmotion.Positive) {
            targetJquery = $('#emoji-progress-top');
            progress = this.topProgress;
        }
        else if(res.emotion == MyEmotion.Negative){
            targetJquery = $('#emoji-progress-bottom');
            progress = this.bottomProgress;
        }

        if(this.lastTimeStamp == null) {
            this.lastTimeStamp = timestamp;
        }
        let timeDiff = timestamp - this.lastTimeStamp;

        let added = 1 / fullTime * res.intensity * timeDiff;
        progress.value += added;
        progress.value = clamp(progress.value, 0, 1);

        if(progress.value == 1) {                
            
            this.emotionMaxed(res.emotion);
        }

        this.refreshBarLeftIconStatus(res.emotion);
        this.refreshProgressBarCss();
        // if(res.emotion != MyEmotion.None) {
        //     targetJquery.css('width', progress.value * 100 + "%");
        // }
        this.lastTimeStamp = timestamp;
    }

    refreshBarLeftIconStatus(currEmotion: MyEmotion) {
        let activateBarID:string[]= [];
        let deactviateBarID:string[] = ['top-bar', 'bottom-bar'];
        
        if(currEmotion == MyEmotion.Positive) {
            deactviateBarID = [];
            activateBarID.push('top-bar');
            deactviateBarID.push('bottom-bar');
        }
        else if(currEmotion == MyEmotion.Negative) {
            deactviateBarID = [];
            activateBarID.push('bottom-bar');
            deactviateBarID.push('top-bar');
        }
        
        for(let i in activateBarID) {
            let barID = activateBarID[i];
            $(`#${barID} .normal`).css('display', 'none');
            $(`#${barID} .active`).css('display', 'block');
        }

        for(let i in deactviateBarID) {
            let barID = deactviateBarID[i];
            $(`#${barID} .normal`).css('display', 'block');
            $(`#${barID} .active`).css('display', 'none');
        }
    }

    refreshProgressBarCss() {
        $('#emoji-progress-top').css('width', this.topProgress.value * 100 + "%");
        $('#emoji-progress-bottom').css('width', this.bottomProgress.value * 100 + "%");
    }

    isLastTestCorrect = false;
    emotionMaxed(myEmotion: MyEmotion){        
        this.canRecieveEmotion = false;        
        this.canRecieveEmojiClick = false;

        let item = NewsDataManager.getInstance().getByNum(this.npNums[this.currIndex]);
        let rightEmotion = item.answer == 0 ? MyEmotion.Negative : MyEmotion.Positive;
        
        let correct = myEmotion == rightEmotion;
        this.isLastTestCorrect = correct;        
        this.showResult(this.isLastTestCorrect);         

        this.newspaperFsm.event(correct ? Fsm.CORRECT : Fsm.WRONG);
    }
    

    createDwitters(parentContainer: PhContainer) {        
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2400, 1400, true);        
    }

    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');
    }


    sceneAddFirstMeetGreetingActinos(s: FsmState) :FsmState {
        s.addSubtitleAction(this.subtitle, "Oh, hi there!", true)        
        .addSubtitleAction(this.subtitle, "Terminal 65537 is at your service.\n", true)
        .addSubtitleAction(this.subtitle, "Your name is needed! Human.", false).finishImmediatly()
        return s;
    }

    createCenter(parentContainer: PhContainer): CenterObject {
        return new CenterObject(this, parentContainer, MakePoint2(220, 220), CenterType.Rect);
    }

    

    needModeSelect() {
        return false;
    }

    sceneAfterNameInput(s: FsmState) : FsmState {
        s.addSubtitleAction(this.subtitle, s => {
            return this.playerName + "? Interesting!"
        }, true, 2000, 3000, 300)
        .addSubtitleAction(this.subtitle, "THE EXPERIMENT is waiting for us. \n Let's get it over with.", false, null, null, 10)
        .addSubtitleAction(this.subtitle, "Which experiment do you like to take?", false, null, null, 10).setBoolCondition(o=>this.needModeSelect())
        return s;
    }

    getOriginalTitle() {
        return 'Project 65537';
    }

    getChangedToTitle() {
        return 'Project 65537'
    }

    sceneHomeTogameAnimation(s: FsmState): FsmState{
        super.sceneHomeTogameAnimation(s);
        let dt = 1000;
        s.addTweenAllAction(this, [
            // Rotate center to normal angle
            {
                targets: this.centerObject.inner,
                rotation: 0,
                scale: 0,
                duration: dt,
            },
            // Scale out the outter dwitter
            {
                targets: this.dwitterCenter.inner,
                alpha: 0,
                scale: 2,
                duration: dt,
            },
        ])
        return s;
    }
    

    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);        
        
        
    }

    initialPaperTranslateX = -50;
    initialPaperTranslateY = -50;

    initialCamTranslateX = -100;
    initialCamTranslateY = -50;

    initBindingCss() {
        this.paperCssBinding.scale = 0;
        this.paperCssBinding.rotate = 0;
        this.paperCssBinding.translateX = this.initialPaperTranslateX;
        this.paperCssBinding.translateY = this.initialPaperTranslateY;
        this.paperCssBinding.udpate();

        this.camCssBinding.translateX = this.initialCamTranslateX;
        this.camCssBinding.translateY = this.initialCamTranslateY;
        this.camCssBinding.udpate();

        this.topProgressCssBinding.translateY = 100;
        this.topProgressCssBinding.udpate();
        
        this.bottomProgressCssBinding.translateY = -100;
        this.bottomProgressCssBinding.udpate();

        this.resultCssBinding.translateY = 100;
        this.resultCssBinding.udpate();

        this.manualBtnsCssBing.translateX = -100;
        this.manualBtnsCssBing.translateY = -50;
        this.manualBtnsCssBing.udpate();

        this.transparentOverlayCssBinding.opacity = 0;
        this.transparentOverlayCssBinding.udpate();
    }

    showPaper(show: boolean = true) {
        $('#newspaper-layer').css('display', show? 'block' : 'none');
        $('#newspaper-page').css('visibility', show ? 'visible' : 'hidden');

        let dt = 500;
        


        this.tweens.add({
            targets: this.paperCssBinding,
            scale: 1,
            duration: dt
        })

        this.tweens.add({
            targets: this.paperCssBinding,
            rotate: 360,
            duration: dt
        }) 
    }

    showManualBtns(isShow: boolean) {
        let dt = 500;
        
        this.tweens.add({
            targets: this.manualBtnsCssBing,
            translateX: isShow? 0 : -100,
            duration: dt
        })        
    }
    

    showCam(isShow: boolean) {
        let dt = 500;
        
        this.tweens.add({
            targets: this.camCssBinding,
            translateX: isShow? 0 : this.initialCamTranslateX,
            duration: dt
        })

        this.tweens.add({
            targets: this.paperCssBinding,
            translateX: isShow? -70 : this.initialPaperTranslateX,
            duration: dt
        })      
    }    

    /**
     * Since the top and bottom tween have the same duration
     * we just return one of them as the Promise
     */
    showProgressBars(): Pany {
        let dt = 600;
        let top = TweenPromise.create(this, {
            targets: this.topProgressCssBinding,
            translateY: 0,
            duration: dt
        });

        this.tweens.add({
            targets: this.bottomProgressCssBinding,
            translateY: 0,
            duration: dt
        }) 

        return top;
    }

    /**
     * Since the top and bottom tween have the same duration
     * we just return one of them as the Promise
     */
    hideProgressBars(): Pany {        
        let dt = 600;
        
        let top = TweenPromise.create(this, {
            targets: this.topProgressCssBinding,
            translateY: 100,
            duration: dt
        });

        this.tweens.add({
            targets: this.bottomProgressCssBinding,
            translateY: -100,
            duration: dt
        }) 
        return top;
    }

    hideAndShowProgressBars(): Pany {
        return this.hideProgressBars().then(res=>{return this.showProgressBars()});
    }

    showResult(isCorrect: boolean) {
        console.log('hahahahah:' + isCorrect);
        $('#newspaper-result-content').text(isCorrect? '✔️' : '❌');
        let dt = 500;        
        this.tweens.add({
            targets: this.resultCssBinding,
            translateY: 0,
            duration: dt
        })
    }

    hideResult() {
        let dt = 500;        
        this.tweens.add({
            targets: this.resultCssBinding,
            translateY: 100,
            duration: dt
        })
    }
    
    updateCssBinding() {

        if(this.camCssBinding)
            this.camCssBinding.udpate()
        if(this.paperCssBinding) 
            this.paperCssBinding.udpate();
        if(this.topProgressCssBinding)
            this.topProgressCssBinding.udpate();
        if(this.bottomProgressCssBinding)
            this.bottomProgressCssBinding.udpate();            
        if(this.resultCssBinding)
            this.resultCssBinding.udpate();         
        if(this.manualBtnsCssBing)
            this.manualBtnsCssBing.udpate();
        if(this.transparentOverlayCssBinding)
            this.transparentOverlayCssBinding.udpate();

        // $('#affdex_elements').css('transform',`translate(${this.camTranslateX}%, ${this.camTranslateY}%)`);
        // $('#newspaper-page').css('transform', `translate(${this.paperTranslateX}%, ${this.paperTranslateY}%) scale(${this.paperScale}) rotate(${this.paperRotate}deg)`);
    }

    update(time, dt) {
        super.update(time, dt);
        this.updateCssBinding();
    }

    fillNewspaperContentByNum(num: number) {
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(num);

        let titleSlot = $('#newspaper-title');
        let contentSlot = $('#newspaper-content-text');
        let thumbnailSlot = $('newspaper-thumbnail');

        titleSlot.html(newsItem.title);
        contentSlot.html(newsItem.content);

        if(newsItem.style == 0) {
            this.setNewspaperStyle(NewsPaperStyle.DEFAULT);    
        }        
    }

    npStyle: NewsPaperStyle = NewsPaperStyle.DEFAULT;
    setNewspaperStyle(style: NewsPaperStyle) {
        this.npStyle = style;

        let p = $('#newspaper-content-text');
        let thumb = $('#newspaper-thumbnail');

        if(style == NewsPaperStyle.ONLY_TEXT_CENTER) {            
            p.css('position', 'absolute');
            p.css('text-align', 'center');
            p.css('width', '100%');
            
            p.css('top', '50%');
            p.css('transform', 'translate(0, -50%)')      
            
            thumb.css('display', 'none');
        }
        else if (style == NewsPaperStyle.DEFAULT) {            
            p.css('position', 'static');
            p.css('text-align', 'inherit');
            p.css('width', '');
            p.css('top', '');
            p.css('transform', '')   
            this.setNewspaperFontSize(16);

            thumb.css('display', 'block');
        }

    }

    setNewspaperTitle(title: string) {
        let t = $('#newspaper-title');
        t.html(title);
    }

    setNewspaperContent(content: string) {
        let p = $('#newspaper-content-text');
        p.html(content);
    }

    setNewspaperFontSize(size: number) {
        let p = $('#newspaper-content-text');
        p.css('font-size', `${size}px`);
    }



    showTransparentOverlay(isShow: boolean):Pany {        
        let dt = 600;
        let tp = TweenPromise.create(this, {
            targets: this.transparentOverlayCssBinding,
            opacity: isShow? 1 : 0,
            duration: dt
        });
        return tp;        
    }


    setCenterTextPaper(title:string, content: string, fontSize = 150) {
        this.setNewspaperStyle(NewsPaperStyle.ONLY_TEXT_CENTER);
        this.setNewspaperContent(content);
        this.setNewspaperFontSize(fontSize);
        this.setNewspaperTitle(title);
    }
/////////////////////////////////////////////////////////////////////////

    innerBorderStyles = ['double', 'dashed', 'dotted', 'solid'];
    paperEnterCallback(state: FsmState, index:number) {
        this.fillNewspaperContentByNum(this.npNums[index]);        
        this.showTransparentOverlay(false);
        this.hideResult();
        this.canRecieveEmotion = true;
        this.canRecieveEmojiClick = true;

        this.resetProgress();       
        this.currIndex = index;
        let borderStyleIndex = index % this.innerBorderStyles.length;
        $('#newspaper-inner-frame').css('border-style', this.innerBorderStyles[borderStyleIndex]);

        // let randomWidth = 400 + Math.random() * 100;
        let randomWidth = 450;
        $('#newspaper-inner-frame').css('width', `${randomWidth}px`);

        let item = this.getNewsItemByIndex(index);        
        if(item.reaction == 1) {    
            this.showProgressBars();        
        }
    }

    correctEnterCallback(state: FsmState, index: number) {
        // this.hideProgressBars();
        // this.canRecieveEmotion = false;
    }

    getNewsItemByIndex(index:number): NewsItem{
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(this.npNums[index]);
        return newsItem;
    }

    secondChanceEnterCallback(state: FsmState, index:number) {
        this.resetProgress();
        this.hideResult();
        
        let item = this.getNewsItemByIndex(index);        
        // is cam
        if(item.reaction == 1) {            
            this.hideAndShowProgressBars().then(s=>{
                this.canRecieveEmotion = true; 
            });
        }     
        else if(item.reaction == 0){
            this.canRecieveEmojiClick = true;
        }
    }

    /**
     * Keep in mind that the onEnter can't handle the task needed to be sequenced 
     * very well
     * @param state 
     * @param index 
     */
    paperEndEntercallback(state: FsmState, index:number) {
        
    }

    addPaperEndAction(s: FsmState, index:number) {
        s.addAction((s, result, resolve, reject)=>{
            this.showTransparentOverlay(true).then(res=>{
                resolve('transprent show');
            });
            let item = this.getNewsItemByIndex(index);        

            if(item.reaction == 1) {    
                this.hideProgressBars();        
            }

        });
        s.addDelayAction(this, 300);
        s.addFinishAction();
    }
/////////////////////////////////////////////////////////////////////////
}