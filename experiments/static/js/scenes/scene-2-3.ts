/// <reference path="scene-2.ts" />
class Scene2L3 extends Scene2 {    

    constructor() {
        super('Scene2L3');
    }

    // basicNums = [26, 27, 28, 29, 30, 31, 32, 33, 34];
    // basicNums = [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
    basicNums = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
    // basicNums = [33, 34];
    randomNums = [];
    get npNums(): number[]{
        if(!this.randomNums || this.randomNums.length == 0) {
            this.randomNums = [...this.basicNums];
            for(let i = LOOP_BEGIN_NUM; i <= LOOP_BEGIN_NUM + 4; i++) {
            // for(let i = LOOP_BEGIN_NUM; i <= LOOP_END_NUM; i++) {
                this.randomNums.push(i);
            }
        }        
        return this.randomNums;
    }

    endingBgm1: Phaser.Sound.BaseSound;
    endingBgm2: Phaser.Sound.BaseSound;
    
    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            bgm_1: ["assets/audio/ending-ver1-country.mp3", 'endingBgm1'],
            bgm_2: ["assets/audio/ending-ver2-tropical-house.mp3", 'endingBgm2']
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }


    create() {
        this.isExercise = true;
        super.create();
        this.initGamePlayFsm();           
        this.initNewspaperFsm();        
    }

    initBindingCss() {
        super.initBindingCss();
        this.showPropFrame(true);
    }

    initGamePlayFsm() {                 
        this.initStGamePlayDefault();        
        this.initStGamePlayStart();
        this.updateObjects.push(this.gamePlayFsm);        
    }

    initNewspaperFsm() {
        this.initStNewspaperDefault();
        for(let i = 0; i < this.npNums.length; i++) {
            this.initStNewspaperWithIndex(i);
        }
        this.initStNytFirstTime();
        // this.initStNytSecondTime();
        this.initStSeeNoEvilUpgrade();
        this.initStLessCleaningTimeUpgrade();
        this.initStAlwaysWrong();
        this.initStAutoLabel();
        this.initStAutoExpression();

        this.appendLastStateEnding();

        this.updateObjects.push(this.newspaperFsm);
    }

    getProgressBarDenominator() {
        return this.basicNums.length + 5;
    }



    getGamePlayFsmData(): IFsmData {        
        return normal_2_3;
    }

    
    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();        
        state.addAction((s, res, resolve, reject)=>{
            NewsDataManager.getInstance().loadRss( 
                // success
                (rssItems)=>{
                    resolve('suc');                    
                    // deep copy
                    this.rssItems = [...rssItems];
                }, 
                // fail
                ()=>{                    
                    reject('failed to load rss');
                }
            );
        })
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }

    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s=>{                  
            this.showPaper(true);                
            this.newspaperFsm.start();                   
        })        
    }


    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();

        state.addAction(s=>{
            this.setCenterTextPaper('65537', '😀')
        })
        state.addSubtitleAction(this.subtitle, ()=>`${this.getUserName()}, you've got the hang of it so quickly.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('65537', '😚')
        })
        state.addSubtitleAction(this.subtitle, ()=>`Just to let you know, please read the clues carefully.\n Don't make random judgements.`, false);
        
        state.addAction(s=>{
            this.showCam(true);
        })
        state.addFinishAction();
    }    


    initStNytFirstTime(){
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);      
        
    }

    initStNytSecondTime(){
        let index = 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);     
        state.addOnEnter(s=>{
            this.showExpressionPrompt(true);
        })
        
        state.addOnExit(s=>{
            this.showExpressionPrompt(false);
        })
    }

    initStSeeNoEvilUpgrade() {
        let index = this.getIndexFromNum(26);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s=>{
            this.showPropButtonWithType(true, NewspaperPropType.SeeNoEvil);
        })
    }

    
    initStLessCleaningTimeUpgrade() {
        let index = this.getIndexFromNum(28);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s=>{
            // This is just for test
            // Normally speaking, we should have it activated already
            if(!this.isPropActivated(NewspaperPropType.SeeNoEvil)) {
                this.showPropButtonWithType(true, NewspaperPropType.SeeNoEvil);
            }
            this.showPropButtonWithType(true, NewspaperPropType.LessCleaningTime);
        })
    }

    
    initStAlwaysWrong() {
        let index = this.getIndexFromNum(ALWAYS_WRONG_NUM);
        let item = this.getNewsItemByIndex(index);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addOnEnter(s=>{
            
        })

        let wrong = this.newspaperFsm.getReactionStateByIndex(index, false);
        wrong.addOnEnter(s=>{
            if(this.lastMaxedEmojion == MyEmotion.Negative){
                item.answer = 1;
            }
            else{
                item.answer = 0;
            }
        })

        let second = this.newspaperFsm.getSecondChangeStateByIndex(index);
        second.addAction((s) =>{
            this.showPropButtonWithType(true, NewspaperPropType.Prompt);
            this.updatePropStatus();
        })

        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addOnEnter(s=>{
            
        })
    }

    initStAutoLabel() {
        let index = this.getIndexFromNum(AUTO_LABEL_NUM);
        let state = this.newspaperFsm.getStateByIndex(index);
        let purged = this.newspaperFsm.getPurgedStateByIndex(index);

        purged.addOnEnter(s=>{
            $('#newspaper-toolbox-stamps').css('pointer-events', 'none');
        })
        purged.addAction(s=>{
            this.showPropButtonWithType(true, NewspaperPropType.AutoLabel);
            this.updatePropStatus();
        })
        purged.addAction((s, re, resolve, reject) =>{
            this.autoDragLabels().then(s=>{
                resolve('dragFinished');
                this.checkIfLabelsCorrect();
            })
        })
    }

    initStAutoExpression() {
        let index =  this.getIndexFromNum(AUTO_EXPRESSION_NUM);
        let state = this.newspaperFsm.getStateByIndex(index);
        state.addAction(s=>{
            this.canRecieveEmotion = false
            this.showConfirmButons(true);
        })        
    }

    
    
    onConfirmAutoExpressionClick(yes: boolean) {
        FmodManager.getInstance().playOneShot('65537_ConfirmEmoji');
        // if(!yes) {
            $(`#confirm-button-no span`).text("Yes, that's exactly what I need");
        // }

        this.inFinalAutoMode = true;
        let rt = this.add.tween({
            targets: [this.dwitterBKG.inner],
            rotation: '+=' + -Math.PI * 2,
            duration: 260000,
            loop: -1,
        })

        // $('html').css('filter', 'grayscale(100%)');

        $('#confirm-button-root').css('pointer-events', 'none');
        setTimeout(() => {
            
            if(yes) {
                this.playAsBgm(this.endingBgm2);
            }
            else {
                this.playAsBgm(this.endingBgm1);
            }    
        }, 500);
        
        
        let confirmText='Thank you for your cooperation!';
        this.subtitle.loadAndSay(this.subtitle, confirmText, true, 2500, 2500, 1000).finally(()=>{
            this.showPropButtonWithType(true, NewspaperPropType.AutoEmotion);
            this.canRecieveEmotion = true;
            this.showConfirmButons(false);  

            
    
        })      

    }
    
    update(time, dt) {
        super.update(time, dt);
        // console.log('ttt '  +  this.canRecieveEmotion);
    }

    // this is just to append the ending logic to the last newspaper
    appendLastStateEnding() {        
        let index = this.npNums.length - 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s=>{
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);
            this.setCenterTextPaper('65537', '🤩');
        });
        end.addSubtitleAction(this.subtitle, ()=>`This is the end of the demo,\n thank you for playtesting!`, false)        
    }
}