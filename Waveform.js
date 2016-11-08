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

        // console.log(Audiodata.samples);

        var nPart = Math.floor(Audiodata.signalLen / Audiodata.blockLen);

        var maxValue = new Array(nPart / 2);
        var minValue = new Array(nPart / 2);

        console.log(maxValue.length);

        for (var i = 0; i < maxValue.length; i++) {

            var k = 0;

            if ((i % 2) === 0) {
                maxValue[i] = findMax(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i * 2 + 1)));
            } else if ((i % 2) === 1) {
                minValue[i] = findMin(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i * 2 + 1)));
            }
            k++;

        }

        console.log(maxValue);

        console.log(minValue);

        WaveData.lengthCanvas = canvas.width;
        WaveData.hightCanvas = canvas.height;

        // First path
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = 'blue';
        canvasCtx.moveTo(10, 100);
        canvasCtx.lineTo(700, 100);
        canvasCtx.stroke();

        // Second path
        // canvasCtx.beginPath();
        // canvasCtx.strokeStyle = 'green';
        // canvasCtx.moveTo(20, 20);
        // canvasCtx.lineTo(120, 120);
        // canvasCtx.stroke();

        // console.log(WaveData.lengthCanvas);


        // // Set level boarders for color scaling
        // var specLevelHigh = -0;
        // var specLevelLow = -70;
        // var specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
        // // Variable for color scale
        // var TypeColorScale = 1;
        //
        // //Importing spectrogram data to local variable
        // var specData = Audiodata.spectrogram;
        //
        // // Defining varables with no of spectrograms
        // var specWidth = specData.length;
        // var specHight = specData[1].length;
        // //  console.log(specWidth, specHight)
        // // Storing spectrogram specs to global variable
        // SpectroData.picLength = specWidth;
        // SpectroData.picWidth = specHight;
        //
        // // Create temp canvas for temp storing of picture data
        // var tempCanvas = document.createElement("canvas"),
        //     tempCtx = tempCanvas.getContext("2d");
        // tempCtx.clearRect(0, 0, specWidth, specHight);
        // tempCanvas.width = specWidth;
        // tempCanvas.height = specHight;
        //
        //
        // var noOfColorSteps = parulaScale[1].length;

        // draw();
    } else {
        // canvas-unsupported code here
    }

    // Function for drawing a new spectrogram
    function draw() {

        if (TypeColorScale == 1) {
            colorScale = parulaScale;
        } else if (TypeColorScale == 2) {
            colorScale = grayScale;
        } else if (TypeColorScale == 3) {
            colorScale = jetScale;
        } else if (TypeColorScale == 4) {
            colorScale = hsvScale;
        }
        // Clear canvas from previous data
        ctx.clearRect(0, 0, cWidth, cHigh);

        // create image data variable
        var pictureData = ctx.createImageData(specWidth, specHight);

        // Create counter variable for the numbers in the ImageData variable
        var nPictureData = 0;

        // Loop for transfering the spectrogram data to image data with converting them into the color scale
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
