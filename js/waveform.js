/*
 * waveform.js
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
 * contact: sascha.bilert@student.jade-hs.de
 */

var WaveData = {
    gridScale: 1 / 16,
    stepsX: undefined,
    amplitude: undefined,
    rms: undefined
};

var mouseUsed = 0;
var intervalDrawSelect;
var selectionX = NaN;
var startSelection = NaN;
var offSetLeft = 24;
var offSetBottom = 20;

function drawWave() {

    var canvas = document.getElementById("canvasWave");
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvasRMS = document.getElementById("canvasRMS");

    canvasWaveLine.addEventListener("mousedown", startPlayHereWave);
    canvasWaveLine.addEventListener("mousedown", waveOnMouseDown);
    canvasWaveLine.addEventListener("mouseup", waveOnMouseUp);
    canvasWaveLine.addEventListener("mousemove", displayWavePosition);
    canvasWaveLine.addEventListener("dblclick", resetSelection);

    if (canvas.getContext) {

        var canvasCtx = canvas.getContext("2d");
        var canvasCtxRMS = canvas.getContext("2d");

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtxRMS.clearRect(0, 0, canvasCtx.width, canvasCtx.height);

        var waveScale = 100;

        var canvasBlockLen = Audiodata.signalLen / canvas.width;

        var nPart = Math.floor(Audiodata.signalLen / canvasBlockLen);

        var currentBlock = new Array(canvasBlockLen.length);
        var maxValue = new Array(nPart);
        var minValue = new Array(nPart);
        var peak = new Array(nPart);
        var rms = new Array(nPart);

        for (i = 0; i < nPart; i++) {

            currentBlock = Audiodata.samples.slice(canvasBlockLen * i, canvasBlockLen * (i + 1));

            maxValue[i] = Math.max(...currentBlock) * waveScale;

            minValue[i] = Math.min(...currentBlock) * waveScale;

            rms[i] = calculateRMS(currentBlock);

            if (Math.max(...currentBlock) >= Math.abs(Math.min(...currentBlock))) {
                peak[i] = Math.max(...currentBlock);
            } else if (Math.max(...currentBlock) < Math.abs(Math.min(...currentBlock))) {
                peak[i] = Math.abs(Math.min(...currentBlock));
            }
        }

        drawWaveTimeAxes();
        drawWaveGrid();

        canvasCtx.beginPath();
        canvasCtx.strokeStyle = "#100C87";
        canvasCtx.lineWidth = 0.05;

        canvasCtx.moveTo(0, canvas.height / 2);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtx.lineTo(i, canvas.height / 2 - maxValue[i]);
            canvasCtx.lineTo(i, canvas.height / 2 - minValue[i]);
            canvasCtx.stroke();
        }

        canvasCtxRMS.beginPath();
        canvasCtxRMS.strokeStyle = "#66a3ff";
        canvasCtxRMS.lineWidth = 0.05;

        canvasCtxRMS.moveTo(0, canvas.height / 2);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtxRMS.lineTo(i, canvas.height / 2 - rms[i] * waveScale);
            canvasCtxRMS.lineTo(i, canvas.height / 2 + rms[i] * waveScale);
            canvasCtxRMS.stroke();
        }

        WaveData.amplitude = peak;
        WaveData.rms = rms;
        WaveData.crestFactor = calculateCrestFactor(peak, rms);

    } else {
        // canvas-unsupported code here
    }

    function calculateRMS(samples) {

        var sum = 0;

        for (var i = 0; i < samples.length; i++) {
            sum = sum + (samples[i] * samples[i]);
        }

        var rms = Math.sqrt(sum / samples.length);

        return rms;
    }

    function calculateCrestFactor(peak, rms) {

        var crestFactor = new Array(rms.length);

        for (var i = 0; i < crestFactor.length; i++) {
            crestFactor[i] = peak[i] / rms[i];
            if (isFinite(crestFactor[i]) == false) {
                crestFactor[i] = 0;
            }
        }
        return crestFactor;
    }

    function startPlayHereWave(evt) {

        var mousePos = getMousePos(canvas, evt);
        mouseTime = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x;
        if (isPlaying) {
            toggleSound();
        }
        startOffset = mouseTime;
        drawLineKlickWave(mouseTime);
        drawLineKlick(mouseTime);
    }
}

function drawLineKlickWave(mouseTime) {

    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvas = document.getElementById("canvasWave");
    var ctxLine = canvasWaveLine.getContext("2d");
    mousePos = (mouseTime * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
    ctxLine.clearRect(0, 0, canvasWaveLine.width, canvasWaveLine.height);
    ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' + 0 + ')';
    ctxLine.fillRect(mousePos, 0, 2, canvasWaveLine.height);
    drawLineKlick(mouseTime);
}

