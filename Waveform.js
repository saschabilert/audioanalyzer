var WaveData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
};

var mouseUsed = 0;
var intervalDrawSelect;
var selectionX = 0;
var startSelection = 0;

function drawWave() {

    var canvas = document.getElementById("canvasWave");
    var canvasLine = document.getElementById("canvasWaveLine");
    var canvasRMS = document.getElementById("canvasRMS");
    var CanvasSelect = document.getElementById("CanvasSelect")
    canvasLine.addEventListener("mousedown", startPlayHereWave);
    canvasLine.addEventListener("mousedown", waveOnMouseDown);
    canvasLine.addEventListener("mouseup", waveOnMouseUp);
    if (canvas.getContext) {

        var canvasCtx = canvas.getContext("2d");
        var canvasCtxRMS = canvas.getContext("2d");

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        WaveData.lengthCanvas = canvas.width;
        WaveData.hightCanvas = canvas.height;

        var canvasBlockLen = Audiodata.signalLen / canvas.width;

        var nPart = Math.floor(Audiodata.signalLen / canvasBlockLen);

        var currentBlock = new Array(canvasBlockLen.length);
        var maxValue = new Array(nPart);
        var minValue = new Array(nPart);
        var peak = new Array(nPart);
        var rms = new Array(nPart);

        for (i = 0; i < nPart; i++) {

            currentBlock = Audiodata.samples.slice(canvasBlockLen * i, canvasBlockLen * (i + 1));

            maxValue[i] = Math.max(...currentBlock) * (WaveData.hightCanvas / 2) + (WaveData.hightCanvas / 2) - 100;

            minValue[i] = Math.min(...currentBlock) * (WaveData.hightCanvas / 2) + (WaveData.hightCanvas / 2) - 100;

            rms[i] = calculateRMS(currentBlock) * (WaveData.hightCanvas / 2) + (WaveData.hightCanvas / 2) - 100;

            if (Math.max(...currentBlock) >= Math.abs(Math.min(...currentBlock))) {
                peak[i] = Math.max(...currentBlock);
            } else if (Math.max(...currentBlock) < Math.abs(Math.min(...currentBlock))) {
                peak[i] = Math.abs(Math.min(...currentBlock));
            }

        }

        drawWaveGrid();
        drawWaveTimeAxes();

        canvasCtx.beginPath();
        canvasCtx.strokeStyle = "#003d99";
        canvasCtx.lineWidth = 0.02;

        canvasCtx.moveTo(0, 100);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtx.lineTo(i, 100 - maxValue[i]);
            canvasCtx.lineTo(i, 100 - minValue[i]);
            canvasCtx.stroke();
        }

        canvasCtxRMS.beginPath();
        canvasCtxRMS.strokeStyle = "#66a3ff";
        canvasCtxRMS.lineWidth = 0.1;

        canvasCtxRMS.moveTo(0, 100);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtxRMS.lineTo(i, 100 - rms[i]);
            canvasCtxRMS.lineTo(i, 100 + rms[i]);
            canvasCtxRMS.stroke();
        }

        var crestFactor = calculateCrestFactor(peak, rms);

    } else {
        // canvas-unsupported code here
    }

    function calculateRMS(samples) {

        var sum = 0;

        for (var i = 0; i < samples.length; i++) {
            sum = sum + (samples[i] * samples[i]);
        }

        var rms = Math.sqrt(sum / (samples.length - 1));

        return rms;
    }

    function calculateCrestFactor(peak, rms) {

        var crestFactor = new Array(rms.length);

        for (var i = 0; i < crestFactor.length; i++) {
            crestFactor[i] = peak[i] / rms[i];
            if (rms[i] === 0) {
                crestFactor[i] = 0;
            }
        }
        return crestFactor;
    }

    function getMousePosWave(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor(evt.clientX - rect.left),
            y: Math.floor(evt.clientY - rect.top)
        };
    }

    function startPlayHereWave(evt) {
        var mousePos = getMousePosWave(canvas, evt);
        mouseTime = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x;
        if (isPlaying) {
            toggleSound();
        }
        startOffset = mouseTime;
        drawLineKlickWave(mouseTime);
        drawLineKlick(mouseTime)
    }
}

