// return the logic degisn wdith based on the config.scale.height
// this is the available canvas width
function getLogicWidth() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = config.scale.minWidth / config.scale.height;
    if (windowR > scaleR) {
        return windowR * config.scale.height;
    }
    else {
        return config.scale.minWidth;
    }
}
function myResize() {
    var windowR = window.innerWidth / window.innerHeight;
    var scaleR = config.scale.minWidth / config.scale.height;
    game.scale.resize(getLogicWidth(), config.scale.height);
    if (windowR > scaleR) {
        var canvas = document.querySelector("canvas");
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    else {
        var canvas = document.querySelector("canvas");
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerWidth / scaleR + "px";
    }
}
window.addEventListener('resize', function (event) {
    myResize();
}, false);
//# sourceMappingURL=resolution.js.map