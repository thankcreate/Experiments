class Enemy {

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Container;
    parentContainer: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;

    lbl: string;
    lblStyle: object;

    text: Phaser.GameObjects.Text;
    healthText: Phaser.GameObjects.Text;

    dest: Phaser.Geom.Point;
    duration: number;
    stopDistance: number = 125;

    mvTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number = gameConfig.defaultHealth;

    constructor(scene, enemyManager: EnemyManager, posi, lbl, lblStyle) {        
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.container;
        this.lbl = lbl;
        this.lblStyle = lblStyle;

        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);

        // text
        this.text = this.scene.add.text(0, 0, lbl, lblStyle);
        this.inputAngle = Math.atan2(posi.y, posi.x) * 180 / Math.PI;        
        this.text.setOrigin(posi.x > 0 ? 0 : 1, posi.y > 0 ? 0 : 1);
        this.inner.add(this.text);

        

        // healthText
        let lb = this.text.getBottomLeft();
        this.healthText = this.scene.add.text(lb.x, lb.y, this.health.toString(), lblStyle);
        this.healthText.setOrigin(0, 0);
        this.inner.add(this.healthText);

        this.dest = new Phaser.Geom.Point(0, 0);        
    }

    update(dt) {
        this.checkIfReachEnd();
    }

    checkIfReachEnd() {
        if (this.inStop)
            return;

        let dis = distance(this.dest, this.inner);        
        if (dis < this.stopDistance)
            this.stopRun();
    }

    startRun() {
        this.inner.alpha = 0; // muse init from here, or it will have a blink
        this.mvTween = this.scene.tweens.add({
            targets: this.inner,
            x: this.dest.x,
            y: this.dest.y,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
                duration: 500
            },
            duration: this.duration
        });
    }

    inStop: boolean = false;
    stopRun() {   
        let thisEnemy = this;

        thisEnemy.enemyManager.removeEnemy(thisEnemy);

        this.inStop = true; 
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 300,
            onComplete: function () {                
                thisEnemy.inner.destroy();
            }
        });
    }


    getRealHealthDamage(val : number) : number {        
        let ret = 0;        
        let tiers = gameConfig.damageTiers;
        for(let i in tiers) {
            let tier = tiers[i];
            if(val >= tier[0])
                return tier[1];
        }

        return ret;
    }

    damage(val: number) {
        let realDamage = this.getRealHealthDamage(val);        
        
        console.log(this.lbl + " sim: " + val + "   damaged by: " + realDamage);
        this.health -= realDamage;
        if (this.health < 0) {
            this.stopRun();
        }
        this.health = Math.max(0, this.health);
        this.healthText.setText(this.health.toString());
    }
}