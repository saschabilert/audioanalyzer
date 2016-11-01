
var SpectroData = {
    picData: undefined,
    picLength: undefined,
    picWidth: undefined,
    lengthCanvas: undefined,
    hightCanvas: undefined,
  };


keyEvent=0;

function drawSpec(){
var canvas = document.getElementById("canvasSpec");
  var ctx = canvas.getContext("2d");
  var cWidth=canvas.width;
  var cHigh=canvas.height;
console.log(cWidth,cHigh)
//Saving actual canvas size to global variable object
  SpectroData.lengthCanvas=cWidth;
  SpectroData.hightCanvas=cHigh


  var specLevelHigh=-0;
  var specLevelLow=-70;
  var specLevelWidth=Math.abs(specLevelHigh-specLevelLow);
var TypeColorScale=1;


  var specData=Audiodata.spectrogram;
  var specWidth=specData.length;
  var specHight=specData[1].length
  console.log(specWidth,specHight)
  SpectroData.picLength=specWidth;
  SpectroData.picWidth=specHight;

  var tempCanvas = document.createElement("canvas"),
       tempCtx = tempCanvas.getContext("2d");
   tempCanvas.width=specWidth;
   tempCanvas.height=specHight;

creatParula()
creatGray()
creatJet()
creatHsv()
  var noOfColorSteps=parulaScale[1].length;
draw()

    function draw() {

if (TypeColorScale==1){
colorScale=parulaScale
}
else if (TypeColorScale==2) {
  colorScale=grayScale
}
else if (TypeColorScale==3) {
colorScale=jetScale
}
else if (TypeColorScale==4) {
  colorScale=hsvScale
}
      ctx.clearRect(0,0,cWidth,cHigh)

      var pictureData=ctx.createImageData(specWidth,specHight)

        var nPictureData=0;

        for (var j=specHight-1;j>0;j--){

             for (var i=0;i<specWidth;i++){
        point=20*Math.log10(specData[i][j]/2048)

        point +=Math.abs(specLevelLow)
        point=Math.max(point,0)
        point=Math.min(point,specLevelWidth)

        point /=Math.abs(specLevelLow)
        point*=noOfColorSteps
        point=Math.round(point);


        for (var kk=0;kk<3;kk++){
          pictureData.data[nPictureData]=Math.round(colorScale[kk][point]);
          nPictureData++
        }
        pictureData.data[nPictureData]=255;
        nPictureData++
         }
}


tempCtx.putImageData(pictureData,0,0)
console.log(cWidth/specWidth,cHigh/specHight)
ctx.scale(cWidth/specWidth,cHigh/specHight)
ctx.drawImage(tempCanvas,0,0)
var testdata = ctx.getImageData(0, 0, canvas.width, canvas.height)
console.log(testdata)
specData.picData=pictureData;
}




      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: Math.floor(evt.clientX - rect.left),
          y: Math.floor(evt.clientY - rect.top)
        };
      }


canvas.addEventListener("mousewheel", mouseWheelFunction)

  function mouseWheelFunction(evt){
//    console.log(evt)
//    console.log(keyEvent)
        var  delta=evt.deltaY;
        console.log(delta)
        if (keyEvent.ctrlKey){
          if(keyEvent.shiftKey){
              delta=evt.deltaX;
            // console.log(delta)
            //event.preventDefault();
            zoomFreq(delta)}
          else {
          event.preventDefault();
          zoomTime(delta)
          }
        }
        else if (keyEvent.shiftKey) {
          delta=evt.deltaX;
          zoomAll(delta)

        }


        }


function zoomTime(delta){

if(delta<0){
var factor=1.2}
else if (delta>0) {
  var factor=0.8
}
else {
  factor = 1;
}
  canvas.width=canvas.width*factor
  cWidth=canvas.width;
  ctx.scale(cWidth/specWidth,cHigh/specHight)
  ctx.drawImage(tempCanvas,0,0)

}

function zoomFreq(delta){
  if(delta<0){
  var factor=1.1}
  else if (delta>0) {
    var factor=0.9
  }
  else {
    factor=1
  }
  canvas.height=canvas.height*factor
  cHigh=canvas.height;
  ctx.scale(cWidth/specWidth,cHigh/specHight)
  ctx.drawImage(tempCanvas,0,0)
}

function zoomAll(delta){
  if(delta<0){
  var factor=1.1}
  else if (delta>0) {
    var factor=0.9
  }
  else {factor=1

  }
  canvas.height=canvas.height*factor
  cHigh=canvas.height;
  canvas.width=canvas.width*factor
  cWidth=canvas.width;
  ctx.scale(cWidth/specWidth,cHigh/specHight)
  ctx.drawImage(tempCanvas,0,0)
}

function changeColorScale(delta){
  if(delta<0){
    var factor=5}
  else if (delta>0) {
    var factor=-5
  }


  specLevelHigh+=factor
  specLevelLow+=factor
  specLevelWidth=Math.abs(specLevelHigh-specLevelLow);
//  console.log(specLevelHigh,specLevelLow)
  var nPictureData=0;
  for (var j=specHight-1;j>0;j--){

       for (var i=0;i<specWidth;i++){
         point=20*Math.log10(specData[i][j]/2048)
         point +=Math.abs(specLevelLow)
         point=Math.max(point,0)
         point=Math.min(point,specLevelWidth)

         point /=Math.abs(specLevelLow)
         point*=noOfColorSteps
         point=Math.round(point);

          for (var kk=0;kk<3;kk++){
            specData.picData.data[nPictureData]=Math.round(colorScale[kk][point]);
            nPictureData++
          }
          specData.picData.data[nPictureData]=255;
          nPictureData++
        }

}
tempCtx.putImageData(specData.picData,0,0)
ctx.drawImage(tempCanvas,0,0)

}
//document.onkeydown = KeyCheck;
document.addEventListener("keydown", function(evt){
keyEvent=evt;

})



document.addEventListener("keyup", function(evt){
keyEvent=evt;
})
}
