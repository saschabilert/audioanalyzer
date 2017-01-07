/*
 * spectrogram.js
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

var SpectroData = {
    colorScale: undefined,
    scaleFactorWidth: undefined,
    scaleFactorHeight: undefined,
    scaleOfsetLeft: 24,
    scaleOfsetBottom: 28,
    scrollPositionX: 0,
    scrollPositionY: 0,
    TypeColorScale: 1,
    specLevelHigh: -30,
    specLevelLow: -90,
    specLevelWidth: undefined,
    strgPressed: 0,
    shiftPressed: 0,
    specData: undefined,
    cWidth: undefined,
    cHigh: undefined,
    specWidth: undefined,
    specHight: undefined,
    endTimeSelection: Audiodata.signalLen / Audiodata.sampleRate,
    securityOffset: 10
};

// Creating a temp canvas that will hold the unscaled spectrogram data
var tempCanvas = document.createElement("canvas"),
    tempCtx = tempCanvas.getContext("2d");

// Main function that fills most global variables with numbers and creats the
// colorscales
function drawSpec() {

    SpectroData.specLevelWidth = Math.abs(SpectroData.specLevelHigh - SpectroData.specLevelLow)
    var canvas = document.getElementById("canvasSpec")
    var ctx = canvas.getContext("2d")
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var ctxLine = canvasSpecLine.getContext("2d")
    var div = document.getElementById("canvasDivSpec")
    div.addEventListener("scroll", setscrollPosition);
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    SpectroData.cWidth = canvas.width;
    SpectroData.cHigh = canvas.height;

    //Importing spectrogram data to local variable
    switch (Audiodata.display) {
        case "Spectrum":
            SpectroData.specData = Audiodata.spectrogram;
            break;
        case "Phase":
            SpectroData.specData = Audiodata.phase;
            break;
        case "Instantaneous Frequency Deviation":
            SpectroData.specData = Audiodata.instantFreqDev
            break;
        case "Group Delay":
            SpectroData.specData = Audiodata.groupDelay;
            break;
    }

    // Defining varables with no of spectrograms
    SpectroData.specWidth = SpectroData.specData.length;
    SpectroData.specHight = SpectroData.specData[1].length;
    // Storing spectrogram specs to global variable

    // Create temp canvas for temp storing of picture data

    tempCtx.clearRect(0, 0, SpectroData.specWidth, SpectroData.specHight);
    tempCanvas.width = SpectroData.specWidth;
    tempCanvas.height = SpectroData.specHight;

    // Create color scales
    createViridis();
    createGray();
    createJet();
    createHsv();
    createPlasma();
    createTwilight();

    // Start draw spectrogram
    draw();

    // Functions for chasing mouse actions
    var plusX=document.getElementById('plusX')
    var minusX = document.getElementById('minusX')
    var plusY=document.getElementById('plusY')
    var minusY=document.getElementById('minusY')
    plusX.addEventListener("click",function(){zoomTime(-1)},false);
    minusX.addEventListener("click",function(){zoomTime(1)},false);
    plusY.addEventListener("click",function(){zoomFreq(-1)},false);
    minusY.addEventListener("click",function(){zoomFreq(1)},false);
    playButton.addEventListener("click", toggleSound);
    playButton.addEventListener("click", toggleSound);
    //canvasSpecLine.addEventListener("mousewheel", mouseWheelFunction);
    canvasSpecLine.addEventListener("click", startPlayHere)
    canvasSpecLine.addEventListener('mousemove', displayMousePosition);
    canvasSpecLine.addEventListener("dblclick", scaleFullSpec);

    // Callback function of single click event on the spectrogram
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

    // This function calls a zoom function in dependency on the keys that are
    // pressed while using the mousewheel
    function mouseWheelFunction(evt) {
        var delta = evt.deltaY;

        if (SpectroData.strgPressed) {
            if (SpectroData.shiftPressed) {
                //delta = evt.deltaX;
                // console.log(delta)
                event.preventDefault();
                zoomFreq(delta);
            } else {
                event.preventDefault();
                zoomTime(delta);
            }
        } else if (SpectroData.shiftPressed) {
            //delta = evt.deltaX;
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
        console.log(factor)
        // Checking if the new canvas size is smaler than the maximum possible
        // size, but also bigger then the size of the surrounding div. If this is
        // the case, the canvases are scaled to the new size
        if (canvas.width * factor < 32767 && (canvas.width * factor) * canvas.height < 268435456 && canvas.width * factor > divWidth) {
            canvasSpecScale.width = canvas.width * factor + SpectroData.scaleOfsetLeft
            canvas.width = canvas.width * factor;
            SpectroData.cWidth = canvas.width;
            canvasSpecLine.width = canvasSpecLine.width * factor
            // If the new size will be smaler then the surrounding div, the size
            // of the canvases is set to the size of the div
        } else if (canvas.width * factor < 32767 && (canvas.width * factor) * canvas.height < 268435456 && canvas.width * factor < divWidth) {
            canvasSpecScale.width = divWidth
            canvas.width = divWidth - SpectroData.scaleOfsetLeft
            SpectroData.cWidth = canvas.width;
            canvasSpecLine.width = divWidth - SpectroData.scaleOfsetLeft

        }

        ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
        SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
        SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        drawScale()
        section = getSectionDisplayed()
        drawSelection(section.min, 2, section.max);

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
        // Checking if the new canvas size is smaler than the maximum possible
        // size, but also bigger then the size of the surrounding div. If this is
        // the case, the canvases are scaled to the new size
        console.log(delta, canvas.height, factor, divHeight)
        if (canvas.height * factor < 32767 && (canvas.height * factor) * canvas.width < 268435456 && canvas.height * factor > divHeight && canvas.height * factor <= (tempCanvas.height * 2.5)) {

            canvasSpecScale.height = canvas.height * factor + SpectroData.scaleOfsetBottom
            canvas.height = canvas.height * factor;
            SpectroData.cHigh = canvas.height;
            canvasSpecLine.height = canvasSpecLine.height * factor;
            // If the new size will be smaler then the surrounding div, the size
            // of the canvases is set to the size of the div
        } else if (canvas.height * factor < 32767 && (canvas.height * factor) * canvas.width < 268435456 && canvas.height * factor < divHeight && canvas.height * factor <= (tempCanvas.height * 2.5)) {
            console.log('oder das?')
            canvasSpecScale.height = divHeight
            canvas.height = divHeight - SpectroData.scaleOfsetBottom
            cHigh = canvas.height;
            canvasSpecLine.height = divHeight - SpectroData.scaleOfsetBottom
        }

        ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
        SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
        SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        drawScale()
        section = getSectionDisplayed()
        drawSelection(section.min, 2, section.max);

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
        // Checking if the new canvas size is smaler than the maximum possible
        // size, but also bigger then the size of the surrounding div. If this is
        // the case, the canvases are scaled to the new size
        if (canvas.width * factor < 32767 && (canvas.width * factor) * (canvas.height * factor) < 268435456 && canvas.height * factor < 32767 && canvas.height * factor > divHeight && canvas.width * factor > divWidth && canvas.height * factor <= (tempCanvas.height * 2.5)) {
            canvasSpecScale.height = canvas.height * factor + SpectroData.scaleOfsetBottom
            canvasSpecScale.width = canvas.width * factor + SpectroData.scaleOfsetLeft
            canvas.height = canvas.height * factor;
            SpectroData.cHigh = canvas.height;
            canvas.width = canvas.width * factor;
            SpectroData.cWidth = canvas.width;
            canvasSpecLine.height = canvasSpecLine.height * factor;
            canvasSpecLine.width = canvasSpecLine.width * factor;
            // If the new size will be smaler then the surrounding div, the size
            // of the canvases is set to the size of the div
        } else if (canvas.width * factor < 32767 && (canvas.width * factor) * (canvas.height * factor) < 268435456 && canvas.height * factor < 32767 && (canvas.height * factor > divHeight || canvas.width * factor > divWidth) && canvas.height * factor <= (tempCanvas.height * 2.5)) {
            canvasSpecScale.height = divHeight
            canvas.height = divHeight - SpectroData.scaleOfsetBottom
            SpectroData.cHigh = canvas.height;
            canvasSpecLine.height = divHeight - SpectroData.scaleOfsetBottom
            canvasSpecScale.width = divWidth
            canvas.width = divWidth - SpectroData.scaleOfsetLeft
            cWidth = canvas.width;
            canvasSpecLine.width = divWidth - SpectroData.scaleOfsetLeft

        }

        ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
        SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
        SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        drawScale()
        section = getSectionDisplayed()
        drawSelection(section.min, 2, section.max);

    }

}

// Function for drawing a new spectrogram
function draw() {
    var canvas = document.getElementById("canvasSpec");
    var ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (SpectroData.TypeColorScale == 1) {
        var colorScale = viridisScale;
    } else if (SpectroData.TypeColorScale == 2) {
        var colorScale = grayScale;
    } else if (SpectroData.TypeColorScale == 3) {
        var colorScale = jetScale;
    } else if (SpectroData.TypeColorScale == 4) {
        var colorScale = plasmaScale;
    }

    if (Audiodata.display === "Phase" || Audiodata.display === "Group Delay") {
        var colorScale = twilightScale;
    } else if (Audiodata.display === "Instantaneous Frequency Deviation") {
        var colorScale = sunlightScale;
    }

    SpectroData.colorScale = colorScale;

    var noOfColorSteps = colorScale[1].length;

    // Clear canvas from previous data
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // create image data variable
    var pictureData = ctx.createImageData(SpectroData.specWidth, SpectroData.specHight);

    // Create counter variable for the numbers in the ImageData variable
    var nPictureData = 0;

    switch (Audiodata.display) {
        case "Spectrum":
            for (var j = SpectroData.specHight - 1; j > 0; j--) {

                for (var i = 0; i < SpectroData.specWidth; i++) {
                    //Scaling the input Data onto the colorscale
                    point = 20 * Math.log10(SpectroData.specData[i][j] / Audiodata.blockLen);

                    point += Math.abs(SpectroData.specLevelLow);
                    point = Math.max(point, 0);
                    point = Math.min(point, SpectroData.specLevelWidth);
                    //console.log(point)
                    point /= Math.abs(SpectroData.specLevelWidth);
                    //console.log(point)
                    point *= (noOfColorSteps - 1);

                    point = Math.floor(point);
                    if (point > noOfColorSteps - 1) {
                        point = noOfColorSteps - 1;
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
            for (var j = SpectroData.specHight - 1; j > 0; j--) {

                for (var i = 0; i < SpectroData.specWidth; i++) {
                    point = SpectroData.specData[i][j];

                    point += Math.PI;

                    point *= noOfColorSteps - 1;
                    point /= 2 * Math.PI;
                    point = Math.floor(point);
                    if (point > noOfColorSteps - 1) {
                        point = noOfColorSteps - 1;
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
        case "Instantaneous Frequency Deviation":
            for (var j = SpectroData.specHight - 1; j > 0; j--) {

                for (var i = 0; i < SpectroData.specWidth; i++) {
                    point = SpectroData.specData[i][j];
                    point += Audiodata.wrapFreq / 2;
                    point *= noOfColorSteps - 1;
                    point /= Audiodata.wrapFreq;

                    point = Math.floor(point);
                    if (point > noOfColorSteps - 1) {
                        point = noOfColorSteps - 1;
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
        case "Group Delay":
            for (var j = SpectroData.specHight - 1; j > 0; j--) {

                for (var i = 0; i < SpectroData.specWidth; i++) {
                    point = SpectroData.specData[i][j];

                    point += 0.5 * ((1 / Audiodata.sampleRate) * Audiodata.blockLen)
                    point *= 1000

                    point *= noOfColorSteps - 1;
                    point /= ((1 / Audiodata.sampleRate) * Audiodata.blockLen) * 1000
                    point = Math.floor(point);
                    if (point > noOfColorSteps - 1) {
                        point = noOfColorSteps - 1;
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
    }

    // Putting imageData into the temp canvas
    tempCtx.putImageData(pictureData, 0, 0);

    //SCaling the actual cavas to fit the whole Spectrogram
    ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
    SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
    SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
    // Draw the image from the temp canvas to the scaled canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    // Call function for drawing the legend
    drawLegend(colorScale)
    // Call function for creating the scale arround the spectrgram
    drawScale()
    section = getSectionDisplayed()
    // Mark the section of the signa that is currently displayed
    drawSelection(section.min, 2, section.max);

}

function drawLineKlick(mouseTime) {
    canvasSpecLine = document.getElementById("canvasSpecLine")
    canvas = document.getElementById("canvasSpec")
    ctxLine = canvasSpecLine.getContext("2d")
    mousePos = (mouseTime * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate)
    ctxLine.clearRect(0, 0, canvasSpecLine.width, canvasSpecLine.height)
    ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' + 0 + ')';
    ctxLine.fillRect(mousePos, 0, 2, canvasSpecLine.height);
    info.innerHTML = timeToString((mouseTime), 1, 0) + "/" + timeToString((Audiodata.signalLen / Audiodata.sampleRate), 1, 0);

    drawLinePlay()
}

// In this function the spectrogram values for the actual mouse position are
// extracted  from the raw spectrogram data and then displayed in the upper left
// cornder of the spectrogram
function displayMousePosition(evt) {
    var canvas = document.getElementById("canvasSpec");
    var specTime = document.getElementById("specTime");
    var specFreq = document.getElementById("specFreq");
    var magnitute = document.getElementById("magnitute");
    var mousePos = getMousePos(canvas, evt);
    sigLenSec = Audiodata.signalLen / Audiodata.sampleRate;
    mouseX = Math.round((sigLenSec / canvas.width * mousePos.x) * 100) / 100;
    mouseY = Math.round(((Audiodata.sampleRate / 2) / canvas.height) * (canvas.height - mousePos.y))

    specTime.innerHTML = 'Time: ' + timeToString(mouseX, 1, 1)
    specFreq.innerHTML = 'Freq: ' + mouseY + ' Hz';
    point = SpectroData.specData[Math.round(mousePos.x / SpectroData.scaleFactorWidth)]
    [Math.round(((canvas.height - 1) - (mousePos.y)) / SpectroData.scaleFactorHeight)]

    switch (Audiodata.display) {
        case "Spectrum":
            if (!isNaN(point)) {
                point = 20 * Math.log10(point / Audiodata.blockLen);
                point = Math.max(SpectroData.specLevelLow, point);
                point = Math.min(point, SpectroData.specLevelHigh)
                magnitute.innerHTML = 'Level: ' + Math.round(point) + ' dB'
            }
            break;
        case "Phase":
            if (!isNaN(point)) {
                point /= Math.PI;
                magnitute.innerHTML = 'Phase: ' + Math.round(point * 100) / 100 + ' \u03C0'
            }
            break;
        case "Instantaneous Frequency Deviation":
            magnitute.innerHTML = "IFD: " + Math.round(point) + " Hz"
            break
        case "Group Delay":
            point += 0.5 * ((1 / Audiodata.sampleRate) * Audiodata.blockLen);
            if (!isNaN(point)) {
                point *= 1000
                magnitute.innerHTML = "Group Delay: " + Math.round(point * 100) / 100 + " ms"
            }
            break;
    }
};

// Function that draws the red play position line on the canvas
function drawLinePlay() {
    // Getting all elements needed for the function
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var ctxLine = canvasSpecLine.getContext("2d")
    var div = document.getElementById("canvasDivSpec")

    // If the function is called when nothing is played, nothing happens
    if (isPlaying) {
        // Calculation of actual line Position from actual playback time
        var linePosition = Math.floor(canvasSpecLine.width / (Audiodata.signalLen / Audiodata.sampleRate) * (audioCtx.currentTime - startTime + startOffset))

        // If the position is outside the div, the canvas is scrolled
        if (linePosition <= SpectroData.scrollPositionX - SpectroData.scaleOfsetLeft) {
            div.scrollLeft = linePosition + SpectroData.scaleOfsetLeft - 50
        }

        // Drawing the line
        ctxLine.clearRect(0, 0, canvasSpecLine.width, canvasSpecLine.height)

        ctxLine.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' + 0 + ')';
        ctxLine.fillRect(linePosition, 0, 2, canvasSpecLine.height);
        if (linePosition >= SpectroData.scrollPositionX + div.offsetWidth - SpectroData.scaleOfsetLeft) {
            div.scrollLeft = div.scrollLeft + div.offsetWidth - 50
        }
        // Calling the function again depended on the actual load of the computer
        window.requestAnimationFrame(drawLinePlay)

    }

}

// Functions that draws the legend for the spectrogram
function drawLegend(colorScale) {
    SpectroData.specLevelWidth = Math.abs(SpectroData.specLevelHigh - SpectroData.specLevelLow);
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
            tempCtxLegend.fillStyle = 'rgb(' + Math.floor(colorScale[0][i]) + ',' + Math.floor(colorScale[1][i]) + ',' + Math.floor(colorScale[2][i]) + ')';
            tempCtxLegend.fillRect(i * 3, j, 3, 1);
        }
    }
    // Draw the image from the temp canvas to the scaled canvas
    ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height);
    ctxLegend.drawImage(tempCanvasLEgend, 0, 0);

    ctxLegend.clearRect(0, canvasLegend.height - 15, canvasLegend.width * 2, canvasLegend.height)
    ctxLegend.font = "700 14px Arial";
    switch (Audiodata.display) {
        case "Spectrum":
            ctxLegend.fillText(SpectroData.specLevelLow + ' dB', 2, canvasLegend.height - 1);
            ctxLegend.fillText(SpectroData.specLevelLow + (SpectroData.specLevelWidth / 2) + ' dB', (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
            ctxLegend.fillText(SpectroData.specLevelHigh + ' dB', (canvasLegend.width - 2) - 45, canvasLegend.height - 1);
            break;
        case "Phase":
            ctxLegend.fillText('-\u03C0', 2, canvasLegend.height - 1);
            ctxLegend.fillText(0, (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
            ctxLegend.fillText('\u03C0', (canvasLegend.width - 2) - 10, canvasLegend.height - 1);
            break;
        case "Group Delay":
            ctxLegend.fillText(0 + 'ms', 2, canvasLegend.height - 1);
            ctxLegend.fillText((((Audiodata.blockLen / Audiodata.sampleRate) * 1000) / 2).toFixed(1) + 'ms', (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
            ctxLegend.fillText(((Audiodata.blockLen / Audiodata.sampleRate) * 1000).toFixed(1) + 'ms', (canvasLegend.width - 2) - 45, canvasLegend.height - 1);
            break;
        case "Instantaneous Frequency Deviation":
            ctxLegend.fillText((-1 * Audiodata.wrapFreq / 2).toFixed(0) + 'Hz', 2, canvasLegend.height - 1);
            ctxLegend.fillText(0 + 'Hz', (canvasLegend.width / 2) - 15, canvasLegend.height - 1);
            ctxLegend.fillText((Audiodata.wrapFreq / 2).toFixed(0) + 'Hz', (canvasLegend.width - 2) - 45, canvasLegend.height - 1);
            break;
    }

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
// Function draws the x and y scale to the spectrogram
function drawScale() {
    var canvas = document.getElementById('canvasSpec');
    div = document.getElementById('canvasDivSpec')
    var canvasSpecScale = document.getElementById('canvasSpecScale');
    var ctxScale = canvasSpecScale.getContext('2d');
    var divWidth = div.offsetWidth;
    var divHeight = div.offsetHeight;

    var freqMax = Audiodata.sampleRate / 2;
    var trackLenSec = Audiodata.signalLen / Audiodata.sampleRate;
    var freqPerLine = (Audiodata.sampleRate / 2) / canvas.height;
    var timePerColumn = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width
    var timePerSide = (div.offsetWidth - SpectroData.scaleOfsetLeft) * timePerColumn
    var freqPerSide = (div.offsetHeight - SpectroData.scaleOfsetBottom) * freqPerLine

    var logTime = Math.log10(timePerSide);
    logTime = Math.pow(10, Math.floor(logTime))
    var logFreq = Math.log10(freqPerSide);
    logFreq = Math.pow(10, Math.floor(logFreq))

    var minDistanceNumbersX = 50;
    var maxDistanceNumbersX = 400;
    var minDistanceNumbersY = 25;
    var maxDistanceNumbersY = 400;
    var tickNumX = NaN;
    var tickNumY = NaN;
    var freqPerLine = freqMax / canvas.height;
    var timePerColumn = trackLenSec / canvas.width

    var stepsX = 100;

    while (isNaN(tickNumX)) {
        for (var kk = minDistanceNumbersX; kk <= maxDistanceNumbersX; kk++) {
            var time = kk * timePerColumn;
            var quarter = time % (logTime / 4);
            var half = time % (logTime / 2);
            var full = time % logTime;
            if (quarter <= (timePerColumn) && (logTime / 4) * Math.ceil(canvas.width / kk) >= Math.floor(trackLenSec)) {
                stepsX = kk;
                tickNumX = logTime / 4;
                break
            } else if (half <= (timePerColumn) && (logTime / 2) * Math.ceil(canvas.width / kk) >= Math.floor(trackLenSec)) {
                stepsX = kk;
                tickNumX = logTime / 2
                break
            } else if (full <= (timePerColumn) && logTime * Math.ceil(canvas.width / kk) >= Math.floor(trackLenSec)) {
                stepsX = kk;
                tickNumX = logTime
                break
            }

        }
        if (isNaN(tickNumX)) {
            logTime *= 10
        }
    }

    var stepsY = 25;

    while (isNaN(tickNumY)) {

        for (var kk = minDistanceNumbersY; kk <= maxDistanceNumbersY; kk++) {
            var freq = kk * freqPerLine;
            var quarter = freq % (logFreq / 4);
            var half = freq % (logFreq / 2);
            var full = freq % logFreq;

            if (quarter <= (freqPerLine * 2) && (logFreq / 4) * Math.ceil(canvas.height / kk) >= 20000) {
                stepsY = kk;
                tickNumY = logFreq / 4;
                break;
            } else if (half <= freqPerLine * 2 && (logFreq / 2) * Math.ceil(canvas.height / kk) >= 20000) {
                stepsY = kk;
                tickNumY = logFreq / 2;
                break;
            } else if (full <= freqPerLine * 2 && (logFreq) * Math.ceil(canvas.height / kk) >= 20000) {
                stepsY = kk;
                tickNumY = logFreq;
                break;
            }

        }
        if (isNaN(tickNumY)) {
            logFreq *= 5
        }
    }

    ctxScale.clearRect(0, 0, canvasSpecScale.width, canvasSpecScale.height);
    ctxScale.beginPath();
    ctxScale.moveTo(SpectroData.scaleOfsetLeft, 0);
    ctxScale.lineTo(SpectroData.scaleOfsetLeft, canvasSpecScale.height - SpectroData.scaleOfsetBottom)
    ctxScale.lineTo(canvasSpecScale.width - 1, canvasSpecScale.height - SpectroData.scaleOfsetBottom)
    ctxScale.strokeStyle = 'black';
    ctxScale.lineWidth = 1;
    ctxScale.stroke();
    ctxScale.beginPath();

    ctxScale.font = "bold 12px Verdana";

    for (var kk = canvasSpecScale.height - SpectroData.scaleOfsetBottom; kk >= 0; kk -= stepsY) {
        ctxScale.moveTo(SpectroData.scaleOfsetLeft, kk);
        ctxScale.lineTo(SpectroData.scaleOfsetLeft - 5, kk)
        ctxScale.stroke();

        ctxScale.fillText(tickNumY * ((canvasSpecScale.height - SpectroData.scaleOfsetBottom - kk) / stepsY), 1, kk, SpectroData.scaleOfsetLeft - 2);
    }

    for (var kk = 0; kk <= canvasSpecScale.width; kk += stepsX) {
        ctxScale.moveTo(kk + SpectroData.scaleOfsetLeft, canvasSpecScale.height - SpectroData.scaleOfsetBottom);
        ctxScale.lineTo(kk + SpectroData.scaleOfsetLeft, canvasSpecScale.height - SpectroData.scaleOfsetBottom + 5)
        ctxScale.stroke();
        ctxScale.fillText(timeToString(tickNumX * (kk / stepsX), 0, 0), kk + SpectroData.scaleOfsetLeft - 5, canvasSpecScale.height - SpectroData.scaleOfsetBottom + 15, SpectroData.scaleOfsetLeft - 2);
    }

}

// This functions changes the variables for the actual scroll position of the canvas
// in the div to the new values if the canvas is scrolled
function setscrollPosition() {
    div = document.getElementById('canvasDivSpec')
    SpectroData.scrollPositionX = div.scrollLeft,
    SpectroData.scrollPositionY = div.scrollTop
    section = getSectionDisplayed()
    drawSelection(section.min, 2, section.max);

}
// Function that returns the actual mouse position in the canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(evt.clientX - rect.left),
        y: Math.floor(evt.clientY - rect.top)
    };
}

// Function that sets indicators for pressed key to one if the key is pressed
function onKeyDown(evt) {
    switch (evt.code) {
        case "ShiftLeft":
            SpectroData.shiftPressed = 1;
            break;
        case "ControlLeft":
            SpectroData.strgPressed = 1;
            break;
    }
}
// Function that sets indicators for pressed key back to zero afer the key is released
function onKeyUp(evt) {
    switch (evt.code) {
        case "ShiftLeft":
            SpectroData.shiftPressed = 0;
            break;
        case "ControlLeft":
            SpectroData.strgPressed = 0;
            break;
    }
}

// Function that zooms the spectrogram to the section that is selected in the Waveform
function zoomToSelection(timeStart, timeEnd) {
    var canvas = document.getElementById("canvasSpec")
    var ctx = canvas.getContext("2d")
    var div = document.getElementById("canvasDivSpec")
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var divWidth = div.offsetWidth;

    // If a area is selected from the right to the left, start and endtime are switched here
    if (timeEnd < timeStart) {
        var tempTimeStart = timeStart;
        timeStart = timeEnd;
        timeEnd = tempTimeStart;
        SpectroData.endTimeSelection = timeEnd
        // If start and endtime are the same, the user hast just clicked without
        // marking an area. No selection area is set then, but the spectrogram
        // canvas is scrolled that the marked line is near the left end of the div
    } else if (timeEnd == timeStart) {
        SpectroData.endTimeSelection = Audiodata.signalLen / Audiodata.sampleRate;
        div.scrollLeft = (timeStart / ((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width)) - divWidth / 8;
        return;
    }
    var lengthSelect = (timeEnd - timeStart);
    var freqPerLine = (Audiodata.sampleRate / 2) / canvas.height;
    var timePerColumn = (Audiodata.signalLen / Audiodata.sampleRate) / canvas.width
    var timePerSide = (divWidth - SpectroData.scaleOfsetLeft) * timePerColumn

    if (timePerSide == lengthSelect) {
        var factor = 1;

    }
    if (timePerSide != lengthSelect) {
        factor = timePerSide / (lengthSelect * 1.1);
    }

    if (canvas.width * factor < 32767 && (canvas.width * factor) * canvas.height < 268435456 && canvas.width * factor > divWidth) {

        canvasSpecScale.width = canvas.width * factor + SpectroData.scaleOfsetLeft
        canvas.width = canvas.width * factor;
        SpectroData.cWidth = canvas.width;
        canvasSpecLine.width = canvasSpecLine.width * factor

        ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
        SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
        SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
        ctx.drawImage(tempCanvas, 0, 0);
        drawScale()
        drawLineKlick(timeStart)

        var lineStart = (timeStart * canvas.width) / (Audiodata.signalLen / Audiodata.sampleRate);
        div.scrollLeft = lineStart;
    }
}

// This function returns the lines of the spec canvas that are displayed in the Div
function getSectionDisplayed() {
    var canvas = document.getElementById("canvasSpec")
    var div = document.getElementById("canvasDivSpec")
    return {
        min: SpectroData.scrollPositionX * ((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width),
        max: (SpectroData.scrollPositionX + div.offsetWidth) * ((Audiodata.signalLen / Audiodata.sampleRate) / canvas.width)
    };
}

// Callback for doublecklick for resizing the spectrogram to show the full
// spectrogram in the window
function scaleFullSpec() {
    // getting all neded elements
    var canvas = document.getElementById("canvasSpec")
    var ctx = canvas.getContext("2d")
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var div = document.getElementById("canvasDivSpec")
    var canvasSpecScale = document.getElementById('canvasSpecScale');
    // Resizing all three canvases
    canvas.width = div.offsetWidth - SpectroData.scaleOfsetLeft
    canvas.height = div.offsetHeight - SpectroData.scaleOfsetBottom
    SpectroData.cWidth = canvas.width;
    SpectroData.cHigh = canvas.height
    canvasSpecLine.width = div.offsetWidth - SpectroData.scaleOfsetLeft
    canvasSpecLine.height = div.offsetHeight - SpectroData.scaleOfsetBottom
    canvasSpecScale.width = div.offsetWidth
    canvasSpecScale.height = div.offsetHeight

    // Scale the spectrogram canvas to fit into the div and hold all
    // spectrogram information
    ctx.scale(SpectroData.cWidth / SpectroData.specWidth, SpectroData.cHigh / SpectroData.specHight);
    // Store the scale factors
    SpectroData.scaleFactorWidth = SpectroData.cWidth / SpectroData.specWidth;
    SpectroData.scaleFactorHeight = SpectroData.cHigh / SpectroData.specHight;
    // Draw the spectrogram from the tempCanvas onto the spec canvas
    ctx.drawImage(tempCanvas, 0, 0);
    // Draw new scale and mark the section on the wave form
    drawScale()
    var section = getSectionDisplayed()
    drawSelection(section.min, 2, section.max);
}

function downloadSpectrum() {
    var specCanvas = document.getElementById('canvasSpec');
    var scaleCanvas = document.getElementById('canvasSpecScale');

    var scaleContext = scaleCanvas.getContext('2d');
    scaleContext.drawImage(specCanvas, 25, 0);

    var dataURL = scaleCanvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = "spectrogram.png";
    link.href = scaleCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.click();
}
