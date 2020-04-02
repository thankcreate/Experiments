/// <reference path="scene-2.ts" />
class Scene2L3 extends Scene2 {

    
    constructor() {
        super('Scene2L3');
    }

    get npNums(): number[]{
        return [22];
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
        state.addSubtitleAction(this.subtitle, ()=>`${this.getUserName()}, you have got the hang of it so quickly.`, false);
        state.addAction(s=>{
            this.setCenterTextPaper('65537', '😚')
        })
        state.addSubtitleAction(this.subtitle, ()=>`Just to let you know, please read the clues carefully.\n Don't make random judgements.`, false);
        
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
}