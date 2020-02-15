/// <reference path="spawn-strategy-base.ts" />

class SpawnStrategyClickerGame extends SpawnStrategy {
    constructor(manager: EnemyManager, config?) {
        super(manager, SpawnStrategyType.FlowTheory, config);
        this.needHandleRewardExclusively = true;
    }

    last404Time: number;
    lastNormalTime: number;

    freq404: number;
    freqNormal: number;
    
    needLoopCreateNormal : boolean;
    needloopCeateBad: boolean;

    badCount = 0;
    
    badEliminatedCount = 0;
    normalNormalCount = 0;
    normalTurnedCount = 0;
    respawnAfterKilledThreshould: number = 9999;

    
    lastAutoTypeTime = -1;    
    lastAutoTurnTime = -1;


    autoTypeInterval = 1 * 1000;
    autoTurnInterval = 1 * 1000;




    curBadHealth: number = init404Health;

    getInitConfig() : SpawnStrategyConfig {
        return {
            healthMin: 3,
            healthMax: 3,            
            health: 3,
            enemyDuration: 40000,
        }
    }

    spawnBad(extraConfig?: EnemyConfig, needIncHp:boolean = true) : Enemy {      
        let health = needIncHp ? this.incAndGetBadHealth() : this.curBadHealth ;
        let cg = {health:health, duration: 70000, label: '!@#$%^&*', clickerType: ClickerType.Bad};
        updateObject(extraConfig, cg);

        let ene = this.enemyManager.spawn(cg);        
        this.badCount++;
        return ene;
    }

    incAndGetBadHealth() :number {
        if(this.badEliminatedCount < 4) {
            this.curBadHealth = ++this.curBadHealth;
        }
        else {
            this.curBadHealth *= health404IncreaseFactor;
            this.curBadHealth = Math.ceil(this.curBadHealth);            
        }
        
        return this.curBadHealth;
    }




    getDps404(): number {
        let dpsSum = 0;
        if(badInfos[0].consumed) {                        
            for(let i = 0; i < badInfos.length; i++) {
                if(badInfos[i].consumed)
                    dpsSum += badInfos[i].damage;
            }
        }
        return dpsSum;
    }


    typerAutoDamage(time ,dt) {
        // auto damage to 404
        if(badInfos[0].consumed) {            
            let dpsSum = this.getDps404();
            
            for(let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if(e.isSensative()) {
                    e.damageInner(dpsSum * dt, badInfos[0].title, false);
                }
            }
        }

        // auto damage to real word
        if(getAutoTurnInfo().consumed) {
            // let dpsSum = turnInfos[0].damage;
            for(let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if(!e.isSensative()) {
                    e.damageInner(e.maxHealth / autoTurnDpsFactor * dt, turnInfos[0].title, false);
                }
            }
        }


        // // auto damage to 404
        // if(badInfos[0].consumed && time  - this.lastAutoTypeTime > this.autoTypeInterval) {
        //     this.lastAutoTypeTime = time;
        //     for(let i = 0; i < badInfos.length; i++) {
        //         if(badInfos[i].consumed)
        //             this.enemyManager.sendInputToServer(badInfos[i].title);
        //     }            
        // }

        // // auto damage to real word
        // if(getAutoTurnInfo().consumed && time  - this.lastAutoTurnTime > this.autoTurnInterval) {
        //     this.lastAutoTurnTime = time;
        //     this.enemyManager.sendInputToServer(turnInfos[0].title);
        // }
    }

    getNormalHelath() : number {
        return this.normalTurnedCount + initNormalHealth;
    }

    spawnNormal(): Enemy {
        let health = this.getNormalHelath();
        let ene = this.enemyManager.spawn({health:health,/* label: 'Snorkel', */ duration: normalDuration, clickerType: ClickerType.Normal});
        return ene;
    }

    resetConsumed() {
        for(let i in propInfos)  {
            propInfos[i].consumed = false;
        }

        for(let i in badInfos)  {
            badInfos[i].consumed = false;
            badInfos[i].price =badInfos[i].basePrice;
            badInfos[i].damage =badInfos[i].baseDamage;
        }

        for(let i in hpPropInfos)  {
            hpPropInfos[i].consumed = false;
        }

        let leftBtns = this.sc1().hud.leftBtns;
        for(let i in leftBtns) {
            leftBtns[i].curLevel = 0;
        }

        this.sc1().centerObject.playerInputText.clearAutoKeywords();
        this.sc1().centerObject.centerProgres.reset();
    }
    
