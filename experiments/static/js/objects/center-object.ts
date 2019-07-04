class CenterObject {
    inner: PhContainer; 
    parentContainer: PhContainer; 
    scene: PhScene;

    designSize: PhPoint;

    
    mainImage: PhImage
    speakerImage: PhImage

    playerInputText: PlayerInputText;

    speakerRight: number = 56;
    speakerLeft: number = -56;    

    backToZeroTween: PhTween;

    constructor(scene: PhScene, parentContainer: PhContainer, designSize: PhPoint) {
        this.scene = scene;
        this.parentContainer = parentContainer;
        this.designSize = cpp(designSize);

        this.inner = this.scene.add.container(0, 0);
        this.parentContainer.add(this.inner);


        this.mainImage = this.scene.add.image(0,0, "circle");
        this.inner.add(this.mainImage);
                

        this.speakerImage = this.scene.add.image(this.speakerRight, 28, "speaker");
        this.inner.add(this.speakerImage);

        this.playerInputText = new PlayerInputText(this.scene, this.inner, this);
        this.playerInputText.init(this.getDesignWidth());
        this.playerInputText.changedEvent.on((inputControl)=>{this.playerInputChanged(inputControl)});
        
    }

    
    playerInputChanged(inputControl: PlayerInputText ){
        let percent = inputControl.text.width / this.getTextMaxWidth();
        percent = Math.max(0, percent);
        percent = Math.min(1, percent);
        let desti = lerp(this.speakerRight, this.speakerLeft, percent);
        // this.speakerImage.x = desti;

        if(percent == 0) {
            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerImage,
                x: desti,
                // alpha: {
                //     getStart: () => 0,
                //     getEnd: () => 1,
                //     duration: 500
                // },
                duration: 150
            });
        }
        else {
            if(this.backToZeroTween)
                this.backToZeroTween.stop();
            // this.speakerImage.x = desti;

            this.backToZeroTween = this.scene.tweens.add({
                targets: this.speakerImage,
                x: desti,
                // alpha: {
                //     getStart: () => 0,
                //     getEnd: () => 1,
                //     duration: 500
                // },
                duration: 50
            });
        }

    }

    getDesignWidth() {
        return this.designSize.x;
    }

    getTextMaxWidth() {
        return this.getDesignWidth() * 0.65;
    }
}