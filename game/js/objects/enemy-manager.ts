
class EnemyManager {
    scene: Phaser.Scene;
    container: Phaser.GameObjects.Container; // main scene container

    interval;
    dummy;

    enemies: Enemy[];
    labels;

    lblStyl;

    spawnTween: Phaser.Tweens.Tween;
    fadeTween: Phaser.Tweens.Tween;

    enemyRunDuration;
    spawnRadius;

    constructor(scene, container) {
        this.scene = scene;
        this.container = container;

        this.interval = gameConfig.spawnInterval;
        this.dummy = 1;

        this.enemies = [];


        this.labels = ["Toothbrush", "Hamburger", "Hotel", "Teacher", "Paper", "Basketball", "Frozen", "Scissors", "Shoe"];

        this.lblStyl = {
            fontSize: '32px',
            fill: '#000000', fontFamily: "'Averia Serif Libre', Georgia, serif"
        };

        this.enemyRunDuration = gameConfig.enemyDuratrion;
        this.spawnRadius = 500;
    }

    startSpawn() {
        this.spawnTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,

            onStart: () => {
                this.spawn();
            },

            onRepeat: () => {
                this.spawn();
            },

            repeat: -1
        });
    }

    getNextName() : string{
        let ret;
        // max try count
        let maxTry = 100;
        for(let i = 0; i < maxTry; i++) {
            var lblIndex = Phaser.Math.Between(0, this.labels.length - 1);
            var name = this.labels[lblIndex];            

            if(gameConfig.tryAvoidDuplicate) {
                var contains = false;
                this.enemies.forEach(enemy =>{
                    if(enemy.lbl === name) {
                        contains = true;
                    }                
                })    
                if(!contains) {
                    ret = name;
                    break;
                }
            }
            else {
                ret = name;
                break;
            }
            
        }       
        return ret;
    }

    spawn() {

        var posi = this.getSpawnPoint();
        var name = this.getNextName();
        var enemy = new Enemy(this.scene, this, posi, name, this.lblStyl);

        this.enemies.push(enemy);
        enemy.duration = this.enemyRunDuration;

        enemy.startRun();
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
            this.enemies[i].update(dt);
        }
        

        // console.log("Enemy count:" + this.enemies.length);
        // console.log("Children count: " + this.container.getAll().length);
    }

    getSpawnPoint() {
        var pt = new Phaser.Geom.Point(0, 0);
        var rdDegree = Phaser.Math.Between(0, 365) / 360 * 2 * Math.PI;
        pt.x = Math.cos(rdDegree) * this.spawnRadius;
        pt.y = Math.sin(rdDegree) * this.spawnRadius;

        return pt;
    }

    // api3 callback
    confirmCallbackSuc(res) {
        var ar = res.outputArray;

        // filter the duplicate labels
        var seen = {};        
        ar = ar.filter(item => {                        
            return seen.hasOwnProperty(item.name) ? false : (seen[item.name] = true);
        });

        // if we only want to damage the most similar word
        if(gameConfig.onlyDamageMostMatch) {
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
            enemiesWithName.forEach(e =>{
                e.damage(entryValue);
            });
        }
    }

    findBiggestDamage(ar) : any[] {
        let ret = [];        
        let max = -1;        
        let entry = null;
        ar.forEach(element => {
            if(element.value > max) {                
                max = element.value;
                entry = element;
            }
        });
        
        if(entry)
            ret.push(entry);

        return ret;
    }

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

}