    onEnter(){
        this.resetConsumed();
        this.sc1().hud.resetPropBtns();

        this.creatCount = 0;
        this.badCount = 0;
        this.badEliminatedCount = 0;
        this.normalNormalCount = 0;
        this.normalTurnedCount = 0;
        this.respawnAfterKilledThreshould  = 9999;
        this.curBadHealth = init404Health;

        this.lastAutoTypeTime = this.enemyManager.accTime - 1;    
        this.lastAutoTurnTime = this.enemyManager.accTime - 1;

        this.firstSpawn();
        

        this.sc1().centerObject.centerProgres.fullEvent.on(()=>{
            this.create();
        })
    }


    firstSpawn() {
        for(let i = 0; i < init404Count;i++) {
            this.spawnBad();        
        }

        for(let i = 0; i< initNormalCount; i++) {
            this.spawnNormal();
        }
    }

    creatCount = 0;
    create() {
        this.creatCount++;

        if(this.creatCount == 6) {
            this.sc1().normalGameFsm.event('MOCK');
        }
        let e = this.spawnNormal();
        let scale = e.inner.scale;
        let timeline = this.enemyManager.scene.tweens.createTimeline(null);
        timeline.add({
            targets: e.inner,
            scale: scale * 2,
            duration: 250,
        });
        timeline.add({
            targets: e.inner,
            scale: scale * 1,
            duration: 150,
        });
        timeline.play();
    }



    startLoopCreateNormal() {
        this.needLoopCreateNormal = true;        
        
        this.lastNormalTime = this.enemyManager.accTime;        
        this.freqNormal = normalFreq1 * 1000;
    }

    startLoopCreateBad() {
        this.needloopCeateBad = true;
        this.last404Time = this.enemyManager.accTime;
        this.freq404 = 6 * 1000;
    }

    onUpdate(time ,dt) {
        if(this.isPause)
            return;
            
        if(this.needloopCeateBad &&  time - this.last404Time > this.freq404) {
            this.spawnBad();
            this.last404Time = time;
        }

        if(this.needLoopCreateNormal &&  time - this.lastNormalTime > this.freqNormal) {
            this.spawnNormal();
            this.lastNormalTime = time;
        }        

        this.typerAutoDamage(time ,dt);
    }



    enemyDisappear(enemy: Enemy, damagedBy: string) {        
        let clickerType = enemy.clickerType;
        if(clickerType == ClickerType.Bad) {
            this.badEliminatedCount++;  

            if(this.badCount < this.respawnAfterKilledThreshould) {
                setTimeout(()=>{
                    this.spawnBad();
                }, 500);                
            }
            else if(this.badCount == this.respawnAfterKilledThreshould) {
                this.startLoopCreateBad();
            }
        }
        else if(clickerType == ClickerType.BadFromNormal)  {
            
        }
    }

    

    enemyReachedCore(enemy: Enemy) {     
        this.enemyDisappear(enemy, null);
    }

    getAwardFor404() : number {
        let sc = getAwardFor404(this.badEliminatedCount);
        
        return sc;
    }

    getAwardForNormal() : number {
        return +1;
        // return -100 - this.normalNormalCount;
    }

    enemyEliminated(enemy: Enemy, damagedBy: string) {
        let clickerType = enemy.clickerType;
        if(clickerType == ClickerType.Bad || clickerType == ClickerType.BadFromNormal) {            
            let sc = this.getAwardFor404();
            (this.enemyManager.scene as Scene1).hud.addScore(sc, enemy);
        }
        else if(clickerType == ClickerType.Normal) {
            // by turn
            if(!isReservedTurnKeyword(damagedBy)) {
                let sc = this.getAwardForNormal();
                (this.enemyManager.scene as Scene1).hud.addScore(sc, enemy);
                this.normalNormalCount++;
            }
            // by match
            else {
                this.spawnBad({initPosi: enemy.initPosi, clickerType: ClickerType.BadFromNormal}, false);
                this.normalTurnedCount++;
            }
        }
        this.enemyDisappear(enemy, damagedBy);
    }

    inputSubmitted(input: string) {
        if(getCreatePropInfo().consumed && input == getCreateKeyword()) {
            this.sc1().centerObject.centerProgres.addProgress(initCreateStep);
        }
    }
}