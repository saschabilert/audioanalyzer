/*
 * viridis.js
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

var viridisScale;

// write rgb data into colorscale
function createViridis() {
      var rgbR = [70.1250,70.1250,70.1250,70.1250,70.1250,69.6150,69.1050,68.0850,67.0650,66.0450,65.0250,62.9850,60.9450,58.5225,56.1000,52.5300,48.9600,43.9875,39.0150,31.4925,23.9700,11.9850,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,23.4600,46.9200,60.4350,73.9500,84.9150,95.8800,105.4425,115.0050,124.0575,133.1100,141.5250,149.9400,157.9725,166.0050,174.0375,182.0700,189.5925,197.1150,204.5100,211.9050,218.9175,225.9300,232.9425,239.9550,246.4575,252.9600,];

      var rgbG = [2.0400,9.5625,17.0850,22.5675,28.0500,32.5125,36.9750,41.4375,45.9000,49.9800,54.0600,58.0125,61.9650,66.0450,70.1250,73.5675,77.0100,80.9625,84.9150,88.9950,93.0750,96.5175,99.9600,104.0400,108.1200,111.5625,115.0050,118.4475,121.8900,125.4600,129.0300,132.4725,135.9150,139.4850,143.0550,146.4975,149.9400,153.0000,156.0600,158.9925,161.9250,164.9850,168.0450,170.9775,173.9100,176.9700,180.0300,182.4525,184.8750,187.4250,189.9750,192.5250,195.0750,197.4975,199.9200,201.9600,204.0000,206.0400,208.0800,209.9925,211.9050,213.4350,214.9650,216.4950,218.0250,219.5550,221.0850,222.1050,223.1250,224.0175,224.9100,225.9300,226.9500,227.4600,227.9700,227.9700,227.9700,227.4600,226.9500,];

      var rgbB = [78.0300,81.4725,84.9150,87.9750,91.0350,94.4775,97.9200,100.9800,104.0400,107.4825,110.9250,113.9850,117.0450,119.4675,121.8900,124.9500,128.0100,130.0500,132.0900,134.5125,136.9350,138.9750,141.0150,142.5450,144.0750,145.4775,146.8800,148.4100,149.9400,150.9600,151.9800,152.4900,153.0000,153.5100,154.0200,154.0200,154.0200,154.0200,154.0200,153.5100,153.0000,151.9800,150.9600,149.9400,148.9200,147.9000,146.8800,144.9675,143.0550,141.0150,138.9750,136.9350,134.8950,132.4725,130.0500,126.9900,123.9300,120.9975,118.0650,114.4950,110.9250,107.4825,104.0400,100.4700,96.9000,92.9475,88.9950,85.5525,82.1100,78.0300,73.9500,70.5075,67.0650,64.5150,61.9650,59.5425,57.1200,54.0600,51.0000,];

      viridisScale = [rgbR, rgbG, rgbB];
}
