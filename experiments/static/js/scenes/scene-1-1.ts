/// <reference path="scene-1.ts" />
class Scene1L1 extends Scene1 {
    constructor() {
        super('Scene1L1');

    }

    create() {
        super.create();
        // console.log('print');
        // console.log(getCookie('name'));
        // setCookie("name", "TronTron");
       

        this.initNormalGameFsm();
        this.initZenFsm();

        this.hp.initMaxHealth(10);
    }


    // ----------------------------------------------------------------------    
    initNormalGameFsm() {
        this.initStNormalDefault();
        this.initStTutorialStart();
        this.initStExplainHp();
        this.initStFlowStrategy();
        this.initStNormalStart();
        this.initStStory0();
        this.initStStory1();

        this.updateObjects.push(this.normalGameFsm);
    }

    initStNormalDefault() {
        let state = this.normalGameFsm.getState("Default");
    }

    initStTutorialStart() {
        let state = this.normalGameFsm.getState("TutorialStart");

        // Invoke EXPLAIN_HP need 2 requirements(&&):
        // 1. One enemy is eliminated
        // 2. Welcome subitle is finished
        state.setUnionEvent('EXPLAIN_HP', 2);

        state
            .addAction(s => {
                let health = 3;
                let duration = 50000;
                // let health = 100;
                // let duration = 1000;

                this.enemyManager.startSpawnStrategy(
                    SpawnStrategyType.SpawnOnEliminatedAndReachCore,
                    { enemyDuration: duration, health: health })

                s.autoOn(this.enemyManager.enemyEliminatedEvent, null, e => {
                    s.unionEvent('EXPLAIN_HP', 'one_enemy_eliminated');
                });
            })
            .addDelayAction(this, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "To help me complete the experiment,\njust type in what's in your mind when you see the " + lastEnemyName.toLocaleLowerCase();
            }, true, 2500, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Come on, " + this.playerName + "! Type in anything.\nAnything you think that's related.";
            }, false, 2500, 3000, 1000)
            .addAction(s => {
                s.unionEvent('EXPLAIN_HP', 'subtitle_finished');
            })
    }

    initStExplainHp() {
        let state = this.normalGameFsm.getState('ExplainHp');
        state
            .addDelayAction(this, 300)
            .addSubtitleAction(this.subtitle, s => {
                let last = this.enemyManager.getLastEliminatedEnemyInfo();
                let str = "Great, you've just got your first blood.";
                // console.log(last);
                // console.log(last.damagedBy);
                if (last && last.damagedBy && last.damagedBy.length > 0) {
                    let enemyName = last.name.toLowerCase();
                    let length = last.damagedBy.length;
                    if (length == 1)
                        str += ("\nOf course! " + last.damagedBy[0] + " can match " + enemyName);
                    else
                        str += ("\nOf course! " + last.damagedBy[0] + ' and ' + last.damagedBy[1].toLowerCase() + " can match " + enemyName);
                }
                return str;
            }, true, 2500, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "You may have noticed the number under every item.\n It represents the health of them.";
            }, true, 2500, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "The more semantically related your input is to the items,\nthe more damage they will take.";
            }, true, 2500, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "If you don't eliminate them before they reach me,\nyou'll lose your HP by their remaining health.";
            }, true, 2500, 3000, 600)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Pretty simple, huh?";
            }, true, 2500, 3000, 600)
            .addDelayAction(this, 9000)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "It's either you hurt them, or they hurt you.\nThat's the law of the jungle.";
            }, true, 2500, 3000, 600)
            .addDelayAction(this, 500)
            .addSubtitleAction(this.subtitle, s => {
                let lastEnemyName = this.enemyManager.getLastSpawnedEnemyName();
                return "Hurt each other! Yeah! I like it.";
            }, true, 2500, 3000, 600)
            .addEventAction("TO_FLOW_STRATEGY");
    }

    initStFlowStrategy() {
        let state = this.normalGameFsm.getState('FlowStrategy');
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            // TODO: here should have a better condition to get to next story state instead of just waiting 5s            
            .addDelayAction(this, 6000)
            .addFinishAction();  // -< here finish means goto story0
    }

    // Normal Start may come from a die or from home
    // If it's from die, we need add a different subtitle
    initStNormalStart() {
        let state = this.normalGameFsm.getState('NormalStart');
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            .addDelayAction(this, 1500)
            .addSubtitleAction(this.subtitle, s => {
                if (this.entryPoint === EntryPoint.FromDie)
                    return "Calm down, " + this.playerName + ". Let's do it again.\n You have to help me."
                else
                    return "I just knew it, " + this.playerName + "! You're not gonna leave. Haha";
            }, true, 2000, 3000, 1500)
            .addDelayAction(this, 3)
            .addFinishAction();
    }

    initStStory0() {
        let state = this.normalGameFsm.getState('Story0');
        state
            .addAction(state => { }).setBoolCondition(s => this.getCounter(Counter.Story0Finished) === 0, false)  // <---- reject if story0 has finished
            .addSubtitleAction(this.subtitle, s => {
                return "Okay, I know that this experiment is a bit boring.\n"
            }, true, 2000, 3000, 200)
            .addSubtitleAction(this.subtitle, s => {
                return "But I have my reasons.\nIt's just I can't tell you right now."
            }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                return "How about you help me eliminate 65536 more enemies,\nand I tell you the secret of the universe as a reward?"
            }, false, 2000, 3000, 1500)
            .addDelayAction(this, 2000)
            .addSubtitleAction(this.subtitle, s => {
                return "What do you think? " + this.playerName + ". Think about it.";
            }, true, 2000, 3000, 2000)
            .addSubtitleAction(this.subtitle, s => {
                return "Yes? No?\nAre you still there?"
            }, true, 2000, 3000, 300)
            .addSubtitleAction(this.subtitle, s => {
                return "Oh! Sorry, " + this.playerName + "! I forgot to say that you could\n just talk to me by typing.\nYes, or no?"
            }, false, 2000, 3000, 1).finishImmediatly()
            .addAction((s, result, resolve, reject) => {
                s.autoOn(this.centerObject.playerInputText.confirmedEvent, null, o => {
                    // this.overlay.showBlack();    
                    let wd = o.toLowerCase();
                    if (wd == "yes" || wd == 'no')
                        resolve(wd);
                })
            })
            // .addAction(()=>{
            //     this.subtitle.wrappedObject.setColor('#ffffff');
            // })
            // TODO here should move counter here, and change wd===yes to getVar() way
            .addSubtitleAction(this.subtitle, (s, wd) => {
                if (wd === 'yes') {
                    s.fsm.setVar('answer', true);
                    return "Good!"
                }
                else if (wd === 'no') {
                    s.fsm.setVar('answer', false);
                    return "No? really? I hope you know what you're doing.\nAnyway, have fun!"
                }
            }, true, 2000, 3000, 1000)
            .addAction(o => { this.addCounter(Counter.Story0Finished) })
            .addAction(s => {
                // let an = s.fsm.getVar('answer', false);
                // if (!an) {
                //     this.backBtn.clickedEvent.emit(this.backBtn);
                // }

                // ignore for the demo
                this.getController().gotoNextScene();
            })
            .addFinishAction().setFinally();
    }

    initStStory1() {
        let state = this.normalGameFsm.getState('Story1');
        state.addAction((s) => {
            // console.log('hahaha, story1');
        })

    }


    initZenFsm() {
        this.initStZenStart();
        this.initStZenIntro();
        this.updateObjects.push(this.zenFsm);
    }

    initStZenStart() {
        let state = this.zenFsm.getState("ZenStart");
        state
            .addAction(s => {
                this.enemyManager.startSpawnStrategy(SpawnStrategyType.FlowTheory);
            })
            .addDelayAction(this, 1500)
            .addAction(s => {
                if (this.firstIntoZenMode()) {
                    s.event('TO_FIRST_INTRODUCTION');
                }
            })
    }

    initStZenIntro() {
        let state = this.zenFsm.getState("ZenIntro");
        state
            .addSubtitleAction(this.subtitle, s => {
                return "Interesting!"
            }, true, 2000, 3000, 500)
            .addSubtitleAction(this.subtitle, s => {
                return "Wow, I never expect that someone would really choose the Zen mode."
            }, true, 2000, 3000, 1000)
            .addSubtitleAction(this.subtitle, s => {
                return "No wonder they call you " + this.playerName + ".\nI begin to wonder who you really are."
            }, true, 2000, 3000, 1500)
            .addSubtitleAction(this.subtitle, s => {
                return "We have plenty of time. Just enjoy yourself, please."
            }, true, 2000, 3000, 1500)
    }

}