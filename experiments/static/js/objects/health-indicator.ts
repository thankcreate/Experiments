

class HealthIndicator {
    inner: Phaser.GameObjects.Container; 
    parentContainer: Phaser.GameObjects.Container; 
    scene: Phaser.Scene;
    text: Phaser.GameObjects.Text; 
    textStyle: TextStyle;
    
    graphics: Phaser.GameObjects.Graphics;
    num: number;

    


    constructor(scene: Phaser.Scene, parentContainer: Phaser.GameObjects.Container, posi: Phaser.Geom.Point, num: number ) {
        this.scene = scene;
        this.parentContainer = parentContainer;        
        
        this.inner = this.scene.add.container(posi.x, posi.y);
        this.parentContainer.add(this.inner);
        this.num = num;

        this.graphics = this.scene.add.graphics();        
        this.graphics.fillStyle(0x000000, 1); // background circle
        this.graphics.fillCircle(0, 0, gameplayConfig.healthIndicatorWidth / 2);
        this.inner.add(this.graphics);       


        this.textStyle = getDefaultTextStyle();        
        this.textStyle.fontFamily = gameplayConfig.healthIndicatorFontFamily
        this.textStyle.fill = '#ffffff';
        this.textStyle.fontSize = '28px';
        this.text = this.scene.add.text(0, 1, num.toString(), this.textStyle);
        this.text.setOrigin(0.5, 0.5);
        this.inner.add(this.text);            
    }


    setText(num: number) {
        this.text.text = num.toString();
    }
}