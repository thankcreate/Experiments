class Paper extends Figure {
    title: PhText;
    content: PhText;

    checkboxImg: PhImage;
    continueBtn: Button;

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

        // toggle
        this.fillToggle();


        // init scroll event
        this.initScrollEvent();
    }

    initScrollEvent() {
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {            
            this.othersContainer.y += deltaY * -0.5;
    
        });
    }

    

    fillTitle() {
        let config = this.config;
        let width = config.width;
        let height = config.height;

        let titleStyle = getDefaultTextStyle();
        titleStyle.fontSize = "40px";
        this.title = this.scene.add.text(width / 2, config.padding + 50 + config.topTitleGap, config.title, titleStyle).setOrigin(0.5).setAlign('center');
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
    
    fillToggle() {
        let config = this.config;

        let contentY = this.content.getBottomLeft().y;
        let padding = config.padding + config.contentPadding;

        // checkbox
        let checkboxImg = this.scene.add.image(padding, contentY + 100, 'checkbox_off');
        checkboxImg.setInteractive();
        checkboxImg.setOrigin(0, 0);

        checkboxImg.setData('on', false);
        checkboxImg.on('pointerup',  ()=>{
            this.checkboxClicked();
        });
        this.othersContainer.add(checkboxImg);
        this.checkboxImg = checkboxImg;


        // text
        let stl = getDefaultTextStyle();
        stl.fontSize = '26px';
        let text = this.scene.add.text(checkboxImg.getBottomRight().x + 10, checkboxImg.getBottomRight().y - 5,
            'Click to confirm you have completed the reading', stl);
        text.setOrigin(0, 1);
        text.setInteractive();
        text.on('pointerup', ()=>{
            this.checkboxClicked();
        });
        this.othersContainer.add(text);        

        // continue button
        let checkboxY = checkboxImg.getBottomLeft().y;
        let btn = new Button(this.scene, this.othersContainer, padding +120, checkboxY + 40, null, '[Continue]');
        btn.text.setColor('#000000');
        btn.text.setFontSize(50);
        
        
        btn.needHandOnHover = true;
        btn.needInOutAutoAnimation = false;
        this.continueBtn = btn;

    }

    /**
     * The function 'checkboxClicked' handle both the event invoked 
     * from clicking on the checkbox and the following text
     */
    checkboxClicked() {
        let checkboxImg = this.checkboxImg;
        if (checkboxImg.getData('on'))
        {
            checkboxImg.setTexture('checkbox_off');
            checkboxImg.setData('on', false);
        }
        else
        {
            checkboxImg.setTexture('checkbox_on');
            checkboxImg.setData('on', true);                
        }
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
    }

}