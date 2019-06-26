class QuickDrawFigure{

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Graphics;
    parentContainer: Phaser.GameObjects.Container;
    lbl: string;

    curIndex = -1;
    figures: object[];

    interval = 300;
    changeTween: Phaser.Tweens.Tween;

    graphicLineStyle = {
        width: 4,
        color: 0xFF0000,
        alpha: 1
    }

    constructor(scene, parentContainer, lbl) {
        this.scene = scene;        
        this.parentContainer = parentContainer;
        this.lbl = lbl;

        this.inner = this.scene.add.graphics({lineStyle: this.graphicLineStyle});        

        let fullPath = this.getFilePathByLbl(lbl);        
        $.getJSON(fullPath,  json => {
            this.figures = json;   
            // this.drawFigure(this.figures[3]);           
            
            this.startChange();
        });

        this.parentContainer.add(this.inner);
    }

    // 
    drawFigure(figure) {

        var strokes = figure.drawing;
        this.inner.clear();
        // let maxY = -10000;
        // let maxX = -10000;
        // the sample is 255, which means that x, y are both <= 255


        for(let strokeI = 0; strokeI < strokes.length; strokeI++) {
            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for(let i = 0; i < count - 1; i++) {                     
                this.mappedLineBetween(xArr[i], yArr[i], xArr[i + 1], yArr[i + 1]);
                // maxX = Math.max(maxX, xArr[i]);
                // maxY = Math.max(maxY, yArr[i]);
            }                 
        }
        // console.log("MaxX: " + maxX + "   MaxY: " + maxY) ;
        
    }

    mappedLineBetween(x1, y1, x2, y2) {
        let mappedPosi1 = this.getMappedPosi(x1, y1);
        let mappedPosi2 = this.getMappedPosi(x2, y2);
        this.inner.lineBetween(mappedPosi1[0], mappedPosi1[1], mappedPosi2[0], mappedPosi2[1]);
    }

    getFilePathByLbl(lbl: string) {
        let folderPath = gameConfig.quickDrawDataPath;
        return folderPath + lbl + ".json";
    }


    startChange() {
        this.changeTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,

            onStart: () => {
                this.change();
            },

            onRepeat: () => {
                this.change();
            },

            repeat: -1
        });
    }

    change() {
        if(!this.figures || this.figures.length == 0)
            return;

        this.curIndex = (this.curIndex + 1) % this.figures.length;
        this.drawFigure(this.figures[this.curIndex])
    }

    
    sampleRate = 255;
    originX = 0.5;
    originY = 0.5;
    newSize = 150;
    getMappedPosi(x, y) : number[] {
        let scaleRate = this.newSize / this.sampleRate;
        let posi = [
            x * scaleRate - this.newSize * this.originX, 
            y * scaleRate - this.newSize * this.originY
        ];
        return posi;
    }
}