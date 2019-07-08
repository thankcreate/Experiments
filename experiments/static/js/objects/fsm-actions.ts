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
    addDelayAction(scene: PhScene, dt: number): FsmState;
    addTweenAction(scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any): FsmState;
    addFinishAction();
    addLogAction(message?: any, ...optionalParams: any[]);
}

FsmState.prototype.addLogAction = function(message?: any) {    
    let self = this as FsmState;    
    self.addAction((state, result) => {
        console.log(message);
    });
    return self;
}

FsmState.prototype.addFinishAction = function() {    
    let self = this as FsmState;    
    self.addAction((state, result) => {
        state.finished();
    });
    return self;
}

FsmState.prototype.addDelayAction = function(scene: PhScene, dt: number) {    
    this.addAction((state, result, resolve, reject) => {
        scene.time.delayedCall(dt, resolve, [], null);
    });
    return this;
}

FsmState.prototype.addTweenAction = function(scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any) {    
    this.addAction((state, result, resolve, reject) => {
        config.onComplete = resolve;
        let tweeen = scene.tweens.add(config);
    });

    return this;
}