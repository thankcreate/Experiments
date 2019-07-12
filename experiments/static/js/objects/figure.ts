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

    padding?: number,
    title?:string,
    contentPadding?: number,
    content?: string
    titleContentGap?: number,
    btnToBottom?: number,
    
} 

/**
 * This class is created to solve the origin problem of PhGraphics
 */
class Figure extends Wrapper<PhGraphics> {

    config: FigureConfig;

    othersContainer: PhContainer;

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
        this.applyOrigin(this.wrappedObject);
        if(this.othersContainer) {
            this.applyOrigin(this.othersContainer);
        }
    }    

    applyOrigin(ob: any) {
        if(ob) {
            ob.x = -this.config.width * this.config.originX;
            ob.y = -this.config.height * this.config.originY;
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

        if(config.lineWidth != 0) {
            graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha)
            graphics.strokeRect(0, 0, config.width, config.height);       
        }        
    }
}

var aboutContent = `This is a good game This is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good gameThis is a good game
`

class Dialog extends Figure {
    
    title: PhText;
    content: PhText;
    okBtn: Button;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, config: FigureConfig) {
        super(scene, parentContainer, x, y ,config)

        this.othersContainer = this.scene.add.container(0,0);
        this.inner.add(this.othersContainer);
        
        let width = config.width;
        let height = config.height;

        // title
        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50, config.title, titleStyle).setOrigin(0.5).setAlign('center');        
        this.othersContainer.add(this.title);

        // content
        let contentStyle = getDefaultTextStyle();
        this.content = this.scene.add.text(
            config.padding + config.contentPadding, 
            this.title.getBottomCenter().y + config.titleContentGap, 
            aboutContent, contentStyle);
        this.content.setOrigin(0, 0).setAlign('left');        
        this.content.setWordWrapWidth(width - (this.config.padding  + config.contentPadding) * 2)
        this.othersContainer.add(this.content);


        // OK btn

        this.okBtn = new Button(this.scene, this.othersContainer, width / 2, height - config.btnToBottom, null, '< OK >', 100, 50, true);
        this.okBtn.text.setColor('#000000');        
    }


    handleConfig(config: FigureConfig) {
        super.handleConfig(config);

        if(notSet(config.lineWidth)) config.lineWidth = 4;
        if(notSet(config.lineColor)) config.lineColor = 0x000000;
        if(notSet(config.lineAlpha)) config.lineAlpha = 1;
        
        if(notSet(config.fillColor)) config.fillColor = 0xffffff; 
        if(notSet(config.fillColor)) config.fillAlpha = 1; 

        if(notSet(config.padding)) config.padding = 4; 
    }

    drawGraphics() {
        let graphics = this.wrappedObject;
        let config = this.config;

        graphics.clear();
       
       
        graphics.fillStyle(config.fillColor, config.fillAlpha);
        graphics.fillRect(0, 0, config.width, config.height);

        graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha)
        graphics.strokeRect(config.padding, config.padding, config.width - config.padding * 2, config.height - config.padding * 2);   


    }
}

