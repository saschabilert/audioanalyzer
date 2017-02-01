Audioanalyzer
=============

## General

The Audioanalyzer is a website to analyze different audio files in various formats. It is the result of an university project. The FFT used for tranformation is made by [Project Nayuki](https://www.nayuki.io/page/free-small-fft-in-multiple-languages).

The intension of the project was to build an environment where everybody can easily and fast analyze audio signals. The code for [Audioanalyzer](http://audioanalyzer.net/) is licensed under the GNU General Public License Copyright (C) 2016  Moritz Balters, Sascha Bilert, Vlad-Stefan Paul IHA @ Jade Hochschule applied licence see EOF.

<p align="center">
<img src="/image/icon.png" width="30%" height="30%">
</p>

## Usage

If you want to checkout the project or analyze audio files locally you can copy the following lines:

```bash
git clone https://github.com/saschabilert/audioanalyzer.git
cd audioanalyzer
```
Open the local `index.html` file in a web-browser like Firefox or Chrome to use the Audioanalyzer.

## About

The Audioanalyzer is a web app to display different audio signal features and controll the signal by using the select and playback function.

You can zoom into the displayed spectrogram and click to navigate to a desired playback position (marked by a red bar). You have several parameters i.e. windows, block length or overlap. For more details you can open the `instructions.html` file.

<p align="center">
<img src="/image/screenshot.png" width="80%" height="80%">
</p>

Here are some important files of the project:

`fft.js` contains the FFT implementation in JS from Project Nayuki.

`audioprocessing.js` decodes the audio data and contains all the calculations based on the linear amplitudes i.e. magnitude spectrogram and groupdelay.

`spectrogram.js` receives all the calculated data from `audioprocessing.js`, maps the data and applies different colormaps.

`waveform.js` contains all the calculations for the waveform i.e. amplitude and RMS.

`index.html` contains the basic website used to display the website

## Browser

The website is optimized for the following web-browsers:

1. Google Chrome (Ver. 55.0)
2. Firefox (Ver. 50.1.0)

## News

Version: 1.0 (Moritz Balters, Sascha Bilert, Vlad Paul)
