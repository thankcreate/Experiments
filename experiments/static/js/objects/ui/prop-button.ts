class PropButton extends Button {

    priceTag: number;
    priceLbl: PhText;
    purchased: boolean = false;
    hasShownFirstTimeBubble: boolean = false;

    hud: Hud65536;
    promptImg: ImageWrapper;

    purchasedEvent: TypedEvent<PropButton> = new TypedEvent();
    needConfirmEvent: TypedEvent<PropButton> = new TypedEvent();

    purchasedMark: ImageWrapper;

    /**
     * Some props need to pop up and dialog to confirm whether to buy
     */
    needConfirm: boolean = false;


    allowMultipleConsume: boolean = false;
  
    info: ClickerPropInfo;
    group: ButtonGroup;
    hovered: boolean;


    lvlLbl: PhText;

    /**
     * For shake usage
     * Only init once at the first time of the click shake
     */
    shakeScale;

    allowLevelUp: boolean = false;
    curLevel = 0;



    bubble: Bubble;
    
    bubbleContent: StrGen;

    // return the propInfo
    getPropIndex() {
        let ret = -1;
        for(let i = 0; i < clickerPropInfos.length; i++) {
            if(clickerPropInfos[i] === this.info) {
                return i;
            }
        }   
     

        return ret;
    }


    bubbleCount = 0;
    showAttachedBubble(title?: string) {
        (this.scene as BaseScene).pause(title);    

        this.bubbleCount++;
        if(this.bubbleCount == 1) {
            this.showAttachedBubbleInner(title);
        }
    }

    private showAttachedBubbleInner(title?: string) {
        this.hovered = true;       
        if(this.bubble) {
            this.updateBubbleInfo();            
            this.bubble.show();
        }            
    }


    hideAttachedBubble() {
        (this.scene as BaseScene).unPause();
        this.bubbleCount--;
        if(this.bubbleCount == 0) {
            this.hideAttachedBubbleInner();
        }
    }

    hideAttachedBubbleInner() {     
        this.hovered = false;
        if(this.bubble) {                
            this.bubble.hide();
        }
    }

    

    hasNoActualClick: boolean = false;

    constructor (scene: BaseScene, parentContainer: PhContainer, group: ButtonGroup, hd: Hud65536,
        x: number, y: number,
        imgKey: string, info: ClickerPropInfo, canLevelUp:boolean,
        width?: number, height?: number,  debug?: boolean, fakeOriginX? : number, fakeOriginY?: number) {        
        
        super(scene, parentContainer, x, y, imgKey, info.title, width, height, debug, fakeOriginX, fakeOriginY);
        this.allowLevelUp = canLevelUp;
        this.group = group;
        this.info = info;
        this.hud = hd;

        this.text.setFontSize(info.size);
        this.text.y -= 10;
        this.needHandOnHover = true;
        this.needInOutAutoAnimation = false;

        let priceStyle = getDefaultTextStyle();
        priceStyle.fontSize = '22px';
        let priceLbl = this.scene.add.text(0, 30, '$' + myNum(info.price) + "",  priceStyle).setOrigin(0.5);
        this.inner.add(priceLbl);
        this.priceLbl = priceLbl;

        this.desc = info.desc;
        this.priceTag = info.price;

        this.fakeZone.on('pointerover', ()=>{            
            this.showAttachedBubble();
        });

        this.fakeZone.on('pointerout', () =>{
            this.hideAttachedBubble();            
        });

        
        this.purchasedEvent.on(btn=>{
            if(notSet(this.shakeScale)){
                this.shakeScale = this.inner.scale;
            }            
            let timeline = this.scene.tweens.createTimeline(null);
            timeline.add({
                targets: btn.inner,
                scale: this.shakeScale * 0.8,
                duration: 40,
            });
            timeline.add({
                targets: btn.inner,
                scale: this.shakeScale * 1,
                duration: 90,
            });
            timeline.play();
        });    

        

        this.clickedEvent.on(btn1=>{    
            
            let btn = btn1 as PropButton;          
            //if((this.allowMultipleConsume || !btn.purchased) && this.hud.score >= btn.priceTag) {
            {
                if(this.hasNoActualClick){
                    return;
                }

                if(this.needConfirm) {
                    let dialog = (this.scene as BaseScene).overlay.showTurnCautionDialog();
                    // (this.scene as Scene1).enemyManager.freezeAllEnemies();
                    (this.scene as BaseScene).pause();

                    dialog.singleUseConfirmEvent.on(() => {
                        this.doPurchased();
                    });                

                    dialog.singleUseClosedEvent.on(() => {
                        // (this.scene as Scene1).enemyManager.unFreezeAllEnemies();
                        (this.scene as BaseScene).unPause();
                    })
                }
                else {
                    this.doPurchased();
                }
                
            }
        });

        let markImg = this.scene.add.image(0, 0, canLevelUp ? 'level_mark' : 'purchased_mark');        
        this.purchasedMark = new ImageWrapperClass(this.scene, this.inner, 0, 0,  markImg);        
        let markOffset = 40;
        let poX = 0;
        let poY = 0;
        if(canLevelUp) {
            poX = - 40 + 15;
            poY = -44;
        }
        else {
            poX = 40;
            poY = -40;
        }

        this.purchasedMark.inner.setPosition(poX, poY);        

        if(canLevelUp) {
            this.purchasedMark.inner.setScale(0.9);

            let st = getDefaultTextStyle();
            st.fontSize = '22px';
            st.fill = '#ffffff';
            this.lvlLbl = this.scene.add.text(0, 0, 'Lv.1', st).setOrigin(0.5, 0.5);
            this.purchasedMark.inner.add(this.lvlLbl);
        }        
        this.purchasedMark.inner.setVisible(false);

        if(canLevelUp)
            this.updateInfo();
    }

    

    doPurchased() {
        this.purchased = true;
        this.hud.addScore(-this.priceTag);     
        
        if(this.allowMultipleConsume)  {
            
        }
        else if(this.allowLevelUp) {
            this.purchasedMark.inner.setVisible(true);
            this.levelUp();
        }
        else {
            this.purchasedMark.inner.setVisible(true);
        }           
        
        this.purchasedEvent.emit(this);
    }

    levelUp() {
        this.curLevel++;
        this.updateInfo();
        this.updateBubbleInfo();

    }

    updateInfo() {
        this.info.damage = this.getCurDamage();

        this.info.price = this.getPrice();

        this.priceTag = this.info.price;

        this.refreshLevelLabel();
        this.refreshPriceLabel();
    }

    /**
     * Damage for curLevel
     */
    getCurDamage() {
        let ret = getDamageBasedOnLevel(this.curLevel, this.info);
        return ret;
    }

    getNextDamage() {
        let ret = getDamageBasedOnLevel(this.curLevel + 1, this.info);
        return ret;
    }



    // Price for (curLevel) -> (curLevel + 1)
    getPrice():number {
        let ret = getPriceToLevel(this.curLevel + 1, this.info);        
        return ret;
    }

    refreshPriceLabel() {
        if(!this.priceLbl) 
            return;

        this.priceLbl.text = '$' + myNum(this.info.price) + "";
    }

    refreshLevelLabel() {
        if(!this.lvlLbl)
            return;

        this.lvlLbl.text = 'Lv.' + this.curLevel;
    }

    hotkeyPrompt: PhText;

    /**
     * Dir means the button location. 
     * For example: button dir = top means arrow shoud be pointed from bottom to top
     * @param dir 
     */
    addPromptImg(dir: Dir) {

        
        if(dir == Dir.Left || dir == Dir.Right) {
            let isLeft = dir == Dir.Left;            
            let img = this.scene.add.image(0, 0, isLeft ? 'arrow_rev' : 'arrow');
            this.promptImg = new ImageWrapperClass(this.scene, this.inner, 0, 0, img);            
            
            this.promptImg.inner.x += isLeft ?  40 : -40;
            img.setOrigin(isLeft ? 0 : 1, 0.5);
            // this.promptImg.setScale(isLeft ? -1 : 1);

            //if(this.needConsiderHP) {
                // this.scene.tweens.add({
                //     targets: this.promptImg.inner,
                //     x:  isLeft ? +60 : -60,
                //     yoyo: true,
                //     duration: 250,
                //     loop: -1,
                // });
            //}
            
        }


        let textOriginX = 0;
        let textOriginY = 0;
        let textX = 0;        
        if(dir == Dir.Left) {
            textOriginX = 0;
            textOriginY = 0;
            textX = 52;
        }
        else if(dir == Dir.Right) {
            textOriginX = 1;
            textOriginY = 0;
            textX = -52;
        }

        let style = getDefaultTextStyle();
        let size = 24;
        style.fontSize = size + 'px';
        // style.fill = '#ff0000';          

        /**
         * Changed from red to black, because we added a much more obivious prompt
         * when a prop is available
         */
        style.fill = '#000000';
                
        this.hotkeyPrompt = this.scene.add.text(textX, -40, "", style).setOrigin(textOriginX, textOriginY);
        this.promptImg.inner.add(this.hotkeyPrompt);
        // this.hotkeyPrompt.setVisible(false);
    }


    // needHotKey = false;
    hotkey: string;
    setHotKey(val: string) {
        if(this.hotkeyPrompt) {
            this.hotkey = val;

            // if(this.allowLevelUp) {
            //     this.hotkeyPrompt.y = -66;
            //     this.hotkeyPrompt.text = 'Upgrade\nHotkey: "'+ val + '"';
            // }
            // else {
            this.hotkeyPrompt.text = 'Hotkey: "'+ val + '"';
            // }
            
        }
    }
            

    setPurchased(val: boolean) {
        this.purchased = val;
        this.purchasedMark.inner.setVisible(val);
    }

    /**
     * Some prop button is purchased by some prerequisite condition.
     * Even though the current score has been greater than its price,
     * we still don't show the prompt img.
     * For example, Keyword 'Bad' is acquired by the purchasing of the 'AutoTyper',
     * and the price of 'Bad' is 0.
     * We don't want to show a prompt img beside the 'Bad'
     */
    canBePurchased() : boolean {
        if(this.group && !this.group.isShown) {
            return false;
        }

        let propIdx = this.getPropIndex();
        if(propIdx >= 0) {
            /**
             * >=0 means this is a btn in the right prop group
             * For the props, it can only be purchased when the previous one is purchased
             */
            if(propIdx >= 1) {
                if(!clickerPropInfos[propIdx - 1].consumed) {
                    return false;
                }
            }
        }

        return this.hud.score >= this.priceTag && this.priceTag != 0;
    }

    needForceBubble = false;
    firstTimeBubbleCallback: (idx: number) => any;

    needConsiderHP: boolean = false;
    /**
     * Refresh if can click
     */
    refreshState() : boolean {
        let idx = this.getPropIndex();
        if(idx == 1) {
            let i = 1;
            i++;
        }
        if(this.text.text == 'Evil') {
            let i = 1;
            i++;
        }
        // already purchased && can only be purchased once
        if(this.purchased && !(this.allowMultipleConsume || this.allowLevelUp)) {
            this.myTransparent(false);
            this.canClick = false;

            if(this.promptImg) {
                this.promptImg.inner.setVisible(false);
            }
        }
        // can buy
        else if(this.canBePurchased()){
            if(!this.hasShownFirstTimeBubble) {
                this.hasShownFirstTimeBubble = true;
                if(this.needForceBubble == true) {
                    // console.log('bubble show');
                    this.showAttachedBubble(this.info.pauseTitle);
                    if(this.firstTimeBubbleCallback)
                        this.firstTimeBubbleCallback(this.getPropIndex());
                }
                    
            }

            if(this.promptImg) {
                if(this.hovered)
                    this.promptImg.inner.setVisible(false);
                else{
                    if(this.needConsiderHP) {
                        if((this.scene as Scene1).hp.currHealth <= (this.scene as Scene1).hp.maxHealth / 2) {
                            this.promptImg.inner.setVisible(true);    
                        }
                        else {
                            this.promptImg.inner.setVisible(false);    
                        }
                    }
                    else {
                        this.promptImg.inner.setVisible(true);
                    }                    
                }
            }
            this.myTransparent(false);        
            this.canClick = true;          
        }
        // can not buy
        else {   
            if(this.allowLevelUp && this.curLevel > 0)
                this.myTransparent(false);
            else
                this.myTransparent(true);

            this.canClick = false;
            
            if(this.promptImg) {                    
                this.promptImg.inner.setVisible(false);
            }  
        }                 
        return this.canClick;
    }

    myTransparent(tran: boolean) {
        this.image.alpha = tran ? 0.2 : 1;
        this.priceLbl.alpha = tran ? 0.2 : 1;
        // this.text.alpha = tran ? 0.2: 1;
    }

    updateBubbleInfo() {
        if(this.hovered && this.bubble && this.bubbleContent)        
            this.bubble.setText(this.bubbleContent(), (this.info as any).warning);            
    }
}