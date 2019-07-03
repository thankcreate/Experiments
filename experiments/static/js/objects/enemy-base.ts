
enum EnemyType {
    Text,
    TextWithImage,
    Image,
}

interface EnemyConfig {
    type: EnemyType,
    label?: string;
    image?:string
}

class Enemy {

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Container; 
    parentContainer: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;

    initPosi : Phaser.Geom.Point;
    lbl: string;
    lblStyle: TextStyle;

    text: Phaser.GameObjects.Text;
    

    dest: Phaser.Geom.Point;
    duration: number;
    stopDistance: number = 125;

    mvTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number = gameplayConfig.defaultHealth;

    config : EnemyConfig;

    healthIndicator: HealthIndicator;
     

    constructor(scene, enemyManager: EnemyManager, posi : Phaser.Geom.Point, lblStyle, config : EnemyConfig) {        
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.container;
        this.lbl = config.label;
        this.lblStyle = lblStyle;
        this.initPosi = posi;
        this.config = config;

        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);

        
        this.dest = new Phaser.Geom.Point(0, 0); 
        
        this.initContent();
    }

    


    initContent() {
        // init in inheritance
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
        let tiers = gameplayConfig.damageTiers;
        for(let i in tiers) {
            let tier = tiers[i];
            if(val >= tier[0])
                return tier[1];
        }

        return ret;
    }

    

    damage(val: number, input:string) {

        
        let realDamage = this.getRealHealthDamage(val);        
        
        console.log(this.lbl + " sim: " + val + "   damaged by: " + realDamage);
        this.health -= realDamage;
        if (this.health <= 0) {
            this.eliminated();            
        }
        this.health = Math.max(0, this.health);
        this.healthIndicator.setText(this.health);
    }

    eliminated() {
        this.stopRun();
    }
}


