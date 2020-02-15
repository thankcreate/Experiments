/// <reference path="../fsm/fsm.ts" />

var mainFsm =
{
  name: 'MainFsm',
  initial: "Home",
  events: [
    { name: 'TO_FIRST_MEET', from: 'Home', to: 'FirstMeet' },
    { name: 'TO_SECOND_MEET', from: 'Home', to: 'SecondMeet' },
    { name: 'FINISHED', from: 'HomeToGameAnimation', to: 'NormalGame' },
    { name: 'BACK_TO_HOME', from: 'NormalGame', to: 'BackToHomeAnimation' },
    { name: 'FINISHED', from: 'BackToHomeAnimation', to: 'Home' },
    { name: 'FINISHED', from: 'FirstMeet', to: 'ModeSelect' },
    { name: 'FINISHED', from: 'SecondMeet', to: 'ModeSelect' },
    { name: 'FINISHED', from: 'ModeSelect', to: 'HomeToGameAnimation' },
    { name: 'DIED', from: 'NormalGame', to: 'Died' },
    { name: 'RESTART', from: 'Died', to: 'Restart' },
    { name: 'BACK_TO_HOME', from: 'Died', to: 'BackToHomeAnimation' },
    { name: 'RESTART_TO_GAME', from: 'Restart', to: 'NormalGame'}
  ],
};


farray.push(mainFsm);

// var mainFsm = 
// {
//   initial: "Home",  
//   events: [
//     { name: 'Finished', from: 'Home', to: 'HomeToGameAnimation' },
//     { name: 'Finished', from: 'HomeToGameAnimation', to: 'NormalGame' },
//     { name: 'BACK_TO_HOME', from: 'NormalGame', to: 'BACK_TO_HOMEAnimation' },

//   ], 
// };



// var traverse = require('babel-traverse').default;
// var babylon = require("babylon");
// var generator = require("babel-generator").default
// const ast = babylon.parse(code);
// traverse(ast, {
//   enter: path => {
//     const { node, parent } = path;        
//     // do with the node
//   }
// });
