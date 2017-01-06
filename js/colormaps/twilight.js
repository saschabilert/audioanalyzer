/*
 * twilight.js
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

var twilightScale;
var sunlightScale;

// write rgb data into colorscale
function createTwilight() {
      var rgbR=[243.7510,235.7528,228.0571,220.4665,212.7668,204.8790,196.8328,188.6960,180.5650,172.5476,164.7490,157.2520,150.1121,143.3621,137.0244,131.1130,125.6422,120.6273,116.0833,112.0232,108.4554,105.3819,102.7902,100.6590,98.9549,97.6338,96.6429,95.9237,95.4127,95.0450,94.7571,94.4861,94.1706,93.7490,93.1581,92.3327,91.2031,89.6931,87.7232,85.2195,82.1299,78.4493,74.2313,69.5669,64.5568,59.2900,53.8317,48.2270,42.5012,36.6650,36.9777,43.5439,50.1465,56.7923,63.4869,70.2280,77.0135,83.8325,90.6709,97.5052,104.3036,111.0248,117.6184,124.0333,130.2214,136.1473,141.7913,147.1468,152.2200,157.0202,161.5577,165.8411,169.8768,173.6681,177.2167,180.5235,183.5882,186.4111,188.9940,191.3420,193.4639,195.3774,197.1078,198.6896,200.1674,201.5942,203.0310,204.5416,206.1895,208.0332,210.1227,212.4959,215.1769,218.1685,221.4404,224.9347,228.7649,233.2687,238.3407,243.7510,];

      var rgbG=[234.5007,229.9344,225.3192,220.7200,216.2161,211.8353,207.5571,203.3432,199.1476,194.9267,190.6463,186.2853,181.8348,177.2934,172.6622,167.9435,163.1385,158.2468,153.2671,148.1976,143.0359,137.7795,132.4273,126.9780,121.4314,115.7880,110.0489,104.2157,98.2913,92.2796,86.1861,80.0186,73.7893,67.5172,61.2320,54.9809,48.8360,42.9042,37.3323,32.2957,27.9551,24.3806,21.4976,19.1249,17.0503,15.0872,13.1065,11.0142,8.7958,6.6627,6.7859,9.1646,11.5789,13.7799,15.7846,17.6328,19.3593,21.0094,22.6352,24.3044,26.0982,28.1094,30.4327,33.1456,36.2952,39.8873,43.8924,48.2610,52.9344,57.8611,62.9993,68.3171,73.7911,79.4042,85.1438,90.9992,96.9615,103.0219,109.1706,115.3965,121.6860,128.0227,134.3876,140.7599,147.1171,153.4370,159.6986,165.8842,171.9811,177.9820,183.8855,189.6962,195.4249,201.0905,206.7261,212.3840,218.0636,223.6322,229.0858,234.5007,];

      var rgbB=[244.3209,237.9423,231.9950,226.5918,221.7205,217.3138,213.3494,209.8475,206.8260,204.2728,202.1419,200.3661,198.8738,197.6021,196.5004,195.5263,194.6453,193.8265,193.0411,192.2600,191.4543,190.5938,189.6487,188.5886,187.3837,186.0043,184.4215,182.6056,180.5277,178.1584,175.4655,172.4135,168.9621,165.0649,160.6648,155.7038,150.1162,143.8405,136.8349,129.1061,120.7400,111.9160,102.8705,93.8227,84.9295,76.2830,67.9113,59.8176,51.9753,44.3535,42.9251,47.4255,51.7386,55.8498,59.7395,63.3857,66.7591,69.8267,72.5503,74.8910,76.8113,78.2866,79.3171,79.9298,80.1875,80.1786,80.0035,79.7593,79.5314,79.3892,79.3897,79.5813,80.0071,80.7086,81.7273,83.1038,84.8810,87.1027,89.8121,93.0506,96.8580,101.2619,106.2808,111.9200,118.1691,125.0007,132.3709,140.2232,148.4857,157.0834,165.9400,174.9824,184.1403,193.3502,202.5358,211.5345,219.9962,227.9646,235.9940,244.3209,];

      twilightScale = [rgbR, rgbG, rgbB];

      // flip twilight colorscale
      var rgbRshift = new Array(rgbR.length);
      var rgbGshift = new Array(rgbG.length);
      var rgbBshift = new Array(rgbB.length);

      var halfColorScale = rgbRshift.length / 2;

      for (var i = 0; i < halfColorScale; i++) {
          rgbRshift[i] = rgbR[halfColorScale + i];
          rgbGshift[i] = rgbG[halfColorScale + i];
          rgbBshift[i] = rgbB[halfColorScale + i];
          rgbRshift[i + halfColorScale] = rgbR[i];
          rgbGshift[i + halfColorScale] = rgbG[i];
          rgbBshift[i + halfColorScale] = rgbB[i];
      }
      sunlightScale = [rgbRshift, rgbGshift, rgbBshift];
}
