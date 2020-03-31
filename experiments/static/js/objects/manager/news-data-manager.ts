
interface NewsItem{
    index: number;
    title: string,
    content: string,
    answer: number,
    intro: string,
    correctResponse: string,
    wrongResonpse: string,
    secondChanceIntro: string,
    style: number,
    reaction: number,
    thumbnail1: string,
    thumbnail2: string,
    ambience: string,
    needloop: number,
}


class NewsDataManager {
    private static instance: NewsDataManager;   


    data: NewsItem[] = [];
    constructor() {
    }

    
    static getInstance(): NewsDataManager {
        if(!NewsDataManager.instance) {
            NewsDataManager.instance = new NewsDataManager();
            NewsDataManager.instance.load();
        }
        return NewsDataManager.instance;
    }

    getByNum(num: number): NewsItem {
        for(let i in this.data) {
            if(this.data[i].index == num) {
                return this.data[i];
            }
        }
        return null;
    }

    load() {
        this.data = [];
        let lines = g_newsData1.split('\n');
        let firstAdd = true;
        for(let i = 0; i < lines.length; i++) {                        
            let line  = lines[i];
            // ignore the empty line
            if(line == '') {
                continue;
            }

            // ignore the head
            if(firstAdd) {
                firstAdd = false;
                continue;
            }

            let cols = line.split('\t');
            
            try {
                let item: NewsItem = {
                    index: parseInt(cols[0]),
                    title: cols[1],
                    content: cols[2],
                    answer: parseInt(cols[3]),
                    intro: cols[4],
                    correctResponse: cols[5],
                    wrongResonpse: cols[6],
                    secondChanceIntro: cols[7],
                    style: parseInt(cols[8]),
                    reaction: parseInt(cols[9]),
                    thumbnail1: cols[10],
                    thumbnail2: cols[11],
                    ambience: cols[12],
                    needloop: parseInt(cols[13]),
                }    
                if(isNaN(item.index) || isNaN(item.answer)) {
                    throw 'NewsData loading failed for one item';
                }

                if(isNaN(item.style)) {
                    item.style = 0;
                }

                if(isNaN(item.reaction)) {
                    item.reaction = 1;
                }

                this.data.push(item);
            } catch (error) {
                console.log(error);
                continue;
            }            
        }
        console.log(this.data);
    }

}