//Get the user choice of grid size
function gridSize() {
    WaveData.gridScale = +(document.getElementById("grid").value);
    drawWaveGrid();
}
//Get the user choice of block length
function blockLength() {
    Audiodata.blockLen = +(document.getElementById("blockLength").value);
    audioProcessing();
}
//Get the user choice of window type
function windowType() {
    Audiodata.windowFunction = document.getElementById("windowType").value;
    audioProcessing();
}
//Get the user choice of overlap
function overlap() {
    Audiodata.overlap = +(document.getElementById("overlap").value);
    audioProcessing();
}
//Get the user choice of display type
function chooseDisplay() {
    Audiodata.display = document.getElementById("display").value;
    audioProcessing();
    // If this three display types are chosen, disable the colormap and the min max values
    if (Audiodata.display == "Phase" || Audiodata.display == "Instantaneous Frequency Deviation" ||
         Audiodata.display == "Group Delay") {
        document.getElementById("colormap").disabled = true;
        document.getElementById("min").disabled = true;
        document.getElementById("max").disabled = true;
    }
}
//Get the user choice of colormap
function colormap() {
    SpectroData.TypeColorScale = +(document.getElementById("colormap").value);
    draw();
}

var startOffset = 0;
var startTime = 0;
var audPlay;
var isPlaying = false;
var gainNode;
var playButton = document.getElementById("player");
playButton.addEventListener("click", toggleSound);

var stopbtn = document.getElementById("stop");

var info = document.getElementById("playbackTime");
var loopSelection = false;

document.onkeydown = function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 32) {
        toggleSound();
        e.preventDefault();
    }
};


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
            info.innerHTML = "00:00.0" + "/" + playback.trackDuration;
            drawLineKlick(0);
            drawLineKlickWave(0);
        };

        audPlay.onended = function() {
            playButton.innerHTML = "&#9654;";
            if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
                startTime = 0;
                startOffset = 0;
                isPlaying = false;
                info.innerHTML = "00:00.0" + "/" + playback.trackDuration;

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
        if (fileName === "") {
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
    document.getElementById("saveSpec").disabled = false;
    document.getElementById("LoopCheck").disabled = false;
    document.getElementById("volume").disabled = false;

}

function minMaxValue(e) {
    var min = 0;
    var max = 0;
    if (e.keyCode == 13 || e.which == 13) {

        min = document.getElementById("min").value;
        max = document.getElementById("max").value;
        if (min !== 0) {
            min = parseInt(min);
        } else {
            min = 1;
        }
        if (max !== 0) {
            max = parseInt(max);
        } else {
            max = 1;
        }

        if (min < 0 && max < 0 && max > min) {
            specLevelHigh = max;
            specLevelLow = min;
            specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
        } else if (min < 0 && max === 0 && specLevelHigh > min) {

            specLevelLow = min;
            specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
        } else if (min === 0 && max < 0 && specLevelLow < max) {

            specLevelHigh = max;
            specLevelWidth = Math.abs(specLevelHigh - specLevelLow);
        } else if (min >= 0 || max >= 0 || max < min) {
            alert("Es duerfen nur Werte <= -1 eingetragen werden. Ausserdem muss min Value kleiner sein als max Value ");
        }

        draw();
    }

}

function timeToString(time, alwaysShowFull, alwaysShowMilisec) {

    var minutes = Math.floor((time) / 60);
    var seconds = Math.floor((time) - minutes * 60);
    var miliseconds = Math.floor((time % 1) * 10);


    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (alwaysShowFull == 1) {
        return [minutes + ":" + seconds + "." + miliseconds];
    } else if (alwaysShowFull == 0) {
        if ((minutes == "00") && (Audiodata.signalLen / Audiodata.sampleRate) < 60) {
            if (miliseconds != 0) {
                return [seconds + "." + miliseconds];
            } else {
                return [seconds];
            }
        } else {
            if (alwaysShowMilisec) {
                return [minutes + ":" + seconds + "." + miliseconds];
            } else {
                if (miliseconds != 0) {
                    return [minutes + ":" + seconds + "." + miliseconds];
                } else {
                    return [minutes + ":" + seconds];
                }
            }
        }
    }
}

function timeUpdate() {
    window.requestAnimationFrame(timeUpdate);
    if (isPlaying === false) {
        return 

    }

    var currentTime = (audioCtx.currentTime - startTime + startOffset);

    var durationTrack = (Audiodata.signalLen / Audiodata.sampleRate);



    info.innerHTML = timeToString(currentTime, 1, 0) + "/" + timeToString(durationTrack, 1, 0);

    if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
        audioCtx.currentTime = 0;
        startTime = 0;
        startOffset = 0;

        isPlaying = false;
        info.innerHTML = "00:00.0" + "/" + timeToString(durationTrack, 1, 0);

        drawLineKlick(0);
        drawLineKlickWave(0);
    } else if (((audioCtx.currentTime - startTime + startOffset) >= SpectroData.endTimeSelection)) {
        audioCtx.currentTime = 0;

        isPlaying = false;
        info.innerHTML = timeToString(currentTime, 1, 0) + "/" + timeToString(durationTrack, 1, 0);
        audPlay.stop();
        if (loopSelection) {
            toggleSound();
        }
    }





}

function setLoop() {

    loopSelection = document.getElementById("LoopCheck").checked;

}
