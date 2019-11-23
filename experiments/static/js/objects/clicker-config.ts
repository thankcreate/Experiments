let keywordInfos = [
    {title: "Bad", size: 44, desc: "", damage: 3, cost: 0, consumed: true},
    {title: "Evil", size: 40, desc: "", damage: 5, cost: 300, consumed: false},
    {title: "Guilty", size: 28, desc: "", damage: 8, cost: 1000, consumed: false},
    {title: "Vicious", size: 24, desc: "", damage: 12, cost: 3000, consumed: false},
    {title: "Immoral", size: 20, desc: "", damage: 20, cost: 10000, consumed: false},
    {title: "Shameful", size: 18, desc: "", damage: 32, cost: 30000, consumed: false},
]       

let baseScore = 100;

for(let i = 0; i < keywordInfos.length; i++) {
    let item = keywordInfos[i];
    item.desc = '"' + item.title + '"' + "\nDamage: " + item.damage + "\nCost: " + item.cost;
}