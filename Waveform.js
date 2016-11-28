var WaveData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
};

function drawWave() {

    var canvas = document.getElementById("canvasWave");
    var canvasLine = document.getElementById("canvasWaveLine");
    var canvasRMS = document.getElementById("canvasRMS");

    canvasLine.addEventListener("click", startPlayHereWave);

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
    ctxLine.fillRect(mousePos, 0, 2, canvasLine.height);
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
    var canvasWaveTimeAxes = document.getElementById("canvasWaveSpec");
    var ctxWaveTimeAxes = canvasWaveTimeAxes.getContext("2d");
    var div = document.getElementById('canvasDivWave')
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;

    var trackLenSec = Math.round(Audiodata.signalLen / Audiodata.sampleRate);

    var timePoint = canvasWaveTimeAxes.width / trackLenSec;

    console.log(timePoint);

    console.log(canvasWaveTimeAxes.width);

    ctxWaveTimeAxes.beginPath();
    ctxWaveTimeAxes.strokeStyle = "#000000";
    ctxWaveTimeAxes.lineWidth = 1;

    ctxWaveTimeAxes.moveTo(24, 0);
    ctxWaveTimeAxes.lineTo(24, canvasWaveTimeAxes.height);
    ctxWaveTimeAxes.lineTo(canvasWaveTimeAxes.width, canvasWaveTimeAxes.height);
    ctxWaveTimeAxes.stroke();

    for (var i = 0; i <= trackLenSec; i++) {

      ctxWaveTimeAxes.beginPath();
      ctxWaveTimeAxes.strokeStyle = "#000000";
      ctxWaveTimeAxes.lineWidth = 3;
      ctxWaveTimeAxes.moveTo((timePoint * i) + 24, canvasWaveTimeAxes.height);
      ctxWaveTimeAxes.lineTo((timePoint * i) + 24, canvasWaveTimeAxes.height + 10);
      ctxWaveTimeAxes.stroke();
      
    }


}
