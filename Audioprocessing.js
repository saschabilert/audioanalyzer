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

    // read the data from myAudio as ArrayBuffer
    reader.readAsArrayBuffer(data);

    // trigger the onload function to decode the Audiodata
    reader.onload = function() {
        audioCtx.decodeAudioData(reader.result).then(buffer => {
            // give the decoded Audiodata to the split-function
            var Value = splitData(buffer);
            console.log(Value);
        });
    };

    function splitData(buffer) {
        // define the block length :: later blockLen as user input
        var blockLen = 2048;
        // define hopsize 25% of blockLen
        var hopsize = blockLen / 4;

        var samples = buffer.getChannelData(0);

        // calculate the startpoints for the sample blocks
        var nPart = Math.floor((samples.length - blockLen) / hopsize);
        // create array with zeros for imaginär part to use the fft
        var zeros = new Array(samples.length).fill(0);
        var endIdx = 0;
        var absValue = new Array(blockLen+1);

        for (var i = 0; i < nPart; i++) {

            var real = samples.slice(hopsize * i, blockLen + endIdx);
            var imag = zeros.slice(hopsize * i, blockLen + endIdx);

            endIdx = endIdx + hopsize;

            CalculateFFT(real, imag);

            CalculateFFTabsValue(real, imag, absValue);
        }
        return absValue;
    }

    function CalculateFFT(real, imag) {
        transform(real, imag);
    }

    function CalculateFFTabsValue(real, imag, absValue) {
        // console.log(imag[20]);
        for (i = 0; i <= real.length; i++) {
            absValue[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
        }
        return absValue;
    }
}
