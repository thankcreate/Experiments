
// create youtube player
var s_youtubePlayer;
var s_youtubeFinishCallback;
function onYouTubePlayerAPIReady() {
    s_youtubePlayer = new YT.Player('yb-player', {
        height: '480',
        width: '640',
        // videoId: '7YL_-y7fc3I',
        videoId: '4TKbcu3zoAo',
        playerVars: { 'autoplay': 0, 'controls':0 },
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        }
    });
}

// autoplay video
function onPlayerReady(event) {
    if(s_youtubeNeedPlay) {
        playYoutubeVideoInner();
    }
    else {
        event.target.pauseVideo();
    }
    
    s_youtubeReady = true;
}

let s_youtubeNeedPlay = false;
let s_youtubeReady = false;
/**
 * When play is called, maybe the onPlayerReady is still not called 
 */
function playYoutubeVideo() {
    s_youtubeNeedPlay = true;
    if(s_youtubeReady) {
        playYoutubeVideoInner();
    }
}

function playYoutubeVideoInner() {
    s_youtubePlayer.playVideo();
}

// when video ends
function onPlayerStateChange(event) {        
    if(event.data === 0) {        
        if(s_youtubeFinishCallback)    
            s_youtubeFinishCallback();
    }
}


