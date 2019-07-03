class EnemyImage extends Enemy {
    figure: QuickDrawFigure;
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
        
        
        let lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
        
        // // healthText
        // let lb = this.text.getBottomLeft();
        // this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), this.lblStyle);
        // this.healthText.setOrigin(0, 0);
        // this.inner.add(this.healthText);  


        
    }

    getStopDistance() : number{
        return this.centerRadius + gameplayConfig.drawDataDefaultSize / 2 + 10;
    }
}