function drawLinePlayWave() {

    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var ctxLine = canvasWaveLine.getContext("2d");

    if (isPlaying) {
        ctxLine.clearRect(0, 0, canvasWaveLine.width, canvasWaveLine.height);

        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' + 0 + ')';
        ctxLine.fillRect(Math.floor(canvasWaveLine.width / (Audiodata.signalLen / Audiodata.sampleRate) * (audioCtx.currentTime - startTime + startOffset)), 0, 2, canvasWaveLine.height);

        window.requestAnimationFrame(drawLinePlayWave);
    }
}

function drawWaveTimeAxes() {

    var canvasWaveScale = document.getElementById("canvasWaveScale");
    var ctxWaveScale = canvasWaveScale.getContext("2d");
    var canvasWave = document.getElementById('canvasWave');

    var minDistanceNumbersX = 50;
    var maxDistanceNumbersX = 320;

    var trackLenSec = Audiodata.signalLen / Audiodata.sampleRate;

    var logTime = Math.log10(trackLenSec);
    logTime = Math.pow(10, Math.floor(logTime));

    var timePoint = trackLenSec / canvasWave.width;

    WaveData.stepsX = 100;
    var tickNum;

    for (var i = minDistanceNumbersX; i <= maxDistanceNumbersX; i++) {
        var time = timePoint * i;
        var quarter = time % (logTime / 4);
        var half = time % (logTime / 2);
        var full = time % logTime;

        if (quarter <= (timePoint) && (logTime / 4) * Math.ceil(canvasWave.width / i) >= trackLenSec) {
            WaveData.stepsX = i;
            tickNum = (logTime / 4);
            break;
        } else if (half <= (timePoint) && (logTime / 2) * Math.ceil(canvasWave.width / i) >= trackLenSec) {
            WaveData.stepsX = i;
            tickNum = (logTime / 2);
            break;
        } else if (full <= (timePoint) && (logTime) * Math.ceil(canvasWave.width / i) >= trackLenSec) {
            WaveData.stepsX = i;
            tickNum = logTime;
            break;
        }
    }

    ctxWaveScale.clearRect(0, 0, canvasWaveScale.width, canvasWaveScale.height);

    ctxWaveScale.beginPath();
    ctxWaveScale.strokeStyle = "#000000";
    ctxWaveScale.lineWidth = 1;

    ctxWaveScale.moveTo(offSetLeft, 0);
    ctxWaveScale.lineTo(offSetLeft, canvasWaveScale.height - offSetBottom);
    ctxWaveScale.lineTo(canvasWaveScale.width - 1, canvasWaveScale.height - offSetBottom);
    ctxWaveScale.stroke();

    ctxWaveScale.beginPath();
    ctxWaveScale.lineWidth = 2;
    ctxWaveScale.font = "bold 12px Verdana";

    for (i = 0; i <= canvasWaveScale.width; i += WaveData.stepsX) {
        ctxWaveScale.moveTo(i + offSetLeft, canvasWaveScale.height - offSetBottom);
        ctxWaveScale.lineTo(i + offSetLeft, canvasWaveScale.height - offSetBottom + 5);
        ctxWaveScale.stroke();

        ctxWaveScale.fillText(timeToString((i / WaveData.stepsX) * tickNum, 0), i + offSetLeft - 5, canvasWaveScale.height - offSetBottom + 15, offSetLeft - 2);
    }
}

function drawWaveGrid() {

    var canvasWaveGrid = document.getElementById("canvasWaveGrid");
    var ctxWaveGrid = canvasWaveGrid.getContext("2d");

    var gridSize = WaveData.stepsX * WaveData.gridScale;

    var numHorizontal = canvasWaveGrid.height / gridSize;
    var numVertical = canvasWaveGrid.width  / gridSize;

    ctxWaveGrid.clearRect(0, 0, canvasWaveGrid.width, canvasWaveGrid.height);

    ctxWaveGrid.beginPath();
    ctxWaveGrid.strokeStyle = "#bfbfbf";
    ctxWaveGrid.lineWidth = 1;

    for (var i = 1; i < numHorizontal; i++) {
        ctxWaveGrid.moveTo( 1, gridSize * i);
        ctxWaveGrid.lineTo(canvasWaveGrid.width, gridSize * i);
        ctxWaveGrid.stroke();
    }

    for (var k = 1; k <= numVertical; k++) {
        ctxWaveGrid.moveTo(gridSize * k, 0);
        ctxWaveGrid.lineTo(gridSize * k, canvasWaveGrid.height - 1);
        ctxWaveGrid.stroke();
    }

    ctxWaveGrid.beginPath();
    ctxWaveGrid.strokeStyle = "#000000";
    ctxWaveGrid.lineWidth = 1;
    ctxWaveGrid.moveTo(offSetLeft, canvasWaveGrid.height / 2);
    ctxWaveGrid.lineTo(canvasWaveGrid.width, canvasWaveGrid.height / 2);
    ctxWaveGrid.stroke();
}

