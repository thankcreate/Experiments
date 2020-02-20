/// <reference path="../fsm/fsm.ts" />


var normal_1_4 = {
    name: 'Normal_1_4',
    initial: "Default",
    events: [
        {name: 'START', from:'Default', to: 'Start'},                
        {name: 'FINISHED', from: 'Start', to: 'Idle'},
        {name: 'WARN', from: 'Idle', to: 'Warn'},
        {name: 'FINISHED', from:'Warn', to:'Idle'},
        {name: 'MOCK', from: 'Idle', to:'Mock'},
        {name: 'TO_PROMPT_COMPLETE_BAD', from:'Idle', to:'PromptCompleteBad'},
        {name: 'FINISHED', from:'PromptCompleteBad', to:'Idle'},
        {name: 'TO_PROMPT_AUTO_BAD', from:'Idle', to:'PromptAutoBad'},        
        {name: 'FINISHED', from:'PromptAutoBad', to:'Idle'},
        {name: 'TO_PROMPT_TURN', from:'Idle', to:'PromptTurn'},
        {name: 'FINISHED', from:'PromptTurn', to:'Idle'},
        {name: 'TO_PROMPT_AUTO_TURN', from:'Idle', to:'PromptAutoTurn'},
        {name: 'FINISHED', from:'PromptAutoTurn', to:'Idle'},
        {name: 'TO_PROMPT_CREATOR', from:'Idle', to:'PromptCreator'},
        {name: 'FINISHED', from:'PromptCreator', to:'Idle'},
    ],
    states: [
        {name: 'Idle', color:'Green'}
    ]
}

farray.push(normal_1_4); 