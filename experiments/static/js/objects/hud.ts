/**
 * TronTron
 * The intention of Hud is to wrap the behavior of HP bar
 * However, I added more things into it like the score and right tool bar
 * 
 * If something needs to be facein/fadeout in the animation, we need 
 * include them in the array in the 'show' and 'hide' functions
 */
class Hud extends Wrapper<PhText> {


    hp: HP;
    scoreText: PhText;    
    score = 0;

    comboHitText: PhText;
    comboHit = 0;

    hpInitPosi: PhPoint;
    inShow: boolean = false;
    inTwenn: PhTween;
    outTween: PhTween;
   
    toolMenuContainer: PhContainer;
    toolBtns: Button[] = [];
    
    
    popupBubble :Wrapper<PhImage>;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let hpBottom = 36;
        let hpLeft = 36;
        this.hp = new HP(scene, this.inner, hpLeft, phaserConfig.scale.height - hpBottom);
        this.hpInitPosi = MakePoint2(this.hp.inner.x, this.hp.inner.y);
        this.hp.inner.y += 250; // hide it at beginning

        // score
        let style = getDefaultTextStyle();
        style.fontSize = '44px';
        this.scoreText = this.scene.add.text(getLogicWidth() - 30, phaserConfig.scale.height - 20, "Score: 0", style).setOrigin(1, 1);
        this.scoreText.y += 250
        this.inner.add(this.scoreText);

        // combo
        style.fontSize = '60px';
        this.comboHitText = this.scene.add.text(getLogicWidth() - 30, 20, "0 HIT COMBO", style).setOrigin(1, 0);
        this.inner.add(this.comboHitText);
        this.comboHitText.setVisible(false);

        // tool menu
        this.toolMenuContainer = this.scene.add.container(getLogicWidth() - 75, 350); 
        this.inner.add(this.toolMenuContainer);

        let lbls = ['B**', 'HP', 'Auto','404++']        
        let lblSizes = [40, 40, 34, 30];
        let startY = 0;
        let intervalY = 100;
        for(let i = 0; i < lbls.length; i++) {            
            let btn = new Button(this.scene, this.toolMenuContainer, 0, startY + intervalY * i,
                 'rounded_btn', lbls[i], 75,75, false);        
            btn.text.setFontSize(lblSizes[i]);
            btn.needInOutAutoAnimation = false;
            this.toolBtns.push(btn);
        }      
        
        // bubble
        let bubbleX = this.toolBtns[0].inner.x + this.toolMenuContainer.x - 100;    
        let bubbleY = this.toolBtns[0].inner.y + this.toolMenuContainer.y;
        this.popupBubble = new Bubble(this.scene, this.inner, 0, 0);        
        this.popupBubble.inner.setPosition(bubbleX, bubbleY);        
    }
    lastTimeAddCombo;

    addCombo() {
        this.comboHitText.setVisible(true);
        this.comboHit++;
        this.comboHitText.setText(this.comboHit + " HIT COMBO");

        
        let scaleTo = 1.2;
        let sc = this.scene as Scene1;
        if(this.comboHit == 2) {
            sc.sfxMatches[0].play();
        }
        else if(this.comboHit == 3) {
            sc.sfxMatches[1].play();
            scaleTo = 2;
        }
        else if(this.comboHit >= 4) {
            sc.sfxMatches[2].play();
            scaleTo = 4;
        }


        this.scene.tweens.add({
            targets: this.comboHitText,
            scale: scaleTo,
            yoyo: true,
            duration: 200,
        });

        this.lastTimeAddCombo = sc.curTime;
    }

    update(time, dt) {
        let sc = this.scene as Scene1;
        if(this.comboHit > 0 && sc.curTime - this.lastTimeAddCombo > 7000) {
            
            if(sc.needFeedback) {
                this.resetCombo();
                // sc.sfxFail.play();
            }
            
        }
    }

    resetCombo() {
        this.comboHitText.setVisible(false);
        this.comboHit = 0;
        this.comboHitText.setText("");
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