

class HealthIndicator {
    inner: PhContainer; 
    parentContainer: PhContainer; 
    scene: PhScene;
    text: PhText; 
    textStyle: TextStyle;
    
    textPosi: PhPoint = MakePoint2(0, 1);

    graphics: PhGraphics;
    num: number;
    
    maskGraph: PhGraphics;
    mask: PhMask;
    // mvTween: PhTween;

    constructor(scene: PhScene, parentContainer: PhContainer, posi: PhPoint, num: number ) {
        this.scene = scene;
        this.parentContainer = parentContainer;        
        
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.num = num;

        
        // circle
        this.graphics = this.scene.add.graphics();        
        this.graphics.fillStyle(0x000000, 1); // background circle
        this.graphics.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        this.inner.add(this.graphics);       


        // text health
        this.text = this.makeCenterText(num);
        
        // text mask
        this.maskGraph = this.scene.make.graphics({}); 
        this.maskGraph.fillStyle(0x0000ff, 1); // background circle
        this.maskGraph.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2); 

        let p = this.getAbsolutePosi(this.inner, this.textPosi); 
        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;

        this.mask = this.maskGraph.createGeometryMask();
        this.text.setMask(this.mask);
    }

    makeCenterText(num: number, offsetX: number = 0, offsetY: number = 0) : PhText {
        this.textStyle = getDefaultTextStyle();       
        this.textStyle.fontFamily = gameplayConfig.healthIndicatorFontFamily
        this.textStyle.fill = '#FFFFFF';
        this.textStyle.fontSize = '28px';
        
        let t = this.scene.add.text(this.textPosi.x + offsetX, this.textPosi.y + offsetY, num.toString(), this.textStyle);
        t.setOrigin(0.5, 0.5);
        this.inner.add(t);   

        if(this.mask) {
            t.setMask(this.mask);
        }
        
        return t;
    }

    damagedTo(num: number) {
        let curNum = this.num;
        let newNum = num;

        let outTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            // alpha: {
            //     getStart: () => 0,
            //     getEnd: () => 1,
            //     duration: 500
            // },
            duration: 500
        });

        this.text = this.makeCenterText(num, 0, -gameplayConfig.healthIndicatorWidth);

        
        let inTween = this.scene.tweens.add({
            targets: this.text,
            y: '+=' + gameplayConfig.healthIndicatorWidth,
            // alpha: {
            //     getStart: () => 0,
            //     getEnd: () => 1,
            //     duration: 500
            // },
            duration: 500
        });

    }

    update(time, dt) {        
        let p = this.getAbsolutePosi(this.inner, this.textPosi); 
        // console.log("getAbsolutePosi:" + p.x + " " + p.y);

        this.maskGraph.x = p.x;
        this.maskGraph.y = p.y;
    }

    getAbsolutePosi(ct : PhContainer , posi: PhPoint) : PhPoint{
        var ret = MakePoint2(posi.x, posi.y);
        while(ct != null) {
            ret.x += ct.x;
            ret.y += ct.y;
            ct = ct.parentContainer;           
        }
        return ret;
    }
}