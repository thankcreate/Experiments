var normalGameFsm = {
    name: 'NormalGameFsm',
    initial: "Default",
    events: [
        {name: 'TUTORIAL_START', from:'Default', to: 'TutorialStart'},
        {name: 'EXPLAIN_HP', from:'TutorialStart', to: 'ExplainHp'},
        {name: 'TO_FLOW_STRATEGY', from: 'ExplainHp', to:'FlowStrategy'}
    ]
}