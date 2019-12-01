/// <reference path="spawn-strategy-base.ts" />

class SpawnStrategyClickerGame extends SpawnStrategy {
    constructor(manager: EnemyManager, config?) {
        super(manager, SpawnStrategyType.FlowTheory, config);
    }

    getInitConfig() : SpawnStrategyConfig {
        return {
            healthMin: 3,
            healthMax: 3,            
            health: 3,
            enemyDuration: 40000,
        }
    }

    spawnBad(extraConfig?: EnemyConfig) : Enemy {        
        let cg = {health:3, duration: 60000, label: '!@#$%^&*', clickerType: ClickerType.Bad};
        updateObject(extraConfig, cg);

        let ene = this.enemyManager.spawn(cg);        
        return ene;
    }

    spawnNormal(): Enemy {
        let ene = this.enemyManager.spawn({health:3, duration: 50000, clickerType: ClickerType.Normal});
        return ene;
    }
    
    onEnter(){
        this.spawnBad();
        this.spawnNormal();
        this.spawnNormal();
    }

    enemyDisappear(enemy: Enemy, damagedBy: string) {        
        let clickerType = enemy.clickerType;
        if(clickerType == ClickerType.Bad) {
            this.spawnBad();        
        }
        else if(clickerType == ClickerType.Normal) {
            // if the normal word is destroyed by a 'turn', respawn a bad word in the same direction
            if(isReservedTurnKeyword(damagedBy)) {
                this.spawnBad({initPosi: enemy.initPosi, clickerType: ClickerType.BadFromNormal});
            }            
            else {
                this.spawnNormal();
            }
        }  
        else if(clickerType == ClickerType.BadFromNormal)  {
            this.spawnNormal();
        }
    }

    enemyReachedCore(enemy: Enemy) {     
        this.enemyDisappear(enemy, null);
    }

    enemyEliminated(enemy: Enemy, damagedBy: string) {
        this.enemyDisappear(enemy, damagedBy);
    }
}