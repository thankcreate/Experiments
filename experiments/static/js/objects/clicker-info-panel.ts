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
            lineWidth: 3,
            width: s_infoPanelWidth, 
            height: 250,             
            originY: 0,
            originX: 0,            
            roundRadius: 16,
            fillAlpha: 0.4
        });

        let style = getDefaultTextStyle();
        style.fontSize = '25px';
        let h = 20;
        let l = 20;
        let gapVertical = 10;
        this.lblDpsFor404 = this.scene.add.text(l, h, "DPS (404): ", style);
        this.inner.add(this.lblDpsFor404);
        
        h += this.lblDpsFor404.displayHeight + gapVertical;
        this.lblAwardFor404 = this.scene.add.text(l, h, "Award (404): ", style);
        this.inner.add(this.lblAwardFor404);

        h += this.lblAwardFor404.displayHeight + gapVertical;
        this.lblAwardForNormal = this.scene.add.text(l, h, "Award (Normal): ", style);
        this.inner.add(this.lblAwardForNormal);

        this.updateValues();
        this.refreahDisplay();
    }

    updateValues() {
        let dps = 0;         
        for(let i = 0; i < badInfos.length; i++) {
            if(badInfos[i].consumed)
                dps += badInfos[i].damage;
        }
        this.valDpsFor404 = dps;
        
        

    }

    refreahDisplay() {
        this.lblDpsFor404.setText("DPS (404): " + this.valDpsFor404);
        this.lblAwardFor404.setText("Award (404): " + this.valAwardFor404);
        this.lblAwardForNormal.setText("Award (Normal): " + this.valAwardForNormal);
    }
}