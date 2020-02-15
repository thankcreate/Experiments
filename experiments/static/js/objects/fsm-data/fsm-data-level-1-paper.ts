/// <reference path="../fsm/fsm.ts" />

var normal_1_paper = {
    name: 'Normal_1_Papaer',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},
        {name: 'CONTINUE', from:'Start', to:'Confirm_1'},
        {name: 'CONTINUE', from:'Confirm_1', to:'Confirm_2'}
    ],
    states: [
        // {name: 'Idle', color:'Green'}
    ]
}

farray.push(normal_1_paper); 