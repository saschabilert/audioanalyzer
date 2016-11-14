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

function drawSpec() {
    var canvas = document.getElementById("canvasSpec");
    var ctx = canvas.getContext("2d");
    var canvasLine = document.getElementById("canvasLine")
    var ctxLine = canvasLine.getContext("2d")
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var cWidth = canvas.width;
    var cHigh = canvas.height;
    //  console.log(cWidth, cHigh)
    //Saving actual canvas size to global variable object
    SpectroData.lengthCanvas = cWidth;
    SpectroData.hightCanvas = cHigh;

    // Set level boarders for color scaling
    var specLevelHigh = -0;
    var specLevelLow = -70;
    var specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
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
    var tempCanvas = document.createElement("canvas"),
        tempCtx = tempCanvas.getContext("2d");
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

    var noOfColorSteps = parulaScale[1].length;

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

                point /= Math.abs(specLevelLow);
                point *= noOfColorSteps;
                point = Math.round(point);


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
        canvas.width = canvas.width * factor;
        cWidth = canvas.width;
        canvasLine.width=canvasLine.width*factor

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
        canvasLine.height = canvasLine.height * factor;

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
        canvasLine.height = canvasLine.height * factor;
        canvasLine.width=canvasLine.width*factor
        ctx.scale(cWidth / specWidth, cHigh / specHight);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    //Function for changing the color scale and/or the scaling of the color scale
    function changeColorScale(delta) {
        var factor;
        if (delta < 0) {
            factor = 5;
        } else if (delta > 0) {
            factor = -5;
        }

        specLevelHigh += factor;
        specLevelLow += factor;
        specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
        //  console.log(specLevelHigh,specLevelLow)
        var nPictureData = 0;
        for (var j = specHight - 1; j > 0; j--) {

            for (var i = 0; i < specWidth; i++) {
                point = 20 * Math.log10(specData[i][j] / 2048);
                point += Math.abs(specLevelLow);
                point = Math.max(point, 0);
                point = Math.min(point, specLevelWidth);

                point /= Math.abs(specLevelLow);
                point *= noOfColorSteps;
                point = Math.round(point);

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
    }

    /*canvas.addEventListener('mousemove', function(evt) {
      var mousePos = getMousePos(canvas, evt);
      alert(mousePos)
      var message = 'Mouse positions: ' + mousePos.x + ':' + mousePos.y;
      //writeMessage(canvasDraw, message);
    }, false);*/

    function drawLegend() {
        legCanvas = document.getElementById("canvasLegend");
        ctxLegend = legCanvas.getContext("2d");

        var tempCanvasLEgend = document.createElement("canvas"),
            tempCtxLegend = tempCanvasLEgend.getContext("2d");
        tempCtxLegend.clearRect(0, 0, SpectroData.colorScale[0].length, 250);
        tempCanvasLEgend.width = SpectroData.colorScale[0].length;
        tempCanvasLEgend.height = 250;

        for (var i = 1; i < 100; i++) {
            for (var j = 1; j < legCanvas.height; j++) {
                tempCtxLegend.fillStyle = 'rgb(' + Math.floor(SpectroData.colorScale[0][i]) + ',' + Math.floor(SpectroData.colorScale[1][i]) + ',' +
                    Math.floor(SpectroData.colorScale[2][i]) + ')';
                tempCtxLegend.fillRect(i, j, 1, 1);
            }
        }
        ctxLegend.scale(canvasLegend.width / tempCanvasLEgend.width, tempCanvasLEgend.height / canvasLegend.height);
            // Draw the image from the temp canvas to the scaled canvas
        ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height);
        ctxLegend.drawImage(tempCanvasLEgend, 0, 0);
        //ctxLegend.clearRect(0, 0, canvasLegend.width, canvasLegend.height)
        ctxLegend.beginPath()
        ctxLegend.moveTo(1,canvasLegend.height-30)
        ctxLegend.lineTo(1,canvasLegend.height-10)

        ctxLegend.lineTo(canvasLegend.width/2,canvasLegend.height-10)
        ctxLegend.lineTo(canvasLegend.width/2,canvasLegend.height-30)
        ctxLegend.lineTo(canvasLegend.width/2,canvasLegend.height-10)
        ctxLegend.lineTo(canvasLegend.width,canvasLegend.height-10)
        ctxLegend.lineTo(canvasLegend.width,canvasLegend.height-30)
      ctxLegend.strokeStyle = '#100719';
      ctxLegend.lineWidth = 5;
      ctxLegend.stroke();

    }
}


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
