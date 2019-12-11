
enum EnemyType {
    Text,
    TextWithImage,
    Image,            
}

enum ClickerType {
    None,
    Normal,
    Bad,
    BadFromNormal,
}

interface EnemyConfig {
    enemyType?: EnemyType,
    clickerType?: ClickerType,
    label?: string,
    image?: string,
    health?: number,
    duration?: number,    
    rotation?: number,
    showLabel?: boolean,   
    needChange?: boolean,
    needShake? : boolean,
    needFlicker? : boolean,
    initPosi? : PhPoint

}


class Enemy {

    scene: Scene1;
    inner: Phaser.GameObjects.Container; 
    parentContainer: Phaser.GameObjects.Container;
    enemyManager: EnemyManager;

    initPosi : Phaser.Geom.Point;

    id: number;

    clickerType: ClickerType = ClickerType.None;

    /**
     * lbl is name shown
     */
    lbl: string;
    lblStyle: TextStyle;

    text: Phaser.GameObjects.Text;
    hpBar: EnemyHpBar;
    

    dest: Phaser.Geom.Point;
    duration: number;

    centerRadius: number = 125;

    mvTween: Phaser.Tweens.Tween;    
    fadeTween: Phaser.Tweens.Tween;
    rotateTween: Phaser.Tweens.Tween;
    shakeTween: Phaser.Tweens.Tween;
    flickerTween: Phaser.Tweens.Tween;


    inputAngle: number;
    health: number;             // hp
    maxHealth: number;
    resistance: number;         // the shield to protect itself from turning into 404

    config : EnemyConfig;

    healthIndicator: HealthIndicator;
     
    damagedHistory : string[] = []; //store only valid input history

    isSensative() : boolean {
        return this.clickerType == ClickerType.Bad || this.clickerType == ClickerType.BadFromNormal;
    }
    

    constructor(scene, enemyManager: EnemyManager, posi : Phaser.Geom.Point, lblStyle, config : EnemyConfig) {        
        this.scene = scene;
        this.enemyManager = enemyManager;
        this.parentContainer = enemyManager.inner;
        this.lbl = config.label;
        this.health = config.health;
        this.maxHealth = config.health;
        this.clickerType = config.clickerType;
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
        if(this.enemyManager.isPaused)
            return;

        this.checkIfReachEnd();
        this.checkIfNeedShowAutoBadBadge(time, dt);
        this.checkIfNeedAutoTurn(time, dt);
        if(this.healthIndicator)        
            this.healthIndicator.update(time, dt);

        // this.updateHealthBarDisplay();
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
        if(this.mvTween)
            this.mvTween.pause();
    }

