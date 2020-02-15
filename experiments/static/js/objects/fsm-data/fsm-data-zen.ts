/// <reference path="../fsm/fsm.ts" />


var zenFsm = {
    name: 'ZenFsm',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'ZenStart'},
        {name: 'TO_FIRST_INTRODUCTION', from:'ZenStart', to:'ZenIntro'}
    ]
}

farray.push(zenFsm);