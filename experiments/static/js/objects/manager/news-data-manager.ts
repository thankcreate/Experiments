
interface NewsItem{
    index: number;
    title: string,
    content: string,
    answer: number,
    style: number,
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
        return this.data[num];
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
                    style: parseInt(cols[4]),
                }    
                if(isNaN(item.index) || isNaN(item.answer) || isNaN(item.style)) {
                    throw 'NewsData loading failed for one item';
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