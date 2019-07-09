var canvasIndex = 0;
/**
 * The current Dwitter only uses Canvas context to draw things \
 * This is because for some heavy-performance task, webgl is extremely laggy
 */
class Dwitter extends Wrapper<PhImage | PhGraphics> implements Updatable {

    width: number;
    height: number;
    frame: number;

    c: any;
    x: any;

    canvasTexture: PhCanvasTexture;

    useImage: boolean;

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
        this.frame = 0;

        // Push to the scene's update array
        this.scene.updateObjects.push(this);
    }


    update(time, dt) {
        let innerTime = this.frame / 60;
        this.frame++;
        this.u(innerTime, this.c, this.x);
    }

    setOrigin(xOri: number, yOri: number) {
        if (this.useImage) {
            (<PhImage>this.wrappedObject).setOrigin(xOri, yOri);
        }
        else {
            console.error("Graphics mode in dwitter is not allowed now");
        }
    }

    u(t, c: any, x) {
        // In inheritance
    }
}

class Dwitter65536 extends Dwitter {
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


class Dwitter65537 extends Dwitter {

    dwitterInit() {
        super.dwitterInit();
        this.inner.alpha = 0.04;
    }

    u(t, c: any, x) {
        let letbase = 5;
        t = ~~(t / 5);
        t += letbase;

        let a = 0;
        c.width |= 0

        for (let i = 1e3; i--; ) {
            x.arc(this.width / 2, this.height / 2, i ^ (t * 25 % 600), i / 100, i / 100 + .03);
            x.stroke();
            x.beginPath(x.lineWidth = 70);
        }

    }

}
