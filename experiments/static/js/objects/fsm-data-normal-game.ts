/// <reference path="fsm.ts" />


var normalGameFsm = {
    name: 'NormalGameFsm',
    initial: "Default",
    events: [
        {name: 'TUTORIAL_START', from:'Default', to: 'TutorialStart'},
        {name: 'EXPLAIN_HP', from:'TutorialStart', to: 'ExplainHp'},
        {name: 'TO_FLOW_STRATEGY', from: 'ExplainHp', to:'FlowStrategy'},
        {name: 'NORMAL_START', from: 'Default', to:'NormalStart'},
        {name: 'FINISHED', from:'NormalStart', to:'Story0'},
        {name: 'FINISHED', from:'FlowStrategy', to:'Story0'},
        {name: 'FINISHED', from:'Story0', to:'Story1'}
    ]
}

farray.push(normalGameFsm);