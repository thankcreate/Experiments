class Bubble extends Wrapper<PhImage> {

    text: PhText;
    warningText: PhText;
    gapBetweenTextAndWarningText = 6;
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, dir: Dir) {
        super(scene, parentContainer, x, y, null);

        let imgRes = "";
        let originX = 0;
        let originY = 0;
        let textX = 0;
        let textY = 0;
        if(dir == Dir.Bottom) {
            imgRes = 'popup_bubble_bottom'
            originX = 55 / 439;
            originY = 1;
            textX = -31;
            textY = -230;
        }
        else if(dir == Dir.Left) {
            imgRes = 'popup_bubble_left'
            originX = 0;
            originY = 46 / 229;
            textX = 40;
            textY = -26;
        }
        else if(dir == Dir.Right) {
            imgRes = 'popup_bubble'
            originX = 1;
            originY = 46 / 229;
            textX = -442;
            textY = -26;
        }

        let img = this.scene.add.image(0, 0, imgRes);
        img.setOrigin(originX, originY);
        this.applyTarget(img);

        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        style.fontSize = '26px'
        let cc = "You can just type in 'B' instead of 'BAD' for short";
        

        let wordWrapthWidt = 400;
        // main text
        this.text = this.scene.add.text(textX, textY, cc, style).setOrigin(0, 0);
        this.text.setWordWrapWidth(wordWrapthWidt);        
        this.inner.add(this.text);

        // warning text
        let warningStyle = getDefaultTextStyle();
        style.fill = '#FF0000';
        style.fontSize = '24px';
        let posi = this.text.getBottomLeft();       
        
        this.warningText = this.scene.add.text(posi.x, 0, "", style).setOrigin(0, 0);
        this.warningText.setWordWrapWidth(wordWrapthWidt);
        this.inner.add(this.warningText);

    }

    setText(val: string, warningVal?: string) {
        this.text.text = val;
        if(warningVal) {            
            this.warningText.text = warningVal; 
            this.warningText.y = this.text.getBottomLeft().y + this.gapBetweenTextAndWarningText;
        }
        else {
            this.warningText.text = "";
        }
    }

    show() {
        this.inner.setVisible(true);
    }

    hide() {
        this.inner.setVisible(false);
    }
}