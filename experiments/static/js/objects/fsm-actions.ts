/// <reference path="fsm.ts" />
var TweenPromise = {
    create: function (scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any): Promise<any> {
        let tp = new Promise(res => {
            config.onComplete = res;
            let centerRotateTween = scene.tweens.add(config);
        });
        return tp;
    }
}

var TimeOutPromise = {
    create: function (dt: number, isResolve:boolean = true): Pany {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if(isResolve)
                    resolve('timeout resolve by :' + dt)
                else
                    reject('timeout reject by: ' + dt);
            }, dt)
        })
    }
}

var TimeOutRace = {
    create: function(base: Pany, dt: number, isResolve: boolean = true) : Pany {
        return Promise.race([base, TimeOutPromise.create(dt, isResolve)]);
    }
}

var TimeOutAll = {
    create: function(base: Pany, dt: number, isResolve: boolean = true) : Pany {
        return Promise.all([base, TimeOutPromise.create(dt, isResolve)]);
    }
}


interface FsmState {
    addDelayAction(scene: PhScene, dt: number): FsmState
    addTweenAction(scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any): FsmState
    addTweenAllAction(scene: PhScene, configs: Phaser.Types.Tweens.TweenBuilderConfig | any[]): FsmState
    addFinishAction(): FsmState
    addEventAction(name: string): FsmState
    addLogAction(message?: any, ...optionalParams: any[]): FsmState
    addSubtitleAction(subtitle: Subtitle, text: string, autoHideAfter: boolean, timeout?:number, minStay?, finishedSpeechWait?): FsmState

}


FsmState.prototype.addSubtitleAction = function (subtitle: Subtitle, text: string, autoHideAfter: boolean,
     timeout = 3000, minStay = 3000, finishedSpeechWait = 1000) {
    console.log(timeout);
    let self = this as FsmState;
    self.addAction((state, result, resolve, reject) => {
        subtitle.loadAndSay(subtitle, text, autoHideAfter, timeout, minStay, finishedSpeechWait)
            .then(s=>{ resolve('subtitle show end')  })      
            .catch(s=>{ resolve('subtitle show end with some err')});
    });
    return self;
}

FsmState.prototype.addLogAction = function (message?: any) {
    let self = this as FsmState;
    self.addAction((state, result) => {
        console.log(message);
    });
    return self;
}

FsmState.prototype.addFinishAction = function () {
    let self = this as FsmState;
    self.addAction((state, result) => {
        state.finished();
    });
    return self;
}

FsmState.prototype.addEventAction = function (eventName) {
    let self = this as FsmState;
    self.addAction((state, result) => {
        state.event(eventName);
    });
    return self;
}


FsmState.prototype.addDelayAction = function (scene: PhScene, dt: number) {
    this.addAction((state, result, resolve, reject) => {
        scene.time.delayedCall(dt, resolve, [], null);
    });
    return this;
}

FsmState.prototype.addTweenAction = function (scene: PhScene, config: Phaser.Types.Tweens.TweenBuilderConfig | any) {
    this.addAction((state, result, resolve, reject) => {
        config.onComplete = resolve;
        let tweeen = scene.tweens.add(config);
    });

    return this;
}

FsmState.prototype.addTweenAllAction = function (scene: PhScene, configs: TweenConfig[]) {
    this.addAction((state, result, resolve, reject) => {
        let promises: Promise<any>[] = [];
        configs.forEach(element => {
            promises.push(TweenPromise.create(scene, element));
        });

        Promise.all(promises).then(data => {
            resolve(data);
        }).catch(e => console.log(e));
    });
    return this;
}