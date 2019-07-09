/**
 * The current Dwitter only uses Canvas context to draw things \
 * This is because for some heavy-performance task, webgl is extremely laggy
 */
class Dwitter extends Wrapper<PhGraphics> implements Updatable {

    width: number;
    height: number;
    frame: number;

    c: any;
    x: PhGraphics;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, width: number, height: number) {

        let graphics = scene.add.graphics();
        super(scene, parentContainer, x, y, graphics);                

        this.width = width;
        this.height = height;

        

        this.dwitterInit();
    }

    dwitterInit() {
        // Default origin set to 0.5
        this.setOrigin(0.5, 0.5);
        this.frame = 0;
        this.x = this.wrappedObject;
        this.x.lineStyle(29, 0x000000);

        this.inner.setScale(0.7);

        // Push to the scene's update array
        this.scene.updateObjects.push(this);        
    }
    

    update(time, dt) {
        let innerTime = this.frame / 60;

        // if (time * 60 | 0 == this.frame - 1)
        // {
        //     time += 0.000001;
        // }

        this.frame++;

        // this.u(innerTime, this.c, this.x);
    }

    setOrigin(xOri: number, yOri:number) {
        this.wrappedObject.x = -this.width * xOri;
        this.wrappedObject.y = -this.height * yOri;
    }

    u(t, c: any, x: PhGraphics) {

    }
}

class Dwitter65536 extends Dwitter {
    
    u(t, c:any, x: PhGraphics) {    
        
        
       // let a = 0;
        // x.clear();
        
        // x.lineStyle(29, 0x000000);
        // x.beginPath();
        // for(let j=3e3;j--;) {
        //     a=j/159+t;           
        //     x.arc(960,540,430+60*S(j/500+a*4)*(S(a-t * 2)/2+.5)**9,a,a);            
        // }

        // x.strokePath();
        // x.closePath();


        x.fillStyle(0x000000, 1);
        let Y = 0;
        let X = 0;
        let r=140-16*(t<10?t:0);
        for(let U=0;U<44;(r<8?"䃀䀰䜼䚬䶴伙倃匞䖴䚬䞜䆀䁠".charCodeAt(Y-61)>>X-18&1:0)||x.fillRect(8*X,8*Y,8,8))X=120+r*C(U+=.11)|0,Y=67+r*S(U)|0
    }

    
}