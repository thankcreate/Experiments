declare var gLabelWall;
declare function gResetLabelWall();
declare function convertNewspaperSourceTypeToID(lbl);

class Scene2 extends BaseScene {
    paperCssBinding : CssBinding;
    camCssBinding: CssBinding;
    topProgressCssBinding: CssBinding;
    bottomProgressCssBinding: CssBinding;
    resultCssBinding: CssBinding;
    manualBtnsCssBing: CssBinding;
    transparentOverlayCssBinding: CssBinding;
    indicatorCssBinding: CssBinding;
    indicatorButtonCssBinding: CssBinding;  
    hpCssBinding: CssBinding;
    cleanLayerCssBinding: CssBinding;
    propFrameCssBinding: CssBinding;
    propCssBindings: CssBinding[];
    levelProgressCssBinding: CssBinding;
    expressionPromptCssBinding: CssBinding;

    newspaperFsm: NewspaperFsm;


    fullTimeComment = 12;
    fullTime = 4;
    // fullTime = 1;

    // cleanTimeLong = 2;
    cleanTimeLong = 10;
    cleanTimeShort = 2; 



    cleanTime = 10; // seconds

    currIndex = 0;
    get npNums(): number[]{
        return [0];
    }

    rssCurIndex = 0;
    rssItems: RssItem[] = [];
    
    npHp = 3;
    npMaxHp = 3;
    
