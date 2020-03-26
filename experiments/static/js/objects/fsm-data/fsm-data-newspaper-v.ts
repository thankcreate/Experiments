/// <reference path="../fsm/fsm.ts" />

var newsPaper = {
    name: 'Newspaper',
    initial: "Default",
    events: [
        {name: 'FINISHED', from:'Default', to: 'Paper1'},      
        {name: 'CORRECT', from: 'Paper1', to: 'Paper1_Correct', dot:{weight:10, len:'0.1'}},
        {name: 'WRONG', from: 'Paper1', to: 'Paper1_Wrong'},        
        {name: 'CORRECT', from:'Paper1_SecondChance', to:'Paper1_Correct'},
        {name: 'WRONG', from:'Paper1_SecondChance', to:'Paper1_Wrong'},
        {name: 'G_DIED', from:'Default', to:'Died'},
        
        {name: '2', from:'Paper1_Wrong', to:'Paper1_SecondChance', },  


        {name: 'FINISHED', from:'Paper1_Wrong', to:'End1'} ,
        {name: 'FINISHED', from:'Paper1_Correct', to:'End1'}  ,
        {name: 'FINISHED', from:'Paper1', to: 'End1'},  
    ]
}

farray.push(newsPaper);