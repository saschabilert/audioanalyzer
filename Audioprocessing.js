// check if AudioContext is supported be the current browser
if (!window.AudioContext) {
    if (!window.webkitAudioContex) {
        alert("no audiocontext found");
    }
    window.AudioContext = window.webkitAudioContext;
}

function loadAudio() {
    var data = document.getElementById("myAudio").files[0];
    var reader = new FileReader();
    var buffer = new ArrayBuffer();
    buffer = reader.readAsArrayBuffer(data);
    var state = reader.readyState;
    console.log(state);
    reader.resultType = "arraybuffer";
    var signalData = reader.result;
    var audioCtx = new AudioContext();
    reader.onload = function() {
        audioCtx.decodeAudioData(reader.result, function(buf) {
            audioData = buf;
        });
    };
asdfssd
    // var analyser = audioCtx.createAnalyser();
    // analyser.connect(audioCtx.destination);
    // analyser.fftSize = 128;
    //var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    //analyser.getByteFrequencyData(frequencyData);
    //console.log("hallo")
}