    unFreeze() {
        if(this.mvTween)
            this.mvTween.resume();
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
            duration: 500,
            onComplete:  () => {                
                this.dispose();
            }
        });
    }

    dispose(){        
        this.inner.destroy();
    }


    getRealHealthDamage(item: SimResultItem) : number {        
        if(item.damage)
            return item.damage;

        let val = item.value;
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
    

    damageFromSimResult(item: SimResultItem, input:string) : DamageResult {            
        let val = item.value;   
        let ret: DamageResult = {
            damage: 0, 
            code:this.checkIfInputLegalWithEnemy(input, this.lbl)
        };

        // Found error
        if(ret.code != ErrorInputCode.NoError) {
            return ret;
        }

        // Zero damage
        ret.damage = this.getRealHealthDamage(item);        
        if(ret.damage == 0) {
            return ret;
        }

        // Damaged by thie same input word before
        if(!gameplayConfig.allowDamageBySameWord 
            && this.checkIfDamagedByThisWordBefore(input)
            && !isReservedKeyword(input)) {
            ret.code = ErrorInputCode.DamagedBefore;
            return ret;
        }

        // Update history
        // We have to history need to update: the enemy's damage history
        // and the manager's omni history
        this.damagedHistory.push(input);
        this.updateOmniDamageHistory(input);

        // console.debug(this.lbl + " sim: " + val + "   damaged by: " + ret.damage);

        // Handle health
        this.damageInner(ret.damage, input, true);
        return ret;
    }


    hasBeenDamagedByTurn: boolean = false;
    damageInner(dmg: number, input: string, fromPlayer: boolean) {
        this.health -= dmg;
        
        this.health = Math.max(0, this.health);

        this.checkIfNeedChangeAlphaByTurn(input);

        if(fromPlayer)
            this.checkIfNeedShowBadBadge(dmg, input);
            
        if(this.healthIndicator)
            this.healthIndicator.damagedTo(this.health);

        this.updateHealthBarDisplay()
        if (this.health <= 0) {
            this.eliminated(input);            
        }
        else {
            let sc = this.scene as Scene1;
            if(sc.needFeedback)
                this.playHurtAnimation();
        }        
    }

    checkIfNeedChangeAlphaByTurn(input: string) {
        if(this.hasBeenDamagedByTurn || isReservedTurnKeyword(input)) {
            this.hasBeenDamagedByTurn = true;
            this.updateAlphaByHealth();
        }
    }

    updateAlphaByHealth() {
        (this.getMainTransform() as any).alpha = this.health / this.maxHealth;
    }

    checkIfNeedShowBadBadge(dmg: number, input: string) {
        if(dmg > 0 && this.isSensative())
            this.showBadgeEffect();
        else if(dmg > 0 && !this.isSensative() && isReservedTurnKeyword(input)) {
            this.showTurnEffect(true);
        }
    }


    updateHealthBarDisplay() {
        if(this.hpBar) {
            this.hpBar.updateDisplay(this.health, this.maxHealth);
        }
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

    eliminated(damagedBy: string) {
        this.enemyManager.enemyEliminated(this, damagedBy);
        this.stopRunAndDestroySelf();
    }



    checkIfInputLegalWithEnemy(inputLbl: string, enemyLbl: string): ErrorInputCode {

        inputLbl = inputLbl.trim().toLowerCase();
        enemyLbl = enemyLbl.trim().toLowerCase();

        // sensitve can't be damanged by ordinary input
        // if(this.config.isSensitive) {
        //     return ErrorInputCode.SensitiveCantDamage;
        // }

        if (this.config.enemyType == EnemyType.TextWithImage &&  inputLbl.replace(/ /g, '') === enemyLbl.replace(/ /g, ''))
            return ErrorInputCode.Same;

        if (this.config.enemyType == EnemyType.TextWithImage && enemyLbl.indexOf(inputLbl) != -1) {
            return ErrorInputCode.Contain;
        }

        if (this.config.enemyType == EnemyType.TextWithImage && inputLbl.indexOf(enemyLbl) != -1) {
            return ErrorInputCode.Wrap;
        }

        return ErrorInputCode.NoError;
    }

    disolve() {
        this.stopRunAndDestroySelf();
    }

    startRotate() {

    }

    getMainTransform() : Phaser.GameObjects.Components.Transform {
        return this.inner;
    }

    lastAutoBadge = -1000;
    autoBadgeIndex = 0;
    checkIfNeedShowAutoBadBadge(time, dt) {
        if(!this.isSensative())
            return;
        if(this.scene.enemyManager.curStrategyID == SpawnStrategyType.ClickerGame) {            
            if(time - this.lastAutoBadge > autoBadgeInterval) {                
                let avi = [];
                for(let i in badInfos) {
                    if(badInfos[i].consumed) {
                        avi.push(i);
                    }
                }
                if(avi.length == 0)
                    return;
                    
                this.showBadgeEffect(avi[this.autoBadgeIndex % avi.length]);

                this.autoBadgeIndex++;
                this.lastAutoBadge = time;
            }
        }
    }

    lastAutoTurn = -1000;    

    checkIfNeedAutoTurn(time, dt) {
        if(this.isSensative())
            return;
        
        if(this.scene.enemyManager.curStrategyID == SpawnStrategyType.ClickerGame) {            
            if(time - this.lastAutoTurn > autoTurnInterval) {                
                if(!getAutoTurnInfo().consumed) 
                    return;

                this.showTurnEffect(false);                
                this.lastAutoTurn = time;
            }
        }    
    }

    loopMagic: PhImage;
    showTurnEffect(fromPlayer: boolean) {
        return ;
        let posi = MakePoint(this.getMainTransform());
        // posi.x += this.inner.x;
        // posi.y += this.inner.y;
        posi.x += 70;        
        posi.y -= 70;

        let magic;
        if(fromPlayer) {
            magic = this.scene.add.image(posi.x, posi.y, 'magic');

            // let posiAmplitude = 20;
            // let randomOffsetX = Math.random() * posiAmplitude * 2 - posiAmplitude;
            // let randomOffsetY = Math.random() * posiAmplitude * 2 - posiAmplitude;
            // posi.x += randomOffsetX;
            // posi.y += randomOffsetY;
            // magic.setPosition(posi.x, posi.y);
        }
        else {
            if(notSet(this.loopMagic)) {
                this.loopMagic = this.scene.add.image(posi.x, posi.y, 'magic');                
            } 
            magic = this.loopMagic;
        }


            
        magic.setOrigin(23 / 49, 81 / 86);
        // this.scene.midContainder.add(magic);
        this.inner.add(magic);

        let scale = 0.8;
        
        let fromRt = -30 / 180 * Math.PI;
        let toRt = -60 / 180 * Math.PI;
        
        let rtDt = 250;

        magic.setRotation(fromRt);        
        magic.setScale(scale);
        magic.alpha = 1;

        let rt = this.scene.add.tween({
            targets: magic,
            rotation: toRt,
            duration: rtDt,
            yoyo: true,
            ease: 'Sine.easeOut',
            // onYoyo: () =>{
            //     this.updateAlphaByHealth()
            // }
        })

        if(fromPlayer) {
            let fadeDelay = 400;
            let fade = this.scene.add.tween({            
                targets: magic,
                delay: fadeDelay,
                alpha: 0,
                duration: rtDt * 2 - fadeDelay,     
                onComplete: ()=>{
                    magic.destroy();
                }     
            })
        }
    }

    showBadgeEffect(idx?) {        
        let posi = MakePoint(this.getMainTransform());
        posi.x += this.inner.x;
        posi.y += this.inner.y;
        posi.y += 8;        

        if(notSet(idx)) {
            idx = 0;
        }

        let resID = getBadgeResID(idx);

        let badge = this.scene.add.image(0, 0,  resID);
        this.scene.midContainder.add(badge);

        // let scaleFrom = 0.8;
        // let scaleTo = 1;
        
        let overallScale = 0.85;
        let scaleFrom = 1.05 * overallScale;
        let scaleTo = 0.8 * overallScale;

        let dt = 140;
        badge.setScale(scaleFrom);

        let posiAmplitude = 30;
        let randomOffsetX = Math.random() * posiAmplitude * 2 - posiAmplitude;
        let randomOffsetY = Math.random() * posiAmplitude * 2 - posiAmplitude;
        posi.x += randomOffsetX;
        posi.y += randomOffsetY;
        badge.setPosition(posi.x, posi.y);

        let rtAmplitude = 35 / 180 * Math.PI;
        let randomRt = Math.random() * rtAmplitude * 2 - rtAmplitude
        badge.setRotation(randomRt);

        let tw = this.scene.tweens.add({
            targets: badge,
            //x: '+=1',
            // scale: scaleTo,
            scale: {
                getStart: () => scaleFrom,
                getEnd: () => scaleTo,
                duration: dt                
            },
            ease: 'Sine.easeIn'
            // yoyo: true,
            // duration: 600,            
            
        });

        let delayFade = this.scene.tweens.add({
            targets: badge,
            delay: 250,
            alpha: 0,
            duration: 400,
            onComplete: ()=>{
                badge.destroy();
            }
        });
    }
}


