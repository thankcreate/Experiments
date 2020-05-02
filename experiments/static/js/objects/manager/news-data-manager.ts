enum NewspaperStyle{
    DEFAULT,
    ONLY_TEXT_CENTER,
}

enum NewsSourceType{
    FAKE,
    NYT,
    WASHINGTON_POST,
    CNN
}

interface NewsItem{
    index: number,
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
    tag: string,
    purgeIntro: string,
    labelCorrectIntro: string,

    sourceType: NewsSourceType,
}

interface RssItem{
    title: string,
    imageUrl: string,
    desc: string,
}


class NewsDataManager {
    private static instance: NewsDataManager;   


    data: NewsItem[] = [];

    labelMapping : Map<NewsSourceType, Array<string>> = new Map();

    constructor() {
    }

    
    static getInstance(): NewsDataManager {
        if(!NewsDataManager.instance) {
            NewsDataManager.instance = new NewsDataManager();
            NewsDataManager.instance.load();
            NewsDataManager.instance.initLabelMapping();
        }
        return NewsDataManager.instance;
    }

    initLabelMapping() {
        this.labelMapping.set(NewsSourceType.NYT, new Array('Dead Paper', 'Embarrassment to Journalism', 'Enemy of the People'));
        this.labelMapping.set(NewsSourceType.CNN, new Array('Fake News', 'Nasty', 'Third-Rate Reporter'));
        this.labelMapping.set(NewsSourceType.WASHINGTON_POST, new Array('A New Hoax', 'Clown', 'Hate Our Country'));
    }

    getByNum(num: number): NewsItem {
        for(let i in this.data) {
            if(this.data[i].index == num) {
                return this.data[i];
            }
        }
        return null;
    }

    loadRss(done: (rssItem: RssItem[])=>any, fail: ()=>any) {
        // let FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml';
        let FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml';
        $.get(FEED_URL)
        .done(data=>{
            let ret:RssItem[] = []
            $(data).find("item").each((index, ele)=> { // or "item" or whatever suits your feed
                var el = $(ele);                
                let rssItem = {
                    title: el.find("title").text(),
                    desc: el.find("description").text(),
                    imageUrl: el.find("media\\:content[medium=image]").attr('url')
                }
                ret.push(rssItem);
                // console.log("title      : " + el.find("title").text());
                // console.log("media:content     : " + el.find("media\\:content[medium=image]").attr('url'));
                // console.log("description: " + el.find("description").text());
            });            
            done(ret);
        })
        .fail(s=>{
            fail();
        });
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
                    tag: cols[14],
                    purgeIntro: cols[15],
                    labelCorrectIntro: cols[16],
                    sourceType: NewsSourceType.FAKE
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

                this.judgeType(item);
                this.data.push(item);
            } catch (error) {
                console.log(error);
                continue;
            }            
        }
        // console.log(this.data);
    }

    isRealPaper(item: NewsItem): boolean {
        return item.answer < 0;
    }

    judgeType(item: NewsItem) {
        if(item.content.includes('nyt')) {
            item.sourceType = NewsSourceType.NYT;
        }
        else if(item.content.includes('wp')) {
            item.sourceType = NewsSourceType.WASHINGTON_POST;
        }
        else if(item.content.includes('cnn')) {
            item.sourceType = NewsSourceType.CNN;
        }
        else {
            item.sourceType = NewsSourceType.FAKE;
        }
    }   

    

}