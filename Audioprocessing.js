// check if AudioContext is supported be the current browser
if (!window.AudioContext) {
    if (!window.webkitAudioContex) {
        alert("no audiocontext found");
    }
    window.AudioContext = window.webkitAudioContext;
}
// function triggered by loading a Audiodata
function loadAudio() {

    // define objects
    var reader = new FileReader();
    var audioCtx = new AudioContext();

    // get the first file data with the id "myAudio"
    var data = document.getElementById("myAudio").files[0];

    reader.readAsArrayBuffer(data);

    reader.onload = function() {
        audioCtx.decodeAudioData(reader.result).then(buffer => {
          splitData(buffer.getChannelData);
        });
    };

    function splitData(bufferArray) {
      var x = bufferArray;
      console.log(x);
    }


    // var x = {durration:5}; (Object erzeugen mit eigenen Properties)

    // var analyser = audioCtx.createAnalyser();
    // analyser.connect(audioCtx.destination);
    // analyser.fftSize = 128;
    //var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    //analyser.getByteFrequencyData(frequencyData);
    //console.log("hallo")
}
