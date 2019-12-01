/**
 * TronTron
 * The intention of Hud is to wrap the behavior of HP bar
 * However, I added more things into it like the score and right tool bar
 * 
 * If something needs to be facein/fadeout in the animation, we need 
 * include them in the array in the 'show' and 'hide' functions
 */



class Hud extends Wrapper<PhText> {


    hp: HP;
    scoreText: PhText;    
    score = 0;

    comboHitText: PhText;
    comboHit = 0;

    hpInitPosi: PhPoint;
    inShow: boolean = false;
    inTwenn: PhTween;
    outTween: PhTween;
   
    toolMenuContainerRight: PhContainer;
    toolMenuContainerRightIsShown: boolean = true;
    rightBtns: Button[] = [];

    toolMenuContainerLeft: PhContainer;
    toolMenuContainerLeftIsShown: boolean = true;
    leftBtns: Button[] = [];
       
    
    popupBubbleRight :Bubble;
    popupBubbleLeft:Bubble;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let hpBottom = 36;
        let hpLeft = 36;
        this.hp = new HP(scene, this.inner, hpLeft, phaserConfig.scale.height - hpBottom);
        this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        this.hp.inner.y += 250; // hide it at beginning

        // score
        let style = getDefaultTextStyle();
        style.fontSize = '44px';
        this.scoreText = this.scene.add.text(getLogicWidth() - 30, phaserConfig.scale.height - 20, "Score: 0", style).setOrigin(1, 1);
        this.scoreText.y += 250
        this.inner.add(this.scoreText);

        // combo
        style.fontSize = '60px';
        this.comboHitText = this.scene.add.text(getLogicWidth() - 30, 20, "0 HIT COMBO", style).setOrigin(1, 0);
        this.inner.add(this.comboHitText);
        this.comboHitText.setVisible(false);

