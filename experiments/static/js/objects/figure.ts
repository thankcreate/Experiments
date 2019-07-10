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
} | any

/**
 * This class is created to solve the origin problem of PhGraphics
 */
class Figure extends Wrapper<PhGraphics> {

    designWidth;
    designHeight;

    originX;
    originY;

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

        this.designWidth = config.width;
        this.designHeight = config.height;
        this.originX = config.originX;
        this.originY = config.originY;

        let graphics = this.constructGraphics();
        this.applyTarget(graphics);

        this.calcGraphicsPosition();
    }

    constructGraphics() : PhGraphics{
        return null;
    }

    setOrigin(x, y) {
        this.originX = x;
        this.originY = y;
        this.calcGraphicsPosition();
    }

    setSize(width, height) {
        this.designWidth = width;
        this.designHeight = height;
        this.calcGraphicsPosition();
    }

    calcGraphicsPosition() {
        if(this.wrappedObject) {
            this.wrappedObject.x = -this.designWidth * this.originX;
            this.wrappedObject.y = -this.designHeight * this.originY;
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

    constructGraphics() : PhGraphics {     
        let graphics = this.scene.add.graphics();

        let config = this.config;

        graphics.fillStyle(config.fillColor, config.fillAlpha);
        graphics.fillRect(0, 0, config.width, config.height);

        graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha)
        graphics.strokeRect(0, 0, config.width, config.height);

        return graphics;
    }
}

