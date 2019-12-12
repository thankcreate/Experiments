var nyuAbout = `NYU Game Center is the Department of Game Design at the New York University Tisch School of the Arts. It is dedicated to the exploration of games as a cultural form and game design as creative practice. Our approach to the study of games is based on a simple idea: games matter. Just like other cultural forms – music, film, literature, painting, dance, theater – games are valuable for their own sake. Games are worth studying, not merely as artifacts of advanced digital technology, or for their potential to educate, or as products within a thriving global industry, but in and of themselves, as experiences that entertain us, move us, explore complex topics, communicate profound ideas, and illuminate elusive truths about ourselves, the world around us, and each other.
`

var googleAbout = `Experiment 65536 is made with the help of the following solutions from Google:

TensorFlow TFHub universal-sentence-encoder: Encodes text into high-dimensional vectors that can be used for text classification, semantic similarity, clustering and other natural language tasks

Quick, Draw! The Data: A unique doodle data set that can help developers train new neural networks, help researchers see patterns in how people around the world draw, and help artists create things we haven’t begun to think of.

Google Cloud Text-to-Speech API (WaveNet): Applies groundbreaking research in speech synthesis (WaveNet) and Google's powerful neural networks to deliver high-fidelity audio
`

var aiAbout = `This experiment is a prospect study for a thesis project at NYU Game Center. It aims to explore how the latest AI tech can help to build a game feel. The experiment is more focused on the concept of games for AI, rather than AI for games.

This current demo is only at progress 10% at most. 
`

var cautionDefault = `Once purchased this item, you can no longer do semantic word matching. All you can input will be limited to "Turn" and "Bad"

Click "OK"(or press "Enter") to confirm
`

var economicTitle = `Hi Economists!📈`
var economicAbout = `This is the 4th level of my thesis game, so we need a little bit of context here.

There are 2 types of enemies:

• 404: Which is just 404
• Non-404: General words like "Flower", "Dog"

You can eliminate 404 enemies by type in "BAD" and press 'Enter'. You can't eliminate Non-404 enemies at first.

You will lose HP if the enemies reach the center circle, but you can buy your HP back.

Caution: You can only get 💰 by eliminating 404s. The award of non-404 is negative.
`
// var economicAbout = `This is the 4th level of my thesis game, so we need a little bit of context here.

// There are 2 types of enemies:

// • 404: Which is just 404
// • Non-404: General words like "Flower", "Dog"

// You should input semantically related words to damage enemies:

// • 404: Only the input "Bad" is considered as related
// • Non-404: Type in a related word. For example, you can type in "Spring" when you see "Flower", and you can type in "Cute" when you see "Dog"

// If the enemies reach the center circle, you will lose your HP.

// Caution: You can only get 💰 by eliminating 404s. Eliminating non-404s can only give you NEGATIVE 💰.
// `

// The wrapped PhText is only for the fact the Wrapper must have a T
// We don't really use the wrapped object
class Overlay extends Wrapper<PhText> {
    
    bkg: Rect;

    /**
     * uniDialog is mostly used in UI
     */
    uniDialog: Dialog;    

    /**
     * inGameDialog is mostly shown during play
     */
    inGameDialog: Dialog;

    leaderboardDialog: LeaderboardDialog;
    inShow: boolean = false;

    inTween: PhTween;

    frontDark: Rect;

    

    constructor(scene: BaseScene, parentContainer: PhContainer, x: number, y: number) {
        super(scene, parentContainer, x, y, null);

        this.inner.alpha = 0;

        let width = getLogicWidth();
        let height = phaserConfig.scale.height
        this.bkg = new Rect(this.scene, this.inner, 0, 0, {            
        fillColor: 0x000000,
        fillAlpha: 0.8,            
        width: width, 
        height: height,
        lineWidth: 0,
        originX: 0.5,
        originY: 0.5, 
        });

        this.bkg.wrappedObject.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

        
        this.initUniDialog();
        this.initInGameDialog();
        this.initLeaderboardDialog();
        
        this.uniDialog.hide();
        this.inGameDialog.hide();
        this.leaderboardDialog.hide();
        this.hide();

    } 

    initUniDialog(){
        this.uniDialog =  new Dialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 1000,
            height: 700,
            title: 'About',
            titleContentGap: 40, 
            contentPadding: 60, 
            contentBtnGap: 30, 
            btnToBottom: 65,                   
            content: nyuAbout,
            autoHeight: true
        });
        this.uniDialog.setOrigin(0.5, 0.5);
        this.uniDialog.okBtn.clickedEvent.on(()=>{
            this.hide();
            this.uniDialog.hide();
        });
    }

    initInGameDialog() {
        this.inGameDialog =  new Dialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 800,
            height: 700,
            title: 'Caution',
            titleContentGap: 40, 
            contentPadding: 60, 
            contentBtnGap: 30, 
            btnToBottom: 65,                   
            content: cautionDefault,
            autoHeight: true
        });
        this.inGameDialog.setOrigin(0.5, 0.5);
        this.inGameDialog.okBtn.clickedEvent.on(()=>{
            this.hide();
            this.inGameDialog.hide();
        });
        this.inGameDialog.cancelBtn.clickedEvent.on(()=>{
            this.hide();
            this.inGameDialog.hide();
        });
    }

    initLeaderboardDialog() {
        this.leaderboardDialog =  new LeaderboardDialog(this.scene, this.inner, 0, 0, {
            fillColor: 0xbbbbbb,
            lineColor: 0x000000,
            lineWidth: 6,
            padding: 16,
            width: 600,
            height: 1000,
            title: 'About',
            titleContentGap: 40, 
            contentPadding: 60, 
            contentBtnGap: 30, 
            btnToBottom: 65,                   
            content: nyuAbout,
            autoHeight: true,
            itemCount: 18,
        });
        this.leaderboardDialog.setOrigin(0.5, 0.5);
        this.leaderboardDialog.okBtn.clickedEvent.on(()=>{
            this.hide();
            this.leaderboardDialog.hide();
        });
    }


    showAiDialog() {
        this.uniDialog.setContent(aiAbout, "A.I. Experiment");
        this.show();
        this.uniDialog.show();
    }

    showAboutDialog() {        
        this.uniDialog.setContent(nyuAbout, "NYU Game Center");
        this.show();
        this.uniDialog.show();
    }

    showGoogleDialog() {
        this.uniDialog.setContent(googleAbout, "Solutions");
        this.show();
        this.uniDialog.show();
    }

    showTurnCautionDialog() : Dialog {
        this.inGameDialog.setContent(cautionDefault, 'Caution', ['OK', 'Cancel']);
        this.show();
        this.inGameDialog.show();
        return this.inGameDialog;
    }

    showEcnomicDialog() : Dialog {
        this.uniDialog.setContent(economicAbout, economicTitle);
        this.show();
        this.uniDialog.show();
        return this.uniDialog;
    }
    

    showLeaderBoardDialog() {        
        this.leaderboardDialog.setContentItems(LeaderboardManager.getInstance().items, "Leaderboard");
        this.show();
        this.leaderboardDialog.show();
    }


    show() {
        this.inShow = true;
        this.inner.setVisible(true);

        
        this.inTween = this.scene.tweens.add({
            targets: this.inner,
            alpha: 1,
            duration: 80,
        })
    }

    hide() {
        this.inShow = false;
        this.inner.setVisible(false);
        this.inner.alpha = 0;
        if(this.inTween) {
            this.inTween.stop();            
        }
    }

    isInShow(): boolean {
        return this.inShow;
    }
}