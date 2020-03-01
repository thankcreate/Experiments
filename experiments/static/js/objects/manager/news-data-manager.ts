
interface NewsData{

}

class NewsDataManager {
    private static instance: NewsDataManager;
    

    
    constructor() {
    }

    
    static getInstance(): NewsDataManager {
        if(!NewsDataManager.instance) {
            NewsDataManager.instance = new NewsDataManager();
        }
        return NewsDataManager.instance;
    }



}