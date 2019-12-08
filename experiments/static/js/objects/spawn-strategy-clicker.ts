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

    curBadHealth: number = 2;
    incAndGetBadHealth() :number {
        if(this.badEliminatedCount < 4) {
            this.curBadHealth = ++this.curBadHealth;
        }
        else {
            this.curBadHealth *= 1.1;
            this.curBadHealth = Math.ceil(this.curBadHealth);            
        }

        
        return this.curBadHealth;
    }

    lastAutoTypeTime = -1;    
    autoTypeInterval = 1 * 1000;

    lastAutoTurnTime = -1;
    autoTurnInterval = 1 * 1000;


    typerAutoDamage(time ,dt) {
        // auto damage to 404
        if(badInfos[0].consumed) {            
            let dpsSum = 0;
            for(let i = 0; i < badInfos.length; i++) {
                if(badInfos[i].consumed)
                    dpsSum += badInfos[i].damage;
            }
            for(let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if(e.isSensative()) {
                    e.damageInner(dpsSum * dt, badInfos[0].title);
                }
            }
        }

        // auto damage to real word
        if(getAutoTurnInfo().consumed) {
            let dpsSum = turnInfos[0].damage;
            for(let i in this.enemyManager.enemies) {
                let e = this.enemyManager.enemies[i];
                if(!e.isSensative()) {
                    e.damageInner(dpsSum * dt, turnInfos[0].title);
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
        return this.normalTurnedCount + 3;
    }

    spawnNormal(): Enemy {
        let health = this.getNormalHelath();
        let ene = this.enemyManager.spawn({health:health, duration: 70000, clickerType: ClickerType.Normal});
        return ene;
    }
    
    onEnter(){
        this.spawnBad();
        this.spawnBad();
        this.spawnNormal();
        this.spawnNormal();
        this.startLoopCreateNormal();
    }



    startLoopCreateNormal() {
        this.needLoopCreateNormal = true;        
        
        this.lastNormalTime = (this.enemyManager.scene as Scene1).curTime;        
        this.freqNormal = normalFreq1 * 1000;
    }

    startLoopCreateBad() {
        this.needloopCeateBad = true;
        this.last404Time = (this.enemyManager.scene as Scene1).curTime;
        this.freq404 = 6 * 1000;
    }

    onUpdate(time ,dt) {
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
                this.spawnBad();
            }
            else if(this.badCount == this.respawnAfterKilledThreshould) {
                this.startLoopCreateBad();
            }
        }
        else if(clickerType == ClickerType.Normal) {            
            // if the normal word is destroyed by a 'turn', respawn a bad word in the same direction
            if(isReservedTurnKeyword(damagedBy)) {
                this.spawnBad({initPosi: enemy.initPosi, clickerType: ClickerType.BadFromNormal}, false);
                this.normalTurnedCount++;
            }            
            else {
                this.normalNormalCount++;
            }
        }  
        else if(clickerType == ClickerType.BadFromNormal)  {
            
        }
    }

    enemyReachedCore(enemy: Enemy) {     
        this.enemyDisappear(enemy, null);
    }

    getAwardFor404() : number {
        let sc = Math.floor(baseScore * Math.pow(1.1, this.badEliminatedCount));
        return sc;
    }

    getAwardForNormal() : number {
        return 1 - this.normalNormalCount;
    }

    enemyEliminated(enemy: Enemy, damagedBy: string) {
        let clickerType = enemy.clickerType;
        if(clickerType == ClickerType.Bad || clickerType == ClickerType.BadFromNormal) {            
            let sc = this.getAwardFor404();
            (this.enemyManager.scene as Scene1).hud.addScore(sc);
        }
        else if(clickerType == ClickerType.Normal) {
            if(!isReservedTurnKeyword(damagedBy)) {
                let sc = this.getAwardForNormal();
                (this.enemyManager.scene as Scene1).hud.addScore(sc);
            }
        }
        this.enemyDisappear(enemy, damagedBy);
    }
}