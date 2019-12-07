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

        this.progressBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.barWidth, 
            height: this.barHeight, 
            lineWidth: 1,
            originX: 0,
            originY: 0,   
            roundRadius: this.outterRadius,         
        });


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
        this.progressBar.setSize(curHp / maxHp * this.barWidth);
        this.refreshCenterText(curHp, maxHp);
    }

}