var canvasIndex = 0;
/**
 * The current Dwitter only uses Canvas context to draw things \
 * This is because for some heavy-performance task, webgl is extremely laggy
 */
class Dwitter extends Wrapper<PhImage | PhGraphics> implements Updatable {

    width: number;
    height: number;
    // frame: number;

    lastInnerTime = -1;

    c: any;
    x: any;

    canvasTexture: PhCanvasTexture;

    useImage: boolean;

    isRunning: boolean = true;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, width: number, height: number, useImage: boolean = true) {
        super(scene, parentContainer, x, y, null);
        this.useImage = useImage;

        this.height = height;
        this.width = width;

        if (useImage) {
            this.constructImage();
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }

        this.dwitterInit();
    }

    constructImage() {
        canvasIndex++;
        this.canvasTexture = this.scene.textures.createCanvas('dwitter' + canvasIndex, this.width, this.height);
        this.c = this.canvasTexture.getSourceImage();
        this.x = this.c.getContext('2d');

        let img = this.scene.add.image(0, 0, 'dwitter' + canvasIndex).setOrigin(0.5, 0.5);
        this.applyTarget(img);
    }

    dwitterInit() {
        // Default origin set to 0.5
        this.setOrigin(0.5, 0.5);
        // this.frame = 0;
        this.lastInnerTime = 0;

        // Push to the scene's update array
        this.scene.updateObjects.push(this);
    }

    next() {
        // this.frame += 60;
        // let innerTime = this.frame / 60;        
        //this.lastInnerTime = innerTime;
        this.lastInnerTime += 1;
        this.u(this.lastInnerTime, this.c, this.x);
    }

    toAutoRunMode() {
        this.isRunning = true;                
    }

    nextWithColorChange() {
        let typeCount = 4;
        let colorIndex  = Math.floor(this.lastInnerTime) % typeCount;
        let colorAr = [0.03, 0.10, 0.08, 0.12];

        // onsole.log(this.lastT + "  " + colorIndex);
        this.inner.alpha = colorAr[colorIndex];
        this.next();
    }
    

    toStaticMode() {
        this.isRunning = false;                
    }


    update(time, dt) {
        if(!this.isRunning)
            return;

        if(this.inner.alpha == 0)
            return;

        // this.frame++;
        // let innerTime = this.frame / 60;

        // if(innerTime === this.lastInnerTime) {           
        //     return;
        // } 
        // this.lastInnerTime = innerTime;       
        
        this.lastInnerTime += dt / 1000;        
        
        this.u(this.lastInnerTime, this.c, this.x);
    }

    u(t, c, x) {      
       
    }


    setOrigin(xOri: number, yOri: number) {
        if (this.useImage) {
            (<PhImage>this.wrappedObject).setOrigin(xOri, yOri);
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }
    }

    
}

/**
 * Round Center
 */
class DwitterCenterCircle extends Dwitter {
    u(t, c: any, x) {

        let a = 0;
        c.width |= c.style.background = <any>"#CDF";

        for (let j = 3e3; j--; x.arc(960, 540, 430 + 60 * S(j / 500 + a * 4) * (S(a - t * 2) / 2 + .5) ** 9, a, a)) {
            a = j / 159 + t;
            x.lineWidth = 29;
        }

        x.stroke();
    }
}


/**
 * Rect bkg
 */
class DwitterRectBKG extends Dwitter {
    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.03;
    }

    u(t, c: any, x) {
        
        let k = 0;
        let i = 0;
        c.width|=k=i=this.width/2

        for(;i--;x.strokeRect(k-i,this.height/2-i,i*2,i*2))x.setLineDash([t+k/i&1?i/5:i])
        x.stroke();
    }
}


class DwitterHoriaontalRect extends Dwitter{
    u(t, c , x) {        
        t/=2;
        let w = 8;
        let i = 0;
        for(c.width|=i=0; i++ < 20;){
            for(let j = 10; j--; ){
                let z=(j+2)/2;
                let xOffset = i*100+((i-10)*j*30)-S(t/3)*500*z

                let alpha = (0.5 - Math.abs(xOffset  / this.width - 0.5)) * 1;
                let cA = clamp(alpha, 0, 1);

                
                x.globalAlpha = Math.pow(Math.sin(cA * Math.PI / 2), 1/1.5);
                x.fillRect(xOffset, j*20+750+S(t*2-i+j/2)*50, 8*z,8*z)

            }
        }
    }

}

/**
 * Radial from center
 */
class DwitterRadialBKG extends Dwitter {

    freq = 5        // frequency
    phase = 5;      // initial phase
    
    param1;    
    needStopOnFirstShow;
   

    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.03;  

        this.param1 = 25;       
        this.needStopOnFirstShow = false;
    }





    toAutoRunMode() {
        super.toAutoRunMode();
        this.param1 = 200;        
    }

    toStaticMode() {
        super.toStaticMode();
        this.param1 = 25;        
    }


    u(t, c , x) {
        
        if(this.needStopOnFirstShow ){
            this.needStopOnFirstShow = false;
            this.isRunning = false;
        }


        let a = 0;
        c.width |= 0

        for (let i = 1e3; i--; ) {
            x.arc(this.width / 2, this.height / 2, i ^ (t * this.param1 % 600), i / 100, i / 100 + .03);
            x.stroke();
            x.beginPath(x.lineWidth = 70);
        }
    }

}


