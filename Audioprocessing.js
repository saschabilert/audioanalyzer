 // check if AudioContext is supported by the current browser
 if (!window.AudioContext) {
     if (!window.webkitAudioContex) {
         alert("no audiocontext found on this browser");
     }
     window.AudioContext = window.webkitAudioContext;
 }

 // define global object containing all relevant audio informations
 var Audiodata = {
     blockLen: 1024,
     signalLen: undefined,
     sampleRate: undefined,
     samples: undefined,
     numOfChannels: undefined,
     drawCheck: true,
     nPart: undefined,
     hopsize: undefined,
     overlap: 1 / 2,
     spectrogram: undefined,
     phase: undefined,
     groupDelay: undefined,
     instantFreqDev: undefined,
     windowFunction: "hann",
     cepstrum: undefined,
     modSpec: undefined,
     display: "Spectrum",
     windowValue: undefined,
     windowLen: undefined
 };

 // define a global audioContext
 var reader = new FileReader();
 var audioCtx = new AudioContext();

 // function triggered by loading a Audiofile
 function audioProcessing() {

     enableButton();

     document.getElementById("loading").style.display = "block";
     document.getElementById("container").style.display = "block";

     // get the first file data with the id "myAudio"
     var data = document.getElementById("myAudio").files[0];

     // read the data from myAudio as ArrayBuffer
     reader.readAsArrayBuffer(data);

     // save sampleRate as global variable
     Audiodata.sampleRate = audioCtx.sampleRate;

     // trigger the onload function to decode the Audiodata
     reader.onload = function() {
         audioCtx.decodeAudioData(reader.result).then(buffer => {

             myArrayBuffer = buffer;

             Audiodata.numOfChannels = buffer.numberOfChannels;

             Audiodata.hopsize = Audiodata.blockLen - (Audiodata.blockLen *
                 Audiodata.overlap);

             // get the samples of the first channel
             Audiodata.samples = buffer.getChannelData(0);

             Audiodata.signalLen = Audiodata.samples.length;
             var durationMin = Math.floor((Audiodata.signalLen /
                 Audiodata.sampleRate) / 60);
             var durationSec = Math.floor((Audiodata.signalLen /
                 Audiodata.sampleRate) - durationMin * 60);
             if (durationMin < 10) {
                 durationMin = "0" + durationMin;
             }
             if (durationSec < 10) {
                 durationSec = "0" + durationSec;
             }
             info.innerHTML = "00:00" + "/" + durationMin + ":" + durationSec;

             // calculate the number of sampleblocks
             Audiodata.nPart = Math.round((Audiodata.signalLen -
                 Audiodata.blockLen) / Audiodata.hopsize);

             // check the maximum number of blocks ( = 32700);
             checkNumbOfBlocks();

             // create arrays for every display type
             Audiodata.spectrogram = new Array(Audiodata.nPart);
             Audiodata.phase = new Array(Audiodata.nPart);
             // Audiodata.cepstrum = new Array(Audiodata.nPart);
             Audiodata.groupDelay = new Array(Audiodata.nPart);
             // Audiodata.modSpec = new Array(Audiodata.nPart);
             Audiodata.instantFreqDev = new Array(Audiodata.nPart);

             // call calculateDisplay() with current display type
             calculateDisplay(Audiodata.display);

             // draw the spectrogram (see spectrogram.js)
             drawSpec();

             // draw the waveform - just once (see waveform.js)
             if (Audiodata.drawCheck) {
                 drawWave();
             }

             document.getElementById("loading").style.display = "none";
             document.getElementById("container").style.display = "none";
         });
     };
 }

 // calculate data for spectrogram.js depending on type (Types: "Spectrum",
 // "Phase", "Group Delay" and "Instantaneous Frequency Deviation")
 function calculateDisplay(type) {

     // calculate the choosen window (see calculateWindow())
     Audiodata.windowLen = linspace(0, Audiodata.blockLen, Audiodata.blockLen);
     Audiodata.windowValue = calculateWindow(Audiodata.windowLen,
         Audiodata.windowFunction);

     // set the endIdx to slice the array
     var endIdx = 0;

     // cut the audiosamples into blocks and calculate the choosen data
     for (var i = 0; i < Audiodata.nPart; i++) {

         var sampleBlock = Audiodata.samples.slice(Audiodata.hopsize * i,
             Audiodata.blockLen + endIdx);

         // check if type is Instantaneous Frequency Deviation or not
         if (type != "Instantaneous Frequency Deviation") {
             for (var k = 0; k < Audiodata.blockLen; k++) {
                 sampleBlock[k] = sampleBlock[k] * Audiodata.windowValue[k];
             }
             var [realPart, imagPart] = calculateFFT(sampleBlock);
         }

         switch (type) {
             case "Spectrum":
                 Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
                 break;
             case "Phase":
                 Audiodata.phase[i] = calculatePhase(realPart, imagPart);
                 break;
                 // Not working so far try to implement in upcomming version
                 //  case "MFCC":
                 //      Audiodata.cepstrum[i] = calculateMFCC(realPart, imagPart);
                 //      break;
                 // Not working so far try to implement in upcomming verion
                 //  case "Modulation Spectrum":
                 //      Audiodata.modSpec[i] = calculateModSpec(realPart, imagPart);
                 //      break;
             case "Group Delay":
                 Audiodata.groupDelay[i] = calculateGroupDelay(realPart, imagPart);
                 break;
             case "Instantaneous Frequency Deviation":
                 Audiodata.instantFreqDev[i] = calculateInstantFreqDev(sampleBlock,
                     Audiodata.windowFunction);
                 break;
             default:
                 Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
                 break;
         }
         endIdx = endIdx + Audiodata.hopsize;
     }
 }

 // calculate the fft depending on the given sampleblock
 function calculateFFT(sampleBlock) {

     var imag = new Array(sampleBlock.length).fill(0);
     var real = sampleBlock;

     // call the fft from Nayuki (see fft.js for more information)
     transform(real, imag);

     return [real, imag];
 }

 // calculate the absolute value of the spectrogram data (see formula in
 // instructions.html)
 function calculateAbs(real, imag) {

     var absValue = new Array(Audiodata.blockLen / 2 + 1);

     for (i = 0; i < absValue.length; i++) {
         absValue[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
     }
     return absValue;
 }

 // calculate the phase of the spectrogram data (see formula in instructions.html)
 function calculatePhase(real, imag) {

     var phaseValue = new Array(real.length / 2 + 1);

     for (i = 0; i < phaseValue.length; i++) {
         phaseValue[i] = Math.atan2(real[i], imag[i]);
     }
     return phaseValue;
 }

 // calculate the group delay using calcluatePhase() and linspace() (see formula
 // in instructions.html)
 function calculateGroupDelay(real, imag) {

     var phase = calculatePhase(real, imag);

     //TODO: Is not useful here, fix later
     var freqVector = linspace(0, Audiodata.sampleRate / 2, Audiodata.blockLen / 2);

     var dOmega = (freqVector[2] - freqVector[1]) * 2 * Math.PI;

     var dPhase = diff(phase);

     var groupDelay = new Array(dPhase.length);

     for (var k = 0; k < dPhase.length; k++) {
         if (dPhase[k] > Math.PI) {
             dPhase[k] = dPhase[k] - 2 * Math.PI;
         } else if (dPhase[k] < (-1 * Math.PI)) {
             dPhase[k] = dPhase[k] + 2 * Math.PI;
         }
         groupDelay[k] = -1 * dPhase[k] / dOmega;
     }
     return groupDelay;
 }

 // calculate the instantaneous frequency deviation for more informations see
 // the instructions.html website
 function calculateInstantFreqDev(sampleBlock, windowType) {

     var overlap = 1 / 1.024;

     var newSampleBlockLen = sampleBlock.length * overlap;

     var windowLen = linspace(0, newSampleBlockLen, newSampleBlockLen);

     var window = calculateWindow(windowLen, windowType);

     var firstSampleBlock = sampleBlock.slice(0, newSampleBlockLen);

     var secondSampleBlock = sampleBlock.slice(sampleBlock.length -
         newSampleBlockLen - 1, sampleBlock.length - 1);

     for (var i = 0; i < newSampleBlockLen; i++) {
         firstSampleBlock[i] = firstSampleBlock[i] * window[i];
         secondSampleBlock[i] = secondSampleBlock[i] * window[i];
     }

     var [firstReal, firstImag] = calculateFFT(firstSampleBlock);
     var [secondReal, secondImag] = calculateFFT(secondSampleBlock);

     var firstPhase = calculatePhase(firstReal, firstImag);

     var secondPhase = calculatePhase(secondReal, secondImag);

     var instantFreq = new Array(newSampleBlockLen / 2 + 1).fill(0);
     var instantFreqDev = new Array(instantFreq.length).fill(0);

     var freq_wrap = Audiodata.sampleRate / (sampleBlock.length - newSampleBlockLen);

     var freq = linspace(0, Audiodata.sampleRate / 2, instantFreq.length);

     for (var k = 0; k < instantFreq.length; k++) {
         var dPhase = secondPhase[k] - firstPhase[k];

         instantFreq[k] = dPhase + Math.round((freq[k] - dPhase) / freq_wrap) * freq_wrap;

         instantFreqDev[k] = instantFreq[k] - freq[k];
     }
     return instantFreqDev;
 }

 // Cosine - transform needed to calculate the MFCC's so we deferred it
 /* function calculateMFCC(real, imag) {

     var absValue = calculateAbs(real, imag);
     var melFreq = new Array(absValue.length);

     melFreq = calculateMelFreq(absValue);

     var completeReal = new Array(Audiodata.blockLen);
     var completeImag = new Array(Audiodata.blockLen).fill(0);

     for (var k = 0; k < Audiodata.blockLen / 2; k++) {

         var logAbsValue = Math.log10(absValue[k] * absValue[k]);
         completeReal[k] = logAbsValue;
         completeReal[(Audiodata.blockLen - 1) - k] = logAbsValue;
     }

     inverseTransform(completeReal, completeImag);

     for (var i = 0; i < completeReal.length; i++) {
         completeReal[i] = Math.abs(completeReal[i]);
         completeReal[i] = completeReal[i] * completeReal[i];
     }
     return completeReal;
 }
 */

 // calculate the Mel-Frequency bands for the MFCC function (not working so far)
 /* function calculateMelFreq(freq) {

     var mel = new Array(freq.length);

     for (var i = 0; i < freq.length; i++) {
         mel[i] = 1127 * Math.log(1 + (freq[i] / (700 / (Audiodata.sampleRate / 2))));
     }
     return mel;
 }
 */

 // is not correct so far maybe not possible to display
 /* function calculateModSpec(real, imag) {

     var analyticWeight = new Array(real.length).fill(0);
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

     var envelopeReal = calculateAbs(analyticReal, analyticImag);

     var envelopeImag = new Array(envelopeReal.length).fill(0);

     transform(envelopeReal, envelopeImag);

     var modSpec = calculateAbs(envelopeReal, envelopeImag);

     return modSpec;
 }
 */

 // calculate the different windows depending on the window length and the
 // window type (Types: "hann", "hannpoisson", "consine", "kaiser-bessel",
 // "flat-top" and "rect") see instructions.html
 function calculateWindow(windowLen, type) {

     var window = new Array(windowLen.length);

     switch (type) {
         case "hann":
             for (i = 0; i < windowLen.length; i++) {
                 window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] /
                     (windowLen.length - 1)));
             }
             break;
         case "hannpoisson":
             // alpha is a parameter that controls the slope of the exponential
             // (Wiki: https://en.wikipedia.org/wiki/Window_function)
             var alpha = 2;

             for (i = 0; i < windowLen.length; i++) {
                 window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] /
                     (windowLen.length - 1))) * Math.exp((-alpha *
                         Math.abs(windowLen.length - 1 - (2 * windowLen[i]))) /
                     (windowLen.length - 1));
             }
             break;
         case "cosine":
             for (i = 0; i < windowLen.length; i++) {
                 window[i] = Math.cos(((Math.PI * windowLen[i]) /
                     (windowLen.length)) - (Math.PI / 2));
             }
             break;
         case "kaiser-bessel":
             var alpha = 2;
             var denom = new Array(windowLen.length);
             var numer = Math.PI * alpha;

             for (i = 0; i < windowLen.length; i++) {
                 denom[i] = Math.PI * alpha * Math.sqrt(1 - (((2 *
                         windowLen[i]) / (windowLen.length - 1) - 1) *
                     ((2 * windowLen[i]) / (windowLen.length - 1) - 1)));
             }

             numer = besselfkt(numer);
             denom = besselfkt(denom);

             for (i = 0; i < denom.length; i++) {
                 window[i] = denom[i] / numer;
             }
             break;
         case "flat-top":
             // alpha is a parameter that controls the slope of the exponential
             // (Wiki: https://en.wikipedia.org/wiki/Window_function)
             var alpha = [1, 1.93, 1.29, 0.388, 0.028];

             for (i = 0; i < windowLen.length; i++) {
                 window[i] = alpha[0] - alpha[1] * Math.cos(2 * Math.PI *
                         windowLen[i] / (windowLen.length - 1)) + alpha[2] *
                     Math.cos(4 * Math.PI * windowLen[i] /
                         (windowLen.length - 1)) - alpha[3] *
                     Math.cos(6 * Math.PI * windowLen[i] /
                         (windowLen.length - 1)) + alpha[4] *
                     Math.cos(8 * Math.PI * windowLen[i] /
                         (windowLen.length - 1));
             }
             break;
         case "rect":
             window.fill(1);
             break;
     }
     return window;
 }

 // implementation of the linspace function make use of start value, end value
 // and the number of points between the start and end index
 function linspace(startIdx, endIdx, n) {

     var linVector = new Array(n);

     for (var i = 0; i < n; i++) {
         linVector[i] = startIdx + (i * (endIdx - startIdx) / n);
     }
     linVector[0] = startIdx;
     linVector[n - 1] = endIdx;
     return linVector;
 }

 // caluclate the difference between each element of an array
 function diff(array) {

     var difference = new Array(array.length - 1);

     for (var i = 0; i < difference.length; i++) {
         difference[i] = array[i + 1] - array[i];
     }
     return difference;
 }

 // implementation of the bessel function of first kind (I0), see more
 // information in instructions.html
 function besselfkt(array) {

     var bessel = new Array(array.length).fill(0);

     for (i = 0; i < bessel.length; i++) {
         var n = i + 1;
         bessel[i] = Math.pow((array[i] / 2), n) / Math.pow(factorial(i), 2);
     }
     return bessel;
 }

 // implementation of the factorial of the number n (e.g 3! = 6)
 function factorial(n) {

     var fak = 1;

     for (var i = 1; i <= n; i++) {
         fak = fak * i;
     }
     return fak;
 }

 // check if the maximum block number for canvas is given
 function checkNumbOfBlocks() {

     var maxBlockNumb = 32767;

     if (Audiodata.nPart > maxBlockNumb) {
         alert("Reached the maximum number of blocks. Data not fully displayed!");
         Audiodata.nPart = maxBlockNumb;
     }
 }
