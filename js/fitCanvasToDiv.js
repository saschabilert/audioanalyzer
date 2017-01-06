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
 * contact: sascha.bilert@student.jade-hs.de
 */

 function fitCanvas(){
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

   var divSpecWidth = divSpec.offsetWidth;
   var divWaveWidth = divWave.offsetWidth;


   canvasSpec.width=divSpecWidth-SpectroData.scaleOfsetLeft;
   canvasSpecLine.width=divSpecWidth-SpectroData.scaleOfsetLeft;
   canvasSpecScale.width=divSpecWidth;
   canvasWave.width=divWaveWidth-offSetLeft;
   canvasWaveLine.width=divWaveWidth-offSetLeft;
   canvasRMS.width=divWaveWidth-offSetLeft;
   canvasSelect.width=divWaveWidth-offSetLeft;
   canvasWaveScale.width=divWaveWidth;
   canvasWaveGrid.width=divWaveWidth-offSetLeft;
   
 }
