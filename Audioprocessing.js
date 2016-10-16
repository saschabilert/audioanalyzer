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
    var audioCtx = new AudioContext();
    buffer = reader.readAsArrayBuffer(data);
    var state = reader.readyState;

    console.log(state);

    reader.resultType = "arrayBuffer";

    reader.onload = function() {
        audioCtx.decodeAudioData(reader.result, function(buf) {
            audioData = buf;
            var analyser = audioCtx.createAnalyser();
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 128;
            var frequencyData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(frequencyData);
            console.log("hallo");
        });
    };
}

// define variables and create new AudioContext obj
// var context = new AudioContext();
// var audioBuffer;
// var sourceNode;
//
// setupAudioNodes();
// loadSound("wagner-short.ogg");
//
// function setupAudioNodes() {
//     sourceNode = context.createBufferSource();
//     sourceNode.connect(context.destination);
// }
//
// function loadSound(url) {
// var request = new XMLHttpRequest();
// request.open('GET', url, true);
// request.responseType = 'arraybuffer';
//
// // When loaded decode the data
// request.onload = function() {
//
//     // decode the data
//     context.decodeAudioData(request.response, function(buffer) {
//         // when the audio is decoded play the sound
//         playSound(buffer);
//     }, onError);
// }
// request.send();
// }
//
// function playSound(buffer) {
// sourceNode.buffer = buffer;
// sourceNode.start(0);
// }
//
// // log if an error occurs
// function onError(e) {
//     console.log(e);
// }