function displayWavePosition(evt) {

    var canvasWave = document.getElementById("canvasWave");
    var waveTime = document.getElementById("waveTime");

    var mousePos = getMousePos(canvasWave, evt);
    var trackLenSec = Audiodata.signalLen / Audiodata.sampleRate;

    var mouseX = Math.round((trackLenSec / canvasWave.width * mousePos.x) * 100) / 100;
    waveTime.innerHTML = 'Time: ' + timeToString(mouseX, 1, 1);


    var amplitude = WaveData.amplitude[Math.round(mousePos.x)];
    var rms = WaveData.rms[Math.round(mousePos.x)];

    if (amplitude == 0) {
        amplitudeValue.innerHTML = 'Amplitude: ' +
            'NaN' +
            ' dB';
    } else {
        amplitude = 20 * Math.log10(amplitude);
        amplitudeValue.innerHTML = 'Amplitude: ' + amplitude.toFixed(1) + ' dB';
    }

    if (rms == 0) {
        rmsValue.innerHTML = 'RMS: ' +
            'NaN' +
            ' dB';
    } else {
        rms = 20 * Math.log10(rms);
        rmsValue.innerHTML = 'RMS: ' + rms.toFixed(1) + ' dB';
    }
}

function waveOnMouseDown(evt) {
    var canvas = document.getElementById("canvasWave");
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    canvasWaveLine.addEventListener("mousemove", onMouseMove);

    mouseUsed = 1;
    var mousePos = getMousePos(canvas, evt);
    startSelection = mousePos.x;
    intervalDrawSelect = setInterval(function() {
        drawSelection(startSelection, 1, evt);
    }, 30);
}

function drawSelection(startPos, caller, endPos) {

    var canvas = document.getElementById("canvasWave");
    var canvasSelect = document.getElementById("canvasSelect");
    var ctxSelect = canvasSelect.getContext("2d");

    if (caller == 1 && mouseUsed) {
        var start = startPos;
        var actualPosition = selectionX;
        var widthSelection = (actualPosition - startPos);
        ctxSelect.clearRect(0, 0, canvasSelect.width, canvasSelect.height);
        ctxSelect.fillStyle = 'rgba(' + 255 + ',' + 0 + ',' + 0 + ',' + 0.2 + ')';
        ctxSelect.fillRect(start, 0, widthSelection, canvasSelect.height);
    } else if (caller == 2) {
        var start = (startPos * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
        var actualPosition = (endPos * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
        var widthSelection = (actualPosition - start);
        ctxSelect.clearRect(0, 0, canvasSelect.width, canvasSelect.height);
        ctxSelect.fillStyle = 'rgba(' + 255 + ',' + 0 + ',' + 0 + ',' + 0.2 + ')';
        ctxSelect.fillRect(start, 0, widthSelection, canvasSelect.height);
    }
}

function waveOnMouseUp(evt) {
    canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvas = document.getElementById("canvasWave");
    mousePos = getMousePos(canvasWaveLine, evt);
    mousePos = mousePos.x;
    mouseUsed = 0;
    SpectroData.endTimeSelection = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos;

    if (selectionX < startSelection) {
        drawLineKlickWave(SpectroData.endTimeSelection);
        startOffset = SpectroData.endTimeSelection;
        SpectroData.endTimeSelection = mousePos;
    }
    canvasWaveLine.removeEventListener("mousemove", onMouseMove);
    clearInterval(intervalDrawSelect);
    zoomToSelection((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * startSelection, (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos);
    startSelection = NaN;
    selectionX = NaN;
}

function onMouseMove(evt) {
    canvasWaveLine = document.getElementById("canvasWaveLine");
    mousePos = getMousePos(canvasWaveLine, evt);
    selectionX = mousePos.x;
}

function resetSelection() {

    var canvasSelect = document.getElementById("canvasSelect");
    var ctxSelect = canvasSelect.getContext("2d");
    SpectroData.endTimeSelection = NaN;
    ctxSelect.clearRect(0, 0, canvasSelect.width, canvasSelect.height);
    scaleFullSpec();
}
