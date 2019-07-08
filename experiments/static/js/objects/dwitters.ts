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

        this.u(innerTime, this.c, this.x);
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
        return;           
        
        let a = 0;
        console.log("haha" + 3e3);
        // x.clear();
        // c.width|=c.style.background=<any>"#CDF";

        // x.fillStyle(0xff0000, 1);
        // x.fillRect(0, 0, 100,100);
        x.lineStyle(29, 0x000000);
        x.beginPath();
        for(let j=3e3;j--;x.arc(960,540,430+60*S(j/500+a*4)*(S(a-t * 2)/2+.5)**9,a,a)) {
            a=j/159+t;
        }

        x.strokePath();
    }
}