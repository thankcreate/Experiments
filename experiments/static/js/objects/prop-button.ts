class PropButton extends Button {

    priceTag: number;
    priceLbl: PhText;
    purchased: boolean = false;

    hud: Hud;
    promptImg: PhImage;

    purchasedEvent: TypedEvent<PropButton> = new TypedEvent();

    purchasedMark: PhImage;

    constructor (scene: BaseScene, parentContainer: PhContainer, hd: Hud,
        x: number, y: number,
        imgKey: string, title: string,
        width?: number, height?: number,  debug?: boolean, fakeOriginX? : number, fakeOriginY?: number) {        
        
        super(scene, parentContainer, x, y, imgKey, title, width, height, debug, fakeOriginX, fakeOriginY);
        this.hud = hd;
        
        this.clickedEvent.on(btn1=>{    
            let btn = btn1 as PropButton;          
            if(!btn.purchased && this.hud.score >= btn.priceTag) {
                btn.purchased = true;
                this.hud.addScore(-btn.priceTag);                   
                // btn.priceLbl.text = "✓" + btn.priceLbl.text;    
                this.purchasedMark.setVisible(true);
                this.purchasedEvent.emit(this);
            }
        });

        this.purchasedMark = this.scene.add.image(0, 0, 'purchased_mark');
        this.inner.add(this.purchasedMark);
        let markOffset = 40;
        this.purchasedMark.setPosition(markOffset, -markOffset);
        this.purchasedMark.setVisible(false);

        
     
    }

    /**
     * Dir means the button location. 
     * For example: button dir = top means arrow shoud be pointed from bottom to top
     * @param dir 
     */
    addPromptImg(dir: Dir) {
        this.promptImg = this.scene.add.image(0, 0, 'arrow');
        this.inner.add(this.promptImg);

        if(dir == Dir.Left || dir == Dir.Right) {
            let isLeft = dir == Dir.Left;
            this.promptImg.y -= 50;
            this.promptImg.x += isLeft ?  40 : -40;
            this.promptImg.setOrigin(isLeft ? 0 : 1);
            this.scene.tweens.add({
                targets: this.promptImg,
                x: isLeft ? 60 : -60,
                yoyo: true,
                duration: 250,
                loop: -1,
            });
        }
      
    }
            

    setPurchased(val: boolean) {
        this.purchased = val;
        this.purchasedMark.setVisible(val);
    }

    refreshState() {
        if(this.purchased) {
            this.inner.alpha = 1;
            this.canClick = false;

            if(this.promptImg) {
                this.promptImg.setVisible(false);
            }
        }
        else if(this.hud.score < this.priceTag){
            this.inner.alpha = 0.2;
            this.canClick = false;
            
            if(this.promptImg) {                    
                this.promptImg.setVisible(false);
            }                
        }
        else {                                
            if(this.promptImg) {
                this.promptImg.setVisible(true);
            }
            this.inner.alpha = 1;
            this.canClick = true;
        }         
    }
}