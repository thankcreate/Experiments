// return the logic degisn wdith based on the config.scale.height
// this is the available canvas width
function getLogicWidth() {
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;

    if (windowR > scaleR) {
        return windowR * phaserConfig.scale.height;
    }
    else {
        return phaserConfig.scale.minWidth;
    }
}


function myResize(gm) {
    let windowR = window.innerWidth / window.innerHeight;
    let scaleR = phaserConfig.scale.minWidth / phaserConfig.scale.height;

    gm.scale.resize(getLogicWidth(), phaserConfig.scale.height);

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





