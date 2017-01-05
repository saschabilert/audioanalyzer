/*
 * plot.js
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
function plotWindow() {

    var windowLen = linspace(0, 1024, 1024);

    var windowValueHann = calculateWindow(windowLen, "hann");
    var data = [
        {
            x: windowLen,
            y: windowValueHann,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Hann Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divHann', data, layout, {showLink: false});

    var windowValueRect = calculateWindow(windowLen, "rect");
    var [realRect,
        imagRect] = calculateFFT(windowValueRect);
    var spectrumRect = calculateAbs(realRect, imagRect);

    windowValueRect.fill(0, 0, 81);
    windowValueRect.fill(0, 942, 1024);
    var trace1 = {
        x: windowLen,
        y: windowValueRect,
        type: 'bar'
    };
    var trace2 = {
        x: windowLen,
        y: spectrumRect,
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'bar'
    };
    var data = [trace1, trace2];
    var layout = {
        title: 'Rect Window',
        xaxis: {
            domain: [
                0, 0.45
            ],
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis2: {
            title: 'value',
            anchor: 'x2',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        xaxis2: {
            domain: [0.55, 1]
        }
    };
    Plotly.newPlot('divRect', data, layout);

    var windowValueHannPoisson = calculateWindow(windowLen, "hannpoisson");
    var data = [
        {
            x: windowLen,
            y: windowValueHannPoisson,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Hann-Poisson Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divHannPoisson', data, layout);

    var windowValueCosine = calculateWindow(windowLen, "cosine");
    var data = [
        {
            x: windowLen,
            y: windowValueCosine,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Cosine Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divCosine', data, layout);

    var windowValueFlatTop = calculateWindow(windowLen, "flat-top");
    var data = [
        {
            x: windowLen,
            y: windowValueFlatTop,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Flat-Top Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divFlatTop', data, layout);

    var windowValueHamming = calculateWindow(windowLen, "hamming");
    var data = [
        {
            x: windowLen,
            y: windowValueHamming,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Hamming Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divHamming', data, layout);

    var windowValueBlackman = calculateWindow(windowLen, "blackman");
    var data = [
        {
            x: windowLen,
            y: windowValueBlackman,
            type: 'bar'
        }
    ];
    var layout = {
        title: 'Blackman Window',
        xaxis: {
            title: 'samples [n]',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        },
        yaxis: {
            title: 'value',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 14,
                color: 'black'
            }
        }
    };
    Plotly.newPlot('divBlackman', data, layout);
}
