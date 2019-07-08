class EnemyManager {

    scene: BaseScene;
    container: Phaser.GameObjects.Container; // main scene container

    interval;
    dummy;

    enemies: Enemy[];
    labels;

    lblStyl: TextStyle;

    spawnTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;

    enemyRunDuration;
    spawnRadius;

    spawnHistory: SpawnHistoryItem[] = [];

    fsm: Fsm;

    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.interval = gameplayConfig.spawnInterval;
        this.dummy = 1;
        this.enemies = [];


        // this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];
        this.labels = figureNames;

        this.lblStyl = getDefaultTextStyle();

        this.enemyRunDuration = gameplayConfig.enemyDuratrion;
        this.spawnRadius = 500;

    }

    

    startSpawn() {
        this.spawnTween = this.scene.tweens.add({
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

    stopSpawn() {
        if(this.spawnTween)
            this.spawnTween.stop();
    }

    stopSpawnAndClear() {
        this.stopSpawn();

        // Must iterate from back
        // disolve will use slice to remove itself from the array
        for(let i = this.enemies.length - 1; i >=0; i--) {
            this.enemies[i].disolve();
        }

        // this.enemies.forEach(e=>{
        //     e.disolve();
        // });

        this.enemies.length = 0;
        this.spawnHistory.length = 0;
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

    spawn() {
        var posi = this.getSpawnPoint();
        var name = this.getNextName();

        this.insertSpawnHistory(posi, name);

        var figureName = name.split(' ').join('-').toLowerCase();
        // var enemy = new EnemyText(this.scene, this, posi, this.lblStyl, {
        //     type: EnemyType.Text,
        //     label: name
        // });

        var enemy = new EnemyImage(this.scene, this, posi, this.lblStyl, {
            type: EnemyType.Image,
            label: name,
            image: figureName
        });

        // console.log('-------------------------')
        this.enemies.forEach(item => {
            // console.log("item: " + item.lbl + " " + item.inner.x + " "+ item.inner.y + " "+ item.inner.alpha);
        });
        // console.log(this.enemies.length + "  name:" + name);

        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;
        enemy.startRun();
    }

    insertSpawnHistory(posi: PhPoint, name: string) {
        let rad = Math.atan2(posi.y, posi.x);
        let item: SpawnHistoryItem = {
            degree: rad,
            name: name
        };
        this.spawnHistory.push(item);
    }

    removeEnemy(enemy: Enemy) {
        for (let i in this.enemies) {
            if (this.enemies[i] == enemy) {
                this.enemies.splice(parseInt(i), 1);
            }
        }
    }

    update(time, dt) {
        dt = dt / 1000;
        var w = getLogicWidth();
        var h = phaserConfig.scale.height;

        for (let i in this.enemies) {
            this.enemies[i].update(time, dt);
        }


        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }

    getSpawnPoint(): Phaser.Geom.Point {
        var threshould = Math.PI / 2;
        var pt = new Phaser.Geom.Point(0, 0);

        var rdDegree = 0;
        while (true) {

            rdDegree = (Math.random() * 2 - 1) * Math.PI;
            pt.x = Math.cos(rdDegree) * this.spawnRadius;
            pt.y = Math.sin(rdDegree) * this.spawnRadius;

            if (this.spawnHistory.length == 0)
                break;

            var lastOne = this.spawnHistory[this.spawnHistory.length - 1];
            if (this.getAngleDiff(lastOne.degree, rdDegree) > threshould)
                break;
        }

        // console.log(rdDegree);
        return pt;
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
        this.scene.playSpeech(inputWord);

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
}