var SpectroData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
    colorScale: undefined,
};
var TypeColorScale = 1;
//keyEvent = 0;
var specLevelHigh = -30;
var specLevelLow = -90;
var specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
var tempCanvas = document.createElement("canvas"),
    tempCtx = tempCanvas.getContext("2d");
var scaleOfsetLeft = 24;
var scaleOfsetBottom = 28;

function drawSpec() {
    var canvas = document.getElementById("canvasSpec");
    var ctx = canvas.getContext("2d");
    var canvasLine = document.getElementById("canvasLine")
    var ctxLine = canvasLine.getContext("2d")
    var div = document.getElementById('canvasDivSpec')
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var cWidth = canvas.width;
    var cHigh = canvas.height;
    //  console.log(cWidth, cHigh)
    //Saving actual canvas size to global variable object
    SpectroData.lengthCanvas = cWidth;
    SpectroData.hightCanvas = cHigh;

    // Set level boarders for color scaling

    // Variable for color scale




    //Importing spectrogram data to local variable
    var specData = Audiodata.spectrogram;

    // Defining varables with no of spectrograms
    var specWidth = specData.length;
    var specHight = specData[1].length;
    //  console.log(specWidth, specHight)
    // Storing spectrogram specs to global variable
    SpectroData.picLength = specWidth;
    SpectroData.picWidth = specHight;

    // Create temp canvas for temp storing of picture data

    tempCtx.clearRect(0, 0, specWidth, specHight);
    tempCanvas.width = specWidth;
    tempCanvas.height = specHight;

    // Create color scales
    creatParula();
    creatGray();
    creatJet();
    creatHsv();

    if (TypeColorScale == 1) {
        colorScale = parulaScale;
    } else if (TypeColorScale == 2) {
        colorScale = grayScale;
    } else if (TypeColorScale == 3) {
        colorScale = jetScale;
    } else if (TypeColorScale == 4) {
        colorScale = hsvScale;
    }
    SpectroData.colorScale = colorScale;

    var noOfColorSteps = colorScale[1].length;

    draw();

    // Function for drawing a new spectrogram
    function draw() {



        // Clear canvas from previous data
        ctx.clearRect(0, 0, cWidth, cHigh);

        // create image data variable
        var pictureData = ctx.createImageData(specWidth, specHight);

        // Create counter variable for the numbers in the ImageData variable
        var nPictureData = 0;

        // Loop for transfering the spectrogram data to image data with converting them into the color scale
        for (var j = 0; j < specHight; j++) {

            for (var i = 0; i < specWidth; i++) {
                point = 20 * Math.log10(specData[i][j] / 2048);

                point += Math.abs(specLevelLow);
                point = Math.max(point, 0);
                point = Math.min(point, specLevelWidth);

                point /= Math.abs(specLevelWidth);
                point *= noOfColorSteps - 1;
                point = Math.floor(point);
                if (point > 99) {
                    point = 99;
                }

                for (var kk = 0; kk < 3; kk++) {
                    pictureData.data[nPictureData] = Math.round(colorScale[kk][point]);
                    nPictureData++;
                }
                pictureData.data[nPictureData] = 255;
                nPictureData++;
            }
        }

        // Putting imageData into the temp canvas
        tempCtx.putImageData(pictureData, 0, 0);

        //SCaling the actual cavas to fit the whole Spectrogram
        ctx.scale(cWidth / specWidth, cHigh / specHight);
        // console.log(cWidth / specWidth, cHigh / specHight)
        // Draw the image from the temp canvas to the scaled canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        // console.log(testdata)
        specData.picData = pictureData;
        drawLegend()
        drawScale()

    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.floor(evt.clientX - rect.left),
            y: Math.floor(evt.clientY - rect.top)
        };
    }

    // Function for chasing mouse wheel actions
    canvasLine.addEventListener("mousewheel", mouseWheelFunction);
    canvasLine.addEventListener("click", startPlayHere)


    function startPlayHere(evt) {
        var mousePos = getMousePos(canvas, evt)
        mouseTime = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x
        console.log(mouseTime)
        if (isPlaying) {
            toggleSound()
        }
        startOffset = mouseTime
        toggleSound()
        drawLineKlick(mousePos.x)
    }

    function drawLineKlick(mousePos) {
        ctxLine.clearRect(0, 0, canvasLine.width, canvasLine.height)
        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
            0 + ')';
        ctxLine.fillRect(mousePos, 0, 2, canvasLine.height);
        console.log(audioCtx.currentTime)
    }




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
        if (canvas.width * factor < 32767 && (canvas.width * factor) * canvas.height < 268435456 && canvas.width * factor > divWidth) {
            canvasScale.width = canvas.width * factor + scaleOfsetLeft
            canvas.width = canvas.width * factor;
            cWidth = canvas.width;
            canvasLine.width = canvasLine.width * factor


            ctx.scale(cWidth / specWidth, cHigh / specHight);
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
        }

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
        if (canvas.height * factor < 32767 && (canvas.height * factor) * canvas.width < 268435456 && canvas.height * factor > divHeight) {
            canvasScale.height = canvas.height * factor + scaleOfsetBottom
            canvas.height = canvas.height * factor;
            cHigh = canvas.height;
            canvasLine.height = canvasLine.height * factor;


            ctx.scale(cWidth / specWidth, cHigh / specHight);
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
        }
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
        if (canvas.width * factor < 32767 && (canvas.width * factor) * (canvas.height * factor) < 268435456 && canvas.height * factor < 32767 && canvas.height * factor > divHeight && canvas.width * factor > divWidth) {
            canvasScale.height = canvas.height * factor + scaleOfsetBottom
            canvasScale.width = canvas.width * factor + scaleOfsetLeft
            canvas.height = canvas.height * factor;
            cHigh = canvas.height;
            canvas.width = canvas.width * factor;
            cWidth = canvas.width;
            canvasLine.height = canvasLine.height * factor;
            canvasLine.width = canvasLine.width * factor;

            ctx.scale(cWidth / specWidth, cHigh / specHight);
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
        }
    }
}
//Function for changing the color scale and/or the scaling of the color scale

