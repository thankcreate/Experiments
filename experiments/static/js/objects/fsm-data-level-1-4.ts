/// <reference path="fsm.ts" />


var normal_1_4 = {
    name: 'Normal_1_4',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},                
        {name: 'FINISHED', from: 'Start', to: 'Idle'},
        {name: 'WARN', from: 'Idle', to: 'Warn'}
    ],
    states: [
        {name: 'Idle', color:'Green'}
    ]
}

farray.push(normal_1_4);