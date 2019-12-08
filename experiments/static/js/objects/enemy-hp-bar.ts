class EnemyHpBar extends Wrapper<PhText> {
    
    bkgBar: Rect;
    frameBar: Rect;
    progressBar: Rect;
    
      
    frameColor = 0x000000;
    bkgColor = 0xffffff;
    progressColor = 0x999999;
    progressGap = 4;

    barHeight = 25;
    barWidth;

    
    frameWidth = 4;

    outterRadius = 12;

    centerText: PhText;
    
    maxHp: number;
    
    progressOffsetX = 0;
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, width: number, maxHp: number) {
        super(scene, parentContainer, x, y, null);

        this.barWidth = width;
        this.maxHp = maxHp;

        this.bkgBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: this.bkgColor,
            fillColor: this.bkgColor,
            width: this.barWidth, 
            height: this.barHeight, 
            lineWidth: 1,
            originX: 0,
            originY: 0,   
            roundRadius: this.outterRadius,         
        });

        this.progressBar = new Rect(this.scene, this.inner, 0, this.barHeight / 2, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.barWidth - this.frameWidth, 
            height: this.barHeight, 
            lineWidth: 1,
            originX: 0,
            originY: 0,   
            roundRadius: this.outterRadius,         
        });
        this.progressBar.setOrigin(0, 0.5);
        this.progressOffsetX = 2;
        this.progressBar.inner.x = this.progressOffsetX; 


        this.frameBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: this.frameColor,
            fillColor: this.frameColor,
            fillAlpha: 0,
            width: this.barWidth, 
            height: this.barHeight, 
            lineWidth: this.frameWidth,
            originX: 0,
            originY: 0,   
            roundRadius: this.outterRadius,         
        });

        let style = getDefaultTextStyle();
        style.fontSize = '20px'
        style.fill = '#111111'
        this.centerText = this.scene.add.text(width / 2, this.barHeight / 2, "hp", style);
        this.centerText.setOrigin(0.5, 0.5);
        this.inner.add(this.centerText);
        this.refreshCenterText(this.maxHp, this.maxHp);

    }

    refreshCenterText(curHp, maxHp) {
        
        let curHpShown = Math.ceil(curHp);
        let maxHpShown = Math.ceil(maxHp);
        this.centerText.text = curHpShown + " / " + maxHpShown;
    }

    /**
     * Called by EnemyBase
     * @param curHp 
     * @param maxHp 
     */

    updateDisplay(curHp, maxHp) {
        curHp = clamp(curHp, 0, maxHp);        
        //this.progressBar.setSize(0);
        // maxHp = 100
        // curHp = 0;

        let useSetSize = false;
        if(useSetSize) {
            let ratio = curHp / maxHp;        
            let newWidth = ratio * this.barWidth;
    
            let threshouldWidth = this.outterRadius * 2;
            if(newWidth < threshouldWidth) {
                this.progressBar.setScale(newWidth / threshouldWidth, Math.pow(newWidth / threshouldWidth, 0.5));
                newWidth = threshouldWidth;
            }        
    
            this.progressBar.setSize(newWidth);
        }
        else {
            let ratioX = curHp / maxHp;        
            let ratioY = 1;
    
            let newWidth = ratioX * this.progressBar.config.width;
    
            let threshouldWidth = this.outterRadius * 1.8;
            if(newWidth < threshouldWidth) {            
                ratioY = Math.pow(newWidth / threshouldWidth, 1);
                // this.progressBar.inner.x = (1 - newWidth / threshouldWidth) * 1 + this.progressOffsetX;
            }   
            this.progressBar.setScale(ratioX,ratioY);     
        }
        
        this.refreshCenterText(curHp, maxHp);
    }

}