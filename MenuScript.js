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

function chooseDisplay() {
    Audiodata.display = document.getElementById("display").value;
    audioProcessing();

}

var startOffset = 0;
var startTime = 0;
var audPlay;

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

function enableButton(){
  playButton.disabled = !playButton.disabled;
}
