// process audio signal with a new block length
function blockLength() {
    Audiodata.blockLen = +(document.getElementById("blockLength").value);
    audioProcessing();
}
// process audio signal with a new window type
function windowType() {
    Audiodata.windowFunction = document.getElementById("windowType").value;
    audioProcessing();
}

function overlap() {
    Audiodata.overlap = +(document.getElementById("overlap").value);
    audioProcessing();
}

function phaseOn() {
    Audiodata.phase = document.getElementById("overlap").value;
    audioProcessing();

}

var startOffset = 0;
var startTime = 0;
var audPlay;
var isPlaying = false;
var gainNode;
var playButton = document.getElementById("player");
playButton.disabled = true;
playButton.addEventListener("click", toggleSound);


function toggleSound() {
    if (!isPlaying) {
        startTime = audioCtx.currentTime;
        audPlay = audioCtx.createBufferSource();
        audPlay.buffer = myArrayBuffer;
        audPlay.start(0, startOffset);
        playButton.innerHTML = "Click to pause sound";
        isPlaying = true;
        window.requestAnimationFrame(drawLinePlay)
        gainNode = audioCtx.createGain();
        audPlay.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.5;
    } else {

        audPlay.stop();
        isPlaying = false;
        playButton.innerHTML = "Click to play sound";
        startOffset += audioCtx.currentTime - startTime;



    }
}



document.getElementById('volume').addEventListener('input', function() {
    gainNode.gain.value = this.value;

});


function enableButton() {
    playButton.disabled = !playButton.disabled;
}

function playSound() {
    startTime = audioCtx.currentTime;
    audPlay = audioCtx.createBufferSource();
    audPlay.buffer = myArrayBuffer;
    audPlay.loop = false;
    audPlay.connect(audioCtx.destination);
    audPlay.start(0, startOffset);
}

function pauseSound() {
    audPlay.stop();
    startOffset += audioCtx.currentTime - startTime;
}

function gainChange() {
    var gainNode = audioCtx.createGain();
    audPlay.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}
