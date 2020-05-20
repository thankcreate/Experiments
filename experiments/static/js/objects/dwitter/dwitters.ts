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

    isRunning1: boolean = true;
    isRunning2: boolean = false;

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
        this.isRunning1 = true;                
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
        this.isRunning1 = false;                
    }

    get needRunning() {
        return this.isRunning1 || this.isRunning2;
    }

    update(time, dt) {
        if(!this.needRunning)
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


    toIndex: number = 0;
    changeTo(idx: number) {
        this.toIndex = idx;
        this.next();
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
        let i = 0;
        let k = 0;
        let s = 0;
        
        // new
        // let halfWidth = this.width / 2;
        // let halfHeight = this.height / 2;
        // let j = 0;
        // t /= 4;
        // c.width^=0;
        // for(i=9;i<2e3;i+=3)s=13/(9.2-(t+i/29)%9),x.beginPath(),j=i*7+S(i*4+t+S(t)),x.lineWidth=s*s,x.arc(halfWidth,halfHeight,s*92,j,j+.1),x.stroke()        


        // old
        c.width|=k=i=this.width/2                
        k=i=this.width/2
        t/=4;
        for(;i--;) {
            x.setLineDash([t+k/i&1 ? i/5: i])
            x.strokeRect(k-i,this.height/2-i,i*2,i*2)
            // x.rect(k-i,this.height/2-i,i*2,i*2)
            // x.stroke();
        }       

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
            this.isRunning1 = false;
        }

        if(this.toIndex == 0) {
            let a = 0;
            c.width |= 0
    
            
            for (let i = 1e3; i--; ) {
                x.arc(this.width / 2, this.height / 2, i ^ (t * this.param1 % 600), i / 100, i / 100 + .03);
                x.stroke();
                x.beginPath(x.lineWidth = 70);
            }    
        }
        else {
            let i = 0;
            let j = 0;
            let r = 0;
            let a = 0;
            for (c.width |= j = 21, x.scale(5, 5), x.lineJoin = "round"; j--;)for (i = 26; i--;)x.arc(this.width / 10, this.height / 10, 1.3 ** (r = j + i % 2 + t % 2), a = (i + j) % 24 / 3.8197 + C(r) / 2, a); x.stroke()
        }
        // else {            
        //     let i = 0;
        //     let j = 0;
        //     for(c.width|=i=50,S=Math.sin;i--;)for(j=50;j--;)x.arc(this.width / 2,this.height / 2,200*(S(t)/2+2)*(S(i)+1),(t%2)+j,(S(t)+1)*i+j);x.stroke()            
        // }

        
    }

}


