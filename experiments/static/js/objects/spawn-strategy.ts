enum SpawnStrategyType{
    None,
    SpawnOnEliminatedAndReachCore,
    FlowTheory
}


class SpawnStrategy {
    enemyManager: EnemyManager;
    type: SpawnStrategyType;
    config: SpawnStrategyConfig = {};

    constructor(manager: EnemyManager, type: SpawnStrategyType, config: SpawnStrategyConfig) {        
        
        this.config = this.getInitConfig();
        this.enemyManager = manager;        
        this.type = type;
        this.updateConfig(config);
    }

    getInitConfig() : SpawnStrategyConfig {
        return {}
    }

    
    updateConfig(config: SpawnStrategyConfig) {
        if(notSet(config))
            return;

        for(let key in config) {            
            this.config[key] = config[key];            
        }
    }
   
    onEnter() {

    }

    onExit() {

    }

    onUpdate(time ,dt) {

    }

    enemyReachedCore(enemy: Enemy) {        
    }

    enemyEliminated(enemy: Enemy) {
    }

    enemySpawned(enemy: Enemy) {        
    }

    reset() {        
    }
}

class SpawnStrategyOnEliminatedAndReachCore extends SpawnStrategy {
    constructor(manager: EnemyManager, config?) {
        super(manager, SpawnStrategyType.SpawnOnEliminatedAndReachCore, config);
    }

    getInitConfig() : SpawnStrategyConfig {
        return {
            healthMin: 3,
            healthMax: 3,            
            health: 3,
            enemyDuration: 60,
        }
    }

    spawn() {
        let config = this.config;
        this.enemyManager.spawn({health:config.healthMin, duration: config.enemyDuration});
    }


    onEnter(){
        if(this.enemyManager.enemies.length == 0) {
            this.spawn();
        }
    }

    enemyReachedCore(enemy: Enemy) {     
        this.spawn();   
    }

    enemyEliminated(enemy: Enemy) {
        this.spawn();
    }
}


class SpawnStrategyFlowTheory extends SpawnStrategy {
    constructor(manager: EnemyManager, config?) {
        super(manager, SpawnStrategyType.FlowTheory, config);
    }
}
