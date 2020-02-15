/// <reference path="enemy-base.ts" />

class EnemyText extends Enemy {
    constructor(scene, enemyManager: EnemyManager, posi, lblStyle, config : EnemyConfig) {        
        super(scene, enemyManager, posi, lblStyle, config);
    }

    initContent() {
        super.initContent();

        // text
        this.text = this.scene.add.text(0, 0, this.lbl, this.lblStyle);
        this.inputAngle = Math.atan2(this.initPosi.y, this.initPosi.x) * 180 / Math.PI;        
        this.text.setOrigin(this.initPosi.x > 0 ? 0 : 1, this.initPosi.y > 0 ? 0 : 1);
        this.inner.add(this.text);      
        

        // healthText
        let lc = this.text.getLeftCenter();
        lc.x -= gameplayConfig.healthIndicatorWidth / 2;
        lc.x -= 4;
        this.healthIndicator = new HealthIndicator(this.scene, this.inner, lc, this.health);
    }
}