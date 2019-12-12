interface PropInfo {
    title: string,
    size: number,
    desc: string,
    price: number,
    damage?: number,
    baseDamage?: number,
    basePrice?: number,

}


let initScore = 0;
let baseScore = 100;
let normalFreq1 = 8;

let autoBadgeInterval = 400;
let autoTurnInterval = 1000;

let hpRegFactor = 4;


let initNormalHealth = 3;
let init404Health = 2;

let initNormalCount = 2;
let init404Count =1;

let initCreateStep = 1;
let initCreateMax = 3;


let priceIncreaseFactor = 1.1;
let damageIncraseFactor = 1.1;

let award404IncreaseFactor = 1.1;
let health404IncreaseFactor = 1.15;

let basePrice = 100;
let baseDamage = 1;
let priceFactorBetweenInfo = 5;
let damageFactorBetweenInfo = 4;

let autoTurnDpsFactor = 10;

let normalDuration = 35000;

let badInfos = [
    {title: "Bad", size: 36, desc: "Bad is just bad", damage: 1, baseDamage: 1, price: 0, basePrice: 100, consumed: false},
    {title: "Evil", size: 34, desc: "Evil, even worse then Bad", damage: 3, baseDamage: 3, price: 0,  basePrice: 300, consumed: false},
    {title: "Guilty", size: 28, desc: "Guilty, even worse than Evil", damage: 5, baseDamage: 5, price: 0, basePrice: 1000, consumed: false},
    {title: "Vicious", size: 24, desc: "Vicious, even worse than Guilty", damage: 8, baseDamage: 8, price: 0, basePrice: 3000, consumed: false},
    {title: "Immoral", size: 20, desc: "Immoral, even worse than Vicious", damage: 12, baseDamage: 12, price: 0, basePrice: 10000, consumed: false},
    {title: "Shameful", size: 18, desc: "Shameful, the worst.", damage: 20, baseDamage: 20, price: 0, basePrice: 30000, consumed: false},
]

for(let i = 0; i < badInfos.length; i++) {
    badInfos[i].basePrice = basePrice * Math.pow(priceFactorBetweenInfo, i);
    badInfos[i].baseDamage = baseDamage * Math.pow(damageFactorBetweenInfo, i);    
}



function getDamageBasedOnLevel(lvl: number, info: PropInfo)  {
    // let ret = info.baseDamage * Math.pow(damageIncraseFactor, lvl - 1);
    let ret = info.baseDamage * lvl;
    return ret;
}

function getPriceToLevel(lvl: number, info: PropInfo) {
    let ret = info.basePrice * Math.pow(priceIncreaseFactor, lvl - 1);
    return ret;
}

function getAwardFor404(count: number) {
    let sc = Math.floor(baseScore * Math.pow(award404IncreaseFactor, count));
    return sc;
}

let turnInfos = [
    {title: "Turn", damage: 1},
]

let createInfos = [
    {title: "Create", damage: 1},
]


function getCreateKeyword(): string {
    return createInfos[0].title;
}

let hpPropInfos = [
    {title: '+HP', consumed: false, price: 200, size: 36, desc: 'Restore you HP a little bit', hotkey: ['+','=']},
]

let propInfos = [
    {title: "B**", consumed: false, price: 200, size: 40, desc: 'You can just type in "B" instead of "BAD" for short'},            
    {title: "Auto\nBad", consumed: false, price: 600, size: 22, desc: "Activate a cutting-edge Auto Typer which automatically eliminates B-A-D for you"},
    {title: "T**", consumed: false, price: 2500, size: 30, 
        desc: 'Turn Non-404 words into 404.\nYou can just type in "T" for short',
        //warning: "Caution: Once you purchased this item, you can no longer do semantic word matching"
        },
    {title: "Auto\nTurn", consumed: false, price: 10000, size: 22, desc: "Automatically Turn Non-404 words into 404"},
    {title: "The\nCreator", consumed: false, price: 20000, size: 22, desc: 'Create a new word! Type in "C" for short'}
]   

function getBadgeResID(i) {
    let resId = 'badge_' + badInfos[i].title.toLowerCase(); 
    return resId;
}

function getAutoTypeInfo() {
    return propInfos[1];
}

function getTurnInfo() {
    return propInfos[2];
}

function getAutoTurnInfo() {
    return propInfos[3];
}

function getNormalFreq() {
    return normalFreq1;
}

function getCreatePropInfo() {
    return propInfos[4];
}




// for(let i = 0; i < badInfos.length; i++) {
//     let item = badInfos[i];
//     item.desc = '"' + item.title + '"' + "\nDPS to 404: " + item.damage + "\nPrice: " + item.price;
// }

for(let i = 0; i < hpPropInfos.length; i++) {
    let item = hpPropInfos[i];
    item.desc = "+HP"
        + "\n\nHP: +1/" + hpRegFactor + " of MaxHP"
        + "\nPrice: " + item.price
        + '\n\nHotkey: "' + item.hotkey[0] + '"';        
}




function isReservedBadKeyword(inputWord: string) : boolean {
    if(notSet(inputWord)) return false;
    let foundKeyword = false;
    for(let i = 0; i < badInfos.length; i++) {
        if(inputWord.toLocaleLowerCase() == badInfos[i].title.toLocaleLowerCase()) {
            foundKeyword = true;
            break;
        }
    }
    return foundKeyword;
}


function isReservedTurnKeyword(inputWord: string) : boolean {
    if(notSet(inputWord)) return false;
    let foundKeyword = false;
    for(let i = 0; i < turnInfos.length; i++) {
        if(inputWord.toLocaleLowerCase() == turnInfos[i].title.toLocaleLowerCase()) {
            foundKeyword = true;
            break;
        }
    }
    return foundKeyword;   
}

function isReservedKeyword(inputWord: string) : boolean {
    return isReservedBadKeyword(inputWord) || isReservedTurnKeyword(inputWord) || inputWord == getCreateKeyword();
}