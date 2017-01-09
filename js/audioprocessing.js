/*
 * audioprocessing.js
 *
 * Copyright (C) 2016  Moritz Balter, Vlad Paul, Sascha Bilert
 * IHA @ Jade Hochschule applied licence see EOF
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * contact: moritz.balters@student.jade-hs.de
 * contact: sascha.bilert@student.jade-hs.de
 * contact: vlad.paul@student.jade-hs.de
 */

// check if AudioContext is supported by the current browser
if (!window.AudioContext) {
    if (!window.webkitAudioContex) {
        alert("no audiocontext found on this browser");
    }
    window.AudioContext = window.webkitAudioContext;
}

// define global object containing all audio informations
var Audiodata = {
    blockLen: 1024,
    signalLen: undefined,
    sampleRate: undefined,
    samples: undefined,
    numOfChannels: undefined,
    nPart: undefined,
    hopsize: undefined,
    overlap: 1 / 2,
    spectrogram: undefined,
    phase: undefined,
    groupDelay: undefined,
    instantFreqDev: undefined,
    windowFunction: "hann",
    display: "Spectrum",
    windowValue: undefined,
    windowLen: undefined,
    wrapFreq: 250
};

// define a global audioContext
var reader = new FileReader();
var audioCtx = new AudioContext();

// function to load the Audiodata
function loadAudio() {

    // display the loading screen
    document.getElementById("loading").style.display = "block";
    document.getElementById("container").style.display = "block";
    enableButton();

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

            // get the samples of the first channel
            Audiodata.samples = buffer.getChannelData(0);

            // calculate the length of the audiosignal
            Audiodata.signalLen = Audiodata.samples.length;

            drawWave();

            processAudio();

            // hide the loading display after processing the audiodata
            document.getElementById("loading").style.display = "none";
            document.getElementById("container").style.display = "none";
        });
    }
}

// function to process the Audiodata with the given parameters
function processAudio() {

    Audiodata.hopsize = Math.round(Audiodata.blockLen - (Audiodata.blockLen * Audiodata.overlap));

    // calculate the audiodata duration
    var duration = (Audiodata.signalLen / Audiodata.sampleRate);

    info.innerHTML = "00:00.0" +
        "&thinsp;/&thinsp;" + timeToString(duration, 1, 0);

    // calculate the number of sampleblocks
    Audiodata.nPart = Math.round((Audiodata.signalLen - Audiodata.blockLen) / Audiodata.hopsize);

    // check the maximum number of blocks ( = 32700);
    checkNumbOfBlocks();

    // create arrays for every display type
    Audiodata.spectrogram = new Array(Audiodata.nPart);
    Audiodata.phase = new Array(Audiodata.nPart);
    Audiodata.groupDelay = new Array(Audiodata.nPart);
    Audiodata.instantFreqDev = new Array(Audiodata.nPart);

    // call calculateDisplay() with current display type
    calculateDisplay(Audiodata.display);

    // draw the spectrogram (see spectrogram.js)
    drawSpec();

}

/*
 * calculate data for spectrogram.js depending on type (Types: "Spectrum",
 * "Phase", "Group Delay" and "Instantaneous Frequency Deviation")
 */
