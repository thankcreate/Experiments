/**
 * UI means the overall ui
 * Hud specifically means the head-up display when entered into game mode
 */
class UI extends Wrapper<PhText>{
    
    footer: Footer;
    leaderboardBtn: Button;
    
    hud: Hud65536;        // hp, score, etc...
    footerInitPosi: PhPoint;

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        let footerMarginBottom = 25;
        let footerMarginLeft = 30;
        this.footer = new Footer(this.scene, this.inner, footerMarginLeft, phaserConfig.scale.height - footerMarginBottom, 100);
        this.footerInitPosi = MakePoint(this.footer.inner);       

        this.leaderboardBtn = new Button(this.scene, this.inner, getLogicWidth()  - 30, 
            phaserConfig.scale.height - 25, 'leaderboard_icon', '', undefined, undefined, false, 1, 1);
        this.leaderboardBtn.image.setOrigin(1, 1);
        this.leaderboardBtn.inner.scale = 0.6
        this.leaderboardBtn.needInOutAutoAnimation = false;
        this.leaderboardBtn.needHandOnHover = true;
        anchorToRight(30, this.leaderboardBtn.inner);
    }

    mode: GameMode;
    gotoGame(mode: GameMode){
        this.mode = mode;
        if(this.hud) {
            this.hud.reset();
            this.hud.show(mode);
        }        
        this.footer.hide();
        this.down(this.leaderboardBtn.inner);
    }

    gotoHome() {
        if(this.hud) {
            this.hud.hide(this.mode);
        }        
        this.footer.show();
        this.up(this.leaderboardBtn.inner);
    }


    down(target: any) {
        this.scene.tweens.add({
            targets: target,
            y: "+= 250",
            duration: 1000,
        })
    }

    up(target: any) {
        this.scene.tweens.add({
            targets: target,
            y: "-= 250",
            duration: 1000,
        })
    }
}