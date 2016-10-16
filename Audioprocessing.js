// check if AudioContext is supported be the current browser
if (!window.AudioContext) {
    if (!window.webkitAudioContex) {
        alert("no audiocontext found");
    }
    window.AudioContext = window.webkitAudioContext;
}

function loadAudio() {

    var data = document.getElementById("myAudio").files[0];
    console.log(data);

    var buffer = new ArrayBuffer(data.size);
    console.log(buffer);

    var reader = new FileReader(buffer);
    console.log(reader);

    buffer = reader.result;
    console.log(buffer);

    reader.readAsArrayBuffer(data.size);

    // reader.load;

    var state = reader.readyState;
    console.log(state);
    read = reader.result;
    console.log(read);
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    audioCtx.decodeAudioData(read);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 128;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    console.log("hallo");
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
