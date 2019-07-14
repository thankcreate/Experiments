/**
 * The anchor of footer is bottom-left
 */
class Footer extends Wrapper<PhText> {
    badges: Button[] = [];

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number, overallHeight: number) {
        super(scene, parentContainer, x, y, null);

        let keys = ['footer_ai', 'footer_google','footer_nyu'];
        let sepKey = 'footer_sep';

        let curX = 0;
        let gapLogoSep = 50;
        for(let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let button = new Button(this.scene, this.inner, curX, 0, key, '', undefined, undefined, false, 0, 1);
            button.image.setOrigin(0, 1);
            button.needInOutAutoAnimation = false;
            button.needHandOnHover = true;
            this.badges.push(button);

            if(i === keys.length - 1)
                continue

            curX += button.image.displayWidth;
            // console.log(button.image.displayWidth)
            curX += gapLogoSep;
            
            let sep = this.scene.add.image(curX, 0, sepKey);
            sep.setOrigin(0, 1);
            this.inner.add(sep);
            
            curX += gapLogoSep;
        }

        let picH = this.badges[0].image.displayHeight;
        this.inner.setScale(overallHeight / picH);
    }
}