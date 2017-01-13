/*
 * fitCanvasToDiv.js
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

function fitCanvas() {
    var offsetButtons = 25;
    var canvasSpec = document.getElementById("canvasSpec")
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var canvasSpecScale = document.getElementById('canvasSpecScale');
    var divSpec = document.getElementById("canvasDivSpec")
    var divWave = document.getElementById("canvasDivWave")
    var canvasWave = document.getElementById("canvasWave");
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvasRMS = document.getElementById("canvasRMS");
    var canvasSelect = document.getElementById("canvasSelect");
    var canvasWaveScale = document.getElementById("canvasWaveScale");
    var canvasWaveGrid = document.getElementById("canvasWaveGrid");

    var divSpecWidth = divSpec.offsetWidth - offsetButtons;
    var divWaveWidth = divWave.offsetWidth - 3 - offsetButtons;
    console.log(divWaveWidth)
    canvasSpec.width = divSpecWidth - SpectroData.scaleOfsetLeft;
    canvasSpecLine.width = divSpecWidth - SpectroData.scaleOfsetLeft;
    canvasSpecScale.width = divSpecWidth;
    canvasWave.width = divWaveWidth - offSetLeft - 20;
    canvasWaveLine.width = divWaveWidth - offSetLeft - 20;
    canvasRMS.width = divWaveWidth - offSetLeft - 20;
    canvasSelect.width = divWaveWidth - offSetLeft - 20;
    canvasWaveScale.width = divWaveWidth;
    canvasWaveGrid.width = divWaveWidth - offSetLeft - 20;

}

function resizeCanvas() {
    var offsetButtons = 25;
    var canvasSpec = document.getElementById("canvasSpec")
    var canvasSpecLine = document.getElementById("canvasSpecLine")
    var canvasSpecScale = document.getElementById('canvasSpecScale');
    var ctx = canvasSpec.getContext('2d')
    var divSpec = document.getElementById("canvasDivSpec")
    var divWave = document.getElementById("canvasDivWave")
    var canvasWave = document.getElementById("canvasWave");
    var ctxWave = canvasWave.getContext('2d')
    var canvasWaveLine = document.getElementById("canvasWaveLine");
    var canvasRMS = document.getElementById("canvasRMS");
    var ctxRMS = canvasRMS.getContext('2d')
    var canvasSelect = document.getElementById("canvasSelect");
    var canvasWaveScale = document.getElementById("canvasWaveScale");
    var canvasWaveGrid = document.getElementById("canvasWaveGrid");

    var divSpecWidth = divSpec.offsetWidth - offsetButtons;
    var divWaveWidth = divWave.offsetWidth - offsetButtons;

    if (canvasSpec.width <= divSpecWidth) {
        canvasSpec.width = divSpecWidth - SpectroData.scaleOfsetLeft;
        canvasSpecLine.width = divSpecWidth - SpectroData.scaleOfsetLeft;
        canvasSpecScale.width = divSpecWidth - 3;
        if (typeof(viridisScale) != "undefined") {
            ctx.scale(canvasSpec.width / SpectroData.specWidth, canvasSpec.height / SpectroData.specHight);
            SpectroData.scaleFactorWidth = canvasSpec.width / SpectroData.specWidth;
            ctx.clearRect(0, 0, canvasSpec.width, canvasSpec.height);
            ctx.drawImage(tempCanvas, 0, 0);
            drawScale()
            section = getSectionDisplayed()
            drawSelection(section.min, 2, section.max);
        }
    }

    canvasWave.width = divWaveWidth - offSetLeft;
    canvasWaveLine.width = divWaveWidth - offSetLeft;
    canvasRMS.width = divWaveWidth - offSetLeft;
    canvasSelect.width = divWaveWidth - offSetLeft;
    canvasWaveScale.width = divWaveWidth;
    canvasWaveGrid.width = divWaveWidth - offSetLeft;
    if (typeof(viridisScale) != "undefined") {
        ctxRMS.setTransform(1, 0, 0, 1, 0, 0);
        ctxWave.setTransform(1, 0, 0, 1, 0, 0);
        ctxRMS.clearRect(0, 0, canvasWave.width, canvasWave.height);
        ctxWave.clearRect(0, 0, canvasWave.width, canvasWave.height);
        ctxRMS.scale(canvasWave.width / tempWaveCanvas.width, canvasWave.height / tempWaveCanvas.height);
        ctxWave.scale(canvasWave.width / tempWaveCanvas.width, canvasWave.height / tempWaveCanvas.height);
        WaveData.scaleX = canvasWave.width / tempWaveCanvas.width
        ctxRMS.drawImage(tempRMSCanvas, 0, 0);
        ctxWave.drawImage(tempWaveCanvas, 0, 0);
        drawWaveTimeAxes()
        drawWaveGrid();
        section = getSectionDisplayed()
        drawSelection(section.min, 2, section.max);
    }
}
