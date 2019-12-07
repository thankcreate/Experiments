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

    
    frameWidth = 5;

    outterRadius = 10;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, width: number) {
        super(scene, parentContainer, x, y, null);

        this.barWidth = width;

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
    }

    updateDisplay(curHp, maxHp) {
        this.progressBar.setSize(0);
        // this.progressBar.setSize(curHp / maxHp * this.barWidth);
    }

}