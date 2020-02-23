
class Scene1 extends BaseScene {

    enemyManager: EnemyManager;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {     
        super(config);

    }

    preload() {
        super.preload();
        this.load.image('circle', 'assets/circle.png');
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

        // Hide title and show speaker dots
        this.centerObject.prepareToGame();

        // Player input
        s.autoOn($(document), 'keypress', this.centerObject.playerInputText.keypress.bind(this.centerObject.playerInputText));
        s.autoOn($(document), 'keydown', this.centerObject.playerInputText.keydown.bind(this.centerObject.playerInputText));

        // Dead event handling
        s.autoOn(this.hp.deadEvent, null, e => {
            s.event("DIED");
        })

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
    

    sceneAddFirstMeetGreetingActinos(s: FsmState) :FsmState {
        s.addSubtitleAction(this.subtitle, "God! Someone finds me finally!", true)        
        .addSubtitleAction(this.subtitle, "This is terminal 65536.\nNice to meet you, human", true)
        .addSubtitleAction(this.subtitle, "May I know your name, please?", false).finishImmediatly()
        return s;
    }

    getOriginalTitle() {
        return 'Project 65536';
    }

    getChangedToTitle() {
        return 'Project 65536'
    }

    sceneHomeTogameAnimation(s: FsmState): FsmState{
        super.sceneHomeTogameAnimation(s);
        let dt = 1000;
        s.addTweenAllAction(this, [
            // Rotate center to normal angle
            {
                targets: this.centerObject.inner,
                rotation: 0,
                scale: this.centerObject.gameScale,
                duration: dt,
            },
            // Scale out the outter dwitter
            {
                targets: this.dwitterCenter.inner,
                alpha: 0,
                scale: 2,
                duration: dt,
            },
        ])
        return s;
    }
}