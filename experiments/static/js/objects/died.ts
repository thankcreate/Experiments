class Died extends Wrapper<PhText> {

    banner: Rect;
    restartBtn: Button;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        // Big banner
        this.banner = new Rect(this.scene, this.inner, 0,0, {
            originX: 0.5,
            originY: 0.5,
            width: 3000,
            height: 350,
            fillColor: 0x000000,
            lineColor: 0x000000,
            lineAlpha: 0,
        });
        
        // Title
        let style = getDefaultTextStyle();
        style.fill = '#ffffff';
        style.fontSize = '250px';

        let title = this.scene.add.text(0, -10, "YOU DIED", style).setOrigin(0.5).setAlign('center');
        this.applyTarget(title);

        // Restart Btn
        this.restartBtn = new Button(this.scene, this.inner, 0, 125, null, ">reboot -n", 200, 100, false);
        this.restartBtn.text.setFontSize(44);
    }

    hide() {
        this.inner.setVisible(false);
        this.restartBtn.setEnable(false, false);
    }

    show(): Pany{
        this.inner.setVisible(true);
        this.inner.alpha = 0;
        this.restartBtn.setEnable(true, false);
        return TweenPromise.create(this.scene, {
            targets: this.inner,
            alpha: 1,
            duration: 200
        });
    }

    
}