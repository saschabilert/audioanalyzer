var WaveData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
};

function drawWave() {

    var canvas = document.getElementById("canvasWave");

    if (canvas.getContext) {
        var canvasCtx = canvas.getContext("2d");

        var nPart = Math.floor(Audiodata.signalLen / Audiodata.blockLen);

        console.log(nPart);

        var value = new Array(nPart);


        for (var i = 0; i < nPart; i++) {

            if ((i % 2) === 0) {
                value[i] = findMax(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i + 1)));
            } else if ((i % 2) === 1) {
                value[i] = findMin(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i + 1)));
            }

        }

        console.log(value);

        WaveData.lengthCanvas = canvas.width;
        WaveData.hightCanvas = canvas.height;

        // First path
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = 'blue';
        canvasCtx.moveTo(10, 100);
        canvasCtx.lineTo(700, 100);
        canvasCtx.stroke();

    } else {
        // canvas-unsupported code here
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor(evt.clientX - rect.left),
            y: Math.floor(evt.clientY - rect.top)
        };
    }

    // Function for chasing mouse wheel actions
    canvas.addEventListener("mousewheel", mouseWheelFunction);

    function mouseWheelFunction(evt) {
        // console.log(evt)
        // console.log(keyEvent)
        var delta = evt.deltaY;
        // console.log(delta)
        if (evt.ctrlKey) {
            if (evt.shiftKey) {
                delta = evt.deltaX;
                // console.log(delta)
                //event.preventDefault();
                zoomFreq(delta);
            } else {
                event.preventDefault();
                zoomTime(delta);
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
    // Function for zooming freq axes only
    function zoomFreq(delta) {
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

function findMax(sampleArray) {

    return Math.max(...sampleArray);

}

function findMin(sampleArray) {

    return Math.min(...sampleArray);

}
