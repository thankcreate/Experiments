var config = {
    type: Phaser.WEBGL,
    backgroundColor: '#FFFFFF',
    scale: {
        parent: 'phaser-main',
        width: 8000,        
        height: 1200,
        minWidth: 1200
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
    
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('circle', 'assets/circle.png');
    
}

let container;

var text;
function create ()
{
    container = this.add.container(0,0);
    var sprite = this.add.sprite(0, 0, 'circle').setInteractive();
    container.add(sprite);
    sprite.on('pointerover', ()=>{
        sprite.setScale(1.5);
    });

    sprite.on('pointerout', ()=>{
        sprite.setScale(1);
    });


    text = this.add.text(10, 10, '', { fill: '#00ff00' });


    myResize(game);   

    var canvas = game.canvas;
    console.log(canvas);
    var context = canvas.getContext('2d');

    var sceneThis = this;
    canvas.addEventListener('mousemove', function(evt) {
        var pointer = sceneThis.input.mousePointer;


        var rect = canvas.getBoundingClientRect();
        x =  evt.clientX - rect.left;
        y =  evt.clientY - rect.top;
        text.setText([
            'x: ' + x,
            'y: ' + y,
            'sX: ' + pointer.worldX,
            'sY: ' + pointer.worldY,
        ]);
    }, false);
}




function update (time, dt) {
    var w = getLogicWidth();
    var h = config.scale.height;

    container.setPosition(w / 2, h / 2);

    // console.log(game.canvas);


    var pointer = this.input.mousePointer;
    // text.setText([
    //     'x: ' + pointer.worldX,
    //     'y: ' + pointer.worldY,
    //     'isDown: ' + pointer.isDown,
    //     'rightButtonDown: ' + pointer.rightButtonDown()
    // ]);
}

window.addEventListener('resize', function (event) {
    // console.log('resize haha');
    myResize(game);     
    
}, false);


function getLogicWidth() {
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = config.scale.minWidth / config.scale.height;

    if (windowR > scaleR) {
        return windowR * config.scale.height;
    }
    else {
        return config.scale.minWidth;
    }
}


function myResize(gm) {
    console.log('my resize');
    
    // console.log('width: ' + window.innerWidth);
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = config.scale.minWidth / config.scale.height;

    gm.scale.resize(getLogicWidth(), config.scale.height);

    var canvas = document.querySelector("canvas");
    if (windowR > scaleR) {        
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    else {    
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerWidth / scaleR + "px";                
    }

    // canvas.style.verticalAlign= "middle";    
}




