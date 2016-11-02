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

function phaseON() {
    Audiodata.phase = document.getElementById("overlap").value;
    audioProcessing();

}
function playSound(buffer){
    var x = audioCtx.createBufferSource();
    x.buffer = buffer;
    x.connect(audioCtx.destination);
    source.start(0);
}
