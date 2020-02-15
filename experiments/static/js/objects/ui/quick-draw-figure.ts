var figureNames = ["aircraft carrier","airplane","alarm clock","ambulance","angel","animal migration","ant","anvil","apple","arm","asparagus","axe","backpack","banana","bandage","barn","baseball bat","baseball","basket","basketball","bat","bathtub","beach","bear","beard","bed","bee","belt","bench","bicycle","binoculars","bird","birthday cake","blackberry","blueberry","book","boomerang","bottlecap","bowtie","bracelet","brain","bread","bridge","broccoli","broom","bucket","bulldozer","bus","bush","butterfly","cactus","cake","calculator","calendar","camel","camera","camouflage","campfire","candle","cannon","canoe","car","carrot","castle","cat","ceiling fan","cell phone","cello","chair","chandelier","church","circle","clarinet","clock","cloud","coffee cup","compass","computer","cookie","cooler","couch","cow","crab","crayon","crocodile","crown","cruise ship","cup","diamond","dishwasher","diving board","dog","dolphin","donut","door","dragon","dresser","drill","drums","duck","dumbbell","ear","elbow","elephant","envelope","eraser","eye","eyeglasses","face","fan","feather","fence","finger","fire hydrant","fireplace","firetruck","fish","flamingo","flashlight","flip flops","floor lamp","flower","flying saucer","foot","fork","frog","frying pan","garden hose","garden","giraffe","goatee","golf club","grapes","grass","guitar","hamburger","hammer","hand","harp","hat","headphones","hedgehog","helicopter","helmet","hexagon","hockey puck","hockey stick","horse","hospital","hot air balloon","hot dog","hot tub","hourglass","house plant","house","hurricane","ice cream","jacket","jail","kangaroo","key","keyboard","knee","knife","ladder","lantern","laptop","leaf","leg","light bulb","lighter","lighthouse","lightning","line","lion","lipstick","lobster","lollipop","mailbox","map","marker","matches","megaphone","mermaid","microphone","microwave","monkey","moon","mosquito","motorbike","mountain","mouse","moustache","mouth","mug","mushroom","nail","necklace","nose","ocean","octagon","octopus","onion","oven","owl","paint can","paintbrush","palm tree","panda","pants","paper clip","parachute","parrot","passport","peanut","pear","peas","pencil","penguin","piano","pickup truck","picture frame","pig","pillow","pineapple","pizza","pliers","police car","pond","pool","popsicle","postcard","potato","power outlet","purse","rabbit","raccoon","radio","rain","rainbow","rake","remote control","rhinoceros","rifle","river","roller coaster","rollerskates","sailboat","sandwich","saw","saxophone","school bus","scissors","scorpion","screwdriver","sea turtle","see saw","shark","sheep","shoe","shorts","shovel","sink","skateboard","skull","skyscraper","sleeping bag","smiley face","snail","snake","snorkel","snowflake","snowman","soccer ball","sock","speedboat","spider","spoon","spreadsheet","square","squiggle","squirrel","stairs","star","steak","stereo","stethoscope","stitches","stop sign","stove","strawberry","streetlight","string bean","submarine","suitcase","sun","swan","sweater","swing set","sword","syringe","t-shirt","table","teapot","teddy-bear","telephone","television","tennis racquet","tent","The Eiffel Tower","The Great Wall of China","The Mona Lisa","tiger","toaster","toe","toilet","tooth","toothbrush","toothpaste","tornado","tractor","traffic light","train","tree","triangle","trombone","truck","trumpet","umbrella","underwear","van","vase","violin","washing machine","watermelon","waterslide","whale","wheel","windmill","wine bottle","wine glass","wristwatch","yoga","zebra","zigzag"];

var gQuickIndex = 0;
class QuickDrawFigure{

    scene: Phaser.Scene;
    inner: Phaser.GameObjects.Graphics;
    parentContainer: Phaser.GameObjects.Container;
    lbl: string;

    curIndex = -1;
    figures: object[];

    interval = 200;
    changeTween: Phaser.Tweens.Tween;

    testIndex = 0;;

        
    sampleRate = gameplayConfig.drawDataSample;
    originX = 0.5;
    originY = 0.5;
    newSize = gameplayConfig.drawDataDefaultSize;

    graphicLineStyle = {
        width: 4,
        color: 0x000000,
        alpha: 1
    }

    forceStop: boolean = false;

