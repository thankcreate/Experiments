/// <reference path="scene-2.ts" />
class Scene2LPaper extends Scene2 {

    constructor() {
        super('Scene2LPaper');
    }

    get npNums(): number[]{
        return [2001];
    }

    create() {
        super.create();
        this.initGamePlayFsm();           
        this.initNewspaperFsm();        
        this.fullTime = 1;

        
        this.onlyShowPositive = true;        
    }


    paperBgm: Phaser.Sound.BaseSound;    
    
    loadAudio() {
        super.loadAudio();
        let audioLoadConfig = {
            paper_bgm: ["assets/audio/65536_BGM.mp3", 'paperBgm'],            
        };
        this.loadAudioWithConfig(audioLoadConfig);
    }

    beginCheckifBgmLoaded = false;
    update(time, dt) {
        super.update(time, dt);
        if(this.beginCheckifBgmLoaded) {
            if(this.paperBgm && !this.paperBgm.isPlaying) {
                this.beginCheckifBgmLoaded = false;
                this.playAsBgm(this.paperBgm);
            }
        }

        // console.log('this.isCamShow  ' + this.isCamShown);
    }



    dynaWith = 650;
    naomiPaperWidth = 650;
    finalWidth = 450;
    getInnerFrameWith() {
        return this.dynaWith;
    }


    initScrollListener() {
        $('#newspaper-inner-frame').on('scroll', function() {
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 20) {
                alert('end reached end reached end reached end reached');
            }
        })
    }
    
    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);
        this.initNaomiPaperCss();

        let title = $('#newspaper-title');    
        let content = $('#newspaper-content');
        title.removeClass('report-font');
        content.removeClass('report-font');
    }

    initNaomiPaperCss() {
        let innerFrame = $('#newspaper-inner-frame');
        innerFrame.css('overflow-y', 'scroll');
        innerFrame.css('width', '650px');
        innerFrame.css('height', '60vh');
        innerFrame.css('background-color', 'white');
        innerFrame.css('border-width', '0px');
        
        let title = $('#newspaper-title');
        title.css('margin', '5px');

        let content = $('newspaper-content');
        content.css('margin-top', '20px');
    }

    restoreToNormalPaperCss() {
        let innerFrame = $('#newspaper-inner-frame');
        innerFrame.css('width', '450px');
        innerFrame.css('height', 'auto');
        innerFrame.css('overflow-y', 'hidden');
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
        this.initStOnlyOne();
        this.appendLastStateEnding();
        this.updateObjects.push(this.newspaperFsm);
    }

    initStOnlyOne(){
        let index = 0;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);     
        state.addAction(s=>{
            this.canRecieveEmotion = false;
        }) 

        state.addAction(s=>{
            s.autoOn($('#newspaper-inner-frame'), 'scroll', ()=> {                
                let ele = $('#newspaper-inner-frame');
                if(ele.scrollTop() + ele.innerHeight() >= ele[0].scrollHeight - 20) {
                    if(!this.isCamShown) {
                        console.log('kkkkkkkkkkkk');
                        this.showCam(true);
                        this.canRecieveEmotion = true;
                    }                    
                }
            });
        })  
    }


    getGamePlayFsmData(): IFsmData {        
        return normal_2_paper;
    }

    initStGamePlayDefault() {
        let state = this.gamePlayFsm.getDefaultState();        
        state.addDelayAction(this, 200)
            .addEventAction("START");
    }

    initStGamePlayStart() {
        let state = this.gamePlayFsm.getState("Start");
        state.addOnEnter(s=>{      
            setTimeout(() => {
                this.beginCheckifBgmLoaded = true;    
            }, 1500);
            
            this.showPaper(true);    
            // this.setCenterTextPaper('65536 Sucks', '😀')
            this.newspaperFsm.start();                   
        })        
    }



    initStNewspaperDefault() {
        let state = this.newspaperFsm.getDefaultState();   
               
       
        state.addFinishAction();     
    }    



    // this is just to append the ending logic to the last newspaper
    appendLastStateEnding() {        
        let index = this.npNums.length - 1;
        let state = this.newspaperFsm.getStateByIndex(index);
        let end = this.newspaperFsm.getStateEndByIndex(index);
        end.addAction(s=>{
            this.restoreToNormalPaperCss();
            this.showLevelProgess(false);
            this.showCam(false);
            this.hideResult();
            this.showTransparentOverlay(false);

            let title = $('#newspaper-title');    
            let content = $('#newspaper-content');
            title.addClass('report-font');
            content.addClass('report-font');
            this.setCenterTextPaper('Subject Satisfaction', '100%');
        });
        end.addSubtitleAction(this.subtitle, ()=>`Subject:`, true)
        end.addSubtitleAction(this.subtitle, ()=>`${this.getUserName()}`, true)
        end.addSubtitleAction(this.subtitle, ()=>`Satisfaction:`, true)
        end.addSubtitleAction(this.subtitle, ()=>`100%`, true)
        end.addAction(s=>{
            this.setCenterTextPaper('65537', '👉');
        });
        end.addSubtitleAction(this.subtitle, ()=>`Transfer to the final test.`, true, null, null, 1500);
        end.addAction(s=>{
            this.getController().gotoNextScene();
        })
    }

    createDwitters(parentContainer: PhContainer) {
        // super.createDwitters(parentContainer);
        this.initCenterDwitterScale = 0.52;
        this.dwitterCenter = new DwitterHoriaontalRect(this, parentContainer, 0, 0, 1920, 1080, true).setScale(this.initCenterDwitterScale);
        this.dwitterBKG = new DwitterRadialBKG(this, parentContainer, 0, 0, 2400, 1400, true);       
        this.dwitterBKG.changeTo(1);
    }

    resetNewspaperParameter() {
        super.resetNewspaperParameter();        
    }
}