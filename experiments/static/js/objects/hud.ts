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
    rightBtns: PropButton[] = [];

    toolMenuContainerLeft: PhContainer;
    toolMenuContainerLeftIsShown: boolean = true;
    leftBtns: PropButton[] = [];
       
    
    popupBubbleRight :Bubble;
    popupBubbleLeft:Bubble;

    infoPanel: ClickerInfoPanel;


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
        this.scoreText = this.scene.add.text(getLogicWidth() - 30, phaserConfig.scale.height - 20, "$core: 0", style).setOrigin(1, 1);
        this.scoreText.y += 250
        this.inner.add(this.scoreText);

        // combo
        style.fontSize = '60px';
        this.comboHitText = this.scene.add.text(getLogicWidth() - 30, 20, "0 HIT COMBO", style).setOrigin(1, 0);
        this.inner.add(this.comboHitText);
        this.comboHitText.setVisible(false);

        this.createMenuRight();
        this.createMenuLeft();

        this.infoPanel = new ClickerInfoPanel(this.scene, this.inner, getLogicWidth() - s_infoPanelWidth - 30, 30);
    }


    createMenuRight() {
        // tool menu right
        this.toolMenuContainerRight = this.scene.add.container(getLogicWidth() - 75, 400); 
        this.inner.add(this.toolMenuContainerRight);
        // this.hideContainerRight(false);

             
        let startY = 0;
        let intervalY = 100;

        
        for(let i = 0; i < propInfos.length; i++) {            
            let btn = new PropButton(this.scene, this.toolMenuContainerRight, this, 0, startY + intervalY * i,
                 'rounded_btn', propInfos[i].title, 75,75, false);        
            btn.text.setFontSize(propInfos[i].size);
            btn.text.y -= 10;
            btn.needHandOnHover = true;
            btn.needInOutAutoAnimation = false;

            let priceStyle = getDefaultTextStyle();
            priceStyle.fontSize = '22px';
            let priceLbl = this.scene.add.text(0, 30, propInfos[i].price + '',  priceStyle).setOrigin(0.5);
            btn.inner.add(priceLbl);
            btn.priceLbl = priceLbl;
            btn.priceTag = propInfos[i].price;
            this.rightBtns.push(btn);
            
            btn.tag = propInfos[i].desc;
            btn.addPromptImg(Dir.Right);
            // btn.promptImg.setVisible(false);

            btn.fakeZone.on('pointerover', ()=>{            
                this.popupBubbleRight.setText(btn.tag + "\nCost: " + propInfos[i].price, (propInfos[i] as any).warning);                         
                this.popupBubbleRight.setPosition(btn.inner.x + this.toolMenuContainerRight.x - 70, btn.inner.y + this.toolMenuContainerRight.y);
                this.popupBubbleRight.show();                
            });

            btn.fakeZone.on('pointerout', () =>{
                this.popupBubbleRight.hide();
            });

            
        }
        
        // 'Bad' Btn click
        this.rightBtns[0].purchasedEvent.on(btn=>{    
            (this.scene as Scene1).centerObject.playerInputText.addAutoKeywords('Bad');            
        });

        // 'Auto'
        this.rightBtns[1].purchasedEvent.on(btn=>{    
            badInfos[0].consumed = true;
            this.showContainerLeft();
            this.leftBtns[0].setPurchased(true);
            getAutoTypeInfo().consumed = true;

        });

        // Turn 
        this.rightBtns[2].purchasedEvent.on(btn=>{    
            (this.scene as Scene1).centerObject.playerInputText.addAutoKeywords('Turn');
            getTurnInfo().consumed = true;
        });

        // Auto Turn 
        this.rightBtns[3].purchasedEvent.on(btn=>{      
            getAutoTurnInfo().consumed = true;
        });
        
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
        this.hideContainerLeft(false);

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
        titleStyle.fontSize = '20px';
        titleStyle.fill = '#1A1A1A'
        let title = this.scene.add.text(0, -btnWidth / 2 - 15,'Auto Bad', titleStyle).setOrigin(0.5, 1);
        this.toolMenuContainerLeft.add(title);
        
        for(let i = 0; i < badInfos.length; i++) {            
            let btn = new PropButton(this.scene, this.toolMenuContainerLeft, this, 0, startY + intervalY * i,
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
            btn.addPromptImg(Dir.Left);
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

            btn.purchasedEvent.on(btn=>{
                badInfos[i].consumed = true;
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
        // let currentStrongest = this.getCurrentStrongestKeyword();
        for(let i = 0; i < badInfos.length; i++) {
            let btn = this.leftBtns[i];     
            btn.refreshState();
        }

        for(let i = 0; i < this.rightBtns.length; i++) {
            let btn = this.rightBtns[i];           
            btn.refreshState();
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
        this.refreshMenuBtnState();
        this.infoPanel.update(time, dt);
    }

    resetCombo() {
        this.comboHitText.setVisible(false);
        this.comboHit = 0;
        this.comboHitText.setText("");
    }

    

    addScore(inc, enemy?: Enemy, showGainEffect: boolean = true) {
        this.score += inc;
        this.refreshScore();

        if(enemy) {
            if(showGainEffect) {
                this.showScoreGainEffect(inc, enemy);
            }
        }
    }

    showScoreGainEffect(inc: number, enemy: Enemy)  {        
        

        let posi = MakePoint2(enemy.inner.x, enemy.inner.y);
        if(enemy.config.enemyType == EnemyType.TextWithImage) {
            posi.y += (enemy as EnemyImage).getMainTransform().y;
        }
        else {
            posi.y -= 75;
        }
        

        let style = getDefaultTextStyle();
        style.fontSize = '40px';
        style.fill = inc > 0 ? style.fill : '#ff0000';
        let str = (inc >= 0 ? '+' : '-') + ' $: ' + Math.abs(inc);
        let lbl = this.scene.add.text(posi.x, posi.y, str, style);

        lbl.setOrigin(0.5, 0.5);

        
        // this.inner.add(lbl);
        let parentContainer = (this.scene as Scene1).midContainder;
        parentContainer.add(lbl);
        let dt = 2000;

        let tw = this.scene.tweens.add({
            targets: lbl,            
            y: '-= 30',
            alpha: {                
                getStart: () => 1,
                getEnd: () => 0,
                duration: dt,                
            },
            onComplete: ()=>{
                lbl.destroy();
            },
            duration: dt
        });        
    }

    refreshScore() {
        this.scoreText.text = "$core: " + this.score;
    }

    reset() {
        this.score = initScore;        
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
        this.toolMenuContainerRight.setVisible(true);
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
        this.toolMenuContainerLeft.setVisible(true);
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
            this.toolMenuContainerRight.setVisible(false);
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
            this.toolMenuContainerLeft.setVisible(false);
        }
        
    }
}