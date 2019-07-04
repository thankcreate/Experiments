
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

    centerRadius: number = 125;

    mvTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number = gameplayConfig.defaultHealth;

    config : EnemyConfig;

    healthIndicator: HealthIndicator;
     
    damagedHistory : string[] = []; //store only valid input history
    

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

    update(time, dt) {        
        this.checkIfReachEnd();
        this.healthIndicator.update(time, dt);
    }

    checkIfReachEnd() {
        if (this.inStop)
            return;

        let dis = distance(this.dest, this.inner);   
        let stopDis = this.getStopDistance();
        // console.log(stopDis);
        // console.log("dis:" + dis +  "stopdis:" + stopDis );
        if (dis < stopDis)
            this.stopRun();
    }

    getStopDistance() : number{
        return this.centerRadius;
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

    checkIfDamagedByThisWordBefore(input: string) : boolean {
        for(let i in this.damagedHistory) {
            if(this.damagedHistory[i] === input) {
                return true;
            }
        }

        return false;
    }
    

    damage(val: number, input:string) : DamageResult {         
        let ret: DamageResult = {
            damage: 0, 
            code:this.checkIfInputLegalWithEnemy(input, this.lbl)
        };

        // Found error
        if(ret.code != ErrorInputCode.NoError) {
            return ret;
        }

        // Zero damage
        ret.damage = this.getRealHealthDamage(val);        
        if(ret.damage == 0) {
            return ret;
        }

        // Damaged by thie same input word before
        if(!gameplayConfig.allowDamageBySameWord && this.checkIfDamagedByThisWordBefore(input)) {
            ret.code = ErrorInputCode.DamagedBefore;
            return ret;
        }

        // Update history
        this.damagedHistory.push(input);

        console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);

        // Handle health
        this.health -= ret.damage;
        if (this.health <= 0) {
            this.eliminated();            
        }
        this.health = Math.max(0, this.health);
        this.healthIndicator.damagedTo(this.health);

        return ret;
    }

    eliminated() {
        this.stopRun();
    }



    checkIfInputLegalWithEnemy(inputLbl: string, enemyLbl: string): ErrorInputCode {

        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();

        if (inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;

        if (enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }

        if (inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }

        return ErrorInputCode.NoError;
    }

    
}


