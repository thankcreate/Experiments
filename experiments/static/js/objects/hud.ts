class Hud extends Wrapper<PhText> {


    hp: HP;
    scoreText: PhText;
    score = 0;

    hpInitPosi: PhPoint;
    inShow: boolean = false;
    inTwenn: PhTween;
    outTween: PhTween;
   

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let hpBottom = 36;
        let hpLeft = 36;
        this.hp = new HP(scene, this.inner, hpLeft, phaserConfig.scale.height - hpBottom);
        this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        this.hp.inner.y += 250; // hide it at beginning

        let style = getDefaultTextStyle();
        style.fontSize = '44px';
        this.scoreText = this.scene.add.text(getLogicWidth() - 30, phaserConfig.scale.height - 20, "Score: 0", style).setOrigin(1, 1);
        this.scoreText.y += 250
        this.inner.add(this.scoreText);
    }

    addScore(inc) {
        this.score += inc;
        this.refreshScore();
    }

    refreshScore() {
        this.scoreText.text = "Score: " + this.score;
    }

    reset() {
        this.score = 0;        
        this.refreshScore();

        this.hp.reset();
    }

    show(mode: GameMode) {
        this.inShow = true;
        let tg = [];
        if(mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText]
        else
            tg = [this.scoreText]

        this.inTwenn = this.scene.tweens.add({
            targets: tg,
            y: "-= 250",
            duration: 1000,
        })

    }

    hide(mode: GameMode) {
        this.inShow = false;

        let tg = [];
        if(mode === GameMode.Normal)
            tg = [this.hp.inner, this.scoreText]
        else
            tg = [this.scoreText]

        this.outTween = this.scene.tweens.add({
            targets: tg,
            y: "+= 250",
            duration: 1000,
        })
    }
}