    isExercise = false;
    isAttentionChecking:boolean = false;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);        
    }

    
    preload() {
        super.preload();
        this.load.image('center_rect', 'assets/center_rect.png');        
    }

    getPropID(idx: number) {
        return `prop-${idx}`
    }


    create() {
        super.create();
        this.intiPropButtons();
        $(document).ready(()=>{
            this.initDnD();
            this.setAllLabels();
        })
        
        this.initButtonHoverAudioEffect();
        this.showMonkey1();
        this.initConfirmButtons();

        this.showTestInfo(false);

        

        this.newspaperFsm = this.makeNewspaperFsm();

        this.paperCssBinding = new CssBinding($('#newspaper-page'));
        this.camCssBinding = new CssBinding($('#cam-root'));
        this.topProgressCssBinding = new CssBinding($('#top-bar'));
        this.bottomProgressCssBinding = new CssBinding($('#bottom-bar'));
        this.resultCssBinding = new CssBinding($('#newspaper-result'));
        this.manualBtnsCssBing = new CssBinding($('#newspaper-manual-button'));
        this.transparentOverlayCssBinding = new CssBinding($('#newspaper-transparent-overlay'));
        this.indicatorCssBinding = new CssBinding($('#indicator-bar'));
        this.indicatorButtonCssBinding = new CssBinding($('#indicator-bar-btn'));
        this.hpCssBinding = new CssBinding($('#newspaper-hp'));
        this.cleanLayerCssBinding = new CssBinding($('#newspaper-clean-overlay'));
        this.propFrameCssBinding = new CssBinding($('#newspaper-prop-frame'))
        this.levelProgressCssBinding = new CssBinding($('#level-progress-root'));
        this.expressionPromptCssBinding = new CssBinding($('#expression-prompt'));

        // collection
        this.propCssBindings = [];
        for(let i = 0; i < newspaperPropInfos.length; i++) {
            let propID = this.getPropID(i);
            let bd = new CssBinding($(`#${propID}`));
            this.propCssBindings.push(bd);
        }


        this.initBindingCss();

        
        CameraManager.getInstance().imageResEvent.on((e)=>{
            this.imageHandler(e);
        })
        CameraManager.getInstance().requestPermission();
        CameraManager.getInstance().initFaceAPI()       

        CameraManager.getInstance().startDectector();   
        CameraManager.getInstance().setPosition(CamPosi.Newspaper);

        CameraManager.getInstance().showVideo();               

        

        GlobalEventManager.getInstance().newspaperButtonTopClickedEvent.on((m)=>{
            this.newspaperButtonClicked(m, true);
        })
        GlobalEventManager.getInstance().newspaperButtonBottomClickedEvent.on((m)=>{
            this.newspaperButtonClicked(m, false);
        })        
    }

    newspaperButtonClicked(manager: GlobalEventManager, isTop: boolean) {
        if(!this.canRecieveEmojiClick)
            return;
        this.emotionMaxed(isTop ? MyEmotion.Positive : MyEmotion.Negative);
        FmodManager.getInstance().playOneShot('65537_ConfirmEmoji');
    }

   
    

    resetProgress() {
        this.topProgress.value = 0;
        this.bottomProgress.value = 0;
        this.refreshEmojiProgressBarCss();
    }


    showTestInfo(show: boolean) {
        $('#test-info').css('display', show ? 'block' : 'none');
    }
    makeNewspaperFsm() {
        return new NewspaperFsm(this, this.npNums, 
            this.paperEnterCallback.bind(this),
            this.correctEnterCallback.bind(this), 
            this.secondChanceEnterCallback.bind(this),
            this.paperEndEntercallback.bind(this),
            this.paperEndAction.bind(this),
            this.paperDiedAddActionCallBack.bind(this)
            );        
    }

    intiPropButtons() {
        for(let i = 0; i < newspaperPropInfos.length; i++) {
            let info = newspaperPropInfos[i];
            $(`#prop-${i} .newspaper-prop-icon`).text(info.icon);
            $(`#prop-${i} .tooltip`).text(info.desc);           

            
            $(`#prop-${i}`).css('pointer-events', 'none');
            // $(`#prop-${i}`).on('click', ()=>{this.onPropButtonClick(i)});
        }
    }

    onPropButtonClick(index: number) {
        newspaperPropInfos[index].activated = !newspaperPropInfos[index].activated;
        this.showPropButtonWithIndex(newspaperPropInfos[index].activated, index);

        this.updatePropStatus();
    }

    updateCleanTime() {
        if(this.isPropActivated(NewspaperPropType.LessCleaningTime)) {
            this.cleanTime = this.cleanTimeShort;
        }
        else {
            this.cleanTime = this.cleanTimeLong;
        }
    }


    updatePropStatus() {
        // Less cleaning time
        this.updateCleanTime();

        // See no evil
        // Logic is in this.updateAttentionLevel & this.drawBlackBar

        // Auto label drag
        if(this.isPropActivated(NewspaperPropType.AutoLabel)) {
            $('#newspaper-toolbox-stamps').css('pointer-events', 'none');
        }   
        else {
            $('#newspaper-toolbox-stamps').css('pointer-events', 'auto');
        }
        
        // Prompt
        let item = this.getCurrentItem();
        if(!this.isRealPaper(item)) {
            this.showPromptLayer(this.isPropActivated(NewspaperPropType.Prompt));        
        }


        // AutoEmoji
        // Logic is in this.drawVirtualHead

    }

    getPromptEmoji(item : NewsItem) : string{
        let answerEmoji = '';
        if(item.answer == 0) {
            answerEmoji = '😣';
        }
        else if(item.answer == 1) {
            answerEmoji = '😀';
        }
        else {
            answerEmoji = '🙈';
        }
        return answerEmoji;
    }


    showPromptLayer(show: boolean) {
        let answerEmoji = this.getPromptEmoji(this.getCurrentItem());        
        this.setPromptContent(answerEmoji);
        $('#newspaper-prompt-overlay').css('visibility', show ? 'visible': 'hidden');
    }

    setPromptContent(content: string) {
        let fullText = `✔️ -> ${content}`;
        $('#newspaper-prompt-overlay-content').text(fullText);
    }


    getPropInfoByType(tp: NewspaperPropType) : NewspaperPropInfo{
        for(let i  = 0; i < newspaperPropInfos.length; i++) {
            if(newspaperPropInfos[i].type == tp) {
                return newspaperPropInfos[i];
            }
        }
        console.log("ERROR: Can't find this NewspaperPropType");
        return null;
    }
    

    // called by BaseScene.create
    initVoiceType() {
        this.getSpeechManager().setVoiceType(VoiceType.Voice65537);
    }

    drawFeaturePoints(res: ImageRes) {
        if ($('#face_video_canvas')[0] == null) {
            return;
        }
        let img = res.img;
        let featurePoints = res.face.featurePoints;

        var ctx = ($('#face_video_canvas')[0] as any).getContext('2d');

        var hRatio = ctx.canvas.width / img.width;
        var vRatio = ctx.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        ctx.strokeStyle = "#FF0000";


        for (var id in featurePoints) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff0000';
            ctx.arc(featurePoints[id].x,
                featurePoints[id].y, 2, 0, 2 * Math.PI);            
            ctx.stroke();

            // console.log(ctx.lineWidth);
            // Draw number indices
            // contxt.font="10px Comic Sans MS";
            // contxt.fillStyle = "red";
            // contxt.textAlign = "center";
            // contxt.fillText("" + id, featurePoints[id].x,
            // featurePoints[id].y);
        }

        // this.drawBlackBar(ctx, featurePoints);


        if(this.isRealPaper() && this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
            this.drawBlackBar(ctx, featurePoints);
        }
       

        // TODO: should only happen in fake paper
        // if(this.isFakePaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
        if(!this.isRealPaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
            this.drawVirtualHead(ctx, featurePoints);
        }
        // this.drawVirtualHead(ctx, featurePoints);
    }

    isPropActivated(type: NewspaperPropType) : boolean{
        return this.getPropInfoByType(type).activated;
    }

    drawVirtualHead(ctx, featurePoints: FeaturePoint[]) {
        let item = this.getCurrentItem();
        let eyeBegin = featurePoints[16];
        let eyeEnd = featurePoints[19];

        let faceCenter = featurePoints[12];
        let angl = Math.atan2(eyeEnd.y - eyeBegin.y, eyeEnd.x - eyeBegin.x);
       
        ctx.save();
        ctx.font = '260pt Arial';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(faceCenter.x, faceCenter.y - 20);        
        ctx.rotate(angl);

        var rText = '😄';
        if(item.answer == 0) {
            rText = '😖';
        }
        else {
            rText = '😄';
        }

        if(this.canRecieveEmotion) {
            let num = this.getCurrentItem().index;
            if(num >= CREDIT_BEGIN_NUM && num <= CREDIT_END_NUM - 1) {
                rText = '❤️'
            }
            else if(num == COMMENT_NUM) {
                rText = '💌'
            }
        }
        
        
        ctx.fillText(rText , 0, 0);
        ctx.restore();


    }

    drawBlackBar(ctx, featurePoints: FeaturePoint[]) {
        let eyeBegin = featurePoints[16];
        let eyeEnd = featurePoints[19];
        let extendRadio = 0.1;
        // extend the bar a little bit
        let barBegin = this.lerpFeaturePoint(eyeBegin, eyeEnd, 0 - extendRadio);
        let barEnd = this.lerpFeaturePoint(eyeBegin, eyeEnd, 1 + extendRadio);

        ctx.beginPath();
        ctx.lineWidth = 40;
        ctx.strokeStyle = '#ffc83d';
        // ctx.strokeStyle = '#000000';
        ctx.moveTo(barBegin.x, barBegin.y);
        ctx.lineTo(barEnd.x, barEnd.y);
        ctx.stroke();
    }

    lerpFeaturePoint(point1: FeaturePoint, point2: FeaturePoint, ratio: number) : FeaturePoint {
        let x = lerp(point1.x, point2.x, ratio);
        let y = lerp(point1.y, point2.y, ratio);
        return {x: x, y: y};
    }

    imageHandler(res: ImageRes) {
        this.drawFeaturePoints(res);
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

    showIndicator(isShow: boolean): Pany {
        let dt = 600;
        let pany = TweenPromise.create(this, {
            targets: this.indicatorCssBinding,
            translateX: isShow ? 0 : -100,
            duration: dt
        });
        return pany;
    }

    needFreezeIndicatorMeterBtn: boolean = false;
    updateIndicatorMeterBtn(analyzeRes: MyAnalysis) {
        if(this.needFreezeIndicatorMeterBtn) {
            return;
        }

        let emotionFactor = analyzeRes.emotion == MyEmotion.Positive ? -1 : 1;
        let per = 0.5 + emotionFactor * analyzeRes.intensity * 0.5;        
        this.updateIndicatorMeterBtnByPercentage(per);
    }

    /**
     * Updatdate the indicator button by a input normalized number
     * @param per [0, 1]. 0 means top-most, 1 means bottom-most;
     */
    updateIndicatorMeterBtnByPercentage(per: number, needLerp: boolean = true) {
        // 1.current
        let curTop = this.indicatorButtonCssBinding.top;
        //  remove the postfix '%'
        let curTopNum = parseFloat(curTop.substr(0, curTop.length - 1)); 
        
        // 2.destination
        let top = this.indicatorBtnTop;  
        let bottom = this.indicatorBtnBottom; 
        let dest = lerp(top, bottom, per);

        // 3.lerp from current->destination
        let lerped = needLerp ? lerp(curTopNum, dest, 0.1) : dest;

        this.indicatorButtonCssBinding.top = `${lerped}%`;
    }

    /**
     * 
     * @param attention [0, 100]
     */
    lastAttention = 0;

    /**
     * Called from update
     * @param time 
     * @param dt 
     */

    curCleanProgress = 0; // [0, 1]

    updateAttentionLevel(time, dt) {
        if(this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
            this.lastAttention = 0;
        }

        let timestamp = this.curTime / 1000
        if(this.lastTimeStamp != null && timestamp - this.lastTimeStamp > 0.3) {
            this.lastAttention = 0;
        }
        $('#attention-content').text(`🙈 Attention: ${this.lastAttention.toFixed(0)}`);


        let needPlay = false;
        if(this.lastAttention < 10) {

            $('#attention-frame').css('border-color', '#FFEB3B');

            if(this.isAttentionChecking) {         
                this.updateCleanTime();
                this.needChangeMonkey = false;
                this.curCleanProgress += dt / 1000 / this.cleanTime;
                this.curCleanProgress = clamp(this.curCleanProgress, 0, 1);
    
                this.updateCleanProgressInner();
    
                needPlay = true;

                if(this.curCleanProgress == 1) {                    
                    this.newspaperFsm.event(Fsm.PURGED);
                    // $('#newspaper-toolbox-stamps').css('visibility', 'visible');                    
                }
            }
        }
        else {
            $('#attention-frame').css('border-color', 'red');
        }     

        let fmod = FmodManager.getInstance();
        if(needPlay) {
            
            if(!this.isPurgeProgressAudioPlaying) 
            {
                
                fmod.playInstance(fmod.purgeProgressInstance);                         
            }
            this.isPurgeProgressAudioPlaying = true;
        }
        else {
            if(this.isPurgeProgressAudioPlaying)
             {
                fmod.stopInstance(fmod.purgeProgressInstance);       
            }
            this.isPurgeProgressAudioPlaying = false;
        }
    }

    updateCleanProgressInner() {
        let showProgress = (this.curCleanProgress * 100).toFixed(0);
        $('#newspaper-clean-progress').text(`🧹: ${showProgress}%`);            
        this.cleanLayerCssBinding.opacity = this.curCleanProgress;
    }

    isFakePaper() {
        let item = this.getCurrentItem();
        return !this.isRealPaper(item);
    }



    setNeedProgressAudioPlaying(needPlay) { 
        let fmod = FmodManager.getInstance();
        if(this.inFinalAutoMode)
            needPlay = false;
        

        if(needPlay) {
            
            if(!this.isEmojiProgressAudioPlaying) 
            {
                
                fmod.playInstance(fmod.emojiProgressInstance);                         
            }
            this.isEmojiProgressAudioPlaying = true;
        }
        else {
            if(this.isEmojiProgressAudioPlaying)
             {
                fmod.stopInstance(fmod.emojiProgressInstance);       
            }
            this.isEmojiProgressAudioPlaying = false;
        }
    }

    onlyShowPositive = false;
    // whether need to animate the dwitter background when a emotion intensity reached a threshould
    needDwitterFlow = false;
    emotionAnalyze(imgRes: ImageRes) {     
        let item = this.getCurrentItem()   ;
        let face = imgRes.face;
        // console.log(this.curTime);
        // console.log(imgRes.timestamp);
        // let timestamp = imgRes.timestamp; // in seconds
        
        let timestamp = this.curTime / 1000; // in seconds
        if(this.lastTimeStamp == null) {
            this.lastTimeStamp = timestamp;
        }

        this.lastAttention = imgRes.face.expressions.attention;

        let timeDiff = timestamp - this.lastTimeStamp;

        // analyze
        let res = EmmotionManager.getInstance().emotionAnalyze(imgRes);       
        if(this.isFakePaper() && this.isPropActivated(NewspaperPropType.AutoEmotion)) {
            res.emotion = item.answer == 0 ? MyEmotion.Negative : MyEmotion.Positive;
            res.intensity = 1;
        }
        

        // notify the indicator meter to update Y
        this.updateIndicatorMeterBtn(res);

        
        if(res.intensity > 0.75){
            this.setNeedProgressAudioPlaying(true);
        }
        else {
            this.setNeedProgressAudioPlaying(false);
        }

        
        // this.updateAttentionLevel(imgRes.face.expressions.attention);

        this.needDwitterFlow = false;
        
        if(!this.canRecieveEmotion || timeDiff > 1 || (this.onlyShowPositive && res.emotion == MyEmotion.Negative)) {
            this.lastTimeStamp = timestamp;
            this.setNeedProgressAudioPlaying(false);
            return;
        }

        if(this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            this.lastTimeStamp = timestamp;
            this.setNeedProgressAudioPlaying(false);
            return;
        }

        this.emotionAnalyzeFinished(res);

        // console.log(timeDiff);


        let fullTime = item.index == COMMENT_NUM ? this.fullTimeComment : this.fullTime;
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



        let added = 1 / fullTime * res.intensity * timeDiff;
        progress.value += added;
        progress.value = clamp(progress.value, 0, 1);

        if(progress.value == 1) {                     
            this.emotionMaxed(res.emotion);
        }

        if(res.intensity > 0.9){
            this.needDwitterFlow = true;
        }


        
        this.refreshBarLeftIconStatus(res.emotion);
        this.refreshEmojiProgressBarCss();
        // if(res.emotion != MyEmotion.None) {
        //     targetJquery.css('width', progress.value * 100 + "%");
        // }
        this.lastTimeStamp = timestamp;


        
    }

    isEmojiProgressAudioPlaying = false;
    isPurgeProgressAudioPlaying = false;


    emotionAnalyzeFinished(res: MyAnalysis) {

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

    refreshEmojiProgressBarCss() {

        this.topProgress.value = clamp(this.topProgress.value, 0, 1);
        this.bottomProgress.value = clamp(this.bottomProgress.value, 0, 1);

        $('#emoji-progress-top').css('width', this.topProgress.value * 100 + "%");
        $('#emoji-progress-bottom').css('width', this.bottomProgress.value * 100 + "%");
    }

    getProgressBarDenominator() {
        return this.npNums.length
    }

    refreshLevelProgressBarCss(index: number) {
        let deno = this.getProgressBarDenominator();
        let pg = (index) / deno * 100;
        let fixedPg = pg.toFixed(0);
        $('#level-progress-bar').css('width',  fixedPg + '%');
        $('#level-progress-text').text(`Experiment Progress: ${index} / ${index <= deno ? deno : '65537'}`);
    }

    getCurrentItem(): NewsItem {
        return NewsDataManager.getInstance().getByNum(this.npNums[this.currIndex]);
    }

    isLastTestCorrect = false;

    isFirstShownNYT(item: NewsItem) {
        return item.tag == 'FirstShownNYT';
    }
    

    lastMaxedEmojion: MyEmotion = MyEmotion.Negative;
    emotionMaxed(myEmotion: MyEmotion){        
        let item = this.getCurrentItem()      

        // If it's in NYT mode, the EmotionMaxed event didn't trigger a result
        // It still shows a full progress bar, but does nothing
        // However, for the first time player encounter the NYT,
        // we still want to invoke the wrong answer branch

        this.refreshContentRelatedToProgress();
        if(this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            return ;
        }
        else {
            this.canRecieveEmotion = false;
            this.canRecieveEmojiClick = false;
    
            
    
            this.lastMaxedEmojion = myEmotion;

            let rightEmotion = MyEmotion.None;
            if(item.answer == 0) {
                rightEmotion = MyEmotion.Negative;
            }
            else if(item.answer == 1) {
                rightEmotion = MyEmotion.Positive;
            }
            
            let correct = myEmotion == rightEmotion;
            // If:
            // 1. Is alwyas wrong mode
            // 2. Without prompt unlocked
            // Then it's a WRONG
            if(NewsDataManager.getInstance().isAlwaysWrongItem(item) && !this.isPropActivated(NewspaperPropType.Prompt)){
                correct = false;
            }

            this.isLastTestCorrect = correct; 
            
            // this.showResult(this.isLastTestCorrect);
            this.newspaperFsm.event(correct ? Fsm.CORRECT : Fsm.WRONG);
            if(!this.isExercise || correct) {
                this.refreshLevelProgressBarCss(this.currIndex + 1);
            }
                


        }        
    }
    

    createDwitters(parentContainer: PhContainer) {        
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRectBKG(this, parentContainer, 0, 0, 2400, 2400, true);        
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
        .addSubtitleAction(this.subtitle, "Which experiment would you like to take?", false, null, null, 10).setBoolCondition(o=>this.needModeSelect())
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
        this.initBindingCss();
        this.resetNewspaperParameter();
    }


    resetNewspaperParameter() {
        this.isCamShown = false;
        this.npHp = this.npMaxHp;   
        this.refreshHp();
        this.cleanTime = this.cleanTimeLong; 
        this.needFreezeIndicatorMeterBtn = false;
        this.refreshLevelProgressBarCss(0);        
        this.inFinalAutoMode = false;
    }

    refreshHp() {
        this.setHp(this.npHp);
    }

    setHp(num: number) {
        // the logical hp  = shown heart + 1        
        let hpStr = '';
        for(let i = 0; i < num - 1; i++) {
            hpStr += '❤️';
        }
        for(let i = 0; i < this.npMaxHp - num; i++) {
            hpStr += '🤍';
        }
        $('#newspaper-hp-content').text(hpStr);
    }

    initialPaperTranslateX = -50;
    initialPaperTranslateY = -50;

    initialCamTranslateX = -100;
    initialCamTranslateY = -50;

    indicatorBtnTop = 1;
    indicatorBtnBottom = 99;


    initBindingCss() {
        this.paperCssBinding.scale = 0;
        this.paperCssBinding.rotate = 0;
        this.paperCssBinding.translateX = this.initialPaperTranslateX;
        this.paperCssBinding.translateY = this.initialPaperTranslateY;
        this.paperCssBinding.update();

        this.camCssBinding.translateX = this.initialCamTranslateX;
        this.camCssBinding.translateY = this.initialCamTranslateY;
        this.camCssBinding.update();

        this.topProgressCssBinding.translateY = 100;
        this.topProgressCssBinding.update();
        
        this.bottomProgressCssBinding.translateY = -100;
        this.bottomProgressCssBinding.update();

        this.resultCssBinding.translateX = 100;
        this.resultCssBinding.update();

        this.manualBtnsCssBing.translateX = -100;
        this.manualBtnsCssBing.translateY = -50;
        this.manualBtnsCssBing.update();

        this.transparentOverlayCssBinding.opacity = 0;
        this.transparentOverlayCssBinding.update();

        this.indicatorCssBinding.translateX = -100;
        this.indicatorCssBinding.update();

        this.indicatorButtonCssBinding.top = `${this.indicatorBtnTop}%`;
        this.indicatorButtonCssBinding.update();

        this.hpCssBinding.translateX = 100;
        this.hpCssBinding.update();

        this.cleanLayerCssBinding.opacity = 0;
        this.cleanLayerCssBinding.update();

        this.propFrameCssBinding.translateY = 0;
        this.propFrameCssBinding.update();

        this.levelProgressCssBinding.translateY = 0;
        this.levelProgressCssBinding.update();

        this.expressionPromptCssBinding.translateX = 0;
        this.expressionPromptCssBinding.update();

        for(let i = 0; i < this.propCssBindings.length; i++) {
            // TODO
            this.showPropButtonWithIndex(true, i);
        }
    }

    // show the see-no-evil monkey
    showExpressionPrompt(show: boolean) {
        let dt = 1000;        
        let dest = show ? -100 : 0;
        this.tweens.add({
            targets: this.expressionPromptCssBinding,
            translateX: dest,
            duration: dt
        })
    }

    needChangeMonkey: boolean = true;
    showMonkey1() {
        $('#expression-prompt-content').text('🙈');
        if (this.needChangeMonkey) {
            setTimeout(() => {
                this.showMonkey2()
            }, 2000);
        }
        else {
            $('#expression-prompt-content').text('🙈');
        }
    }

    showMonkey2() {
        $('#expression-prompt-content').text('🙉');
        if (this.needChangeMonkey) {
            setTimeout(() => {
                this.showMonkey1()
            }, 1000);
        }   
        else {
            $('#expression-prompt-content').text('🙈');
        }
    }

    showPropFrame(show: boolean = true) {
        this.propFrameCssBinding.translateY = show ? -100 : 0;
        this.propFrameCssBinding.update();
    }

    showPropButtonWithType(show: boolean, type: NewspaperPropType) {
        let i = 0;
        for(; i < newspaperPropInfos.length; i ++) {
            if(newspaperPropInfos[i].type == type) {
                break;
            }
        }
        this.showPropButtonWithIndex(show, i);
    }

    showPropButtonWithIndex(show: boolean, index: number) {
        
        $(`#prop-${index}`).css('pointer-events', show ? 'auto' : 'none');

        let dt = 500;
        newspaperPropInfos[index].activated = show;
        if(notSet(this.propCssBindings[index].translateY)) {
            this.propCssBindings[index].translateY = 65;
        }
        this.tweens.add({
            targets: this.propCssBindings[index],
            translateY: show ? 0 : 65,
            duration: dt
        })
        // this.propCssBindings[index].translateY = show ? 0 : 65;
    }

    showPaper(show: boolean = true) {
        $('#newspaper-layer').css('display', show? 'block' : 'none');
        $('#newspaper-page').css('visibility', show ? 'visible' : 'hidden');

        $('#top-bar').css('visibility', show ? 'visible' : 'hidden');
        $('#bottom-bar').css('visibility', show ? 'visible' : 'hidden');
        $('#indicator-bar').css('visibility', show ? 'visible' : 'hidden');

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

    createHud(parentContainer: PhContainer) {
        return null;
    }
    
    sceneExitNormalGame(s: FsmState) {
        super.sceneExitNormalGame(s);
        this.newspaperFsm.stop();
    }

    scenePrepareBackToHome() {
        super.scenePrepareBackToHome();
        this.showPaper(false);
    }

    isCamShown = false;
    showCam(isShow: boolean) {
        let dt = 500;
        this.isCamShown = isShow;
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

    showHp(show: boolean) {
        let dt = 500;
        this.tweens.add({
            targets: this.hpCssBinding,
            translateX: show? 0 : 100,
            duration: dt
        })
    }


    /**
     * Since the top and bottom tween have the same duration
     * we just return one of them as the Promise
     */
    showEmojiProgressBars(): Pany {
        let dt = 600;
        let top = TweenPromise.create(this, {
            targets: this.topProgressCssBinding,
            translateY: 0,
            duration: dt
        });

        if(!this.onlyShowPositive) {
            this.tweens.add({
                targets: this.bottomProgressCssBinding,
                translateY: 0,
                duration: dt
            }) 
        }


        this.showIndicator(true);
        return top;
    }

    
    showLevelProgess(show: boolean) {
        let dt = 600;
        let toY = show ? 100 : 0;
        this.tweens.add({
            targets: this.levelProgressCssBinding,
            translateY: toY,
            duration: dt
        });        
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

        this.showIndicator(false);
        return top;
    }

    hideAndShowProgressBars(): Pany {
        return this.hideProgressBars().then(res=>{return this.showEmojiProgressBars()});
    }

    showResult(isCorrect: boolean) : Pany {
        if(!isCorrect) {
            this.npHp--; 
            this.refreshHp();
        }

        $('#newspaper-result-content').text(isCorrect? '✔️' : '❌');
        

        let ret = TimeOutPromise.create(800).then(s=>{
            
            if(isCorrect) {
                FmodManager.getInstance().playOneShot('65537_CorrectResponse');
            }
            else {
                FmodManager.getInstance().playOneShot('65537_WrongResponse');
            }

            // when in show result, make sure the top of hp bar is moved down
            $('#newspaper-hp').css('top', '90px');

            let dt = 500;     
            return TweenPromise.create(this, {
                targets: this.resultCssBinding,
                translateX: 0,
                duration: dt
            })
        }).then(s=>{
            return TimeOutPromise.create(1000);
        }) 


        return ret;
    }


    hideResult() {
        let dt = 500;        
        this.tweens.add({
            targets: this.resultCssBinding,
            translateX: 100,
            duration: dt
        })

        $('#newspaper-hp').css('top', '20px');
    }
    
    updateCssBinding() {
        if(this.camCssBinding)
            this.camCssBinding.update()
        if(this.paperCssBinding) 
            this.paperCssBinding.update();
        if(this.topProgressCssBinding)
            this.topProgressCssBinding.update();
        if(this.bottomProgressCssBinding)
            this.bottomProgressCssBinding.update();            
        if(this.resultCssBinding)
            this.resultCssBinding.update();         
        if(this.manualBtnsCssBing)
            this.manualBtnsCssBing.update();
        if(this.transparentOverlayCssBinding)
            this.transparentOverlayCssBinding.update();
        

        if(this.indicatorCssBinding) 
            this.indicatorCssBinding.update();
        if(this.indicatorButtonCssBinding)
            this.indicatorButtonCssBinding.update();

        if(this.hpCssBinding)
            this.hpCssBinding.update();

        if(this.cleanLayerCssBinding)
            this.cleanLayerCssBinding.update();

        if(this.propFrameCssBinding)
            this.propFrameCssBinding.update();

        for(let i = 0; i < this.propCssBindings.length; i++) {
            this.propCssBindings[i].update();
        }

        if(this.levelProgressCssBinding)
            this.levelProgressCssBinding.update();

        if(this.expressionPromptCssBinding) 
            this.expressionPromptCssBinding.update();

        // $('#affdex_elements').css('transform',`translate(${this.camTranslateX}%, ${this.camTranslateY}%)`);
        // $('#newspaper-page').css('transform', `translate(${this.paperTranslateX}%, ${this.paperTranslateY}%) scale(${this.paperScale}) rotate(${this.paperRotate}deg)`);
    }

    update(time, dt) {
        super.update(time, dt);
        this.updateCssBinding();
        this.updateDwitterBackgroundState();

        this.updateAttentionLevel(time, dt);        
    }

    updateDwitterBackgroundState() {
        if(this.inFinalAutoMode){
            this.dwitterBKG.isRunning2 = true;
            return;
        }
        


        if(this.isCamShown){
            if(this.needDwitterFlow && this.canRecieveEmotion) {
                this.dwitterBKG.isRunning2 = true;
            }
            else {
                this.dwitterBKG.isRunning2 = false;
            }
        }
        else {
            this.dwitterBKG.isRunning2 = false;
        }
    }
        
    getNewsItemFromIndex(index: number) : NewsItem{
        let num = this.npNums[index];
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(num);
        return newsItem;
    }    

    isRealPaper(newsItem?: NewsItem): boolean {
        if(notSet(newsItem)) {
            newsItem = this.getCurrentItem();
        }
        return NewsDataManager.getInstance().isRealPaper(newsItem);        
    }

    fillNewspaperContentByNum(num: number) {
        let ins = NewsDataManager.getInstance();
        let newsItem = ins.getByNum(num);

        if(num >= CREDIT_BEGIN_NUM && num <= CREDIT_END_NUM) {
            this.fillNewspaperCredit(newsItem);
        }
        else if(this.isRealPaper(newsItem)) {
            this.fillNewspaperContentReal(newsItem);
        }
        else {
            this.fillNewspaperContentNormal(newsItem);
        }        
    }

    fillNewspaperCredit(newsItem: NewsItem) {
        
        if(newsItem.index == COMMENT_NUM) {
            this.setNewspaperStyle(NewspaperStyle.COMMENT);            
        }
        else {
            this.setNewspaperStyle(NewspaperStyle.RATING);            
        }
        
        this.setNewspaperContent(newsItem.content);        
        this.setNewspaperTitle(newsItem.title);
    }

    fillNewspaperContentReal(newsItem: NewsItem) {
        let titleSlot = $('#newspaper-title');
        let contentSlot = $('#newspaper-content-text');
        let thumbnailSlot = $('#newspaper-thumbnail');
        
        
        this.setTitle(this.getToolTipToRealPaperTitle(newsItem, false));

        
        let assignedIndex = Number.parseInt(newsItem.content.match(/index='(.*?)'/)[1]);
        
        // console.log("assignedIndex: " + assignedIndex);
        // let assignedIndex = 0;

        let curRssItem = this.rssItems[assignedIndex % this.rssItems.length];
        let content = curRssItem.title + '<br/><br/>' + curRssItem.desc;
        contentSlot.html(content);

        thumbnailSlot.attr('src', curRssItem.imageUrl);

        if(newsItem.style == 0) {
            this.setNewspaperStyle(NewspaperStyle.DEFAULT);    
        }        

        
        // this.rssCurIndex++;
        // this.rssCurIndex %= this.rssItems.length;
    }

    convertToAsterisk(str: string) {
        let output = '';
        let isFirst = true;
        for(let i = 0; i < str.length; i++) {
            if(str.charAt(i) != ' ')  {
                if(isFirst) {
                    output += str.charAt(i);
                    isFirst = false;
                }
                else {
                    output += '*';
                }                
            }
            else {
                isFirst = true;
                output += ' ';
            }
        }
        return output;
    }

    setAllLabels() {
        console.log('setAllLabels')
        let map = NewsDataManager.getInstance().labelMapping;
        let allLabels = [];
        for(let [k, v] of map) {            
            for(let j in v) {
                allLabels.push(v[j]);
            }
        }
        gLabelWall.setItems(allLabels);
        
    }

    getToolTipToRealPaperTitle(newsItem: NewsItem, isAsteriskTitle: boolean) : string{
        if(!this.isRealPaper(newsItem)) {
            return newsItem.title;
        }

        let oriLabels = NewsDataManager.getInstance().labelMapping.get(newsItem.sourceType);
        let lbls = [];
        for(let i in oriLabels) {
            lbls.push('<b>• ' + oriLabels[i] + '</b>');
        }
        let asteriskTitle = this.convertToAsterisk(newsItem.title);
        let tooltip = `No legal record is found related to ${asteriskTitle}.<br/><br/> Still, according to the Word2Vec word embedding database we got from Experiment 65536, people usually refer to ${asteriskTitle} as:<br/>`;
        let connectedLbls = `<div class='red'>${lbls.join('<br/>')}</div>`;
        
        tooltip += connectedLbls;
        let newTitle = `<span class='keyword'>${isAsteriskTitle ?this.convertToAsterisk(newsItem.title) :  newsItem.title}<span class='tooltip''>${tooltip}</span></span>`
        return newTitle;
    }

    setTitle(str: string) {
        let titleSlot = $('#newspaper-title');
        titleSlot.html(str);;
    }

    fillNewspaperContentNormal(newsItem: NewsItem) {
        let titleSlot = $('#newspaper-title');
        let contentSlot = $('#newspaper-content-text');
        let thumbnailSlot = $('#newspaper-thumbnail');

        this.setTitle(newsItem.title);
        
        contentSlot.html(newsItem.content);
        if(newsItem.thumbnail1 && newsItem.thumbnail1.length > 0) {
            thumbnailSlot.attr('src', 'assets/newspaper/' + newsItem.thumbnail1);
        }
        else {
            thumbnailSlot.attr('src', 'assets/newspaper/portrait-1.jpg');
        }        

        if(newsItem.style == 0) {
            this.setNewspaperStyle(NewspaperStyle.DEFAULT);    
        }    

        this.enableAttention(false);
    }

    npStyle: NewspaperStyle = NewspaperStyle.DEFAULT;
    setNewspaperStyle(style: NewspaperStyle) {
        let newsItem = this.getCurrentItem();
        this.npStyle = style;

        let p = $('#newspaper-content-text');
        let thumb = $('#newspaper-thumbnail');

        if(style == NewspaperStyle.ONLY_TEXT_CENTER) {            
            p.css('position', 'absolute');
            p.css('text-align', 'center');
            p.css('width', '100%');
            
            p.css('top', '50%');
            p.css('transform', 'translate(0, -50%)')      
            
            thumb.css('display', 'none');

            this.setNewspaperTitleFontSize(50);
            this.setNewspaperContentFontSize(50);

            this.setNewspaperTitleFontFamily('Georgia, serif');
        }
        else if (style == NewspaperStyle.DEFAULT) {            
            p.css('position', 'static');
            p.css('text-align', 'inherit');
            p.css('width', '');
            p.css('top', '');
            p.css('transform', '')   
            this.setNewspaperContentFontSize(16);
            this.setNewspaperTitleFontSize(50);
            this.setNewspaperTitleFontFamily('Georgia, serif');

            thumb.css('display', 'block');
        }
        else if(style == NewspaperStyle.RATING) {
            p.css('position', 'absolute');
            p.css('text-align', 'center');
            p.css('width', '100%');
            
            p.css('top', '50%');
            p.css('transform', 'translate(0, -50%)')      
            thumb.css('display', 'none');
    
            this.setNewspaperTitleFontSize(45);
            this.setNewspaperContentFontSize(55);
            this.setNewspaperTitleFontFamily('Impact, Charcoal, sans-serif');
        }
        else if(style == NewspaperStyle.COMMENT) {
            p.css('position', 'static');
            p.css('text-align', 'inherit');
            p.css('width', '');
            p.css('top', '');
            p.css('transform', '')   
            thumb.css('display', 'none');
    
            this.setNewspaperTitleFontSize(45);
            this.setNewspaperContentFontSize(20);
            this.setNewspaperTitleFontFamily('Impact, Charcoal, sans-serif');
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

    setNewspaperContentFontSize(size: number) {
        let p = $('#newspaper-content-text');
        p.css('font-size', `${size}px`);
    }

    setNewspaperTitleFontSize(size: number) {
        let p = $('#newspaper-title');
        p.css('font-size', `${size}px`);
    }

    setNewspaperTitleFontFamily(fm: string) {
        let p = $('#newspaper-title');
        p.css('font-family',fm);        
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
        this.setNewspaperStyle(NewspaperStyle.ONLY_TEXT_CENTER);
        this.setNewspaperContent(content);
        this.setNewspaperContentFontSize(fontSize);
        this.setNewspaperTitle(title);
    }
/////////////////////////////////////////////////////////////////////////

    getInnerFrameWith() {
        return 450;
    }

    innerBorderStyles = ['double', 'dashed', 'dotted', 'solid'];
    paperEnterCallback(state: FsmState, index:number) {
        this.currIndex = index;

        let item = this.getCurrentItem();
        this.fillNewspaperContentByNum(this.npNums[index]);        
        this.showTransparentOverlay(false);
        this.hideResult();
        
        this.canRecieveEmojiClick = true;

        FmodManager.getInstance().playOneShot('65537_NewspaperFlip');
        

        this.resetProgress();       
        
        let borderStyleIndex = index % this.innerBorderStyles.length;
        $('#newspaper-inner-frame').css('border-style', this.innerBorderStyles[borderStyleIndex]);

        // let randomWidth = 400 + Math.random() * 100;
        let randomWidth = this.getInnerFrameWith();
        $('#newspaper-inner-frame').css('width', `${randomWidth}px`);

        // reset the real paper params
        this.curCleanProgress = 0;        
        this.updateCleanProgressInner();

        // check if I need to show the prompt layer
        // Real page doesn't show propmt layer
        if(item.index >= CREDIT_BEGIN_NUM && item.index <= CREDIT_END_NUM) {
            this.showPromptLayer(false);
        }
        else if(this.isPropActivated(NewspaperPropType.Prompt) && !this.isRealPaper(item)) {
            this.showPromptLayer(true);
        }
        else {
            this.showPromptLayer(false);
        }      
        
        if(index == 0 && item.index != NAOMI_PAPER_NUM) {            
            this.showLevelProgess(true);            
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
        this.subtitle.forceStopAndHideSubtitles();
        this.refreshLevelProgressBarCss(index + 1);
    }

    paperEndAction(s: FsmState, index:number) {
        s.addAction((s, result, resolve, reject)=>{
            this.showTransparentOverlay(true).then(res=>{
                resolve('transprent show');
            });
            let item = this.getNewsItemByIndex(index);        

            if(item.reaction == 1) {    
                this.hideProgressBars();        
            }            
            this.hideResult();
            
        });
        s.addDelayAction(this, 300);
        s.addAction(s=>{
            $('#stamp-dest-container')[0].innerHTML = '';
        })
        s.addAction(s=>{
            if(this.npHp == 0 && !this.isExercise) {
                // global died event
                s.fsm.event(NewspaperFsm.DIED_EV_NAME, true);
            }
            else {
                s.finished();
            }
        })        
    }

    /**
     * 
     * @param s 
     * @param index nonsense here. always == 0
     */
    paperDiedAddActionCallBack(s: FsmState, index: number) {
        s.addAction(s=>{
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '😭');            
            this.hideResult();
        })
        s.addSubtitleAction(this.subtitle, ()=>`Sorry, ${this.getUserName()}.\nYou've ran out of lives and we must kick you out` , false);
        s.addAction(s=>{            
            this.setCenterTextPaper('65537', '🤗');     
            this.showCam(false);
        })
        s.addSubtitleAction(this.subtitle, ()=>`Maybe next time? You are always welcome.` , false, null, null, 1500);
        s.addAction(s=>{
            this.backBtn.click();
        })
    }

    waitPromise(dt: number) : Pany {
        return new Promise( (r, j)=>{
            setTimeout(() => {
                r('waitPromise');
                console.log('waitPromisewaitPromisewaitPromisewaitPromise');
            }, dt);
        })
    }

    autoDragLabels() : Pany{
        let ret = Promise.resolve();        
        let item = this.getCurrentItem();

        let neededLabels = NewsDataManager.getInstance().labelMapping.get(item.sourceType);

        let waitDt = 1000;
        for(let i = 0; i < neededLabels.length; i++) {
            let lblName = neededLabels[i];
            let id = convertNewspaperSourceTypeToID(lblName);
            let domObj = $('#' + id)[0];
            ret = ret.then(s=>{return this.waitPromise(waitDt)});
            ret = ret.then(s=>{
                $(this.destiID)[0].appendChild(domObj);
            })
        }
        ret = ret.then(s=>{return this.waitPromise(waitDt)});
        return ret;
    }

    setStrikeThroughOnEmojiIcons(show: boolean) {
        $('.emoji').css('text-decoration', show ? 'line-through' : 'none');              
    }

    showConfirmButons(show: boolean) {
        if(show) {
            $('#confirm-button-root').css('visibility',  'visible');
            $('#confirm-button-root').css('pointer-events', 'auto');
        }
        else {
            $('#confirm-button-root').css('visibility', 'hidden');
            $('#confirm-button-root').css('pointer-events', 'none');
        }       
    }

    initConfirmButtons() {
        $(`#confirm-button-yes`).on('click', ()=>{this.onConfirmAutoExpressionClick(true)});
        $(`#confirm-button-no`).on('click', ()=>{this.onConfirmAutoExpressionClick(false)});
    }

    inFinalAutoMode = false;

    onConfirmAutoExpressionClick(yes: boolean) {
        // implemented in subclass
    }

    refreshContentRelatedToProgress() {
        let curNum = this.getCurrentItem().index;
        if(curNum >= CREDIT_BEGIN_NUM && curNum < CREDIT_BEGIN_NUM + 3) {
            let st = Math.floor(this.topProgress.value * 5 + 0.2);
            let res = '';
            for(let i = 0; i < st; i++) {
                res += '❤️';
            }
            for(let i = 0; i < 5 - st; i++) {
                res += '🤍'
            }
            this.setNewspaperContent(res);
        }

        else if(curNum == COMMENT_NUM) {        
            let fullContent = this.getCurrentItem().content;
            fullContent += `<br/><br/>-` + this.getUserName();
            let progressLen = Math.floor(this.topProgress.value * fullContent.length + 0.2);
            this.setNewspaperContent(fullContent.substr(0, progressLen));        
        }
        
    }

    initStNewspaperWithIndex(idx: number) {
        let index = idx;
        let item = this.getNewsItemFromIndex(index);
        let state = this.newspaperFsm.getStateByIndex(index)
        
        // Intro
        // console.log(idx);
        this.helperAddSubtitleAction(state, item.intro, false);      
        state.addAction(s=>{
            this.canRecieveEmotion = true;
            if(item.reaction == 1) {    
                this.showEmojiProgressBars();        
            }
        })

        // Specific for NYT-likes
        if(this.isRealPaper(item) && !this.isFirstShownNYT(item)) {
            state.addOnEnter(s=>{                     
                this.setStrikeThroughOnEmojiIcons(true);
            })     
            state.addAction(s=>{
                if(!this.isPropActivated(NewspaperPropType.SeeNoEvil) && item.index != SEE_NO_EVIL_NUM){
                    this.showExpressionPrompt(true);  
                }                
                this.enableAttention(true);
                this.isAttentionChecking = true;
            })   

            state.addOnExit(s=>{
                this.isAttentionChecking = false;
                this.enableAttention(false);
                this.setStrikeThroughOnEmojiIcons(false);
                                
                this.showExpressionPrompt(false);  
            });
        }

        // Specific for rating 
        if(item.index >= CREDIT_BEGIN_NUM && item.index < CREDIT_BEGIN_NUM + 3) {
            state.setOnUpdate(s=>{
                this.refreshContentRelatedToProgress();
            })
        }

        // specific for comment
        if(item.index == COMMENT_NUM) {
            state.setOnUpdate(s=>{
                this.refreshContentRelatedToProgress();
            });
        }

        // Purged(waiting for label to be put in)
        let purged = this.newspaperFsm.getPurgedStateByIndex(index);
        this.helperAddSubtitleAction(purged, item.purgeIntro, false);     
        purged.addOnEnter(s=>{
            gResetLabelWall()      
            this.initDnDSource();
            this.setAllLabels();   
            if(!this.isPropActivated(NewspaperPropType.AutoLabel)) {
                $('#newspaper-clean-overlay').css('pointer-events', 'auto');
                FmodManager.getInstance().playOneShot('65537_StampInterfacePopUp');
            }            
            this.setTitle(this.getToolTipToRealPaperTitle(item, true));           
            $('#newspaper-toolbox-stamps').css('visibility', 'visible'); 
        })
        purged.addAction((s, re, resolve, reject) =>{
            this.autoDragLabels().then(s=>{
                resolve('dragFinished');
                this.checkIfLabelsCorrect();
            })
        }).setBoolCondition(()=>{return this.isPropActivated(NewspaperPropType.AutoLabel);});
        purged.addOnExit(s=>{
            $('#newspaper-toolbox-stamps').css('visibility', 'hidden'); 
            $('#newspaper-clean-overlay').css('pointer-events', 'none');
        })

        // LabelCorrect(labels all put)
        let labelCorrect = this.newspaperFsm.getLabelCorrectStateByInde(index);       
        labelCorrect.addAction((s, result, resolve, reject)=>{            
            this.showResult(true).then(s=>{
                resolve('')
            });
        })
        this.helperAddSubtitleAction(labelCorrect, item.labelCorrectIntro, false);    
        labelCorrect.addFinishAction();        
        
        // Correct
        let correct = this.newspaperFsm.getReactionStateByIndex(index, true);                
        correct.addAction((s, result, resolve, reject)=>{            
            this.showResult(true).then(s=>{
                resolve('')
            });
        })
        if(NewsDataManager.getInstance().isAlwaysWrongItem(item)) {            
            this.helperAddSubtitleAction(correct, `See? There is no trap in the prompting!`, true)
            this.helperAddSubtitleAction(correct, `People are always skepical of my willingness to help, which makes me so sad.`, true);
        }
        else {
            this.helperAddSubtitleAction(correct, item.correctResponse, true);
        }
        correct.addFinishAction();

        // Wrong
        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addAction((s, result, resolve, reject)=>{
            this.showResult(false).then(s=>{
                resolve('')
            });
        })
        
        if(NewsDataManager.getInstance().isAlwaysWrongItem(item)) {
            this.helperAddSubtitleAction(wrong, item.wrongResonpse, true, ()=>{
                return this.lastMaxedEmojion == MyEmotion.Negative;
            });    
            this.helperAddSubtitleAction(wrong, item.correctResponse, true, ()=>{
                return this.lastMaxedEmojion == MyEmotion.Positive;
            });    
        }       
        else {
            this.helperAddSubtitleAction(wrong, item.wrongResonpse, true);                
        } 
        

        if(!this.isRealPaper(item) && (this.isExercise || NewsDataManager.getInstance().isAlwaysWrongItem(item))) {            
            wrong.addAction(s=>{
                this.resetProgress();
                this.hideResult();                
            });
            wrong.addEventAction(Fsm.SECODN_CHANCE);
        }
        else {
            wrong.addFinishAction(); 
        }

        // Second Chance Intro
        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addAction((s) =>{
            if(item.reaction == 1) {
                this.hideProgressBars();
            }
        })
        this.helperAddSubtitleAction(second, item.secondChanceIntro, false);                  
        second.addAction(s=>{
            if(item.reaction == 1) {
                this.showEmojiProgressBars();            
                this.canRecieveEmotion = true;             
            }            
        })

        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addOnEnter(s=>{
            this.canRecieveEmotion = false;
        })
    }    

    /**
     * Parse the raw string into separate subtitle action addings
     * '\n' means a new line
     * </hr> means a new action
     * ${username} means username
     * @param s 
     * @param rawStr 
     */
    helperAddSubtitleAction(s: FsmState, rawStr: string, autoHide: boolean, func?:  (s?: FsmState) => boolean) {
        if(!rawStr || rawStr.length == 0) 
            return;
        
        
        let sep = '<hr/>';
        let newline = /\<br\/\>/gi;
        let usernamePlaceholder = /\{username\}/gi;

        let dialog = rawStr.split(sep);
        for(let i = 0; i < dialog.length; i++) {
            let sentenceRaw = dialog[i];
            // console.log(sentenceRaw);
            let fmodMath = sentenceRaw.match(/<fmod event='(.*?)'.*\/>/);
            if(fmodMath) {
                let eventName = fmodMath[1];
                s.addAction((s, r, resolve, reject) =>{
                    
                    let fm = FmodManager.getInstance();
                    fm.playOneShot(eventName, (type, event, parameters)=>{
                        if(type == fm.FMOD.STUDIO_EVENT_CALLBACK_STOPPED) {
                            resolve('Fmod clip play finished');
                            // console.log('STopppedSTopppedSTopppedSTopppedSToppped: ' )
                            // console.log(parameters)
                            // console.log(event)
                        }
                    })
                });
            }
            else {
                let sub = s.addSubtitleAction(this.subtitle, ()=>{
                    let ret = sentenceRaw.replace(newline, '\n');
                    ret = ret.replace(usernamePlaceholder, this.getUserName());
                    return ret;
                }, autoHide);
                if(func) {
                    sub.setBoolCondition(func);
                }
            }            
        }
    }

    
    enableAttention(show: boolean) {        
        $('#attention-frame').css('visibility', show ? 'visible' : 'hidden');
    }

    initDnD() {
        // stamps
        let stampEles = $('.newspaper-stamp');        
        GlobalEventManager.getInstance().dragStartEvent.on((e) =>{this.dragStart(e)});

        this.initDnDDestination();
        this.initDnDSource();
    }

    initDnDDestination() {

        // Destination
        let desti = $(this.destiID);
        desti.on('drop', (e)=>{this.drop(e.originalEvent)});
        desti.on('dragover', (e)=>{this.dragOver(e.originalEvent)});        
        desti.on('dragenter', (e)=>{this.dragEnter(e.originalEvent)});        
        desti.on('dragleave', (e)=>{this.dragLeave(e.originalEvent)});    
        desti.on('dragend', (e)=>{this.dragEnd(e.originalEvent)});    
    }
    initDnDSource() {
        // Source
        let source = $(this.sourceID);
        source.on('drop', (e)=>{this.drop(e.originalEvent)});
        source.on('dragover', (e)=>{this.dragOver(e.originalEvent)});   
        source.on('dragenter', (e)=>{this.dragEnter(e.originalEvent)});        
        source.on('dragleave', (e)=>{this.dragLeave(e.originalEvent)});   
        source.on('dragend', (e)=>{this.dragEnd(e.originalEvent)});    
    }

    lastDragID: string = '';
    dragStart(e:any) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text", e.target.id);
        this.lastDragID = e.target.id;

        this.destiCount = 0;
        this.sourceCount = 0;
    }

    initButtonHoverAudioEffect() {
        let btns = $('.newspaper-manual-button-frame');
        btns.mouseenter(()=>{
            FmodManager.getInstance().playOneShot('65537_ChooseEmoji');
        })

        btns = $('.confirm-button');
        btns.mouseenter(()=>{
            FmodManager.getInstance().playOneShot('65537_ChooseEmoji');
        })
    }

    isIn(parent:any, child: any) {
        return parent == child || parent.contains(child);
    }    

    sourceID = '#newspaper-toolbox-stamps';
    destiID = '#stamp-dest-container';  

    getTrueContainer(node) {
        let desti = $(this.destiID)[0];
        let source =  $(this.sourceID)[0];
        
        // desti
        if(this.isIn(desti, node)) {
            return desti;
        }
        // source
        else if(this.isIn(source, node)) {
            return source;
        }

        return null;
    }
    
    getIndexFromNum(num: number) {        
        for(let i = 0; i < this.npNums.length; i++) {
            if(num == this.npNums[i]) {
                return i;
            }
        }
        return 0;
    }

    checkIfLabelsCorrect() {
        let item = this.getCurrentItem();
        let correctLabels = NewsDataManager.getInstance().labelMapping.get(item.sourceType);
        let actualLabels = [];
        $('#stamp-dest-container .newspaper-stamp').each(function(){
            // 'this' here refers to the iterated ob
            actualLabels.push($(this).text());
        })
        let same = this.isSame(actualLabels, correctLabels);
        if(same) {
            setTimeout(() => {
                this.newspaperFsm.event(Fsm.LABEL_CORRECT);    
            }, 500);                        
        }
    }

    isSame(ar1: string[], ar2: string[]) :boolean {
        if(ar1.length != ar2.length)
            return false;

        for(let i in ar1) {            
            if(!ar2.find(e => e == ar1[i])) {
                return false;
            }
        }
        return true;
    }

    drop(e:any) {       
        e.dataTransfer.dropEffect = 'move';

        let ob = document.getElementById(this.lastDragID);

                
        let container = this.getTrueContainer(e.target);
        if(!this.isIn(container, ob)) {
            container.appendChild(ob);
            FmodManager.getInstance().playOneShot('65537_Stamping');
        }        

        this.checkIfLabelsCorrect();
        e.preventDefault();
        e.stopPropagation();
    }
    
    dragOver(e:any) {
        // if (e.target.getAttribute("draggable") == "true"){
        //     e.dataTransfer.dropEffect = "none"; // dropping is not allowed
        // }   
        // else {
        //    
        // }      
        
        e.dataTransfer.dropEffect = "move"; // drop it like it's hot
        e.preventDefault();
        e.stopPropagation();
    }

    destiCount = 0;
    sourceCount = 0;
    dragEnter(e:any) {
        let ob = document.getElementById(this.lastDragID);      
        
        let container = this.getTrueContainer(e.target);
        if(this.isIn(container, ob)) {
            return;
        }


        if(this.isIn($(this.destiID)[0], e.target)) {
            this.destiCount++;            
            $(this.destiID)[0].classList.add('over');
        }
        else if(this.isIn($(this.sourceID)[0], e.target)) {
            this.sourceCount++;            
            $(this.sourceID)[0].classList.add('over');
        }
        
    }

    dragLeave(e:any) {        
        let ob = document.getElementById(this.lastDragID);
                
        let container = this.getTrueContainer(e.target);
        if(this.isIn(container, ob)) {
            return;
        }


        if(this.isIn($(this.destiID)[0], e.target)) {
            this.destiCount--;
            
            if(this.destiCount == 0)
                $(this.destiID)[0].classList.remove('over');
        }
        else if(this.isIn($(this.sourceID)[0], e.target)) {
            this.sourceCount--;            
            if(this.sourceCount == 0)
                $(this.sourceID)[0].classList.remove('over');
        }
    }

    dragEnd(e:any) {
        $(this.destiID)[0].classList.remove('over');
        $(this.sourceID)[0].classList.remove('over');
    }
    
/////////////////////////////////////////////////////////////////////////
}




