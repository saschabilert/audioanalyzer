 // check if AudioContext is supported be the current browser
 if (!window.AudioContext) {
     if (!window.webkitAudioContex) {
         alert("no audiocontext found");
     }
     window.AudioContext = window.webkitAudioContext;
 }

 var Audiodata = {
     blockLen: 1024,
     signalLen: undefined,
     sampleRate: undefined,
     numOfChannels: undefined,
     nPart: undefined,
     hopsize: undefined,
     overlap: 1 / 4,
     spectrogram: undefined,
     phase: undefined,
     groupDelay: undefined,
     angle: undefined,
     samples: undefined,
     windowFunction: undefined,
     cepstrum: undefined
     buffer: undefined
 };
 // define global audioContext
 var reader = new FileReader();
 var audioCtx = new AudioContext();

 // function triggered by loading a Audiodata
 function audioProcessing() {



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
     // Audiodata.blockLen = +inputBlock;
     // define hopsize 25% of blockLen
     Audiodata.hopsize = Audiodata.blockLen * Audiodata.overlap;

     Audiodata.samples = buffer.getChannelData(0);

     Audiodata.signalLen = Audiodata.samples.length;

     Audiodata.angle = "radian";

     // calculate the startpoints for the sample blocks
     Audiodata.nPart = Math.floor((Audiodata.signalLen - Audiodata.blockLen) / Audiodata.hopsize);

     // create array with zeros for imaginär part to use the fft
     var zeros = new Array(Audiodata.blockLen).fill(0);

     var endIdx = 0;

     var windowLen = linspace(0, Audiodata.blockLen, Audiodata.blockLen);

     var window = applyWindow(windowLen, Audiodata.windowFunction);

     //  console.log(window);
     console.log(Audiodata.nPart);

     Audiodata.spectrogram = new Array(Audiodata.nPart);

     Audiodata.phase = new Array(Audiodata.nPart);

     Audiodata.cepstrum = new Array(Audiodata.nPart);

     Audiodata.groupDelay = new Array(Audiodata.nPart);

     for (var i = 0; i < Audiodata.nPart; i++) {

         var realPart = Audiodata.samples.slice(Audiodata.hopsize * i,
             Audiodata.blockLen + endIdx);
         var imagPart = zeros.fill(0);

         for (var k = 0; k < Audiodata.blockLen; k++) {
             realPart[k] = realPart[k] * window[k];
         }
         endIdx = endIdx + Audiodata.hopsize;

         calculateFFT(realPart, imagPart);

         Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
         Audiodata.phase[i] = calculatePhase(realPart, imagPart);
         //  Audiodata.cepstrum[i] = calculateCepstrum(realPart, imagPart);
     }
     //  console.log(Audiodata.phase);

     calculateGroupDelay();

     //  console.log(Audiodata.groupDelay);

 }

 function calculateFFT(real, imag) {
     transform(real, imag);
 }

 function calculateCepstrum(real, imag) {

     var cepstrum = new Array(real.length / 2 + 1);

     for (var i = 0; i < Audiodata.nPart; i++) {

         cepstrum[i] = inverseTransform(Math.log10(Audiodata.spectrogram[i] *
             Audiodata.spectrogram[i]), imag);
     }
     return cepstrum;
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
         if (Audiodata.angle == "radian")
             phaseValue[i] = Math.atan2(real[i], imag[i]);
         else
             phaseValue[i] = Math.atan2(real[i], imag[i]) * (180 / Math.PI);
     }
     return phaseValue;
 }

 function calculateGroupDelay() {

     var freqVector = linspace(0, Audiodata.sampleRate / 2, Audiodata.blockLen / 2);

     var dOmega = (freqVector[2] - freqVector[1]) * 2 * Math.PI;

     for (var i = 0; i < Audiodata.nPart; i++) {
         Audiodata.groupDelay[i] = -1 * diff(Audiodata.phase[i] / dOmega);
     }
 }

 function applyWindow(windowLen, type) {
     var window = new Array(windowLen.length);
     switch (type) {
         case "hann":
             for (i = 0; i < windowLen.length; i++) {
                 window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] / (windowLen.length - 1)));
             }
             break;
         case "hannpoisson":
             // α is a parameter that controls the slope of the exponential (wiki)
             var alpha = 2;

             for (i = 0; i < windowLen.length; i++) {
                 window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] / (windowLen.length - 1))) *
                     Math.exp((-alpha * Math.abs(windowLen.length - 1 - (2 * windowLen[i]))) / (windowLen.length - 1));
             }
             break;
         case "cosine":
             for (i = 0; i < windowLen.length; i++) {
                 window[i] = Math.cos(((Math.PI * windowLen[i]) / (windowLen.length)) - (Math.PI / 2));
             }
             break;
         default:
             window.fill(1);
             break;
     }
     return window;
 }

 function linspace(startIdx, endIdx, n) {

     var linVector = new Array(n);

     for (var i = 0; i < n; i++) {
         linVector[i] = startIdx + (i * (endIdx - startIdx) / n);
     }
     linVector[0] = startIdx;
     linVector[n - 1] = endIdx;
     return linVector;
 }

 function diff(array) {

     var difference = new Array(array.length);

     for (var i = 2; i < array.length; i++) {
         difference = array[i] - array[i - 1];
     }
     return difference;
 }