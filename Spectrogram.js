var SpectroData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
    colorScale: undefined,
    scaleFactorWidth: undefined,
    scaleFactorHeight: undefined,
    freqTimeRawData: undefined,
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
var scrollPositionX = 0;
var scrollPositionY = 0;
var strgPressed = 0;
var shiftPressed = 0;
var specData;
var cWidth;
var cHigh;
var specWidth;
var specHight;


function drawSpec() {
    var canvas = document.getElementById("canvasSpec")
    var ctx = canvas.getContext("2d")
    var canvasLine = document.getElementById("canvasLine")
    var ctxLine = canvasLine.getContext("2d")
    var div = document.getElementById("canvasDivSpec")
    div.addEventListener("scroll", setscrollPosition);
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    cWidth = canvas.width;
    cHigh = canvas.height;

    //Saving actual canvas size to global variable object
    SpectroData.lengthCanvas = cWidth;
    SpectroData.hightCanvas = cHigh;


    //Importing spectrogram data to local variable
    switch (Audiodata.display) {
        case "Spectrum":
            specData = Audiodata.spectrogram;
            break;
        case "Phase":
            specData = Audiodata.phase;

            break;
            /*  case "MFCC":
                  Audiodata.cepstrum[i] = calculateMFCC(realPart, imagPart);
                  break;*/
        case "Modulation Spectrum":
            specData = Audiodata.modSpec;

            break;
        case "Group Delay":
            specData = Audiodata.groupDelay;

            break;

    }
    SpectroData.freqTimeRawData = specData;

    // Defining varables with no of spectrograms
    specWidth = specData.length;
    specHight = specData[1].length;
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
    creatTwilight();

    // Start draw spectrogram
    draw();


    // Functions for chasing mouse actions
    canvasLine.addEventListener("mousewheel", mouseWheelFunction);
    canvasLine.addEventListener("click", startPlayHere)
    canvasLine.addEventListener('mousemove', displayMousePosition);


    function startPlayHere(evt) {
        var mousePos = getMousePos(canvas, evt)
        mouseTime = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width * mousePos.x

        if (isPlaying) {
            toggleSound()
        }
        startOffset = mouseTime

        drawLineKlick(mouseTime)
        drawLineKlickWave(mouseTime)
    }

    function mouseWheelFunction(evt) {
        // console.log(evt)
        // console.log(keyEvent)
        var delta = evt.deltaY;
        // console.log(delta)
        if (strgPressed) {
            if (shiftPressed) {
                delta = evt.deltaX;
                // console.log(delta)
                event.preventDefault();
                zoomFreq(delta);
            } else {
                event.preventDefault();
                zoomTime(delta);
            }
        } else if (shiftPressed) {
            delta = evt.deltaX;
            zoomAll(delta);
            event.preventDefault();
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
            SpectroData.scaleFactorWidth = cWidth / specWidth;
            SpectroData.scaleFactorHeight = cHigh / specHight;
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
            section=getSectionDisplayed()
          drawSelection(section.min,2,section.max);
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
        if (canvas.height * factor < 32767 && (canvas.height * factor) * canvas.width < 268435456 && canvas.height * factor > divHeight && canvas.height * factor <= (tempCanvas.height * 4)) {
            canvasScale.height = canvas.height * factor + scaleOfsetBottom
            canvas.height = canvas.height * factor;
            cHigh = canvas.height;
            canvasLine.height = canvasLine.height * factor;


            ctx.scale(cWidth / specWidth, cHigh / specHight);
            SpectroData.scaleFactorWidth = cWidth / specWidth;
            SpectroData.scaleFactorHeight = cHigh / specHight;
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
            section=getSectionDisplayed()
          drawSelection(section.min,2,section.max);
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
        if (canvas.width * factor < 32767 && (canvas.width * factor) * (canvas.height * factor) < 268435456 && canvas.height * factor < 32767 && canvas.height * factor > divHeight && canvas.width * factor > divWidth && canvas.height * factor <= (tempCanvas.height * 4)) {
            canvasScale.height = canvas.height * factor + scaleOfsetBottom
            canvasScale.width = canvas.width * factor + scaleOfsetLeft
            canvas.height = canvas.height * factor;
            cHigh = canvas.height;
            canvas.width = canvas.width * factor;
            cWidth = canvas.width;
            canvasLine.height = canvasLine.height * factor;
            canvasLine.width = canvasLine.width * factor;

            ctx.scale(cWidth / specWidth, cHigh / specHight);
            SpectroData.scaleFactorWidth = cWidth / specWidth;
            SpectroData.scaleFactorHeight = cHigh / specHight;
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
            section=getSectionDisplayed()
          drawSelection(section.min,2,section.max);
        }
    }

}

// Function for drawing a new spectrogram
function draw() {
  var canvas = document.getElementById("canvasSpec");
  var ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
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



    // Clear canvas from previous data
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // create image data variable
    var pictureData = ctx.createImageData(specWidth, specHight);

    // Create counter variable for the numbers in the ImageData variable
    var nPictureData = 0;
    switch (Audiodata.display) {
        case "Spectrum":
            for (var j = specHight - 1; j > 0; j--) {

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
            break;
        case "Phase":
            for (var j = specHight - 1; j > 0; j--) {

                for (var i = 0; i < specWidth; i++) {
                    point = specData[i][j];

                    point += Math.PI;

                    point *= noOfColorSteps - 1;
                    point /= 2 * Math.PI;
                    point = Math.floor(point);
                    if (point > 99) {
                        point = 99;
                    }

                    for (var kk = 0; kk < 3; kk++) {
                        pictureData.data[nPictureData] = Math.round(twilightScale[kk][point]);
                        nPictureData++;
                    }
                    pictureData.data[nPictureData] = 255;
                    nPictureData++;
                }
            }
            colorScale=twilightScale;
            break;
            /*case "MFCC":
                Audiodata.cepstrum[i] = calculateMFCC(realPart, imagPart);
                break;*/
        case "Modulation Spectrum":

            break;
        case "Group Delay":
            for (var j = specHight - 1; j > 0; j--) {

                for (var i = 0; i < specWidth; i++) {
                    point = specData[i][j];

                    point += 0.5 * ((1 / Audiodata.sampleRate) * Audiodata.blockLen)
                    point *= 1000



                    point *= noOfColorSteps - 1;
                    point /= ((1 / Audiodata.sampleRate) * Audiodata.blockLen) * 1000
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
              colorScale=twilightScale;
            break;

    }


    // Putting imageData into the temp canvas
    tempCtx.putImageData(pictureData, 0, 0);

    //SCaling the actual cavas to fit the whole Spectrogram
    ctx.scale(cWidth / specWidth, cHigh / specHight);
    SpectroData.scaleFactorWidth = cWidth / specWidth;
    SpectroData.scaleFactorHeight = cHigh / specHight;
    // Draw the image from the temp canvas to the scaled canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    // console.log(testdata)
    SpectroData.picData = pictureData;
    drawLegend(colorScale)
    drawScale()
    section=getSectionDisplayed()
  drawSelection(section.min,2,section.max);

}

function drawLineKlick(mouseTime) {
    canvasLine = document.getElementById("canvasLine")
    canvas = document.getElementById("canvasSpec")
    ctxLine = canvasLine.getContext("2d")
    mousePos = (mouseTime * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate)
    ctxLine.clearRect(0, 0, canvasLine.width, canvasLine.height)
    ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
        0 + ')';
    ctxLine.fillRect(mousePos, 0, 2, canvasLine.height);
drawLinePlay()
}

function displayMousePosition(evt) {
    var canvas = document.getElementById("canvasSpec");
    var position = document.getElementById("Position");
    var wert = document.getElementById("wert");
    var mousePos = getMousePos(canvas, evt);
    sigLenSec = Audiodata.signalLen / Audiodata.sampleRate;
    mouseX = Math.round((sigLenSec / canvas.width * mousePos.x) * 100) / 100;
    mouseY = Math.round(((Audiodata.sampleRate / 2) / canvas.height) * (canvas.height - mousePos.y))
    position.innerHTML = mouseX + ' sec' + ' : ' + mouseY + ' Hz';
    point = SpectroData.freqTimeRawData[Math.round(mousePos.x / SpectroData.scaleFactorWidth)][Math.round(((canvas.height - 1) - (mousePos.y)) / SpectroData.scaleFactorHeight)]

    switch (Audiodata.display) {
        case "Spectrum":
            if (!isNaN(point)) {
                point = 20 * Math.log10(point / 2048);
                point = Math.max(specLevelLow, point);
                point = Math.min(point, specLevelHigh)
                wert.innerHTML = Math.round(point) + 'dB'
            }
            break;
        case "Phase":
            if (!isNaN(point)) {
                wert.innerHTML = Math.round(point * 100) / 100
            }
            break;
            /*  case "MFCC":
                  Audiodata.cepstrum[i] = calculateMFCC(realPart, imagPart);
                  break;*/
        case "Modulation Spectrum":

            break;
        case "Group Delay":
            point += 0.5 * ((1 / Audiodata.sampleRate) * Audiodata.blockLen)
            if (!isNaN(point)) {
                point *= 1000
                wert.innerHTML = Math.round(point * 100) / 100 + "ms"
            }
            break;

    }

};


function drawLinePlay() {
    var canvasLine = document.getElementById("canvasLine")
    var ctxLine = canvasLine.getContext("2d")
    var div = document.getElementById("canvasDivSpec")

    if (isPlaying) {
        var linePosition = Math.floor(canvasLine.width / (Audiodata.signalLen / Audiodata.sampleRate) * (audioCtx.currentTime - startTime + startOffset))


        if (linePosition <= scrollPositionX - scaleOfsetLeft) {
            div.scrollLeft = linePosition + scaleOfsetLeft
        }

        ctxLine.clearRect(0, 0, canvasLine.width, canvasLine.height)

        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' +
            0 + ')';
        ctxLine.fillRect(linePosition, 0, 2, canvasLine.height);
        if (linePosition >= scrollPositionX + div.offsetWidth - scaleOfsetLeft) {
            div.scrollLeft = div.scrollLeft + div.offsetWidth - 20
        }

        window.requestAnimationFrame(drawLinePlay)

    }

}

function drawLegend(colorScale) {
    specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
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
            tempCtxLegend.fillStyle = 'rgb(' + Math.floor(colorScale[0][i]) + ',' + Math.floor(colorScale[1][i]) + ',' +
                Math.floor(colorScale[2][i]) + ')';
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
    ctxLegend.fillText(specLevelLow + (specLevelWidth / 2) + ' dB', (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
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
        //console.log(freq, quarter, half, full)
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

        ctxScale.fillText((Math.floor((kk) * timePerColumn * (100 / logTime))) / (100 / logTime), kk + scaleOfsetLeft - 5, canvasScale.height - scaleOfsetBottom + 15, scaleOfsetLeft - 2);
    }

}

function setscrollPosition() {
    div = document.getElementById('canvasDivSpec')
    scrollPositionX = div.scrollLeft,
        scrollPositionY = div.scrollTop
        section=getSectionDisplayed()
      drawSelection(section.min,2,section.max);


}

function getMousePos(canvas,evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(evt.clientX - rect.left),
        y: Math.floor(evt.clientY - rect.top)
    };
}

function onKeyDown(evt) {
    switch (evt.code) {
        case "ShiftLeft":
            shiftPressed = 1;
            break;
        case "ControlLeft":
            strgPressed = 1;
            break;
    }
}

function onKeyUp(evt) {
    switch (evt.code) {
        case "ShiftLeft":
            shiftPressed = 0;
            break;
        case "ControlLeft":
            strgPressed = 0;
            break;
    }
}

function zoomToSelection(timeStart , timeEnd){
  var canvas = document.getElementById("canvasSpec")

  var lineStart = (timeStart * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
  var lineEnd = (timeEnd * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
  var lengthSelect=(lineEnd-lineStart);


}

function zoomToSelection(timeStart , timeEnd){
    var canvas = document.getElementById("canvasSpec")
    var ctx = canvas.getContext("2d")
    var div = document.getElementById("canvasDivSpec")
    var canvasLine = document.getElementById("canvasLine")
    var divWidth = div.offsetWidth;

if(timeEnd<timeStart){
var tempTimeStart=timeStart;
timeStart=timeEnd;
timeEnd=tempTimeStart;
}
  var lengthSelect=(timeEnd-timeStart);
    var freqPerLine = (Audiodata.sampleRate / 2) / canvas.height;
    var timePerColumn = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width
    var timePerSide=(divWidth-scaleOfsetLeft)*timePerColumn

    if (timePerSide==lengthSelect){
      var factor=1;

  }
  if(timePerSide!=lengthSelect){
    factor=timePerSide/lengthSelect;
  }

  if (canvas.width * factor < 32767 && (canvas.width * factor) * canvas.height < 268435456 && canvas.width * factor > divWidth) {


      canvasScale.width = canvas.width * factor + scaleOfsetLeft
      canvas.width = canvas.width * factor;
      cWidth = canvas.width;
      canvasLine.width = canvasLine.width * factor


      ctx.scale(cWidth / specWidth, cHigh / specHight);
      SpectroData.scaleFactorWidth = cWidth / specWidth;
      SpectroData.scaleFactorHeight = cHigh / specHight;
      ctx.drawImage(tempCanvas, 0, 0);
      drawScale()



      var lineStart = (timeStart * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
        div.scrollLeft=lineStart;
    }
}

function getSectionDisplayed(){
  var canvas = document.getElementById("canvasSpec")
  var div = document.getElementById("canvasDivSpec")
  return {
      min:   scrollPositionX*((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width),
      max:   (scrollPositionX+div.offsetWidth)*((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width)
  };
}
