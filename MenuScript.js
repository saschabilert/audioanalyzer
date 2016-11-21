// process audio signal with a new block length
function blockLength() {
    Audiodata.blockLen = +(document.getElementById("blockLength").value);
    audioProcessing();
}
// process audio signal with a new window type
function windowType() {
    Audiodata.windowFunction = document.getElementById("windowType").value;
    audioProcessing();
}

function overlap() {
    Audiodata.overlap = +(document.getElementById("overlap").value);
    audioProcessing();
}

function chooseDisplay() {
    Audiodata.display = document.getElementById("display").value;
    audioProcessing();
}

function colormap(){
    TypeColorScale = +(document.getElementById("colormap").value);
    changeColorScale();
    drawWave();
}
var audio = document.getElementById("myAudio");
var startOffset = 0;
var startTime = 0;
var audPlay;
var isPlaying = false;
var gainNode;
var playButton = document.getElementById("player");
playButton.disabled = true;
playButton.addEventListener("click", toggleSound);
var stopbtn = document.getElementById("stop");
stopbtn.addEventListener("click", stopButton);

var curtime;
var durtime;
var seekslider;
var seeking = false;
var seekto;
var info = document.querySelector('[data-js="info"]');



function toggleSound() {
       if (!isPlaying) {
           startTime = audioCtx.currentTime;
           audPlay = audioCtx.createBufferSource();
           audPlay.buffer = myArrayBuffer;
           audPlay.start(0, startOffset);
           playButton.innerHTML = "&#10074;&#10074;";
           isPlaying = true;
           window.requestAnimationFrame(drawLinePlay);
           window.requestAnimationFrame(drawLinePlayWave);
           gainNode = audioCtx.createGain();
           audPlay.connect(gainNode);
           gainNode.connect(audioCtx.destination);
           gainNode.gain.value = 0.5;
           // curtime = document.getElementById("curtime");
           // durtime = document.getElementById("durtime");
           // audio.addEventListener("timeupdate", timeUpdate(),false);
           // function timeUpdate(){
           //     var nt = audioCtx.currentTime-startTime+startOffset*(100/Audiodata.signalLen/Audiodata.sampleRate);
           //     var curmins = Math.floor(audioCtx.currentTime-startTime+startOffset/60);
           //     var cursecs = Math.floor(audioCtx.currentTime-startTime+startOffset - curmins*60);
           //     var durmins = Math.floor(Audiodata.signalLen/Audiodata.sampleRate/60);
           //     var dursecs = Math.floor(Audiodata.signalLen/Audiodata.sampleRate - durmins*60);
           //     if(cursecs<10){cursecs = "0"+cursecs;}
           //     if(dursecs<10){dursecs = "0" + dursecs;}
           //     if(curmins<10){curmins = "0" + curmins;}
           //     if(durmins<10){durmins = "0" + durmins;}
           //     curtime.innerHTML = curmins+":"+cursecs;
           //     durtime.innerHTML = durmins+":"+dursecs;
           // }

           function update(){
               window.requestAnimationFrame(update);
               info.innerHTML = (audioCtx.currentTime-startTime+startOffset).toFixed(1) +"/"+(Audiodata.signalLen/Audiodata.sampleRate).toFixed(1);
               if((audioCtx.currentTime-startTime+startOffset)>Audiodata.signalLen/Audiodata.sampleRate){
                   audioCtx.currentTime = 0;
                   startTime = 0;
                   startOffset = 0;
                   info.innerHTML = (audioCtx.currentTime-startTime+startOffset).toFixed(1) +"/"+(Audiodata.signalLen/Audiodata.sampleRate).toFixed(1);

               }

           }
           update();

           audPlay.onended = function() {
               playButton.innerHTML = "&#9654;";
               if((audioCtx.currentTime-startTime+startOffset)>Audiodata.signalLen/Audiodata.sampleRate){
                   startTime = 0;
                   startOffset = 0;
                   isPlaying = false;
               }
           };

       } else {

           audPlay.stop();
           isPlaying = false;
           playButton.innerHTML = "&#9654;";
           startOffset += audioCtx.currentTime - startTime;
       }
    stopbtn.onclick = function(){
        startTime = 0;
        startOffset = 0;
        isPlaying = false;
    }

}


document.getElementById('volume').addEventListener('input',function(){
    gainNode.gain.value = this.value;
})




function enableButton() {
   playButton.disabled = !playButton.disabled;
}

var inputs = document.querySelectorAll( '.audioInput' );
Array.prototype.forEach.call( inputs, function( input )
{
    var label	 = input.nextElementSibling,
        labelVal = label.innerHTML;

    input.addEventListener( 'change', function( e )
    {

          var fileName = e.target.value.split( '\\' ).pop();
            label.innerHTML = fileName;
    });
});
