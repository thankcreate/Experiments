type FigureConfig = {
    width?: number, 
    height?: number, 
    originX?: number, 
    originY?: number,

    lineWidth?: number,
    lineColor?: number,
    lineAlpha?: number,
   
    fillColor?: number,
    fillAlpha?: number,
} 

/**
 * This class is created to solve the origin problem of PhGraphics
 */
class Figure extends Wrapper<PhGraphics> {

    config: FigureConfig;

    handleConfig(config: FigureConfig) {
        if(notSet(config)) config = {};                
        if(notSet(config.width)) config.width = 100;
        if(notSet(config.height)) config.height = 100;
        if(notSet(config.originX)) config.originX = 0;
        if(notSet(config.originY)) config.originY = 0; 

        this.config = config;
    }
    

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, 
        config: FigureConfig) {
        super(scene, parentContainer, x, y, null);
        
        this.handleConfig(config);


        let graphics = this.scene.add.graphics();
        this.applyTarget(graphics);

        this.drawGraphics();
        this.calcGraphicsPosition();
    }

    drawGraphics() {
        // To be implemented in inheritance
    }

    setOrigin(x, y) {
        this.config.originX = x;
        this.config.originY = y;
        this.calcGraphicsPosition();
    }

    setSize(width, height?) {
        this.config.width = width;
        
        if(!notSet(height))
            this.config.height = height;

        this.drawGraphics();
        this.calcGraphicsPosition();
    }

    calcGraphicsPosition() {
        if(this.wrappedObject) {
            this.wrappedObject.x = -this.config.width * this.config.originX;
            this.wrappedObject.y = -this.config.height * this.config.originY;
        }
    }    
}

class Rect extends Figure {

    handleConfig(config: FigureConfig) {
        super.handleConfig(config);

        if(notSet(config.lineWidth)) config.lineWidth = 4;
        if(notSet(config.lineColor)) config.lineColor = 0x000000;
        if(notSet(config.lineAlpha)) config.lineAlpha = 1;
        
        if(notSet(config.fillColor)) config.fillColor = 0xffffff; 
        if(notSet(config.fillColor)) config.fillAlpha = 1; 
    }

    drawGraphics() {
        let graphics = this.wrappedObject;
        let config = this.config;

        graphics.clear();

        // Some times even if lineWidth == 0 && width == 0
        // There is still a tiny line
        // So we need to double check that if the width == 0,
        // we don't draw anything
        if(config.width === 0)
            return;

        graphics.fillStyle(config.fillColor, config.fillAlpha);
        graphics.fillRect(0, 0, config.width, config.height);

        graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha)
        graphics.strokeRect(0, 0, config.width, config.height);       
    }
}

