
$(document).ready(()=>{
    var game = new Phaser.Game(phaserConfig);

    window.addEventListener('resize', function (event) {
        myResize(game);
    }, false);
    window.game = game;
    
    $.cookie.json = true;
})
