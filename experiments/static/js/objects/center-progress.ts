class CenterProgress extends Wrapper<PhText> {

    radius: number;

    curVal: number;
    maxVal: number;

    circle: Arc;

    arcOffset = -Math.PI / 2;

    addTw: PhTween;

    resetTw: PhTween;

    /**
     * progress is normalized as [0, 1]
     */
    progress = 0;

    progressDisplayed:number = 0;

    fullEvent: TypedEvent<CenterProgress> = new TypedEvent();


    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        this.radius = 115;

        this.curVal = 0;
        this.maxVal = initCreateMax;
        this.progress =  this.curVal / this.maxVal;
        
        //let ac = this.scene.add.arc(x, y, radius, 0, Math.pi, false, 0x000000, 1);
        this.circle = new Arc(this.scene, this.inner, 0, 0, {
            radius: this.radius,
            startAngle: 0 + this.arcOffset, 
            endAngle: 1 + this.arcOffset,
            antiClockwise: false,
            lineWidth: 12,
        }); 
    }

    reset() {
        this.addProgress(-this.curVal, 0);
    }

    addProgress(val: number, delay?: number, duration?: number) {       
        if(notSet(delay)) delay = 0;
        if(notSet(duration)) duration = 100;
        
        this.curVal += val;
        this.curVal = clamp(this.curVal, 0, this.maxVal);
        this.progress =  this.curVal / this.maxVal;        
      
        let to = this.progress;
        // console.log(to);
        if(this.resetTw) {
            this.resetTw.stop();
        }
        if(val > 0) {
            this.addTw = this.scene.add.tween({
                delay: delay,
                targets: this,            
                progressDisplayed: to,
                duration: duration,            
            })
        }
        else {
            this.resetTw = this.scene.add.tween({
                delay: delay,
                targets: this,            
                progressDisplayed: to,
                duration: duration,            
            })
        }
        

        if(this.progress == 1) {
            this.full();
        }
    }

    full() {
        this.fullEvent.emit(this);
        this.addProgress(-this.maxVal, 500, 1000);
    }

    lastTimeProgressDisplayed: number = -1;
    update(time, dt) {        
        this.updateProgressDisplay();        
    }

    updateProgressDisplay() {
        if(this.progressDisplayed == this.lastTimeProgressDisplayed)
            return; 

        this.circle.config.endAngle = Math.PI * 2 * this.progressDisplayed  + this.arcOffset;
        this.circle.drawGraphics();

        this.lastTimeProgressDisplayed = this.progressDisplayed;
    }
}