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

        WaveData.lengthCanvas = canvas.width;
        WaveData.hightCanvas = canvas.height;

        var nPart = Math.floor(Audiodata.signalLen / (Audiodata.blockLen / 2));

        var value = new Array(nPart);

        var samples = Audiodata.samples;

        for (var i = 0; i < nPart; i++) {

            if ((i % 2) === 0) {
                value[i] = findMax(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i + 1))) * (WaveData.hightCanvas / 2) + (WaveData.hightCanvas / 2);
            } else if ((i % 2) === 1) {
                value[i] = Math.abs(findMin(Audiodata.samples.slice(Audiodata.blockLen * i,
                    Audiodata.blockLen * (i + 1))) * (WaveData.hightCanvas / 2) + (WaveData.hightCanvas / 2));
            }
        }

        // for (var i = 0; i < nPart; i++){
        //
        //   var currentBlock = samples.slice(Audiodata.blockLen * i, Audiodata.blockLen * (i + 1));
        //   var maxValue = Math.max(...currentBlock) + 1;
        //   var minValue = Math.min(...currentBlock) + 1;
        //
        //   if (Math.abs(maxValue) >= Math.abs(minValue)){
        //     value[i] = maxValue * (WaveData.hightCanvas / 2);
        //   } else {
        //     value[i] = minValue * (WaveData.hightCanvas / 2);
        //   }
        //
        // }

        // var samples = new Array(Audiodata.samples.length);
        
        // samples = samples * WaveData.hightCanvas;

        console.log(value);

        // First path
        canvasCtx.beginPath();
        canvasCtx.strokeStyle = 'blue';
        canvasCtx.moveTo(0, 100);
        for (i = 0; i < value.length; i++) {
            canvasCtx.lineTo(i * x, value[i]);
            canvasCtx.stroke();
        }

    } else {
        // canvas-unsupported code here
    }
  }

  function findMax(array){

    return Math.max(...array);
  }
  function findMin(array){

    return Math.min(...array);
  }
