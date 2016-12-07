// process audio signal with a new block length
document.getElementById("blockLength").disabled = true;
document.getElementById("windowType").disabled = true;
document.getElementById("overlap").disabled = true;
document.getElementById("display").disabled = true;
document.getElementById("colormap").disabled = true;
document.getElementById("min").disabled = true;
document.getElementById("max").disabled = true;
document.getElementById("grid").disabled = true;

function gridSize() {
  WaveData.gridSize = document.getElementById("grid").value;
  drawWaveGrid();
}

function blockLength() {
    Audiodata.blockLen = +(document.getElementById("blockLength").value);
    audioProcessing();
    Audiodata.drawCheck = false;
}
// process audio signal with a new window type
function windowType() {
    Audiodata.windowFunction = document.getElementById("windowType").value;
    audioProcessing();
    Audiodata.drawCheck = false;
}

function overlap() {
    Audiodata.overlap = +(document.getElementById("overlap").value);
    audioProcessing();
    Audiodata.drawCheck = false;
}

function chooseDisplay() {
    Audiodata.display = document.getElementById("display").value;
    audioProcessing();
    Audiodata.drawCheck = false;
    if (Audiodata.display == "Phase" || Audiodata.display == "MFCC" || Audiodata.display == "Modulation Spectrum" || Audiodata.display == "Group Delay" || Audiodata.display == "Instantaneous Frequency") {
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
playButton.addEventListener("click", toggleSound);
playButton.disabled = true;

var stopbtn = document.getElementById("stop");
stopbtn.disabled = true;

var curtime;
var durtime;
var seekslider;
var seeking = false;
var seekto;
var info = document.querySelector('[data-js="info"]')


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
        var playback = timeUpdate();
        stopbtn.onclick = function() {
            startTime = 0;
            startOffset = 0;
            isPlaying = false;
            audPlay.stop();
            info.innerHTML = "00:00.0"  + "/" +  playback.trackDuration;
            drawLineKlick(0);
            drawLineKlickWave(0);
        }

        audPlay.onended = function() {
            playButton.innerHTML = "&#9654;";
            if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
                startTime = 0;
                startOffset = 0;
                isPlaying = false;
                info.innerHTML = "00:00.0"  + "/" + playback.trackDuration;

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

var inputs = document.querySelectorAll('.audioInput');
Array.prototype.forEach.call(inputs, function(input) {
    var label = input.nextElementSibling;

    input.addEventListener('change', function(e) {

        var fileName = e.target.value.split('\\').pop();
        label.innerHTML = fileName;
        if (fileName == "") {
            fileName = "Choose a file";
            label.innerHTML = fileName;
            document.getElementById("loading").style.display = "none";
            document.getElementById("container").style.display = "none";
        }
    });
});


function enableButton() {
    playButton.disabled = false;
    stopbtn.disabled = false;
    document.getElementById("blockLength").disabled = false;
    document.getElementById("windowType").disabled = false;
    document.getElementById("overlap").disabled = false;
    document.getElementById("display").disabled = false;
    document.getElementById("colormap").disabled = false;
    document.getElementById("min").disabled = false;
    document.getElementById("max").disabled = false;
    document.getElementById("grid").disabled = false;
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

        draw();
    }

}

function timeToString(time){

  var currentMin = Math.floor((time)/60);
  var currentSec = Math.floor((time)-currentMin*60);
  var milisec = time % 1

  currentSec = currentSec+milisec
  if((Audiodata.signalLen / Audiodata.sampleRate)<=60){
  currentSec=currentSec.toPrecision(3)
}
  if(currentMin == 0 && (Audiodata.signalLen / Audiodata.sampleRate)<=60 ) {
        return currentSec

  }
  else if ((Audiodata.signalLen / Audiodata.sampleRate)>60  && currentSec<10){
      return [currentMin + ":" +0+ currentSec]
  }
  else {
    return [currentMin + ":" +  currentSec]
  }
}

function timeUpdate(){
    window.requestAnimationFrame(timeUpdate);
    if (isPlaying == false) {
        return;
    }

    var currentMin = Math.floor((audioCtx.currentTime - startTime + startOffset)/60);
    var currentMiliSec = Math.floor((audioCtx.currentTime - startTime + startOffset)*10);
    var currentSec = Math.floor((audioCtx.currentTime - startTime + startOffset)-currentMin*60);
    var durationMin = Math.floor((Audiodata.signalLen / Audiodata.sampleRate)/60);
    var durationSec = Math.floor((Audiodata.signalLen / Audiodata.sampleRate)-durationMin*60);
    if (currentSec < 10) {currentSec = "0" + currentSec;}
    if (currentMin < 10) {currentMin = "0" + currentMin;}
    if (durationMin < 10) {durationMin = "0" + durationMin;}
    if (durationSec < 10) {durationSec = "0" + durationSec;}
    if (currentMiliSec >= 10) {currentMiliSec = currentMiliSec%10;}
    if(currentMin == 0) {
        currentTime = currentSec + "." + currentMiliSec;
        trackDuration = durationMin + ":" + durationSec;
    }
    else {
        currentTime = currentMin + ":" + currentSec + "." + currentMiliSec;
        trackDuration = durationMin + ":" + durationSec;
    }


    info.innerHTML = currentMin + ":" + currentSec + "." + currentMiliSec + "/" + trackDuration;

    if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
        audioCtx.currentTime = 0;
        startTime = 0;
        startOffset = 0;

         isPlaying = false;
        info.innerHTML = "00:00"  + "/"  + durationMin + ":" + durationSec;

        drawLineKlick(0)
        drawLineKlickWave(0)
    }
    else if (((audioCtx.currentTime - startTime + startOffset) >=endTimeSelection)) {
        audioCtx.currentTime = 0;
        //startTime = startTime;
        //startOffset = startOffset;
        isPlaying = false;
        info.innerHTML = currentTime +  "/"  + trackDuration;
        audPlay.stop();
    }
return {
    currentTime: currentTime,
    trackDuration: trackDuration
};


}
