
interface SpawnStrategyConfig {
    interval?: number,
    healthMin?: number,
    healthMax?: number,
    health?: number,
    enemyDuration?: number
} 

var gEnemyID = 0
class EnemyManager {

    scene: BaseScene;
    inner: Phaser.GameObjects.Container; // main scene container

    interval;
    dummy;

    enemies: Enemy[];
    labels;

    lblStyl: TextStyle;

    autoSpawnTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;

    enemyRunDuration;
    spawnRadius;


    /**
     * At first, it's call spawn history,\
     * but later on, I think I should also add the time info
     * about when the enemy is killed for use in the strategy.
     * So, I change the name to omni
     */
    omniHistory: OmniHistoryItem[] = [];
       
    enemyReachedCoreEvent: TypedEvent<Enemy> = new TypedEvent();
    enemyEliminatedEvent: TypedEvent<Enemy> = new TypedEvent();

    curStrategy: SpawnStrategy;

    strategies: Map<SpawnStrategyType, SpawnStrategy> = new Map();;
    
    constructor(scene, parentContainer) {
        this.scene = scene;
        this.inner = this.scene.add.container(0, 0);
        parentContainer.add(this.inner);


        this.interval = gameplayConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];


        // this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.labels = figureNames;

        this.lblStyl = getDefaultTextStyle();

        this.enemyRunDuration = gameplayConfig.enemyDuratrion;
        this.spawnRadius = 500;

