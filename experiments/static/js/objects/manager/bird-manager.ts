class BirdManager {
    private static instance: BirdManager;
    
    
    constructor() {
    }

    
    static getInstance(): BirdManager {
        if(!BirdManager.instance) {
            BirdManager.instance = new BirdManager();
        }
        return BirdManager.instance;
    }

    print(text?: string, img?: string){
        let sendOb:any = {}
        
        if(text) 
            sendOb.text = text;
        if(img)
            sendOb.img = img;
        
        // make sure the request run in async thread
        // Promise.resolve('hello').then(s=>{
        //     return apiPromise('api/bird', JSON.stringify(sendOb))
        // })

        setTimeout(() => {
            apiPromise('api/bird', JSON.stringify(sendOb));
        }, 1);
    }
}