
var game = new Phaser.Game(phaserConfig);

window.addEventListener('resize', function (event) {
    // have two myReisze becasue in this phaser lib function
    // resize: function (width, height)
    // it only refresh the display ratio by the previous size
    // this could be a problem if the window size is change by a opening developer tool(inspector)
    myResize(game);     
    myResize(game);
}, false);
