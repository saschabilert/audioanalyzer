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

        switch (TypeColorScale) {
            case 1:
                canvasCtx.strokeStyle = 'blue';
                break;
            case 2:
                canvasCtx.strokeStyle = 'black';
                break;
            case 3:
                canvasCtx.strokeStyle = 'blue';
                break;
            case 4:
                canvasCtx.strokeStyle = 'red';
                break;
            default:
                canvasCtx.strokeStyle = 'blue';
                break;
        }

        canvasCtx.beginPath();

        canvasCtx.lineWidth = 0.02;

        canvasCtx.moveTo(0, 100);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtx.lineTo(i, 100 - maxValue[i]);
            canvasCtx.lineTo(i, 100 - minValue[i]);
            canvasCtx.stroke();
        }

        canvasCtxRMS.beginPath();
        canvasCtxRMS.strokeStyle = 'red';
        canvasCtxRMS.lineWidth = 0.1;

        canvasCtxRMS.moveTo(0, 100);
        for (i = 0; i < maxValue.length; i++) {
            canvasCtxRMS.lineTo(i, 100 - rms[i]);
            canvasCtxRMS.lineTo(i, 100 + rms[i]);
            canvasCtxRMS.stroke();
        }

        var crestFactor = calculateCrestFactor(peak, rms);

        console.log(crestFactor);

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

    canvasLine.addEventListener("click", startPlayHereWave);

    function startPlayHereWave(evt) {
        var mousePos = getMousePosWave(canvas, evt);
        mouseTime = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x;
        console.log(mouseTime);
        if (isPlaying) {
            toggleSound();
        }
        startOffset = mouseTime;
        toggleSound();

    }

    // Function for chasing mouse wheel actions
    // canvasLine.addEventListener("mousewheel", mouseWheelFunction);

    function mouseWheelFunction(evt) {
        console.log(evt);
        console.log(keyEvent);
        var delta = evt.deltaY;
        // console.log(delta)
        if (evt.ctrlKey) {
            if (evt.shiftKey) {
                delta = evt.deltaX;
                // console.log(delta)
                //event.preventDefault();
                // zoomFreq(delta);
            } else {
                event.preventDefault();
                // zoomTime(delta);
            }
        } else if (evt.shiftKey) {
            delta = evt.deltaX;
            zoomAll(delta);
        }
    }

    // Function for zooming the time axes only
    function zoomTime(delta) {
        var factor;
        if (delta < 0) {
            factor = 1.2;
        } else if (delta > 0) {
            factor = 0.8;
        } else {
            factor = 1;
        }
        canvas.width = canvas.width * factor;
        cWidth = canvas.width;
        ctx.scale(cWidth / specWidth, cHigh / specHight);
        ctx.drawImage(tempCanvas, 0, 0);

    }

    // Function for zooming both axes
    function zoomAll(delta) {
        var factor;
        if (delta < 0) {
            factor = 1.1;
        } else if (delta > 0) {
            factor = 0.9;
        } else {
            factor = 1;

        }
        canvas.height = canvas.height * factor;
        cHigh = canvas.height;
        canvas.width = canvas.width * factor;
        cWidth = canvas.width;
        ctx.scale(cWidth / specWidth, cHigh / specHight);
        ctx.drawImage(tempCanvas, 0, 0);
    }
}

function drawLinePlayWave() {
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var ctxLine = canvasWaveLine.getContext("2d");

    if (isPlaying) {
        ctxLine.clearRect(0, 0, canvasWaveLine.width, canvasWaveLine.height);

        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
            0 + ')';
        ctxLine.fillRect(Math.floor(canvasWaveLine.width / (Audiodata.signalLen / Audiodata.sampleRate) * (audioCtx.currentTime - startTime + startOffset)), 0, 2, canvasWaveLine.height);

        window.requestAnimationFrame(drawLinePlayWave);
    }
}
