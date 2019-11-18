class Bubble extends Wrapper<PhImage> {

    text: PhText;
    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);


        let img = this.scene.add.image(0, 0, 'popup_bubble');
        img.setOrigin(1, 46 / 229);
        this.applyTarget(img);

        let style = getDefaultTextStyle();
        style.fill = '#FFFFFF';
        let cc = "You can just type in 'B' instead of 'BAD' for short";
        
        this.text = this.scene.add.text(-442, -26, cc, style).setOrigin(0, 0);
        this.text.setWordWrapWidth(400);        
        this.inner.add(this.text);
    }
}