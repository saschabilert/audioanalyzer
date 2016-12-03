// process audio signal with a new block length
document.getElementById("blockLength").disabled = true;
document.getElementById("windowType").disabled = true;
document.getElementById("overlap").disabled = true;
document.getElementById("display").disabled = true;
document.getElementById("colormap").disabled = true;
document.getElementById("min").disabled = true;
document.getElementById("max").disabled = true;

function gridSize() {
  WaveData.gridSize = document.getElementById("grid").value;
  drawWaveGrid();
}

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
    if (Audiodata.display == "Phase" || Audiodata.display == "MFCC" || Audiodata.display == "Modulation Spectrum" || Audiodata.display == "Group Delay" || Audiodata.display == "Instantaneous Frequency") {
        document.getElementById("blockLength").disabled = true;
        document.getElementById("windowType").disabled = true;
        document.getElementById("overlap").disabled = true;
        document.getElementById("colormap").disabled = true;
        document.getElementById("min").disabled = true;
        document.getElementById("max").disabled = true;
    }
}

function colormap() {
    TypeColorScale = +(document.getElementById("colormap").value);
    draw();
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
stopbtn.disabled = true;

var curtime;
var durtime;
var seekslider;
var seeking = false;
var seekto;
var info = document.querySelector('[data-js="info"]');
var fileName;

document.onkeydown = function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 32) {
        toggleSound();
        e.preventDefault();
    }
}


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
        stopbtn.onclick = function() {
            startTime = 0;
            startOffset = 0;
            isPlaying = false;
            audPlay.stop();
            info.innerHTML = "0.0" + ":" + (Audiodata.signalLen / Audiodata.sampleRate).toFixed(1);
            drawLineKlick(0)
            drawLineKlickWave(0)
        }

        function update() {

            window.requestAnimationFrame(update);
            if (isPlaying == false) {
                return;
            }
            info.innerHTML = (audioCtx.currentTime - startTime + startOffset).toFixed(1) + ":" + (Audiodata.signalLen / Audiodata.sampleRate).toFixed(1);

            if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
                audioCtx.currentTime = 0;
                startTime = 0;
                startOffset = 0;
                isPlaying = false;
                info.innerHTML = "0.0" + ":" + (Audiodata.signalLen / Audiodata.sampleRate).toFixed(1);
                drawLineKlick(0)
                drawLineKlickWave(0)
            }
        }
        update();

        audPlay.onended = function() {
            playButton.innerHTML = "&#9654;";
            if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
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
    gainNode = audioCtx.createGain();
    audPlay.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 0.5;


}

document.getElementById('volume').addEventListener('input', function() {
    gainNode.gain.value = this.value;
});




function enableButton() {
    playButton.disabled = !playButton.disabled;
    stopbtn.disabled = !stopbtn.disabled;
    document.getElementById("blockLength").disabled = false;
    document.getElementById("windowType").disabled = false;
    document.getElementById("overlap").disabled = false;
    document.getElementById("display").disabled = false;
    document.getElementById("colormap").disabled = false;
    document.getElementById("min").disabled = false;
    document.getElementById("max").disabled = false;
}



var min;
var max;

function minMaxValue(e) {

    if (e.keyCode == 13 || e.which == 13) {

        min = document.getElementById("min").value;
        max = document.getElementById("max").value;
        if (min != 0) {
            min = parseInt(min)
        }
        if (max != 0) {
            max = parseInt(max)
        }



        if (min < 0 && max < 0 && max > min) {

            specLevelHigh = max;
            specLevelLow = min;
        } else if (min < 0 && max == 0 && specLevelHigh > min) {

            specLevelLow = min;
        } else if (min == 0 && max < 0 && specLevelLow < max) {

            specLevelHigh = max;
        } else if (min >= 0 || max >= 0 || max < min) {
            alert("Es duerfen nur Werte zwischen 0 und -120 eingetragen werden. Ausserdem muss min Value kleiner sein als max Value ")
        }

        changeColorScale();
    }

}
