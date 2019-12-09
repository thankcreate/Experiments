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
    title?: string,
    contentPadding?: number,
    content?: string
    titleContentGap?: number,
    contentBtnGap?: number
    btnToBottom?: number,

    autoHeight?: boolean
    itemCount?: number

    roundRadius?: number

    btns?: string[]

}

/**
 * This class is created to solve the origin problem of PhGraphics
 */
class Figure extends Wrapper<PhGraphics> {

    config: FigureConfig;

    othersContainer: PhContainer;

    handleConfig(config: FigureConfig) {
        if (notSet(config)) config = {};
        if (notSet(config.width)) config.width = 100;
        if (notSet(config.height)) config.height = 100;
        if (notSet(config.originX)) config.originX = 0;
        if (notSet(config.originY)) config.originY = 0;
        if (notSet(config.btns)) config.btns = ['OK'];

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

        if (!notSet(height))
            this.config.height = height;

        this.drawGraphics();
        this.calcGraphicsPosition();
    }

    calcGraphicsPosition() {
        this.applyOrigin(this.wrappedObject);
        if (this.othersContainer) {
            this.applyOrigin(this.othersContainer);
        }
    }

    applyOrigin(ob: any) {
        if (ob) {
            ob.x = -this.config.width * this.config.originX;
            ob.y = -this.config.height * this.config.originY;
        }
    }
}

class Rect extends Figure {

    handleConfig(config: FigureConfig) {
        super.handleConfig(config);

        if (notSet(config.lineWidth)) config.lineWidth = 4;
        if (notSet(config.lineColor)) config.lineColor = 0x000000;
        if (notSet(config.lineAlpha)) config.lineAlpha = 1;

        if (notSet(config.fillColor)) config.fillColor = 0xffffff;
        if (notSet(config.fillColor)) config.fillAlpha = 1;
    }

    drawGraphics() {
        let graphics = this.wrappedObject;
        let config = this.config;

        graphics.clear();

        // Some times even if lineWidth == 0 && width == 0
        // There is still a tiny line
        // So we need to double check that if the width == 0,
        // we don't draw anything
        if (config.width === 0)
            return;

        graphics.fillStyle(config.fillColor, config.fillAlpha);

        if(notSet(config.roundRadius)){
            graphics.fillRect(0, 0, config.width, config.height);
        }            
        else {
            graphics.fillRoundedRect(0, 0, config.width, config.height, config.roundRadius);
        }

        if (config.lineWidth != 0) {
            graphics.lineStyle(config.lineWidth, config.lineColor, config.lineAlpha)
            if(notSet(config.roundRadius)){
                graphics.strokeRect(0, 0, config.width, config.height);
            }
            else {
                graphics.strokeRoundedRect(0, 0, config.width, config.height, config.roundRadius);
            }
        }
    }
}


class Dialog extends Figure {

    title: PhText;
    content: PhText;
    okBtn: Button;
    cancelBtn: Button;

    fixedHalfButtonOffset = 100;

