class HP extends Wrapper<PhText> {

    mainBar: Rect;

    innerProgress: Rect;    
    progressColor = 0x888888;
    progressGap = 4;

    titleGap = 1;

    barHeight = 40;
    barWidth = 400;

    frameWidth = 6;


    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        

        this.mainBar = new Rect(this.scene, this.inner, 0, 0, {
            lineColor: 0x222222,
            width: this.barWidth, 
            height: this.barHeight, 
            lineWidth: this.frameWidth,
            originX: 0,
            originY: 1,            
        });

        this.innerProgress = new Rect(this.scene, this.inner, this.frameWidth / 2 + this.progressGap, - this.frameWidth / 2 - this.progressGap, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.barWidth - this.frameWidth - this.progressGap * 2,
            height: this.barHeight - this.frameWidth - this.progressGap * 2,
            lineWidth: 0,
            originX: 0,
            originY: 1,
        });

        let style = getDefaultTextStyle();
        let title = this.scene.add.text(-this.frameWidth / 2, -this.barHeight - this.titleGap, "HP", style).setOrigin(0, 1);
        this.applyTarget(title);
    } 

    setTitle(val: string) {
        this.wrappedObject.text = val;
    }
}