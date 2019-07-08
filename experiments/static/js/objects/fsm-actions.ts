/// <reference path="fsm.ts" />
var TweenPromise = {
    create: function (scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any) {        
        let tp = new Promise(res => {
            config.onComplete = res;
            let centerRotateTween = scene.tweens.add(config);
        });
        return tp;        
    }
}


interface FsmState {
    addDelayAction(scene: PhScene, dt: number);
    addTweenAction(scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any);
}

FsmState.prototype.addDelayAction = function(scene: PhScene, dt: number) {    
    this.addAction((state, result, resolve, reject) => {
        scene.time.delayedCall(dt, resolve, [], null);
    });
}

FsmState.prototype.addTweenAction = function(scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any) {    
    this.addAction((state, result, resolve, reject) => {
        config.onComplete = resolve;
        let tweeen = scene.tweens.add(config);
    });
}