    constructor(scene, parentContainer, lbl, isFake: boolean = false) {
        this.scene = scene;        
        this.parentContainer = parentContainer;
        this.lbl = lbl;
        this.inner = this.scene.add.graphics({lineStyle: this.graphicLineStyle});        
        let fullPath = this.getFilePathByLbl(lbl);        
        
        if(!isFake) {
            $.getJSON(fullPath,  json => {
                this.figures = json;   
                // this.drawFigure(this.figures[3]);          
                
                this.startChange();
            });
        }
        

        this.testIndex = gQuickIndex;
        gQuickIndex++;

        this.parentContainer.add(this.inner);       
    }

    dispose() {
        if(this.changeTween) {
            this.changeTween.stop();
            this.changeTween = null;
        }
    }

    // 
    drawFigure(figure) {
        var strokes = figure.drawing;
        this.inner.clear();

        let minX = this.sampleRate;
        let maxX = 0;
        let minY = this.sampleRate;
        let maxY = 0;
        for(let strokeI = 0; strokeI < strokes.length; strokeI++) {
            // console.log("drawFigure strokeI:" + strokeI);

            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for(let i = 0; i < count; i++) {                     
                minX = Math.min(minX, xArr[i]);
                maxX = Math.max(maxX, xArr[i]);
                minY = Math.min(minY, yArr[i]);
                maxY = Math.max(maxY, yArr[i]);
            }                 
        }
        this.originX = (minX + maxX ) / 2 / this.sampleRate;
        this.originY = (minY + maxY) / 2 / this.sampleRate;
        // console.log(maxY + "  min:" + minY);
        // this.originY = maxY / this.sampleRate;
        
        this.inner.y = -(maxY / this.sampleRate - this.originY) * this.newSize;

        // let maxY = -10000;
        // let maxX = -10000;
        // the sample is 255, which means that x, y are both <= 255        
        // console.log("drawFigure");
        for(let strokeI = 0; strokeI < strokes.length; strokeI++) {
            // console.log("drawFigure strokeI:" + strokeI);

            var xArr = strokes[strokeI][0];
            var yArr = strokes[strokeI][1];
            var count = xArr.length;
            for(let i = 0; i < count - 1; i++) {                     
                this.mappedLineBetween(xArr[i], yArr[i], xArr[i + 1], yArr[i + 1]);
                // maxX = Math.max(maxX, xArr[i]);
                // maxY = Math.max(maxY, yArr[i]);
                // console.log(xArr[i]);
            }                 
        }
        // console.log("MaxX: " + maxX + "   MaxY: " + maxY) ;        
    }

    mappedLineBetween(x1, y1, x2, y2) {
        let mappedPosi1 = this.getMappedPosi(x1, y1);
        let mappedPosi2 = this.getMappedPosi(x2, y2);
        this.inner.lineBetween(mappedPosi1[0], mappedPosi1[1], mappedPosi2[0], mappedPosi2[1]);
    }

    getFilePathByLbl(lbl: string) {
        let folderPath = gameplayConfig.quickDrawDataPath;
        return folderPath + lbl + ".json";
    }


    startChange() {        
        this.changeTween = this.scene.tweens.add({
            targets: this,
            dummy: 1,
            duration: this.interval,

            onStart: () => {
                this.change();
            },

            onRepeat: () => {
                if(!this.forceStop)  {
                    this.change();
                }                
            },

            repeat: -1
        });
    }

    stopChange() {
        this.forceStop = true;
        if(this.changeTween) {
            this.changeTween.stop();
        }
    }

    change() {    
        if(!this.figures || this.figures.length == 0)
            return;

        this.curIndex = (this.curIndex + 1) % this.figures.length;
        this.drawFigure(this.figures[this.curIndex])
    }


    getMappedPosi(x, y) : number[] {
        let scaleRate = this.newSize / this.sampleRate;
        let posi = [
            x * scaleRate - this.newSize * this.originX, 
            y * scaleRate - this.newSize * this.originY
        ];
        return posi;
    }

    getRightBottom() : Phaser.Geom.Point {
        let mappedPosi = this.getMappedPosi(this.sampleRate, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    }

    getLeftBottom() : Phaser.Geom.Point {
        let mappedPosi = this.getMappedPosi(0, this.sampleRate);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    }

    getCenter() : Phaser.Geom.Point {
        let mappedPosi = this.getMappedPosi(this.sampleRate / 2, this.sampleRate / 2);
        return new Phaser.Geom.Point(mappedPosi[0], mappedPosi[1]);
    }
}