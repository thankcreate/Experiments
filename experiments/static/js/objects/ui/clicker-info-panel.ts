var s_infoPanelWidth = 450;

class ClickerInfoPanel extends Wrapper<PhText> {

    bkg: Rect;

    lblDpsFor404: PhText;
    lblAwardFor404: PhText;
    lblAwardForNormal: PhText;    

    valDpsFor404: number;
    valAwardFor404: number;
    valAwardForNormal: number;
    
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        this.bkg = new Rect(this.scene, this.inner, 0, 0, {
            fillColor: 0xFFFFFF,
            // lineColor: 0x222222,
            lineWidth: 4,
            width: s_infoPanelWidth, 
            height: 250,             
            originY: 0,
            originX: 0,            
            roundRadius: 22,
            fillAlpha: 0.3
        });

        let style = getDefaultTextStyle();
        style.fontSize = '30px';
        let h = 20;
        let l = 20;
        let gapVertical = 10;
        this.lblDpsFor404 = this.scene.add.text(l, h, "DPS (404): ", style);
        this.inner.add(this.lblDpsFor404);
        
        h += this.lblDpsFor404.displayHeight + gapVertical;
        this.lblAwardFor404 = this.scene.add.text(l, h, "Award (404): ", style);
        this.inner.add(this.lblAwardFor404);

        h += this.lblAwardFor404.displayHeight + gapVertical;
        this.lblAwardForNormal = this.scene.add.text(l, h, "Award (Non-404): ", style);
        this.inner.add(this.lblAwardForNormal);

      
    }

    update(time, dt) {
        this.updateValues();
        this.refreahDisplay();
    }

    updateValues() {
        this.valDpsFor404 = undefined;
        this.valAwardFor404 = undefined;
        this.valAwardForNormal = undefined;
       



        let sc = (this.scene as BaseScene);
        let em = sc.enemyManager;
        if(em.curStrategyID == SpawnStrategyType.ClickerGame) {
            if(em.curStrategy) {
                let strategy = (em.curStrategy as SpawnStrategyClickerGame);
                this.valDpsFor404 = strategy.getDps404();
                this.valAwardFor404 = strategy.getAwardFor404();
                this.valAwardForNormal = strategy.getAwardForNormal();
            }            
        }        
    }

    refreahDisplay() {
        this.lblDpsFor404.setText("DPS (404): "  + myNum(this.valDpsFor404));
        this.lblAwardFor404.setText("Award (404): " + (this.valAwardFor404 > 0 ? '+' : '')+ myNum(this.valAwardFor404));
        this.lblAwardForNormal.setText("Award (Non-404): " + myNum(this.valAwardForNormal));
    }
}