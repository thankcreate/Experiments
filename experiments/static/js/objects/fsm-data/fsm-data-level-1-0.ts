/// <reference path="../fsm/fsm.ts" />

var normal_1_0 = {
    name: 'Normal_0',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},
        {name: 'VIDEO_FINISHED', from:'Start', to:'EndAnimation'}
    ],
    states: [
        // {name: 'Idle', color:'Green'}
    ]
}

farray.push(normal_1_0); 