    singleUseConfirmEvent : TypedEvent<Dialog> = new TypedEvent();
    singleUseClosedEvent: TypedEvent<Dialog> = new TypedEvent();
    

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, config: FigureConfig) {
        super(scene, parentContainer, x, y, config)

        this.othersContainer = this.scene.add.container(0, 0);
        this.inner.add(this.othersContainer);

        let width = config.width;
        let height = config.height;

        // title
        this.fillTitle();

        // content
        this.fillContent();


        // OK btn
        // If fixed height, btn's position is anchored to the bottom
        // If auto height, btn's position is anchored to the content

        // By default, we always initialize two buttons,
        // and decide whether to hide them in the calcUniPosi
        

        this.okBtn = new Button(this.scene, this.othersContainer, width / 2 - this.fixedHalfButtonOffset, 0, null, '< ' + this.getOkBtnTitle() +  ' >', 120, 50);
        this.okBtn.text.setColor('#000000');
        this.okBtn.text.setFontSize(38);
        this.okBtn.setToHoverChangeTextMode("-< " + this.getOkBtnTitle() + " >-");
        this.okBtn.needHandOnHover = true;
        this.okBtn.ignoreOverlay = true;
        
        this.okBtn.clickedEvent.on(()=>{
            this.singleUseConfirmEvent.emit(this);
        })

        this.cancelBtn = new Button(this.scene, this.othersContainer, width / 2 + this.fixedHalfButtonOffset, 0, null, '< ' + this.getCancelBtnTitle() +  ' >', 120, 50);
        this.cancelBtn.text.setColor('#000000');
        this.cancelBtn.text.setFontSize(38);
        this.cancelBtn.setToHoverChangeTextMode("-< " + this.getCancelBtnTitle() + " >-");
        this.cancelBtn.needHandOnHover = true;
        this.cancelBtn.ignoreOverlay = true;

        this.calcUiPosi();
    }

    getOkBtnTitle() {
        if(this.config.btns && this.config.btns[0]) {
            return this.config.btns[0];
        }
        return 'OK';
    }

    getCancelBtnTitle() {
        if(this.config.btns && this.config.btns[1]) {
            return this.config.btns[1];
        }
        return 'Cancel';
    }

    fillTitle() {
        let config = this.config;
        let width = config.width;
        let height = config.height;

        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50, config.title, titleStyle).setOrigin(0.5).setAlign('center');
        this.othersContainer.add(this.title);
    }

    fillContent() {
        let config = this.config;
        let width = config.width;
        let height = config.height;


        let contentStyle = getDefaultTextStyle();
        this.content = this.scene.add.text(
            config.padding + config.contentPadding,
            this.title.getBottomCenter().y + config.titleContentGap,
            config.content, contentStyle);
        this.content.setFontSize(28);
        this.content.setOrigin(0, 0).setAlign('left');
        this.content.setWordWrapWidth(width - (this.config.padding + config.contentPadding) * 2)
        this.othersContainer.add(this.content);
    }

    getContentBottomCenterY() {
        return this.content.getBottomCenter().y;
    }

    calcUiPosi() {
        let btnY = 0;
        let height = this.config.height;
        let config = this.config

        if (config.autoHeight) {
            btnY = this.getContentBottomCenterY() + config.contentBtnGap;
            this.okBtn.inner.y = btnY;
            this.cancelBtn.inner.y = btnY;
            let newHeight = btnY + config.btnToBottom;
            this.setSize(config.width, newHeight);
        }
        else {
            btnY = height - config.btnToBottom;
            this.okBtn.inner.y = btnY;
            this.cancelBtn.inner.y = btnY;
        }

        // handle whether to hide and adjust the buttons based on the number
        if(this.config.btns && this.config.btns.length == 1) {
            this.cancelBtn.setEnable(false, false);
            this.okBtn.inner.x = this.config.width / 2;

        }
        else if(this.config.btns && this.config.btns.length == 2) {
            this.cancelBtn.setEnable(true, false);
            this.okBtn.inner.x = this.config.width / 2 - this.fixedHalfButtonOffset;
            this.cancelBtn.inner.x = this.config.width / 2 + this.fixedHalfButtonOffset;
        }
    }

    setContent(content: string, title: string, btns?: string[]) {
        this.config.title = title;
        this.config.content = content;
        if(notSet(btns)) {
            btns =  ['OK'];
        }
        this.config.btns = btns;

        this.content.text = content;
        this.title.text = title;

        if (this.config.autoHeight) {
            this.calcUiPosi();
        }
    }


    handleConfig(config: FigureConfig) {
        super.handleConfig(config);

        if (notSet(config.lineWidth)) config.lineWidth = 4;
        if (notSet(config.lineColor)) config.lineColor = 0x000000;
        if (notSet(config.lineAlpha)) config.lineAlpha = 1;

        if (notSet(config.fillColor)) config.fillColor = 0xffffff;
        if (notSet(config.fillColor)) config.fillAlpha = 1;

        if (notSet(config.padding)) config.padding = 4;
        if (notSet(config.padding)) config.padding = 4;
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

    show() {
        this.inner.setVisible(true);
    }

    hide() {
        this.inner.setVisible(false);

        this.singleUseClosedEvent.emit(this);
        
        this.singleUseConfirmEvent.clear();
        this.singleUseClosedEvent.clear();
    }
}

class LeaderboardDialog extends Dialog {    
    col1 : PhText[];
    col2 : PhText[];
    items : LeaderboardItem[];
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, config: FigureConfig) {
        super(scene, parentContainer, x, y, config)
    }
    handleConfig(config: FigureConfig) {
        super.handleConfig(config);

        if (notSet(config.itemCount)) config.itemCount = 10;
        
    }

    getContentBottomCenterY() {
        return this.col2[this.col2.length - 1].getBottomCenter().y;
    }

    fillContent() {
        this.col1 = [];
        this.col2 = [];
        if(!this.items)
            this.items = [];

        let config = this.config;
        let width = config.width;
        let height = config.height;

        let contentStyle = getDefaultTextStyle();
        let lastY = this.title.getBottomCenter().y + config.titleContentGap;
        for(let i = 0; i < config.itemCount; i++) {            
            let item = this.items[i];
            
            let name = item ? item.name : "";
            let scroe = item ? item.score + "" : "";
            if(name.length > 15) {
                name = name.substr(0, 15);
            }

            let td1 = this.scene.add.text(
                width / 2 - 180,
                lastY,
                name, contentStyle);
            td1.setFontSize(28);
            td1.setOrigin(0, 0).setAlign('left');
            
            this.col1.push(td1);
            this.othersContainer.add(td1);
            
            let td2 = this.scene.add.text(
                width / 2 + 90,
                lastY,
                scroe, contentStyle);
            td2.setFontSize(28);
            td2.setOrigin(0, 0).setAlign('left');
            this.col2.push(td2);
            this.othersContainer.add(td2);                        

            lastY = td1.getBottomCenter().y + 4;
        }
    }

    setContentItems(items : LeaderboardItem[], title: string) {
        this.items = items;
        let config = this.config;
        for(let i = 0; i < config.itemCount; i++) {            
            let item = this.items[i];
            
            let name = item ? item.name : "";
            let scroe = item ? item.score + "" : "";

            if(name.length > 15) {
                name = name.substr(0, 15);
            }

            this.col1[i].text = name;
            this.col2[i].text = scroe;
        }

        this.config.title = title;                
        this.title.text = title;

        if (this.config.autoHeight) {
            this.calcUiPosi();
        }
    }
}