        this.createMenuRight();
        this.createMenuLeft();
    }


    createMenuRight() {
        // tool menu right
        this.toolMenuContainerRight = this.scene.add.container(getLogicWidth() - 75, 400); 
        this.inner.add(this.toolMenuContainerRight);
        // this.hideContainerRight(false);

        let btnInfos = [
            {title: "B**", size: 40, desc: "You can just type in 'B' instead of 'BAD' for short"},
            {title: "HP", size: 40, desc: "Get HP regen by eliminating BAD words"},
            {title: "Auto", size: 34, desc: "Activate a cutting-edge Auto Typer which automatically eliminates B-A-D for you"},
            {title: "404++", size: 30, desc: "Turn NON-BAD words into BAD words"},
        ]        
        let startY = 0;
        let intervalY = 100;
        for(let i = 0; i < btnInfos.length; i++) {            
            let btn = new Button(this.scene, this.toolMenuContainerRight, 0, startY + intervalY * i,
                 'rounded_btn', btnInfos[i].title, 75,75, false);        
            btn.text.setFontSize(btnInfos[i].size);
            btn.text.y -= 10;
            btn.needHandOnHover = true;
            btn.needInOutAutoAnimation = false;

            let priceStyle = getDefaultTextStyle();
            priceStyle.fontSize = '22px';
            let priceLbl = this.scene.add.text(0, 30, '100',  priceStyle).setOrigin(0.5);
            btn.inner.add(priceLbl);
            btn.priceLbl = priceLbl;

            this.rightBtns.push(btn);
            
            btn.tag = btnInfos[i].desc;

            btn.fakeZone.on('pointerover', ()=>{            
                this.popupBubbleRight.setText(btn.tag);                         
                this.popupBubbleRight.setPosition(btn.inner.x + this.toolMenuContainerRight.x - 70, btn.inner.y + this.toolMenuContainerRight.y);
                this.popupBubbleRight.show();                
            });

            btn.fakeZone.on('pointerout', () =>{
                this.popupBubbleRight.hide();
            });
        }
        
        // bubble
        let bubbleX = this.rightBtns[0].inner.x + this.toolMenuContainerRight.x - 70;    
        let bubbleY = this.rightBtns[0].inner.y + this.toolMenuContainerRight.y;
        this.popupBubbleRight = new Bubble(this.scene, this.inner, 0, 0, true);        
        this.popupBubbleRight.inner.setPosition(bubbleX, bubbleY);        
        this.popupBubbleRight.hide();
    }


    createMenuLeft() {
    

        let btnWidth = 90;
        let startY = 0;
        let intervalY = 100;

        let frameBtnGap = 15;
        let frameTopPadding = 60;
        let frameBottonPadding = 15;


        // tool menu left
        this.toolMenuContainerLeft = this.scene.add.container(75, 360); 
        this.inner.add(this.toolMenuContainerLeft);
        // this.hideContainerLeft(false);

        let bkgWidth = btnWidth + frameBtnGap * 2;        
        let bkgHeight = frameTopPadding + frameBottonPadding + (badInfos.length) * btnWidth + (badInfos.length - 1) * (intervalY - btnWidth);
        
        let bkg = new Rect(this.scene, this.toolMenuContainerLeft, -bkgWidth / 2, -btnWidth / 2 - frameTopPadding, {
            fillColor: 0xFFFFFF,
            // lineColor: 0x222222,
            lineWidth: 6,
            width: bkgWidth, 
            height: bkgHeight,             
            originY: 0,
            originX: 0,            
            roundRadius: 30
        });

        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = '24px';
        titleStyle.fill = '#1A1A1A'
        let title = this.scene.add.text(0, -btnWidth / 2 - 15,'Typer', titleStyle).setOrigin(0.5, 1);
        this.toolMenuContainerLeft.add(title);
        
        for(let i = 0; i < badInfos.length; i++) {            
            let btn = new Button(this.scene, this.toolMenuContainerLeft, 0, startY + intervalY * i,
                'rounded_btn', badInfos[i].title, 75,75, false);        
            btn.text.setFontSize(badInfos[i].size);
            btn.text.y -= 10;
            btn.needHandOnHover = true;
            btn.needInOutAutoAnimation = false;

            let priceStyle = getDefaultTextStyle();
            priceStyle.fontSize = '22px';
            let priceLbl = this.scene.add.text(0, 30, i == 0 ? '✓' : badInfos[i].cost + '',  priceStyle).setOrigin(0.5);
            btn.inner.add(priceLbl);
            btn.priceLbl = priceLbl;

            this.leftBtns.push(btn);
            
            btn.tag = badInfos[i].desc;
            btn.priceTag = badInfos[i].cost;

            btn.fakeZone.on('pointerover', ()=>{            
                this.popupBubbleLeft.setText(btn.tag);                         
                this.popupBubbleLeft.setPosition(btn.inner.x + this.toolMenuContainerLeft.x + 70, btn.inner.y + this.toolMenuContainerLeft.y);
                this.popupBubbleLeft.show();                
            });

            btn.fakeZone.on('pointerout', () =>{
                this.popupBubbleLeft.hide();
            });          

            btn.clickedEvent.on(()=>{
                if(this.score >= btn.priceTag) {
                    badInfos[i].consumed = true;
                    this.score -= btn.priceTag;     
                    priceLbl.text = "✓" + badInfos[i].cost;
                }
            });                
        }

        // bubble
        let bubbleX = this.rightBtns[0].inner.x + this.toolMenuContainerLeft.x + 70;    
        let bubbleY = this.rightBtns[0].inner.y + this.toolMenuContainerLeft.y;
        this.popupBubbleLeft = new Bubble(this.scene, this.inner, 0, 0, false);        
        this.popupBubbleLeft.inner.setPosition(bubbleX, bubbleY);        
        this.popupBubbleLeft.hide();
    }

    getCurrentStrongestKeyword() : number{        
        let i = 0;
        for(i = 0; i < badInfos.length; i++) {
            if(!badInfos[i].consumed) {
                return i - 1;
            }            
        }
        return i - 1;
    }

    refreshMenuBtnState() {
        let currentStrongest = this.getCurrentStrongestKeyword();
        for(let i = 0; i < badInfos.length; i++) {
            let item = badInfos[i];
            let btn = this.leftBtns[i];

            if(i >= currentStrongest + 2) {
                btn.setEnable(false, false);
                continue;
            }
            
            btn.setEnable(true, true);
            if(item.consumed) {
                btn.inner.alpha = 1;
                btn.canClick = false;
            }
            else if(this.score < item.cost){
                btn.inner.alpha = 0.2;
                btn.canClick = false;
            }
            else {
                btn.inner.alpha = 1;
                btn.canClick = true;
            }
            
        }
    }

    lastTimeAddCombo;

    addCombo() {
        this.comboHitText.setVisible(true);
        this.comboHit++;
        this.comboHitText.setText(this.comboHit + " HIT COMBO");

        
        let scaleTo = 1.2;
        let sc = this.scene as Scene1;
        if(this.comboHit == 2) {
            sc.sfxMatches[0].play();
        }
        else if(this.comboHit == 3) {
            sc.sfxMatches[1].play();
            scaleTo = 2;
        }
        else if(this.comboHit >= 4) {
            sc.sfxMatches[2].play();
            scaleTo = 4;
        }


        this.scene.tweens.add({
            targets: this.comboHitText,
            scale: scaleTo,
            yoyo: true,
            duration: 200,
        });

        this.lastTimeAddCombo = sc.curTime;
    }

    update(time, dt) {
        let sc = this.scene as Scene1;
        if(this.comboHit > 0 && sc.curTime - this.lastTimeAddCombo > 7000) {
            
            if(sc.needFeedback) {
                this.resetCombo();
                // sc.sfxFail.play();
            }
            
        }
        // this.refreshMenuBtnState();
    }

    resetCombo() {
        this.comboHitText.setVisible(false);
        this.comboHit = 0;
        this.comboHitText.setText("");
    }

    addScore(inc) {
        this.score += inc;
        this.refreshScore();
    }

    refreshScore() {
        this.scoreText.text = "Score: " + this.score;
    }

    reset() {
        this.score = 0;        
        this.refreshScore();

        this.hp.reset();
    }

    show(mode: GameMode) {
        this.inShow = true;
        let tg = [];
        if(mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText]
        else
            tg = [this.scoreText]


        let dt = 1000;
        this.inTwenn = this.scene.tweens.add({
            targets: tg,
            y: "-= 250",
            duration: dt,
        })        

        // Don't call showContainerRight automatiaclly here
        // but still call hideContainerRight when hide()
        // showContainerRight();
    }

    showContainerRight() {
        if(this.toolMenuContainerRightIsShown)
            return;
        this.toolMenuContainerRightIsShown = true;

        this.scene.tweens.add({
            targets: this.toolMenuContainerRight,
            x: "-= 150",
            duration: 1000,
        });
    }

    showContainerLeft() {
        if(this.toolMenuContainerLeftIsShown)
            return;
        this.toolMenuContainerLeftIsShown = true;

        this.scene.tweens.add({
            targets: this.toolMenuContainerLeft,
            x: "+= 150",
            duration: 1000,
        });
    }

    hide(mode: GameMode) {
        this.inShow = false;

        let tg = [];
        if(mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText]
        else
            tg = [this.scoreText]

            
        let dt = 1000;
        this.outTween = this.scene.tweens.add({
            targets: tg,
            y: "+= 250",
            duration: dt,
        })

        this.hideSideMenuBar();
    }

    hideSideMenuBar() {
        this.hideContainerRight()
        this.hideContainerLeft();
    }

    showSideMenuBar() {
        this.showContainerLeft()
        this.showContainerRight();
    }

    hideContainerRight(needAnimation:boolean = true) {
        if(!this.toolMenuContainerRightIsShown)
            return;
        this.toolMenuContainerRightIsShown = false;

        if(needAnimation) {
            this.scene.tweens.add({
                targets: this.toolMenuContainerRight,
                x: "+= 150",
                duration: 1000,
            });
        }
        else {
            this.toolMenuContainerRight.x += 150;
        }
        
    }

    hideContainerLeft(needAnimation:boolean = true) {
        if(!this.toolMenuContainerLeftIsShown)
            return;
        this.toolMenuContainerLeftIsShown = false;

        if(needAnimation) {
            this.scene.tweens.add({
                targets: this.toolMenuContainerLeft,
                x: "-= 150",
                duration: 1000,
            });
        }
        else {
            this.toolMenuContainerLeft.x -= 150;
        }
        
    }
}