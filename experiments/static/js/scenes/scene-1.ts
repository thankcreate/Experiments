
class Scene1 extends BaseScene {

    enemyManager: EnemyManager;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);

    }


    
    createContainerMain() {
        super.createContainerMain();
        // Enemies
        this.enemyManager = new EnemyManager(this, this.container);
    }


    postCreate() {
        super.postCreate();
        this.centerObject.playerInputText.confirmedEvent.on(
            input => {
                this.enemyManager.inputTextConfirmed(input)
            }
        );

        // Add confirmed listener for confirmedEvent to enemyManager
        this.centerObject.playerInputText.confirmedEvent.on(
            input => {                
                this.time.delayedCall(300, () => {
                    this.dwitterBKG.next();
                }, null, null);
        });
    }
    
    update(time, dt) {
        super.update(time, dt);

        this.curTime =  time;
        dt = dt / 1000;
        
        this.enemyManager.update(time, dt);
    }

    sceneIntoNormalGame(s) {
        super.sceneIntoNormalGame(s);
          // Damage handling, only in normal mode
        if (this.mode == GameMode.Normal) {
            s.autoOn(this.enemyManager.enemyReachedCoreEvent, null, e => {
                let enemy = <Enemy>e;
                this.hp.damageBy(enemy.health);
            });
        }
    }

    sceneEnterDied(s, result, resolve, reject) {
        super.sceneEnterDied(s, result, resolve, reject);
        this.enemyManager.freezeAllEnemies();        
    }    

    sceneExitDied() {
        super.sceneExitDied();
        this.enemyManager.stopSpawnAndClear();        
    }


    scenePrepareBackToHome() {
        super.scenePrepareBackToHome();
        this.enemyManager.stopSpawnAndClear();
    }


    pauseInner(title?: string, alpha?: number) {
        super.pauseInner(title, alpha);
        this.enemyManager.freezeAllEnemies();        
    }


    unPauseInnner() {
        super.unPauseInnner();
        this.enemyManager.unFreezeAllEnemies();
    }
    
}