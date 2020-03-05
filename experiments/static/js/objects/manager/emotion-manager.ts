/**
 * We use positve/negative instead of happy/angry/disgusting
 * to avoid over-specific
 */
interface MyAnalysis {
    emotion: MyEmotion,
    intensity: number,/* [0, 1] */
}

enum MyEmotion{
    None,
    Positive,
    Negative,
}


class EmmotionManager {
    private static instance: EmmotionManager;
    
    
    constructor() {
    }

    
    static getInstance(): EmmotionManager {
        if(!EmmotionManager.instance) {
            EmmotionManager.instance = new EmmotionManager();
        }
        return EmmotionManager.instance;
    }

    emotionAnalyze(res: ImageRes) : MyAnalysis{
        let ana = {emotion: MyEmotion.None, intensity: 0}
        
        let face = res.face;
        let timestamp = res.timestamp;
        let emotions = face.emotions;
        let expressions = face.expressions;

        if(emotions.joy > 30 || expressions.lipSuck > 60) {
            ana.emotion = MyEmotion.Positive;
            ana.intensity = 1;
        }

        if(expressions.browFurrow > 70 || expressions.noseWrinkle > 60) {
            ana.emotion = MyEmotion.Negative;
            ana.intensity = 1;
        }

        if(emotions.joy> 90 || expressions.smile > 90) {
            ana.emotion = MyEmotion.Positive;
            ana.intensity = 1;
        }

        return ana;
    }
}