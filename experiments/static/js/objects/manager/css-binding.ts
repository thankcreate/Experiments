class CssBinding {
    target: JQuery
    
    left: string
    top: string
    
    // transition
    translateX: number
    translateY: number
    scale: number
    rotate: number

    opacity: number

    constructor(target) {
        this.target = target;
    }    

    update() {
        if(this.left != null)
            this.target.css('left', this.left)
        
        if(this.top != null)
            this.target.css('top', this.top)

        if(this.opacity != null) 
            this.target.css('opacity', this.opacity)

        if(this.translateX != null|| this.translateY != null || this.scale != null || this.rotate != null) {
            this.target.css('transform', this.getTransformString());
        }
    }

    getTransformString():string {
        let ret = '';
        let tranlateSub = '';
        if(this.translateX != null || this.translateY != null) {
            let xStr =  this.translateX ? this.translateX : '0';
            let yStr =  this.translateY ? this.translateY : '0';
            tranlateSub = ` translate(${xStr}%, ${yStr}%) `;
        }

        let scaleSub = '';
        if(this.scale!= null) {
            scaleSub = ` scale(${this.scale}) `
        }

        let rotateSub = '';
        if(this.rotate != null) {
            rotateSub = ` rotate(${this.rotate}deg) `
        }
        ret = `${tranlateSub} ${scaleSub} ${rotateSub}`
        return ret;
    }
}