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
        let lb = this.text.getBottomLeft();
        this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), this.lblStyle);
        this.healthText.setOrigin(0, 0);
        this.inner.add(this.healthText);  
    }
}