function drawLineKlickWave(mouseTime) {
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvas = document.getElementById("canvasWave")
    var ctxLine = canvasWaveLine.getContext("2d");
    mousePos = (mouseTime * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate)
    ctxLine.clearRect(0, 0, canvasLine.width, canvasLine.height)
    ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
        0 + ')';
    ctxLine.fillRect(mousePos, 0, 2, canvasWaveLine.height);
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
    var div = document.getElementById('canvasDivWave')
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    var offSetLeft = 24;
    var offSetBottom = 20;
    var offSetTextLeft = 8;
    var offSetTextBottom = 4;
    var tickLen = 15;

    var trackLenSec = Math.round(Audiodata.signalLen / Audiodata.sampleRate);

    console.log(trackLenSec);

    var timePoint = canvasWaveScale.width / trackLenSec;

    console.log(timePoint);

    console.log(canvasWaveScale.width);

    ctxWaveScale.clearRect(0, 0, canvasWaveScale.width, canvasWaveScale.height);

    ctxWaveScale.beginPath();
    ctxWaveScale.strokeStyle = "#000000";
    ctxWaveScale.lineWidth = 1;

    ctxWaveScale.moveTo(offSetLeft, 0);
    ctxWaveScale.lineTo(offSetLeft, canvasWaveScale.height - offSetBottom);
    ctxWaveScale.lineTo(canvasWaveScale.width, canvasWaveScale.height - offSetBottom);
    ctxWaveScale.stroke();

    ctxWaveScale.beginPath();
    ctxWaveScale.strokeStyle = "black";
    ctxWaveScale.lineWidth = 2;
    ctxWaveScale.font = "12px Arial";
    ctxWaveScale.moveTo(offSetLeft, canvasWaveScale.height - offSetBottom);
    ctxWaveScale.lineTo(offSetLeft, canvasWaveScale.height - tickLen);


    for (var i = 0; i <= trackLenSec; i++) {

        ctxWaveScale.moveTo((Math.round(timePoint * i)) + offSetLeft, canvasWaveScale.height - offSetBottom);
        ctxWaveScale.lineTo((Math.round(timePoint * i)) + offSetLeft, canvasWaveScale.height - tickLen);
        ctxWaveScale.stroke();
        ctxWaveScale.fillText(i.toString().concat('.0'), (Math.round(timePoint * i)) + offSetLeft - offSetTextLeft, canvasWaveScale.height - offSetTextBottom);

    }
}

function drawWaveGrid() {

    var canvasWaveGrid = document.getElementById("canvasWaveGrid");
    var ctxWaveGrid = canvasWaveGrid.getContext("2d");

    var offSetLeft = 24;

    var divHorizontal = 16;
    var divVertical = 16;

    var numHorizontal = canvasWaveGrid.height / divHorizontal;
    var numVertical = (canvasWaveGrid.width - offSetLeft) / divVertical;

    ctxWaveGrid.clearRect(0, 0, canvasWaveGrid.width, canvasWaveGrid.height);

    ctxWaveGrid.beginPath();
    ctxWaveGrid.strokeStyle = "#f2f2f2";
    ctxWaveGrid.lineWidth = 0.5;

    console.log(canvasWaveGrid.width);

    for (var i = 1; i < numHorizontal; i++) {
        ctxWaveGrid.moveTo(offSetLeft + 1, divHorizontal * i);
        ctxWaveGrid.lineTo(canvasWaveGrid.width, divHorizontal * i);
        ctxWaveGrid.stroke();
    }

    for (var k = 1; k <= numVertical; k++) {
        ctxWaveGrid.moveTo(offSetLeft + divVertical * k, 0);
        ctxWaveGrid.lineTo(offSetLeft + divVertical * k, canvasWaveGrid.height - 1);
        ctxWaveGrid.stroke();
    }
}

function waveOnMouseDown(evt) {
    var canvas = document.getElementById("canvasWave")
    var canvasLine = document.getElementById("canvasWaveLine")
    canvasLine.addEventListener("mousemove", onMouseMove)

    mouseUsed = 1;
    var mousePos = getMousePos(canvas, evt)
    startSelection = mousePos.x;
    intervalDrawSelect = setInterval(function() {
        drawSelection(mousePos.x, 1, evt);
    }, 30)

}

function drawSelection(startPos, caller, endPos) {
    var canvas = document.getElementById("canvasWave")
    var canvasSelect = document.getElementById("canvasSelect")
    var ctxSelect = canvasSelect.getContext("2d")

    if (caller == 1) {
        var start = startPos;
        var actualPosition = selectionX;
        var widthSelection = (actualPosition - startPos);
    } else if (caller == 2) {
        var start = (startPos * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate)
        var actualPosition = (endPos * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate)
        var widthSelection = (actualPosition - start);
    }
    ctxSelect.clearRect(0, 0, canvasSelect.width, canvasSelect.height)
    ctxSelect.fillStyle = 'rgba(' + 255 + ',' + 0 + ',' +
        0 + ',' + 0.2 + ')';
    ctxSelect.fillRect(start, 0, widthSelection, canvasSelect.height);

}

function waveOnMouseUp(evt) {
    canvasLine = document.getElementById("canvasWaveLine")
    var canvas = document.getElementById("canvasWave")
    mousePos = getMousePos(canvasLine, evt)
    mouseUsed = 0;
    canvasLine.removeEventListener("mousemove", onMouseMove)
    clearInterval(intervalDrawSelect)
    zoomToSelection((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width *
        startSelection, (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x)
}

function onMouseMove(evt) {
    canvasLine = document.getElementById("canvasWaveLine")
    mousePos = getMousePos(canvasLine, evt);
    selectionX = mousePos.x;
}
