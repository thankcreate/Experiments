
enum EnemyType {
    Text,
    TextWithImage,
    Image,        
}

interface EnemyConfig {
    type?: EnemyType,
    label?: string,
    image?: string,
    health?: number,
    duration?: number,    
    rotation?: number,
    showLabel?: boolean,   
    needChange?: boolean,
    needShake? : boolean,
    needFlicker? : boolean,
}

class Enemy {

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Container; 
    parentContainer: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;

    initPosi : Phaser.Geom.Point;

    id: number;

    /**
     * lbl is name shown
     */
    lbl: string;
    lblStyle: TextStyle;

    text: Phaser.GameObjects.Text;
    

    dest: Phaser.Geom.Point;
    duration: number;

    centerRadius: number = 125;

    mvTween: Phaser.Tweens.Tween;    
    fadeTween: Phaser.Tweens.Tween;
    rotateTween: Phaser.Tweens.Tween;
    shakeTween: Phaser.Tweens.Tween;
    flickerTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number;

    config : EnemyConfig;

    healthIndicator: HealthIndicator;
     
    damagedHistory : string[] = []; //store only valid input history
    

    constructor(scene, enemyManager: EnemyManager, posi : Phaser.Geom.Point, lblStyle, config : EnemyConfig) {        
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.inner;
        this.lbl = config.label;
        this.health = config.health;
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
        if (dis < stopDis) {            
            this.enemyManager.enemyReachedCore(this);
            this.stopRunAndDestroySelf();            
        }            
    }


    getStopDistance() : number{
        return this.centerRadius;
    }

    getTweenDurationFromEstimated(duration: number) {
        let dis = distance(this.dest, this.inner);   
        let stopDis = this.getStopDistance();

        return duration / (dis - stopDis) * dis;
    }

    startRun() {        


        // the real tween time should be longer than the input duration
        // this is because the tween's target x and y is the center of the circle
        // the the enemy will stop in a distance from the circle core
        let tweenDuration = this.getTweenDurationFromEstimated(this.config.duration);

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
            duration: tweenDuration
        });
    }

    freeze() {
        this.mvTween.pause();
    }
    

    inStop: boolean = false;
    stopRunAndDestroySelf() {   
        let thisEnemy = this;

        thisEnemy.enemyManager.removeEnemy(thisEnemy);

        this.inStop = true; 
        this.mvTween.stop();
        this.fadeTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 0,
            duration: 300,
            onComplete:  () => {                
                this.dispose();
            }
        });
    }

    dispose(){        
        this.inner.destroy();
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
        console.log("hahaha")  ;
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
        // We have to history need to update: the enemy's damage history
        // and the manager's omni history
        this.damagedHistory.push(input);
        this.updateOmniDamageHistory(input);

        console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);

        // Handle health
        this.health -= ret.damage;
        if (this.health <= 0) {
            this.eliminated();            
        }
        else {
            let sc = this.scene as Scene1;
            if(sc.needFeedback)
                this.playHurtAnimation();
        }
        this.health = Math.max(0, this.health);
        this.healthIndicator.damagedTo(this.health);

        return ret;
    }
    playHurtAnimation() {

    }

    updateOmniDamageHistory(input: string){
        this.enemyManager.omniHistory.forEach(e=>{
            if(e.id === this.id) {
                if(notSet(e.damagedBy)) e.damagedBy = [];
                e.damagedBy.push(input);
            }
        })
    }

    eliminated() {
        this.enemyManager.enemyEliminated(this);
        this.stopRunAndDestroySelf();
    }



    checkIfInputLegalWithEnemy(inputLbl: string, enemyLbl: string): ErrorInputCode {

        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();

        if (this.config.type == EnemyType.TextWithImage &&  inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;

        if (this.config.type == EnemyType.TextWithImage && enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }

        if (this.config.type == EnemyType.TextWithImage && inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }

        return ErrorInputCode.NoError;
    }

    disolve() {
        this.stopRunAndDestroySelf();
    }

    startRotate() {

    }

    
}


