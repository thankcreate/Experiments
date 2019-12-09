class Bubble extends Wrapper<PhImage> {

    text: PhText;
    warningText: PhText;
    gapBetweenTextAndWarningText = 6;
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, isRight: boolean) {
        super(scene, parentContainer, x, y, null);


        let img = this.scene.add.image(0, 0, isRight ? 'popup_bubble' : 'popup_bubble_left');
        img.setOrigin(isRight ? 1 : 0, 46 / 229);
        this.applyTarget(img);

        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        style.fontSize = '26px'
        let cc = "You can just type in 'B' instead of 'BAD' for short";
        

        let wordWrapthWidt = 400;
        // main text
        this.text = this.scene.add.text(isRight ? -442 : 40, -26, cc, style).setOrigin(0, 0);
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