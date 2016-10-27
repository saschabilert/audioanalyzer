function drawSpec(){

  var cWidth=10000;
  var cHigh=1025;
  var specLevelHigh=-0;
  var specLevelLow=-70;
  var specLevelWidth=Math.abs(specLevelHigh-specLevelLow);
  var noOfColorSteps=100;


creatParula()
console.log(parulaScale)
var specData=Audiodata.spectrogram;
console.log(specData)
draw()

    function draw() {
      var canvas = document.getElementById("canvasSpec");
      var ctx = canvas.getContext("2d");

      var tempCanvas = document.createElement("canvas"),
           tempCtx = tempCanvas.getContext("2d");
       tempCanvas.width=specData.length;
       tempCanvas.height=cWidth,specData[1].length;

      ctx.clearRect(0,0,cWidth,cHigh);
        //ctx.scale(specData.length/cWidth,specData[1].length/cHigh)
        console.log(specData.length/cWidth,specData[1].length/cHigh)
        var pictureData=ctx.createImageData(specData.length,specData[1].length)
        console.log(pictureData)
        var nPictureData=0;

        for (var j=specData[1].length-1;j>0;j--){

             for (var i=0;i<specData.length;i++){
        point=20*Math.log10(specData[i][j]/2048)
      //  console.log(point)
        point +=Math.abs(specLevelLow)
        point=Math.max(point,0)
        point=Math.min(point,specLevelWidth)
      //  console.log(point)
        point /=Math.abs(specLevelLow)
        point*=noOfColorSteps
        point=Math.round(point);
      //  console.log(point)

        for (var kk=0;kk<3;kk++){
          pictureData.data[nPictureData]=Math.round(parulaScale[kk][point]);
          nPictureData++
        }
        pictureData.data[nPictureData]=255;
        nPictureData++
         }
}
    /*    for (var j=specData[1].length-1;j>0;j--){

             for (var i=0;i<specData.length;i++){
               point=20*Math.log10(specData[i][j]/2048)
               point +=80;
               point=Math.max(point,0);
               point/=80;
               point*=255;
               point=Math.floor(point);
               for (var kk=0;kk<3;kk++){
                 pictureData.data[nPictureData]=point;
                 nPictureData++
               }
               pictureData.data[nPictureData]=255;
               nPictureData++
                }

            }*/
  console.log(pictureData.data)

tempCtx.putImageData(pictureData,0,0)
ctx.scale(cWidth/specData.length,cHigh/specData[1].length)
ctx.drawImage(tempCanvas,0,0)

function writeMessage(canvas, message) {
        var context = canvas.getContext('2d');
       context.clearRect(0, 0, 400, 30);

        context.font = '18pt Calibri';
        context.fillStyle = 'white';
        context.fillText(message, 10, 25);
      }

      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: Math.floor(evt.clientX - rect.left),
          y: Math.floor(evt.clientY - rect.top)
        };
      }
}
      var canvasDraw = document.getElementById('canvasDraw');
      var context = canvasDraw.getContext('2d');
      var drawRect=0;
      var coordStartDraw;
      var coordStoppDraw;

    //  canvasDraw.addEventListener("wheel", MouseWheelHandler,false)
}
