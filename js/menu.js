/*
 * menu.js
 *
 * Copyright (C) 2016  Moritz Balter, Vlad Paul, Sascha Bilert
 * IHA @ Jade Hochschule applied licence see EOF
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * contact: moritz.balters@student.jade-hs.de
 * contact: sascha.bilert@student.jade-hs.de
 * contact: vlad.paul@student.jade-hs.de
 */

// get the user choice of grid size
function gridSize() {
    WaveData.gridScale = +(document.getElementById("grid").value);
    drawWaveGrid();
}

// get the user choice of block length
function blockLength() {
    Audiodata.blockLen = +(document.getElementById("blockLength").value);
    processAudio();
}

// get the user choice of window type
function windowType() {
    Audiodata.windowFunction = document.getElementById("windowType").value;
    processAudio();
}

// get the user choice of overlap
function overlap() {
    Audiodata.overlap = +(document.getElementById("overlap").value);
    processAudio();
}

// get the user choice of display type
function chooseDisplay() {
    Audiodata.display = document.getElementById("display").value;
    processAudio();
    // if this three display types are chosen, disable the colormap and the min and max values and set the right colormap
    if (Audiodata.display == "Phase" || Audiodata.display == "Instantaneous Frequency Deviation" || Audiodata.display == "Group Delay") {
        document.getElementById("colormap").value = "5";
        document.getElementById("colormap").disabled = true;
        document.getElementById("min").disabled = true;
        document.getElementById("max").disabled = true;
        document.getElementById("saveSpec").disabled = true;
        if (Audiodata.display == "Instantaneous Frequency Deviation") {
            document.getElementById("colormap").value = "6";
        }
    } else {
        document.getElementById("colormap").value = "1";
        document.getElementById("colormap").disabled = false;
        document.getElementById("min").disabled = false;
        document.getElementById("max").disabled = false;
    }
}

// get the user choice of colormap
function colormap() {
    SpectroData.TypeColorScale = +(document.getElementById("colormap").value);
    draw();
}

// define the needed global variables for audio signal
var startOffset = 0;
var startTime = 0;
var audPlay;
var isPlaying = false;
var gainNode;
var durationTrack;

// get the user input for play or pause the signal
var playButton = document.getElementById("player");
playButton.addEventListener("click", toggleSound);

// get the user input for stopping the signal
var stopButton = document.getElementById("stop");
var info = document.getElementById("playbackTime");

// save the current gain
document.getElementById('volume').addEventListener('input', function() {
    gainNode.gain.value = this.value;
});

// if user presses "Space", play/pause the file
document.onkeydown = function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 32) {
        toggleSound();
        e.preventDefault();
    }
};

// play, pause and stop the signal
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
        timeUpdate();
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

// show song name after importing it
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

// function for enabling the buttons after loading a file
function enableButton() {
    playButton.disabled = false;
    stopButton.disabled = false;
    document.getElementById("grid").disabled = false;
    document.getElementById("saveSpec").disabled = false;
    document.getElementById("LoopCheck").disabled = false;
    document.getElementById("volume").disabled = false;
    document.getElementById("saveSpec").disabled = false;
}

// values for displaying the spectrum
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
        console.log(min,max)
        if (min < 0 && max < 0 && max > min) {
            SpectroData.specLevelHigh = max;
            SpectroData.specLevelLow = min;
            SpectroData.specLevelWidth = Math.abs(SpectroData.specLevelHigh - SpectroData.specLevelLow);
        } else if (min < 0 && isNaN(max) && SpectroData.specLevelHigh > min) {

            SpectroData.specLevelLow = min;
            SpectroData.specLevelWidth = Math.abs(SpectroData.specLevelHigh - SpectroData.specLevelLow);
        } else if (isNaN(min) && max < 0 && SpectroData.specLevelLow < max) {

            SpectroData.specLevelHigh = max;
            SpectroData.specLevelWidth = Math.abs(SpectroData.specLevelHigh - SpectroData.specLevelLow);
        } else if (min >= 0 || max >= 0 || max < min) {
            alert("Es duerfen nur Werte <= -1 eingetragen werden. Ausserdem muss min Value kleiner sein als max Value ");
        }
        draw();
    }
}

// function to calculate the time in minutes, seconds and miliseconds
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

// function to update the playback time
function timeUpdate() {
    window.requestAnimationFrame(timeUpdate);
    if (isPlaying === false) {
        return
    }

    var currentTime = (audioCtx.currentTime - startTime + startOffset);

    var durationTrack = (Audiodata.signalLen / Audiodata.sampleRate);

    info.innerHTML = timeToString(currentTime, 1, 0) + "&thinsp;/&thinsp;" + timeToString(durationTrack, 1, 0);

    if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
        audioCtx.currentTime = 0;
        startTime = 0;
        startOffset = 0;

        isPlaying = false;
        info.innerHTML = "00:00.0" +
            "&thinsp;/&thinsp;" + timeToString(durationTrack, 1, 0);

        drawLineKlick(0);
        drawLineKlickWave(0);
    } else if (((audioCtx.currentTime - startTime + startOffset) >= SpectroData.endTimeSelection)) {
        audioCtx.currentTime = 0;

        isPlaying = false;
        info.innerHTML = timeToString(currentTime, 1, 0) + "&thinsp;/&thinsp;" + timeToString(durationTrack, 1, 0);
        audPlay.stop();
        if (loopSelection) {
            toggleSound();
        }
    }
    stopButton.onclick = function() {
        startTime = 0;
        startOffset = 0;
        isPlaying = false;
        audPlay.stop();
        info.innerHTML = "00:00.0" +
            "&thinsp;/&thinsp;" + timeToString(durationTrack, 1, 0);
        drawLineKlick(0);
        drawLineKlickWave(0);
    };
    audPlay.onended = function() {
        playButton.innerHTML = "&#9654;";
        if ((audioCtx.currentTime - startTime + startOffset) > Audiodata.signalLen / Audiodata.sampleRate) {
            startTime = 0;
            startOffset = 0;
            isPlaying = false;
            info.innerHTML = "00:00.0" +
                "&thinsp;/&thinsp;" + timeToString(durationTrack, 1, 0);
        }
    };
}

// check the loop selection
var loopSelection = false;
function setLoop() {
    loopSelection = document.getElementById("LoopCheck").checked;
}
