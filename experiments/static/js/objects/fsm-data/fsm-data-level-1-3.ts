/// <reference path="../fsm/fsm.ts" />


var normal_1_3 = {
    name: 'Normal_1_3',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},      
        {name: 'TO_BGM', from: 'Start', to: 'BGM'},
        {name: 'TO_SENSITIVE_WORD', from: 'BGM', to: 'Sensitive'},
        {name: 'FINISHED', from:'Sensitive', to:'End'}    
    ]
}

farray.push(normal_1_3);