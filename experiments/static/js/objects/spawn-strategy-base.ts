enum SpawnStrategyType{
    None,
    SpawnOnEliminatedAndReachCore,
    FlowTheory,
    RandomFlow,
    ClickerGame
}


/**
 * We have two level of configs
 * 1. SpawnStrategyConfig
 * 2. EnemyConfig
 * During the spawn, we are blending based on both 1. and 2.
 */
class SpawnStrategy {
    enemyManager: EnemyManager;
    type: SpawnStrategyType;
    config: SpawnStrategyConfig = {};
    
    isPause : boolean = false;

    needHandleRewardExclusively: boolean = false;

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
   
    pause(){
        this.isPause = true;
    }

    unPause() {
        this.isPause = false;
    }

    onEnter() {

    }

    onExit() {

    }

    onUpdate(time ,dt) {

    }

    inputSubmitted(input: string) {
        
    }

    enemyReachedCore(enemy: Enemy) {        
    }

    enemyEliminated(enemy: Enemy, damagedBy: string) {
    }

    enemySpawned(enemy: Enemy) {        
    }

    reset() {        
    }

    // blendSpawn(c: {}) {
    //     let empty:any = {};        
    //     updateObject(c, empty);
    //     updateObject(this.enemyManager.enemyConfig, empty);

        
    //     console.log("tyoeP  " + empty.type );
    //     this.enemyManager.spawn(empty);
    // }
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
        this.enemyManager.spawn({
            health:config.health, 
            duration: config.enemyDuration,
        });
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
        if(this.isPause) {
            return;
        }
        
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


class RandomFlow extends SpawnStrategyFlowTheory {
    constructor(manager: EnemyManager, config?) {
        super(manager, config);
        this.type = SpawnStrategyType.RandomFlow;
    }

    count: number = 0;

    spawn() {
        let config = this.config;
        
        let tempConfig:any | EnemyConfig = {enemyType: EnemyType.Image, health:config.health, duration: config.enemyDuration};
        
        tempConfig.rotation =  0
        tempConfig.needChange = true;


        // // default
        // if(this.count % 5 == 0)  {            
        //     tempConfig.rotation =  0
        //     tempConfig.needChange = true;
        // }
        // // rotation
        // if(this.count % 5 == 1 || this.count % 5 == 3)  {            
        //     tempConfig.rotation =  1000;
        //     tempConfig.needChange = true;
        // }        
        // // shake
        // if(this.count % 5 == 2)  {            
        //     tempConfig.rotation =  0;
        //     tempConfig.needShake = true;
        //     tempConfig.needChange = true;
        // }
        // // flicker
        // if(this.count % 5 == 4)  {            
        //     tempConfig.rotation =  0;
        //     tempConfig.needFlicker = true;
        //     tempConfig.needChange = true;
        // }
        this.enemyManager.spawn(tempConfig);
        this.count++;        
    }


}


