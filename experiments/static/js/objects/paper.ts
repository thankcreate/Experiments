class Paper extends Figure {
    title: PhText;
    content: PhText;


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