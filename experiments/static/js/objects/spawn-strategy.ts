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

var gSpawnStrategyOnEliminatedAndReachCoreIndex = 0;
class SpawnStrategyOnEliminatedAndReachCore extends SpawnStrategy {
    constructor(manager: EnemyManager, config?) {
        super(manager, SpawnStrategyType.SpawnOnEliminatedAndReachCore, config);
    }

    getInitConfig() : SpawnStrategyConfig {
        return {
            healthMin: 3,
            healthMax: 3,            
            health: 3,
            enemyDuration: 60000,
        }
    }

    spawn() {
        gSpawnStrategyOnEliminatedAndReachCoreIndex++;
        let config = this.config;
        // if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 1)
        // this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Bush'});
        // else if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 2)
        //     this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Bottlecap'});
        // else if(gSpawnStrategyOnEliminatedAndReachCoreIndex== 3)
        //     this.enemyManager.spawn({health:config.health, duration: config.enemyDuration, label: 'Camera'});            
        // else
            this.enemyManager.spawn({health:config.health, duration: config.enemyDuration});
        
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

    getInitConfig() : SpawnStrategyConfig {
        return {
            healthMin: 3,
            healthMax: 3,            
            health: 3,
            enemyDuration: 40000,
        }
    }

    spawn() {
        let config = this.config;
        this.enemyManager.spawn({health:config.health, duration: config.enemyDuration});
    }


    getInterval() : number {
        let history = this.enemyManager.omniHistory;
        let n = history.length;

        let sumLife = 0
        let avaiCount = 0;
        let killedCount = 0;
        for(let i = 0; i < n ; i++) {
            let item = history[i];
            let killedTime = item.killedTime;
            let spawnTime = item.time;
            if(killedTime === undefined || item.eliminated === undefined) {
                continue; 
            }

            if(item.eliminated === true) {
                killedCount++;
            }
            
            let duration = killedTime - spawnTime;
            if(duration <= 0)
                continue

            avaiCount++;
            sumLife += duration;
            if(item.eliminated === false) {
                sumLife += 1;
            }
        }
        
        let average = sumLife  / avaiCount;
        let adjusted = average * 0.7;

        if(killedCount >= 4)

        adjusted *= 0.8;

        if(killedCount >= 8)
        adjusted *= 0.9;


        if(avaiCount == 0) {
            return 8000;
        }
        else {
            return adjusted;
        }
    }

    onEnter(){
        // console.log('flow entered');
    }

    

    onUpdate(time, dt) {
        
        let lastSpawnTime = -1000;
        let historyLength = this.enemyManager.omniHistory.length;
        if(historyLength > 0) {
            lastSpawnTime =this.enemyManager.omniHistory[historyLength - 1].time;
        }
    
        let currentEnemies = this.enemyManager.enemies.length;
        let minEnemies = 2;
        let enemiesNeedSpawn = Math.max(0, minEnemies - currentEnemies);
        if(enemiesNeedSpawn > 0) {
            for(let i = 0; i < enemiesNeedSpawn; i++) {
                this.spawn();
            }
        }        
        else {
            let timeSinceLastSpawn = time - lastSpawnTime;
            let interval = this.getInterval();
            if(timeSinceLastSpawn > interval) {                
                this.spawn();
            }     
        }
        
              
        
    }
}