        this.strategies.set(SpawnStrategyType.SpawnOnEliminatedAndReachCore, new SpawnStrategyOnEliminatedAndReachCore(this));
        this.strategies.set(SpawnStrategyType.FlowTheory, new SpawnStrategyFlowTheory(this));
        this.strategies.set(SpawnStrategyType.RandomFlow, new RandomFlow(this));
        this.strategies.set(SpawnStrategyType.None, new SpawnStrategy(this, SpawnStrategyType.None, {}));
    }

    

    startSpawnStrategy(strategy: SpawnStrategyType, config?:SpawnStrategyConfig) {       
        if(this.curStrategy)
            this.curStrategy.onExit();

        this.curStrategy = this.strategies.get(strategy);
        this.curStrategy.updateConfig(config);

        if(this.curStrategy)
            this.curStrategy.onEnter();
    }
   

    startAutoSpawn() {
        this.autoSpawnTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,
            onStart: () => {
                // console.log('onstart');
                this.spawn();
            },
            onRepeat: () => {
                this.spawn();
            },
            repeat: -1
        });
    }

    stopAutoSpawn() {
        if (this.autoSpawnTween)
            this.autoSpawnTween.stop();
    }

    resetAllStrateges() {
        this.strategies.forEach((value, key, map) => {
            value.reset();
        })
    }

    stopSpawnAndClear() {
        this.stopAutoSpawn();

        this.resetAllStrateges();
        this.curStrategy = null;

        // Must iterate from back
        // disolve will use slice to remove itself from the array
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].disolve();
        }

        // this.enemies.forEach(e=>{
        //     e.disolve();
        // });

        this.enemies.length = 0;
        this.omniHistory.length = 0;
    }

    getNextName(): string {
        let ret: string = "";
        // max try count
        let maxTry = 100;
        for (let i = 0; i < maxTry; i++) {
            var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
            var name = this.labels[lblIndex];

            if (gameplayConfig.tryAvoidDuplicate) {
                var contains = false;
                this.enemies.forEach(enemy => {
                    if (enemy.lbl.toLocaleLowerCase() === name.toLocaleLowerCase()) {
                        contains = true;
                    }
                })
                if (!contains) {
                    ret = name;
                    break;
                }
            }
            else {
                ret = name;
                break;
            }

        }
        return ret[0].toUpperCase() + ret.substring(1, ret.length);
    }
    
    
    spawn(config?: EnemyConfig) : Enemy {

        if(notSet(config))
            config = {};

        if(notSet(config.type)) config.type = EnemyType.TextWithImage;
        if(notSet(config.label)) config.label = this.getNextName();      
        if(notSet(config.duration)) config.duration = gameplayConfig.enemyDuratrion;        
        if(notSet(config.health)) config.health = gameplayConfig.defaultHealth;       


        var name = config.label;

        var figureName = name.split(' ').join('-').toLowerCase();
        if(notSet(config.image)) config.image = figureName;
        
        var posi = this.getSpawnPoint();
        var tm = getGame().getTime();
        var id = gEnemyID++;
        this.insertSpawnHistory(id, posi, name, tm);


        // var enemy = new EnemyText(this.scene, this, posi, this.lblStyl, {
        //     type: EnemyType.Text,
        //     label: name
        // });


        let enemy : Enemy;
        // by deafult is TextWithImage
        //if(config.type == EnemyType.TextWithImage) {
            enemy = new EnemyImage(this.scene, this, posi, this.lblStyl, config);            
            var ei = enemy as EnemyImage;     
        // }
        

        enemy.id = id;

        // console.log('-------------------------')
        this.enemies.forEach(item => {
            // console.log("item: " + item.lbl + " " + item.inner.x + " "+ item.inner.y + " "+ item.inner.alpha);
        });
        // console.log(this.enemies.length + "  name:" + name);

        this.enemies.push(enemy);
        enemy.startRun();

        if(this.curStrategy)
            this.curStrategy.enemySpawned(enemy);
        return enemy;
    }

    insertSpawnHistory(id: number, posi: PhPoint, name: string, time: number) {
        let rad = Math.atan2(posi.y, posi.x);
        let item: OmniHistoryItem = {
            id: id,
            degree: rad,
            name: name,
            time: time,            
        };
        this.omniHistory.push(item);
    }

    removeEnemy(enemy: Enemy) {
        for (let i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    }


    update(time, dt) {

        // dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        for (let i in this.enemies) {
            this.enemies[i].update(time, dt);
        }

        if(this.curStrategy)
            this.curStrategy.onUpdate(time, dt);

        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }

    getSpawnPoint(): Phaser.Geom.Point {

        var pt = new Phaser.Geom.Point(0, 0);

        var rdDegree = 0;

        let tryTime = 50;
        while (true) {
            tryTime++;
            rdDegree = (Math.random() * 2 - 1) * Math.PI;
            pt.x = Math.cos(rdDegree) * this.spawnRadius;
            pt.y = Math.sin(rdDegree) * this.spawnRadius;

            let notBottom = this.notInBottomZone(rdDegree);
            let valid = this.isValidDegree(rdDegree);

            if(!notBottom)
                continue;

            if(valid)
                break;
            
            if(tryTime > 50)
                break;
        }

        // console.log(rdDegree);
        return pt;
    }

    notInBottomZone(rdDegree: number) : boolean {
        var subtitleRestrictedAngle = Math.PI / 3 * 2;     
        let notInSubtitleZone = !(rdDegree > Math.PI / 2 - subtitleRestrictedAngle / 2 && rdDegree < Math.PI / 2 + subtitleRestrictedAngle / 2);
        return notInSubtitleZone;
    }

    isValidDegree(rdDegree: number): boolean {      

        var threshould = Math.PI / 2;
        

        let farEnoughFromLastOne = false;        
        if (this.omniHistory.length == 0)
            farEnoughFromLastOne = true;
        else {
            var lastOne = this.omniHistory[this.omniHistory.length - 1];
            farEnoughFromLastOne = this.getAngleDiff(lastOne.degree, rdDegree) > threshould;
        }

        let min = 1000;
        for(let i in this.omniHistory) {
            let iter = this.omniHistory[i];
            let clamp = this.getAngleDiff(iter.degree, rdDegree);
            if(clamp < min) {
                min = clamp;
            }
        }
        // console.log("min " + min);
        let farEnoughFromEvery = min > (Math.PI / 3);


        return farEnoughFromLastOne && farEnoughFromEvery; 
    }

    getAngleDiff(angl1: number, angle2: number): number {
        let diff1 = Math.abs(angl1 - angle2);
        let diff2 = Math.PI * 2 - diff1;
        return Math.min(diff1, diff2);
    }

    // inputConfirm(input: string) {
    //     var enemies = this.enemies;        
    //     var inputWord = input;

    //     let checkLegal : ErrorInputCode = this.checkIfInputLegalAlone(inputWord);
    //     if(checkLegal == ErrorInputCode.NoError) {
    //         this.sendInputToServer(inputWord);
    //     }
    //     else {
    //         console.log("ErrorInputCode before send: " + checkLegal);
    //     }
    // }

    sendInputToServer(inputWord: string) {
        // this.scene.playSpeech(inputWord);
        if(notSet(this.enemies) || this.enemies.length == 0)
            return;

        var enemyLabels = [];
        for (let i in this.enemies) {
            var enemy = this.enemies[i];
            enemyLabels.push(enemy.lbl);
        }

        api3WithTwoParams(inputWord, enemyLabels,
            // suc
            res => {
                // console.log(res);
                this.confirmCallbackSuc(res);
            },
            // err
            function err(res) {
                // console.log("API3 failed");
            }
        );
    }

    // api3 callback
    confirmCallbackSuc(res: SimResult) {
        var ar = res.outputArray;
        var input = res.input;


        // filter the duplicate labels
        var seen = {};
        ar = ar.filter(item => {
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        let legal = true;
        // if we only want to damage the most similar word
        if (gameplayConfig.onlyDamageMostMatch) {
            ar = this.findBiggestDamage(ar);
        }

        for (let i in ar) {
            let entry = ar[i];
            let entryName = ar[i].name;
            let entryValue = ar[i].value;

            // since network has latency, 
            // the enemy could have been eliminated when the callback is invoked
            // we need to be careful about the availability of the enemy
            let enemiesWithName = this.findEnemyByName(entryName);
            enemiesWithName.forEach(e => {
                e.damage(entryValue, input);
            });
        }
    }



    findBiggestDamage(ar: SimResultItem[]): SimResultItem[] {
        let ret = [];
        let max = -1;
        let entry = null;
        ar.forEach(element => {
            if (element.value > max) {
                max = element.value;
                entry = element;
            }
        });

        if (entry)
            ret.push(entry);

        return ret;
    }

    // haha
    findEnemyByName(name: string): Enemy[] {

        let ret = [];
        for (let i in this.enemies) {
            let e = this.enemies[i];
            if (e.lbl === name) {
                ret.push(e);
            }
        }
        return ret;
    }


    /**
     * PlayerInputTextListener interface implement
     * @param input 
     */
    inputTextConfirmed(input: string): void {
        this.sendInputToServer(input);
    }


    updateTheKilledTimeHistoryForEnemy(enemy: Enemy, eliminated: boolean) {
        this.omniHistory.forEach(v=>{
            if(v.id === enemy.id) {
                v.killedTime = getGame().getTime(); 
                v.eliminated = eliminated;
            }
        })
    }

    enemyReachedCore(enemy: Enemy) {
        // Acturally, I don't think health could be <= 0
        // this is just for safe in case it happens
        if(enemy.health <= 0)
            return;
        
        // killed time is undefined by default
        // if player failed to kill it, set the value to negative
        this.updateTheKilledTimeHistoryForEnemy(enemy, false);
        
        if(this.curStrategy)
            this.curStrategy.enemyReachedCore(enemy);
        
        this.enemyReachedCoreEvent.emit(enemy);
    }

    enemyEliminated(enemy: Enemy) {
        this.updateTheKilledTimeHistoryForEnemy(enemy, true);

        if(this.curStrategy)
            this.curStrategy.enemyEliminated(enemy);

        this.enemyEliminatedEvent.emit(enemy);
    }

    // This is mostly used when died
    freezeAllEnemies() {
        if(this.autoSpawnTween)
            this.autoSpawnTween.pause();
        
        this.startSpawnStrategy(SpawnStrategyType.None);

        this.enemies.forEach(element => {
            element.freeze();
        });
    }

    getLastSpawnedEnemyName() {
        if(this.omniHistory.length == 0) {
            return '';
        }

        return this.omniHistory[this.omniHistory.length - 1].name;
    }

    // acturally, this is not the 'last'
    // it's more like the first created among the eliminated ones
    getLastEliminatedEnemyInfo() : OmniHistoryItem {       

        for(let i in this.omniHistory) {
            let e = this.omniHistory[i];            
            if(e.eliminated === true)
                return e;
        }


        return null;
    }
    

    changeAllEnemies() {
        for(let i in this.enemies) {
            (this.enemies[i] as EnemyImage).figure.change();
        }
    }

}