
// create youtube player
var player;
function onYouTubePlayerAPIReady() {
    player = new YT.Player('yb-player', {
        height: '390',
        width: '640',
        videoId: '7YL_-y7fc3I',
        playerVars: { 'autoplay': 1, 'controls': 0 },
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        }
    });
}

// autoplay video
function onPlayerReady(event) {
    event.target.playVideo();
}

// when video ends
function onPlayerStateChange(event) {        
    if(event.data === 0) {            
        alert('done');
    }
}


