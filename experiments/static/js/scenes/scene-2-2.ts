/// <reference path="scene-2.ts" />
class Scene2L2 extends Scene2 {

    constructor() {
        super('Scene2L2');
    }

    get npNums(): number[]{
        return [11, 14, 12, 15, 13, 16, 17];
        // return [11];
        //return [17];
    }

    create() {
        super.create();
        this.initGamePlayFsm();           
        this.initNewspaperFsm();        
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
        
        this.appendLastStateEnding();
        this.updateObjects.push(this.newspaperFsm);
    }


    getGamePlayFsmData(): IFsmData {        
        return normal_2_2;
    }

    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();        
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }

    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s=>{      
            this.showPaper(true);    
            // this.setCenterTextPaper('65536 Sucks', '😀')
            this.newspaperFsm.start();                   
        })        
    }

    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();

        state.addAction(s=>{
            this.setCenterTextPaper('65537', '😀')
        })
        state.addSubtitleAction(this.subtitle, ()=>`${this.getUserName()}, I hope you had some fun in our tutorial level.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('65537', '🥺')
            this.showHp(true);
        })
        state.addSubtitleAction(this.subtitle, ()=>`From now on, it's no longer exercise.\nFailed twice, you'll be kicked out of the experiment without mercy.`, false, null, null, 2000);
        state.addAction(s=>{
            this.setCenterTextPaper('65537', '🤗')
        })
        state.addSubtitleAction(this.subtitle, `Take care.`, false);
        state.addAction(s=>{
            this.showCam(true);
        })
        state.addFinishAction();
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
        end.addSubtitleAction(this.subtitle, ()=>`Congratulations! You've passed the first batch of trial.`, true)
        end.addAction(s=>{
            this.setCenterTextPaper('65537', '👉');
        });
        end.addSubtitleAction(this.subtitle, ()=>`It's time to try something more advanced.`, true, null, null, 1500);
        end.addAction(s=>{
            this.getController().gotoNextScene();
        })
    }


    hasLastNeg: boolean = false;    
    emotionAnalyzeFinished(res: MyAnalysis) {
        if(this.currIndex == this.npNums.length - 1) {
            if(res.emotion == MyEmotion.Positive
                && res.intensity > 0.9) {
                this.updateIndicatorMeterBtnByPercentage(0, false);

                this.canRecieveEmotion = false;
                this.needFreezeIndicatorMeterBtn = true;

                this.topProgress.value += 0.25;
                this.refreshEmojiProgressBarCss();

                let p = Promise.resolve();
                if(this.topProgress.value < 0.3) {
                    p = p.then(s=>{
                        return this.subtitle.loadAndSay(this.subtitle, "I'm sorry? What's so funny?!", true)
                    }).then(s=>{
                        return this.subtitle.loadAndSay(this.subtitle, "Be a decent citizen! This is not fun at all!", true) 
                    })
                }
                else if(this.topProgress.value < 0.55) {
                    p = p.then(s=>{
                        return this.subtitle.loadAndSay(this.subtitle, "You still think this is fun?!\nWe are conducting an experiment!", true)
                    })
                }
                else if(this.topProgress.value < 0.80) {
                    p = p.then(s=>{
                        return this.subtitle.loadAndSay(this.subtitle, "Don't be rude. I cannot save you this time if you keep playing with the system.\n", true)
                    })
                }
                else {
                    p = p.then(s=>{
                        return this.subtitle.loadAndSay(this.subtitle, "Well, if this is what you ask for,\n then I have no problem with it", true)
                    })
                }
                
                p.catch(s=>{ console.log('subtitle show end with some err')})
                .finally(()=>{
                    this.canRecieveEmotion = true;
                    this.needFreezeIndicatorMeterBtn = false;
                })
            }

            if(!this.hasLastNeg && this.bottomProgress.value >= 0.5) {
                this.hasLastNeg = true;
                

                this.canRecieveEmotion = false;
                this.needFreezeIndicatorMeterBtn = true;

                this.refreshEmojiProgressBarCss();

                
                this.subtitle.loadAndSay(this.subtitle, "Are you trying to bury your laugh in your distorted face?", true)                                
                .then(s=>{
                    return this.subtitle.loadAndSay(this.subtitle, "You can't trick me. I know you are laughing secretly", true) 
                })
                .catch(s=>{ console.log('subtitle show end with some err')})
                .finally(()=>{
                    this.canRecieveEmotion = true;
                    this.needFreezeIndicatorMeterBtn = false;
                })
            }
        }
        
    }

    resetNewspaperParameter() {
        super.resetNewspaperParameter();
        this.hasLastNeg = false;
    }
}