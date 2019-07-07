var mainFsm =
{
  name: 'MainFsm',
  initial: "Home",
  events: [
    { name: 'Finished', from: 'Home', to: 'HomeToGameAnimation' },
    { name: 'Finished', from: 'HomeToGameAnimation', to: 'NormalGame' },
    { name: 'BackToHome', from: 'NormalGame', to: 'BackToHomeAnimation' },
  ],
};


interface IFsm {
  name: string,
  initial: string,
  events: {
    name: string;
    from: string;
    to: string;
  }[],
}

function getMainFsm(): IFsm {
  return mainFsm;
}

// var mainFsm = 
// {
//   initial: "Home",  
//   events: [
//     { name: 'Finished', from: 'Home', to: 'HomeToGameAnimation' },
//     { name: 'Finished', from: 'HomeToGameAnimation', to: 'NormalGame' },
//     { name: 'BackToHome', from: 'NormalGame', to: 'BackToHomeAnimation' },

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
