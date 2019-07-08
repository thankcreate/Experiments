
// let firstRes = null;

// function fp(res, rej) {
//     firstRes = res;
// }

// let chain = new Promise(fp)
// .then(res => {
//     console.log(res);
// })
// .then(res => {
//     return new Promise((resolve, rej) => {
//         rej('just rej');
//     });
// })
// .then(res => {
//     console.log(res);
// })
// .catch(reason => {
//     console.log('catch here');
// });

// firstRes('fuckyou');




// function testFunc(func) {
//     console.log(func.length);
// }

// testFunc((var1, var2, var3, var4)=>{ 
//     var4 = haha;
// });




// let chain = new Promise((resolve, rej)=> {
//     resolve('haha');
// })



// let chain =  new Promise((resolve, reject) => {
//         setTimeout(()=>{
//             reject('33');
//         }, 2000);
//     })

// .then(res => {
//     console.log('123');
//     return new Promise((resolve, reject) => {
//         setTimeout(()=>{
//             resolve('11');
//         }, 2000);
//     });
// },  rej => {
//     reject('33');
//     console.log("thisrej");
// })
// .then(res => {
//     console.log(res + "1");
// }, rej => {
//     console.log("ag");
// })
// .catch(reason => {
//     console.log('catch here');
// });


// function tc() {
//     console.log(this.c);
// }

// tc.prototype.func = function() {

// }

// var k = new tc();
// k.func();


let func1 = (arg1, arg2) => {
    console.log(arg1, arg2);
}

let func2 = func1.bind(this, 1);
func2(3);