/*canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  alert(mousePos)
  var message = 'Mouse positions: ' + mousePos.x + ':' + mousePos.y;
  //writeMessage(canvasDraw, message);
}, false);*/



function drawLinePlay() {
    var canvasLine = document.getElementById("canvasLine")
    var ctxLine = canvasLine.getContext("2d")

    if (isPlaying) {
        ctxLine.clearRect(0, 0, canvasLine.width, canvasLine.height)

        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
            0 + ')';
        ctxLine.fillRect(Math.floor(canvasLine.width / (Audiodata.signalLen / Audiodata.sampleRate) * (audioCtx.currentTime - startTime + startOffset)), 0, 2, canvasLine.height);

        window.requestAnimationFrame(drawLinePlay)

    }
}

function changeColorScale(delta) {
    var canvas = document.getElementById("canvasSpec");
    var ctx = canvas.getContext("2d");
    specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
    //  console.log(specLevelHigh,specLevelLow)
    if (TypeColorScale == 1) {
        colorScale = parulaScale;
    } else if (TypeColorScale == 2) {
        colorScale = grayScale;
    } else if (TypeColorScale == 3) {
        colorScale = jetScale;
    } else if (TypeColorScale == 4) {
        colorScale = hsvScale;
    }

    SpectroData.colorScale = colorScale;
    var noOfColorSteps = colorScale[1].length;
    var specData = Audiodata.spectrogram;
    var specWidth = specData.length;
    var specHight = specData[1].length;

    var nPictureData = 0;
    for (var j = 0; j < specHight; j++) {

        for (var i = 0; i < specWidth; i++) {
            point = 20 * Math.log10(specData[i][j] / 2048);

            point += Math.abs(specLevelLow);
            point = Math.max(point, 0);
            point = Math.min(point, specLevelWidth);

            point /= Math.abs(specLevelWidth);
            point *= noOfColorSteps - 1;
            point = Math.floor(point);
            if (point > 99) {
                point = 99;
            }
            for (var kk = 0; kk < 3; kk++) {
                specData.picData.data[nPictureData] = Math.round(colorScale[kk][point]);
                nPictureData++;
            }
            specData.picData.data[nPictureData] = 255;
            nPictureData++;
        }

    }
    tempCtx.putImageData(specData.picData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
    drawLegend()
}

function drawLegend() {
    legCanvas = document.getElementById("canvasLegend");
    ctxLegend = legCanvas.getContext("2d");
    ctxLegend.setTransform(1, 0, 0, 1, 0, 0);
    ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height)

    var tempCanvasLEgend = document.createElement("canvas"),
        tempCtxLegend = tempCanvasLEgend.getContext("2d");

    tempCtxLegend.clearRect(0, 0, tempCanvasLEgend.width, tempCanvasLEgend.height);
    tempCanvasLEgend.width = 300 //SpectroData.colorScale[0].length;
    tempCanvasLEgend.height = 75;

    for (var i = 0; i < 100; i++) {
        for (var j = 0; j < legCanvas.height; j++) {
            tempCtxLegend.fillStyle = 'rgb(' + Math.floor(SpectroData.colorScale[0][i]) + ',' + Math.floor(SpectroData.colorScale[1][i]) + ',' +
                Math.floor(SpectroData.colorScale[2][i]) + ')';
            tempCtxLegend.fillRect(i * 3, j, 3, 1);
        }
    }
    //ctxLegend.scale(canvasLegend.width / tempCanvasLEgend.width, tempCanvasLEgend.height / canvasLegend.height);
    // Draw the image from the temp canvas to the scaled canvas
    ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height);
    ctxLegend.drawImage(tempCanvasLEgend, 0, 0);
    //ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height)
    ctxLegend.clearRect(0, canvasLegend.height - 15, canvasLegend.width * 2, canvasLegend.height)
    ctxLegend.font = "700 15px Arial";
    ctxLegend.fillText(specLevelLow + ' dB', 2, canvasLegend.height - 1);
    ctxLegend.fillText(specLevelLow + specLevelWidth / 2 + ' dB', (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
    ctxLegend.fillText(specLevelHigh + ' dB', (canvasLegend.width - 2) - 45, canvasLegend.height - 1);
    ctxLegend.beginPath()

    ctxLegend.moveTo(1, (canvasLegend.height - 25))
    ctxLegend.lineTo(1, (canvasLegend.height - 15))

    ctxLegend.lineTo((canvasLegend.width / 2), canvasLegend.height - 15)
    ctxLegend.lineTo((canvasLegend.width / 2), canvasLegend.height - 25)
    ctxLegend.moveTo((canvasLegend.width / 2), canvasLegend.height - 15)
    ctxLegend.lineTo((canvasLegend.width - 1), canvasLegend.height - 15)
    ctxLegend.lineTo((canvasLegend.width - 1), canvasLegend.height - 25)
    ctxLegend.strokeStyle = '#100719';
    ctxLegend.lineWidth = 2;
    ctxLegend.stroke();

}

function drawScale() {
    var canvas = document.getElementById('canvasSpec');
    var freqMax = Audiodata.sampleRate / 2;
    var trackLenSec = Audiodata.signalLen / Audiodata.sampleRate;
    var logTime = Math.log10(trackLenSec);
    logTime = Math.pow(10, Math.floor(logTime))
    var minDistanceNumbersX = 100;
    var maxDistanceNumbersX = 250;
    var minDistanceNumbersY = 50;
    var maxDistanceNumbersY = 150;
    var freqPerLine = freqMax / canvas.height;
    var timePerColumn = trackLenSec / canvas.width
    var stepsX = 100;
    for (var kk = minDistanceNumbersX; kk <= maxDistanceNumbersX; kk++) {
        var time = kk * timePerColumn;
        var quarter = time % (logTime / 4);
        var half = time % (logTime / 2);
        var full = time % logTime;

        if (quarter <= (0.01 * logTime)) {
            stepsX = kk;
            break;
        } else if (half <= (0.01 * logTime)) {
            stepsX = kk;
            break;
        } else if (full <= (0.01 * logTime)) {
            stepsX = kk;
            break;
        }
    }

    var stepsY = 50;
    for (var kk = minDistanceNumbersY; kk <= maxDistanceNumbersY; kk++) {
        var freq = kk * freqPerLine;
        var quarter = freq % (1000 / 4);
        var half = freq % (1000 / 2);
        var full = freq % 1000;
        console.log(freq, quarter, half, full)
        if (quarter <= (freqPerLine)) {
            stepsY = kk;
            break;
        } else if (half <= freqPerLine) {
            stepsY = kk;
            break;
        } else if (full <= freqPerLine) {
            stepsY = kk;
            break;
        }
    }


    var canvasScale = document.getElementById('canvasScale');
    var ctxScale = canvasScale.getContext('2d');
    var div = document.getElementById('canvasDivSpec')
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;



    ctxScale.clearRect(0, 0, canvasScale.width, canvasScale.height);
    ctxScale.beginPath();
    ctxScale.moveTo(scaleOfsetLeft, 0);
    ctxScale.lineTo(scaleOfsetLeft, canvasScale.height - scaleOfsetBottom)
    ctxScale.lineTo(canvasScale.width - 1, canvasScale.height - scaleOfsetBottom)
    ctxScale.strokeStyle = 'black';
    ctxScale.lineWidth = 1;
    ctxScale.stroke();
    ctxScale.beginPath();

    ctxLegend.font = "700 5px Arial";

    for (var kk = canvasScale.height - scaleOfsetBottom; kk >= 0; kk -= stepsY) {
        ctxScale.moveTo(scaleOfsetLeft, kk);
        ctxScale.lineTo(scaleOfsetLeft - 5, kk)
        ctxScale.stroke();

        ctxScale.fillText(Math.floor((((canvasScale.height - scaleOfsetBottom) - kk) * freqPerLine) / 10) * 10, 1, kk, scaleOfsetLeft - 2);
    }

    for (var kk = 0; kk <= canvasScale.width; kk += stepsX) {
        ctxScale.moveTo(kk + scaleOfsetLeft, canvasScale.height - scaleOfsetBottom);
        ctxScale.lineTo(kk + scaleOfsetLeft, canvasScale.height - scaleOfsetBottom + 5)
        ctxScale.stroke();
        console.log(timePerColumn)
        ctxScale.fillText((Math.floor((kk) * timePerColumn * (100 / logTime))) / (100 / logTime), kk + scaleOfsetLeft - 5, canvasScale.height - scaleOfsetBottom + 15, scaleOfsetLeft - 2);
    }

}

function getscrollPosition() {
    div = document.getElementById('canvasDivSpec')
    return {
        x: div.scrollLeft,
        y: div.scrollTop
    };
}
