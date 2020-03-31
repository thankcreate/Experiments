// tt = [5,4,3,2,1]
// let x  = tt.findIndex(v=>v==1);
// console.log(typeof(x));

let str = '123\\n321\\n3';
// let res = str.split('\\n');
let res = str.replace(/\\n/g, '\n');
console.log(res);
// var ob = {
//     ad: 123,
//     get ad() {
//         return 2345;
//     },
   
  
// }
// console.log(ob.ad);

// let fullCount = Math.floor(Math.random() * 4); // 0-3   

// console.log(fullCount)

// console.
// ob = {
//   t:'n',
//   ss:null
// }

// if(true)
//   ob.s1 = '123'
// console.log(JSON.stringify(ob));


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

// let outResolve;
// let chain = Promise.resolve(1)
// .then(res => {
//     return new Promise((resolve, rej) => {
        
//         console.log('log1');
//         resolve('1');
//         console.log('log2');
//         outResolve = resolve;
//         setTimeout(() => {
//             console.log('delay');
//             resolve('haha');
//         }, 2000);
//     });
// })
// .then(res => {
//     console.log(res);
// })
// .catch(reason => {
//     console.log('catch here');
// });

// function logMapElements(value, key, map) {
//     console.log(`m[${key}] = ${value}`);
//   }
  
// new Map([['foo', 3], ['bar', {}], ['baz', undefined]])
// .forEach(logMapElements);
// console.log('123');


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


// let func1 = (arg1, arg2) => {
//     console.log(arg1, arg2);
// }

// let func2 = func1.bind(this, 1);
// func2(3);



// var obj = {
//     name: 'linxin',
//     func: function() {
//         console.log(this.name);
//     }
// }

// var obj2 = {
//     name: 'linxin2',
//     func: function()  {
//         console.log(this.name);
//     }
// }

// function funcG() {
//     console.log(this.name);
// }

// obj.func3 = obj2.func.bind(obj2);
// obj.func3();


// let p1 = new Promise((resolve, reject) => {
//     resolve('成功了')
//   })
  
//   let p2 = new Promise((resolve, reject) => {
//     resolve('success')
//   })
  
//   // let p3 = Promise.reject('fuck');
  
//   Promise.all([p1, p2]).then((result) => {
//     console.log(result)               //['成功了', 'success']
//   }).catch((error) => {
//     console.log(error)
//   })


// Promise.reject('haha').then(s=>{})
// .then(s=>{
//   console.log(s);
// }, r=>{
//   return new Promise((res, ref) => {
//     res('im');
//     setTimeout(() => {
//       console.log('hahahah');
//     }, 2000);

//     setTimeout(() => {
//       console.log('h1h1h1');
//     }, 1000);
//   })
// })
// .then(s=>console.log(s))

// .catch(reason =>{
//   console.log(reason);
//   return Promise.reject('bb');
// }).catch(reason=>{
//   console.log(reason);
// });


// let p1 = new Promise((resolve, reject) => {
//   setTimeout(()=>{
//     resolve('成功了')
//   }, 3000)
  
// })

// let p2 = p1.then(e=>console.log(e));



// let p3 = Promise.reject('失败')

// Promise.race([p2, p3]).then(e=>{console.log('1')}, r=>{console.log('2')});

// let t = undefined;

// if(t == undefined) {
//   console.log('1')
// }
// else
// console.log('2')

// t = null;

// if(t == undefined) {
//   console.log('1')
// }
// else
// console.log('2')


// t = 0;

// if(t) {
//   console.log('1')
// }
// else


// ob = {}
// console.log(ob['j']);


// let p = new Promise((res, rej) =>{
//     res('1');
//     rej('2');
  

   
// })
// .finally(()=>{
//     console.log('haha')
// })
// .then(s=>{console.log('ss' + s)}, e=>{console.log('ee' + e)})


// let ccc = '123';

// let name = 'ccc'

// console.log(window)

// var cc
// if(cc)
//     console.log('haha')

// cc = "haha"

// dic = {
//     cc: "123",
//     a: 1,
// }
// ds = [];
// // // console.log(JSON.stringify(dic))

// let dd = dic;
// dd.a = 1;
// console.log(dic.a);
// console.log(typeof(ds));


// if(dic.k) {
//     console.log('in');
// }
// else {
//     console.log('no');
// }