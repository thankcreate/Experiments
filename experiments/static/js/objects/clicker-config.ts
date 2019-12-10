let badInfos = [
    {title: "Bad", size: 36, desc: "", damage: 1, cost: 0, consumed: false},
    {title: "Evil", size: 34, desc: "", damage: 3, cost: 300, consumed: false},
    {title: "Guilty", size: 28, desc: "", damage: 5, cost: 1000, consumed: false},
    {title: "Vicious", size: 24, desc: "", damage: 8, cost: 3000, consumed: false},
    {title: "Immoral", size: 20, desc: "", damage: 12, cost: 10000, consumed: false},
    {title: "Shameful", size: 18, desc: "", damage: 20, cost: 30000, consumed: false},
]

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
    {title: '+HP', consumed: false, price: 100, size: 36, desc: 'Restore you HP a little bit'},
]

let propInfos = [
    {title: "B**", consumed: false, price: 300, size: 40, desc: 'You can just type in "B" instead of "BAD" for short'},            
    {title: "Auto\nBad", consumed: false, price: 600, size: 22, desc: "Activate a cutting-edge Auto Typer which automatically eliminates B-A-D for you"},
    {title: "T**", consumed: false, price: 2500, size: 30, 
        desc: 'Turn Non-404 words into 404.\nYou can just type in "T" for short',
        warning: "Caution: Once you purchased this item, you can no longer do semantic word matching"
        },
    {title: "Auto\nTurn", consumed: false, price: 4500, size: 22, desc: "Automatically Turn Non-404 words into 404"},
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



let initScore = 100;
let baseScore = 100;
let normalFreq1 = 10;

let autoBadgeInterval = 400;
let autoTurnInterval = 1000;


for(let i = 0; i < badInfos.length; i++) {
    let item = badInfos[i];
    item.desc = '"' + item.title + '"' + "\nDPS: " + item.damage + "\nCost: " + item.cost;
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