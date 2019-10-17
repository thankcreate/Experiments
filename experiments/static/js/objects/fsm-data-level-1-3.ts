/// <reference path="fsm.ts" />


var normal_1_3 = {
    name: 'Normal_1_3',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},      
        {name: 'TO_BGM', from: 'Start', to: 'BGM'},
    ]
}

farray.push(normal_1_3);