function calculateDisplay(type) {

    // calculate the choosen window (see calculateWindow())
    Audiodata.windowLen = linspace(0, Audiodata.blockLen, Audiodata.blockLen);
    Audiodata.windowValue = calculateWindow(Audiodata.windowLen, Audiodata.windowFunction);

    // cut the audiosamples into blocks and calculate the choosen data
    for (var i = 0; i < Audiodata.nPart; i++) {

        var sampleBlock = Audiodata.samples.slice(Audiodata.hopsize * i, Audiodata.blockLen + Audiodata.hopsize * i);

        // check if type is Instantaneous Frequency Deviation or not
        if (type != "Instantaneous Frequency Deviation") {
            for (var k = 0; k < Audiodata.blockLen; k++) {
                sampleBlock[k] = sampleBlock[k] * Audiodata.windowValue[k];
            }
            var [realPart,
                imagPart] = calculateFFT(sampleBlock);
        }

        switch (type) {
            case "Spectrum":
                Audiodata.spectrogram[i] = calculateAbs(realPart, imagPart);
                break;
            case "Phase":
                Audiodata.phase[i] = calculatePhase(realPart, imagPart);
                break;
            case "Group Delay":
                Audiodata.groupDelay[i] = calculateGroupDelay(realPart, imagPart);
                break;
            case "Instantaneous Frequency Deviation":
                Audiodata.instantFreqDev[i] = calculateInstantFreqDev(sampleBlock, Audiodata.windowFunction);
                break;
            default:
                alert("404 spectrogram not found!");
        }
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

// calculate the absolute value of the spectrogram data (see formula in instructions.html)
function calculateAbs(real, imag) {

    var absValue = new Array(real.length / 2 + 1);

    for (i = 0; i < absValue.length; i++) {
        absValue[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    return absValue;
}

// calculate the phase of the spectrogram data (see formula in instructions.html)
function calculatePhase(real, imag) {

    var phaseValue = new Array(real.length / 2 + 1);

    for (i = 0; i < phaseValue.length; i++) {
        phaseValue[i] = Math.atan2(imag[i], real[i]);
    }
    return phaseValue;
}

/*
 * calculate the group delay using calcluatePhase() and linspace() (see formula
 * in instructions.html)
 */
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

/*
 * calculate the instantaneous frequency deviation for more informations see
 * the instructions.html website
 */
function calculateInstantFreqDev(sampleBlock, windowType) {

    var InstHopsize = Audiodata.sampleRate / Audiodata.wrapFreq;

    var newSampleBlockLen = Math.round(sampleBlock.length - InstHopsize);

    var windowLen = linspace(0, newSampleBlockLen, newSampleBlockLen);

    var window = calculateWindow(windowLen, windowType);

    var firstSampleBlock = sampleBlock.slice(0, newSampleBlockLen);

    var secondSampleBlock = sampleBlock.slice(sampleBlock.length - newSampleBlockLen, sampleBlock.length);

    for (var i = 0; i < newSampleBlockLen; i++) {
        firstSampleBlock[i] = firstSampleBlock[i] * window[i];
        secondSampleBlock[i] = secondSampleBlock[i] * window[i];
    }

    var [firstReal,
        firstImag] = calculateFFT(firstSampleBlock);
    var [secondReal,
        secondImag] = calculateFFT(secondSampleBlock);

    var firstPhase = calculatePhase(firstReal, firstImag);

    var secondPhase = calculatePhase(secondReal, secondImag);

    var instantFreq = new Array(newSampleBlockLen / 2 + 1).fill(0);
    var instantFreqDev = new Array(instantFreq.length).fill(0);

    var freq = linspace(0, Audiodata.sampleRate / 2, instantFreq.length);

    for (var k = 0; k < instantFreq.length; k++) {
        var dPhase = secondPhase[k] - firstPhase[k];

        instantFreq[k] = dPhase * Audiodata.wrapFreq / (2 * Math.PI);

        instantFreq[k] = instantFreq[k] + Math.round((freq[k] - instantFreq[k]) / Audiodata.wrapFreq) * Audiodata.wrapFreq;

        instantFreqDev[k] = instantFreq[k] - freq[k];
    }
    return instantFreqDev;
}

/*
 * calculate the different windows depending on the window length and the
 * window type (Types: "hann", "hannpoisson", "consine", "hamming",
 *"flat-top", "blackman" and "rect") see instructions.html
 */
function calculateWindow(windowLen, type) {

    var window = new Array(windowLen.length);

    switch (type) {
        case "hann":
            for (i = 0; i < windowLen.length; i++) {
                window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] / (windowLen.length - 1)));
            }
            break;
        case "hannpoisson":
            // alpha is a parameter that controls the slope of the exponential
            // (Wiki: https://en.wikipedia.org/wiki/Window_function)
            var alpha = 2;

            for (i = 0; i < windowLen.length; i++) {
                window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * windowLen[i] / (windowLen.length - 1))) * Math.exp((-alpha * Math.abs(windowLen.length - 1 - (2 * windowLen[i]))) / (windowLen.length - 1));
            }
            break;
        case "cosine":
            for (i = 0; i < windowLen.length; i++) {
                window[i] = Math.cos(((Math.PI * windowLen[i]) / (windowLen.length)) - (Math.PI / 2));
            }
            break;
        case "hamming":
            // alpha is a parameter that controls the slope of the exponential
            // (Wiki: https://en.wikipedia.org/wiki/Window_function)
            var alpha = 0.54;
            var beta = 1 - alpha;

            for (i = 0; i < windowLen.length; i++) {
                window[i] = alpha - beta * Math.cos((2 * Math.PI * windowLen[i]) / (windowLen.length - 1));
            }
            break;
        case "flat-top":
            // alpha is a parameter that controls the slope of the exponential
            // (Wiki: https://en.wikipedia.org/wiki/Window_function)
            var alpha = [1, 1.93, 1.29, 0.388, 0.028];

            for (i = 0; i < windowLen.length; i++) {
                window[i] = alpha[0] - alpha[1] * Math.cos(2 * Math.PI * windowLen[i] / (windowLen.length - 1)) + alpha[2] * Math.cos(4 * Math.PI * windowLen[i] / (windowLen.length - 1)) - alpha[3] * Math.cos(6 * Math.PI * windowLen[i] / (windowLen.length - 1)) + alpha[4] * Math.cos(8 * Math.PI * windowLen[i] / (windowLen.length - 1));
            }
            break;
        case "blackman":
            // alpha is a parameter that controls the slope of the exponential
            // (Wiki: https://en.wikipedia.org/wiki/Window_function)
            var alpha = 0.16;
            var alpha0 = (1 - alpha) / 2;
            var alpha1 = 1 / 2;
            var alpha2 = alpha / 2;

            for (i = 0; i < windowLen.length; i++) {
                window[i] = alpha0 - alpha1 * Math.cos((2 * Math.PI * windowLen[i]) / (windowLen.length - 1)) + alpha2 * Math.cos((4 * Math.PI * windowLen[i]) / (windowLen.length - 1));
            }
            break;
        case "rect":
            window.fill(1);
            break;
        default:
            alert("no window type is choosen!");
    }
    return window;
}

/*
 * implementation of the linspace function make use of start value, end value
 * and the number of points between the start and end index
 */
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

// check if the maximum block number for canvas is given
function checkNumbOfBlocks() {

    var maxBlockNumb = 32767;

    if (Audiodata.nPart > maxBlockNumb) {
        alert("Reached the maximum number of blocks.\n Data not fully displayed!");
        Audiodata.nPart = maxBlockNumb;
    }
}