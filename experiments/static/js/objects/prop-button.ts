class PropButton extends Button {

    priceTag: number;
    priceLbl: PhText;
    purchased: boolean = false;

    hud: Hud;
    promptImg: ImageWrapper;

    purchasedEvent: TypedEvent<PropButton> = new TypedEvent();
    needConfirmEvent: TypedEvent<PropButton> = new TypedEvent();

    purchasedMark: PhImage;

    /**
     * Some props need to pop up and dialog to confirm whether to buy
     */
    needConfirm: boolean = false;


    allowMultipleConsume: boolean = false;
  
    info: PropInfo;
    group: ButtonGroup;
    hovered: boolean;


    /**
     * For shake usage
     * Only init once at the first time of the click shake
     */
    shakeScale;

    constructor (scene: BaseScene, parentContainer: PhContainer, group: ButtonGroup, hd: Hud,
        x: number, y: number,
        imgKey: string, info: PropInfo,
        width?: number, height?: number,  debug?: boolean, fakeOriginX? : number, fakeOriginY?: number) {        
        
        super(scene, parentContainer, x, y, imgKey, info.title, width, height, debug, fakeOriginX, fakeOriginY);
        this.group = group;
        this.info = info;
        this.hud = hd;

        this.text.setFontSize(info.size);
        this.text.y -= 10;
        this.needHandOnHover = true;
        this.needInOutAutoAnimation = false;

        let priceStyle = getDefaultTextStyle();
        priceStyle.fontSize = '22px';
        let priceLbl = this.scene.add.text(0, 30, info.price + "",  priceStyle).setOrigin(0.5);
        this.inner.add(priceLbl);
        this.priceLbl = priceLbl;

        this.desc = info.desc;
        this.priceTag = info.price;

        this.fakeZone.on('pointerover', ()=>{            
            (this.scene as Scene1).pause();    
            this.hovered = true;       
            
        });

        this.fakeZone.on('pointerout', () =>{
            (this.scene as Scene1).unPause();
            this.hovered = false;
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
            if((this.allowMultipleConsume || !btn.purchased) && this.hud.score >= btn.priceTag) {
                if(this.needConfirm) {
                    let dialog = (this.scene as Scene1).overlay.showTurnCautionDialog();
                    // (this.scene as Scene1).enemyManager.freezeAllEnemies();
                    (this.scene as Scene1).pause();

                    dialog.singleUseConfirmEvent.on(() => {
                        this.doPurchased();
                    });                

                    dialog.singleUseClosedEvent.on(() => {
                        // (this.scene as Scene1).enemyManager.unFreezeAllEnemies();
                        (this.scene as Scene1).unPause();
                    })
                }
                else {
                    this.doPurchased();
                }
                
            }
        });

        this.purchasedMark = this.scene.add.image(0, 0, 'purchased_mark');
        this.inner.add(this.purchasedMark);
        let markOffset = 40;
        this.purchasedMark.setPosition(markOffset, -markOffset);
        this.purchasedMark.setVisible(false);
    }

    

    doPurchased() {
        this.purchased = true;
        this.hud.addScore(-this.priceTag);     
        
        if(!this.allowMultipleConsume)                              
            this.purchasedMark.setVisible(true);
        
        this.purchasedEvent.emit(this);
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

            this.scene.tweens.add({
                targets: this.promptImg.inner,
                x:  isLeft ? +60 : -60,
                yoyo: true,
                duration: 250,
                loop: -1,
            });
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
        style.fill = '#ff0000';        
        this.hotkeyPrompt = this.scene.add.text(textX, -40, "Hotkey: 1", style).setOrigin(textOriginX, textOriginY);
        this.promptImg.inner.add(this.hotkeyPrompt);
    }

    hotkey: string;
    setHotKey(val: string) {
        if(this.hotkeyPrompt) {
            this.hotkey = val;
            this.hotkeyPrompt.text = 'Hotkey: "'+ val + '"';
        }
    }
            

    setPurchased(val: boolean) {
        this.purchased = val;
        this.purchasedMark.setVisible(val);
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
        return this.hud.score >= this.priceTag && this.priceTag != 0;
    }

    /**
     * Refresh if can click
     */
    refreshState() : boolean {
        if(this.purchased && !this.allowMultipleConsume) {
            this.inner.alpha = 1;
            this.canClick = false;

            if(this.promptImg) {
                this.promptImg.inner.setVisible(false);
            }
        }
        else if(this.canBePurchased()){
            if(this.promptImg) {
                if(this.hovered)
                    this.promptImg.inner.setVisible(false);
                else{
                    this.promptImg.inner.setVisible(true);
                }
            }
            this.inner.alpha = 1;
            this.canClick = true;          
        }
        else {   
            this.inner.alpha = 0.2;
            this.canClick = false;
            
            if(this.promptImg) {                    
                this.promptImg.inner.setVisible(false);
            }  
        }         

        return this.canClick;
    }
}