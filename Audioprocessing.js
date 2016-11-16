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
     overlap: 1 / 2,
     spectrogram: undefined,
     phase: undefined,
     groupDelay: undefined,
     samples: undefined,
     windowFunction: undefined,
     cepstrum: undefined,
     envelope: undefined,
     modSpec: undefined,
     display: undefined
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
             myArrayBuffer = buffer;

             Audiodata.hopsize = Audiodata.blockLen - (Audiodata.blockLen * Audiodata.overlap);
             
             Audiodata.samples = buffer.getChannelData(0);

             Audiodata.signalLen = Audiodata.samples.length;

             // calculate the startpoints for the sample blocks
             Audiodata.nPart = Math.floor((Audiodata.signalLen - Audiodata.blockLen) / Audiodata.hopsize);

             Audiodata.spectrogram = new Array(Audiodata.nPart);

             Audiodata.phase = new Array(Audiodata.nPart);

             Audiodata.cepstrum = new Array(Audiodata.nPart);

             Audiodata.groupDelay = new Array(Audiodata.nPart);

             Audiodata.envelope = new Array(Audiodata.nPart);

             // give the decoded Audiodata to the split-function
             calculateDisplay(window, Audiodata.display);

             drawSpec();

             drawWave();

             enableButton();

         });
     };
 }

 function calculateDisplay(window, type) {

     // create array with zeros for imaginär part to use the fft
     var zeros = new Array(Audiodata.blockLen);

     var windowLen = linspace(0, Audiodata.blockLen, Audiodata.blockLen);

     var window = applyWindow(windowLen, Audiodata.windowFunction);
     var endIdx = 0;

     for (var i = 0; i < Audiodata.nPart; i++) {

         var realPart = Audiodata.samples.slice(Audiodata.hopsize * i,
             Audiodata.blockLen + endIdx);
         var imagPart = zeros.fill(0);

         for (var k = 0; k < Audiodata.blockLen; k++) {
             realPart[k] = realPart[k] * window[k];
         }

         transform(realPart, imagPart);

         switch (type) {
             case "Spectrum":
                 Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
                 break;
             case "Phase":
                 Audiodata.phase[i] = calculatePhase(realPart, imagPart);
                 break;
             case "MFCC":
                 Audiodata.cepstrum[i] = calculateCepstrum(realPart, imagPart);
                 break;
             case "Modulation Spectrum":
                 Audiodata.modSpec[i] = calculateModSpec(realPart, imagPart);
                 break;
             case "Group Delay":
                 Audiodata.phase[i] = calculatePhase(realPart, imagPart);
                 if (i == Audiodata.nPart - 1) {
                     calculateGroupDelay();
                 }
                 break;
             default:
                 Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
                 break;
         }
         endIdx = endIdx + Audiodata.hopsize;
     }
 }

 // function calculateSpec(buffer) {
 //     // define the block length :: later blockLen as user input
 //     // Audiodata.blockLen = +inputBlock;
 //     // define hopsize 25% of blockLen
 //     Audiodata.hopsize = Audiodata.blockLen * Audiodata.overlap;
 //
 //     Audiodata.samples = buffer.getChannelData(0);
 //
 //     Audiodata.signalLen = Audiodata.samples.length;
 //
 //     // calculate the startpoints for the sample blocks
 //     Audiodata.nPart = Math.floor((Audiodata.signalLen - Audiodata.blockLen) / Audiodata.hopsize);
 //
 //     // create array with zeros for imaginär part to use the fft
 //     var zeros = new Array(Audiodata.blockLen).fill(0);
 //
 //     var endIdx = 0;
 //
 //     var windowLen = linspace(0, Audiodata.blockLen, Audiodata.blockLen);
 //
 //     var window = applyWindow(windowLen, Audiodata.windowFunction);
 //
 //     Audiodata.spectrogram = new Array(Audiodata.nPart);
 //
 //     Audiodata.phase = new Array(Audiodata.nPart);
 //
 //     Audiodata.cepstrum = new Array(Audiodata.nPart);
 //
 //     Audiodata.groupDelay = new Array(Audiodata.nPart);
 //
 //     Audiodata.envelope = new Array(Audiodata.nPart);
 //
 //     for (var i = 0; i < Audiodata.nPart; i++) {
 //
 //         var realPart = Audiodata.samples.slice(Audiodata.hopsize * i,
 //             Audiodata.blockLen + endIdx);
 //         var imagPart = zeros.fill(0);
 //
 //         for (var k = 0; k < Audiodata.blockLen; k++) {
 //             realPart[k] = realPart[k] * window[k];
 //         }
 //
 //         endIdx = endIdx + Audiodata.hopsize;
 //
 //         transform(realPart, imagPart);
 //
 //         Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
 //         Audiodata.phase[i] = calculatePhase(realPart, imagPart);
 //         Audiodata.cepstrum[i] = calculateCepstrum(realPart, imagPart);
 //         Audiodata.envelope[i] = calculateHilbert(realPart, imagPart);
 //     }
 //     calculateGroupDelay();
 //     calculateModSpec();
 //
 //     console.log(Audiodata.modSpec);
 // }

 function calculateCepstrum(real, imag) {

     var absValue = calculateAbs(real, imag);

     var completeReal = new Array(Audiodata.blockLen);
     var completeImag = new Array(Audiodata.blockLen).fill(0);

     for (var k = 0; k < Audiodata.blockLen / 2; k++) {
         // Achtung wird bei 0 zu -Infinity
         var logAbsValue = Math.log10(absValue[k] * absValue[k]); // / Audiodata.blockLen;
         completeReal[k] = logAbsValue;
         completeReal[(Audiodata.blockLen - 1) - k] = logAbsValue;
     }

     inverseTransform(completeReal, completeImag);

     for (var i = 0; i < completeReal.length; i++) {
         completeReal[i] = Math.abs(completeReal[i]);
         //  completeReal = completeReal / Audiodata.blockLen;
         completeReal[i] = completeReal[i] * completeReal[i];
     }

     return completeReal;
 }

 function calculateGroupDelay() {

     var freqVector = linspace(0, Audiodata.sampleRate / 2, Audiodata.blockLen / 2);

     var dOmega = (freqVector[2] - freqVector[1]) * 2 * Math.PI;

     for (var i = 0; i < Audiodata.nPart; i++) {

         var dPhase = diff(Audiodata.phase[i]);

         for (var k = 0; k < dPhase.length; k++) {
             dPhase[k] = -1 * dPhase[k] / dOmega;
         }
         Audiodata.groupDelay[i] = dPhase;
     }
 }

 function calculateModSpec(real, imag) {

     analyticWeight = new Array(real.length).fill(0);
     analyticWeight[0] = 1;
     analyticWeight[Audiodata.blockLen / 2 - 1] = 1;

     for (var i = 1; i < Audiodata.blockLen / 2 - 1; i++) {
         analyticWeight[i] = 2;
     }

     analyticImag = new Array(imag.length).fill(0);
     analyticReal = new Array(real.length).fill(0);

     for (var k = 0; k < real.length; k++) {
         analyticReal[k] = real[k] * analyticWeight[k];
     }

     inverseTransform(analyticReal, analyticImag);

     var envelope = calculateAbs(analyticReal, analyticImag);

     return envelope;

 }

 // function calculateModSpec() {
 //
 //     Audiodata.modSpec = new Array(Audiodata.nPart);
 //
 //     imagSignal = new Array(Audiodata.envelope[0].length).fill(0);
 //
 //     for (var i = 0; i < Audiodata.nPart; i++) {
 //         var realSignal = Audiodata.envelope[i];
 //         console.log(realSignal);
 //         console.log(imagSignal);
 //         transform(realSignal, imagSignal);
 //         Audiodata.modSpec[i] = calculateAbs(realSignal, imagSignal);
 //     }
 // }

 function calculateAbs(real, imag) {

     var absValue = new Array(Audiodata.blockLen / 2 + 1);

     for (i = 0; i < absValue.length; i++) {
         absValue[i] = Math.sqrt(real[(Audiodata.blockLen / 2) + i] * real[(Audiodata.blockLen / 2) + i] + imag[(Audiodata.blockLen / 2) + i] * imag[(Audiodata.blockLen / 2) + i]);
     }
     return absValue;
 }

 function calculatePhase(real, imag) {

     var phaseValue = new Array(Audiodata.blockLen / 2 + 1);

     for (i = 0; i < phaseValue.length; i++) {
         phaseValue[i] = Math.atan2(real[i], imag[i]);
     }
     return phaseValue;
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

     var difference = new Array(array.length - 1);

     for (var i = 0; i < difference.length; i++) {
         difference[i] = array[i + 1] - array[i];
     }
     return difference;
 }
