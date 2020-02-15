class HP extends Wrapper<PhText> {

    mainBar: Rect;

    innerProgress: Rect;    
    progressColor = 0x888888;
    progressGap = 4;
    progressMaxWidth; // calc in custructor

    titleGap = 1;

    barHeight = 40;
    barWidth = 400;

    frameWidth = 6;

    maxHealth = gameplayConfig.defaultMyHealth;    
    currHealth = this.maxHealth;

    deadEvent: TypedEvent<any> = new TypedEvent();
    
    initMaxHealth(val: number) {
        this.maxHealth = val;
        this.currHealth = val;
    }

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

        this.progressMaxWidth = this.barWidth - this.frameWidth - this.progressGap * 2;
        this.innerProgress = new Rect(this.scene, this.inner, this.frameWidth / 2 + this.progressGap, - this.frameWidth / 2 - this.progressGap, {
            lineColor: this.progressColor,
            fillColor: this.progressColor,
            width: this.progressMaxWidth,
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

    damageBy(val: number) {
        if(this.currHealth <= 0)
            return;

        this.currHealth -= val;
        this.currHealth = clamp(this.currHealth, 0, this.maxHealth);

        let perc = this.currHealth / this.maxHealth;
        let newProgressWidth = perc * this.progressMaxWidth;        
        this.innerProgress.setSize(newProgressWidth);

        if(this.currHealth == 0) {
            this.deadEvent.emit('Haha, you died');
        }        
    }

    reset() {
        this.currHealth = this.maxHealth;
        this.innerProgress.setSize(this.progressMaxWidth);
    }
}