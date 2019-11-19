class Bubble extends Wrapper<PhImage> {

    text: PhText;
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, isRight: boolean) {
        super(scene, parentContainer, x, y, null);


        let img = this.scene.add.image(0, 0, isRight ? 'popup_bubble' : 'popup_bubble_left');
        img.setOrigin(isRight ? 1 : 0, 46 / 229);
        this.applyTarget(img);

        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        let cc = "You can just type in 'B' instead of 'BAD' for short";
        
        this.text = this.scene.add.text(isRight ? -442 : 40, -26, cc, style).setOrigin(0, 0);
        this.text.setWordWrapWidth(400);        
        this.inner.add(this.text);
    }

    setText(val: string) {
        this.text.text = val;
    }

    show() {
        this.inner.setVisible(true);
    }

    hide() {
        this.inner.setVisible(false);
    }
}