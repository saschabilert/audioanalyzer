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
}

var startOffset = 0;
var startTime = 0;
var audPlay;
var isPlaying = false;
var gainNode;
var playButton = document.getElementById("player");
playButton.disabled = true;
playButton.addEventListener("click", toggleSound);

function toggleSound() {
       if (!isPlaying) {
           startTime = audioCtx.currentTime;
           audPlay = audioCtx.createBufferSource();
           audPlay.buffer = myArrayBuffer;
           audPlay.start(0, startOffset);
           playButton.innerHTML = "&#10074;&#10074;";
           isPlaying = true;
           window.requestAnimationFrame(drawLinePlay)
           window.requestAnimationFrame(drawLinePlayWave)
           gainNode = audioCtx.createGain();
           audPlay.connect(gainNode);
           gainNode.connect(audioCtx.destination);
           gainNode.gain.value = 0.5;
           audPlay.onended = function() {
               playButton.innerHTML = "&#9654;"
               if((audioCtx.currentTime-startTime+startOffset)>Audiodata.signalLen/Audiodata.sampleRate){
                   startTime = 0;
                   startOffset = 0;
                   isPlaying = false;
               }
           }

       } else {

           audPlay.stop(audPlay.currentTime);
           isPlaying = false;
           playButton.innerHTML = "&#9654;";

           startOffset += audioCtx.currentTime - startTime;


       }

}

document.getElementById('volume').addEventListener('input', function() {
    gainNode.gain.value = this.value;

});


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
