class EnemyImage extends Enemy {
    figure: QuickDrawFigure;
    textAsImage: PhText;
    gap : number; // init here has no use
    
    
    constructor(scene, enemyManager: EnemyManager, posi, lblStyle, config : EnemyConfig) {                
        super(scene, enemyManager, posi, lblStyle, config);       
    }


    initContent() {
        super.initContent();
        this.gap = 10;


        // figure
        this.figure = new QuickDrawFigure(this.scene, this.inner, this.config.image);


        let lb = this.figure.getLeftBottom();
        let rb = this.figure.getRightBottom();


        this.lblStyle.fontSize = gameplayConfig.defaultImageTitleSize;

        // text
        this.text = this.scene.add.text((lb.x + lb.y) / 2, lb.y + this.gap, this.config.label, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;        
        this.text.setOrigin(0.5, 0);
        this.inner.add(this.text); 

        // let center = this.figure.getCenter();
        // this.text.setPosition(center.x, center.y);
        
        
        let lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
        
        // // healthText
        // let lb = this.text.getBottomLeft();
        // this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), this.lblStyle);
        // this.healthText.setOrigin(0, 0);
        // this.inner.add(this.healthText);  

        // textAsImage
        if(this.config.isSensitive) 
        {
            let textAsImageStyle = getDefaultTextStyle();
            textAsImageStyle.fontSize = '120px';
            textAsImageStyle.fontFamily = gameplayConfig.titleFontFamily;
            
            let textAsImage = this.scene.add.text(0, 0, "404", textAsImageStyle);        
            textAsImage.setOrigin(0.5);
            this.inner.add(textAsImage);

            this.figure.inner.setVisible(false);
        }
        

        if(!this.config.needChange) {
            this.figure.stopChange();
        }
        this.checkIfDontNeedLabel();
        this.checkIfNeedRotate();
        this.checkIfNeedShake();
        this.checkIfNeedFlicker();
    }
    checkIfNeedFlicker() {
        if(!this.config.needFlicker) {
            return;
        }
        
        this.shakeTween = this.scene.tweens.add({
            targets: this.figure.inner,            
            alpha: 0,    
            yoyo: true,
            duration: 400,
            repeat: -1
        });
    }

    checkIfNeedShake() {
        if(!this.config.needShake) {
            return;
        }

        
        this.shakeTween = this.scene.tweens.add({
            targets: this.figure.inner,
            scale: '+1.2',
            yoyo: true,
            duration: 500,
            repeat: -1
        });
    }


    hurAnimation;
    playHurtAnimation() {
        console.log("hoa2");
        this.hurAnimation = this.scene.tweens.add({
            targets: this.figure.inner,
            x: '+=100',
            yoyo: true,
            duration: 150,            
        });

        this.scene.tweens.add({
            targets: this.figure.inner,
            alpha: 0,
            yoyo: true,
            duration: 300,            
        });
    }


    checkIfDontNeedLabel() {
        if(this.config.type == EnemyType.TextWithImage || this.config.showLabel == true) {
            return;
        }

        this.text.setVisible(false);
        this.healthIndicator.inner.x = this.text.getBottomCenter().x;

    }

    getStopDistance() : number{
        return this.centerRadius + gameplayConfig.drawDataDefaultSize / 2 + 10;
    }

    
    dispose() {
        super.dispose();

        this.figure.dispose();        
        this.figure = null;
    }

    checkIfNeedRotate() {
        if(this.config.rotation > 0) {
            this.startRotate();

        }
    }
    
    startRotate() {     

        this.rotateTween = this.scene.tweens.add({
            targets: this.figure.inner,
            angle: '-=360',
            duration: this.config.rotation,
            repeat: -1
        });
        this.text.y += 20;
        this.healthIndicator.inner.y += 20;
    }

}