 // check if AudioContext is supported be the current browser
 if (!window.AudioContext) {
     if (!window.webkitAudioContex) {
         alert("no audiocontext found");
     }
     window.AudioContext = window.webkitAudioContext;
 }

 var Audiodata = {
     blockLen: undefined,
     signalLen: undefined,
     sampleRate: undefined,
     numOfChannels: undefined,
     hopsize: undefined,
     spectrogram: undefined,
     phase: undefined,
     samples: undefined,
     window: undefined
 };

 // function triggered by loading a Audiodata
 function audioProcessing() {

     // define objects
     var reader = new FileReader();
     var audioCtx = new AudioContext();

     // get the first file data with the id "myAudio"
     var data = document.getElementById("myAudio").files[0];


     // read the data from myAudio as ArrayBuffer
     reader.readAsArrayBuffer(data);

     Audiodata.sampleRate = audioCtx.sampleRate;

     // trigger the onload function to decode the Audiodata
     reader.onload = function() {
         audioCtx.decodeAudioData(reader.result).then(buffer => {

             Audiodata.numOfChannels = buffer.numberOfChannels;
             // give the decoded Audiodata to the split-function
             calculateSpec(buffer);

             drawSpec();
         });
     };
 }

 function calculateSpec(buffer) {
     // define the block length :: later blockLen as user input
     Audiodata.blockLen = 2048;
     // define hopsize 25% of blockLen
     Audiodata.hopsize = Audiodata.blockLen / 4;

     Audiodata.samples = buffer.getChannelData(0);

     Audiodata.signalLen = Audiodata.samples.length;

     Audiodata.window = "hann";

     // calculate the startpoints for the sample blocks
     var nPart = Math.floor((Audiodata.signalLen - Audiodata.blockLen) / Audiodata.hopsize);
     // create array with zeros for imaginär part to use the fft
     var zeros = new Array(Audiodata.blockLen).fill(0);

     var endIdx = 0;

     var windowLen = linspace(0, Audiodata.blockLen - 1);

     var window = applyWindow(windowLen, Audiodata.window);

     console.log(window);

     Audiodata.spectrogram = new Array(nPart);

     Audiodata.phase = new Array(nPart);

     for (var i = 0; i < nPart; i++) {

         var realPart = Audiodata.samples.slice(Audiodata.hopsize * i,
             Audiodata.blockLen + endIdx);
         var imagPart = zeros.fill(0);

         endIdx = endIdx + Audiodata.hopsize;

         calculateFFT(realPart, imagPart);

         Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
         Audiodata.phase[i] = calculatePhase(realPart, imagPart);

         break;
     }
 }

 function calculateFFT(real, imag) {
     transform(real, imag);
 }

 function calculateAbs(real, imag) {

     var absValue = new Array(real.length / 2 + 1);

     for (i = 0; i < absValue.length; i++) {
         absValue[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
     }
     return absValue;
 }

 function calculatePhase(real, imag) {

     var phaseValue = new Array(real.length / 2 + 1);

     for (i = 0; i < phaseValue.length; i++) {
         phaseValue[i] = Math.atan2(real[i], imag[i]);
     }
     return phaseValue;
 }

 function applyWindow(windowLen, type) {
     var window = new Array(windowLen.length);
     switch (type) {
         case "hann":
             for (i = 0; i < windowLen; i++) {
                 window[i] = (0.5 * (1 - Math.cos(2 * pi * windowLen[i] / (windowLen - 1))));
             }
             return window;
         default:
             break;
     }
 }

 function linspace(startValue, endValue) {

     var linVector = new Array(endValue - startValue);

     for (startValue; startValue <= endValue; startValue++) {
         linVector[startValue] = startValue;
     }

     return linVector;

 }
