
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




function testFunc(func) {
    console.log(func.length);
}

testFunc((var1, var2, var3, var4)=>{ 
    var4 = haha;
});