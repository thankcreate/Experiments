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

    spawnBad() : Enemy {        
        let ene = this.enemyManager.spawn({health:3, duration: 60000, label: '!@#$%^&*', clickerType: ClickerType.Bad});        
        return ene;
    }

    spawnNormal(): Enemy {
        let ene = this.enemyManager.spawn({health:3, duration: 1500, clickerType: ClickerType.Normal});
        return ene;
    }
    
    onEnter(){
        this.spawnBad();
        this.spawnNormal();
        this.spawnNormal();
    }

    enemyDisappear(enemy: Enemy) {
        console.log('dis');        
        let clickerType = enemy.clickerType;
        if(clickerType == ClickerType.Bad) {
            this.spawnBad();
            console.log('ss');
        }
        else if(clickerType == ClickerType.Normal) {
            this.spawnNormal();
        }   
    }

    enemyReachedCore(enemy: Enemy) {     
        this.enemyDisappear(enemy);
    }

    enemyEliminated(enemy: Enemy) {
        this.enemyDisappear(enemy);
    }
}