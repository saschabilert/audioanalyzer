// check if AudioContext is supported be the current browser
if (!window.AudioContext) {
    if (!window.webkitAudioContex) {
        alert("no audiocontext found");
    }
    window.AudioContext = window.webkitAudioContext;
}

function loadAudio() {
    var audioCtx = new AudioContext();
    var voiceSelect = document.getElementById("myAudio");
    var source;
    var stream;

    // grab the mute button to use below

    var mute = document.querySelector('.mute');

    //set up the different audio nodes we will use for the app

    var analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    var distortion = audioCtx.createWaveShaper();
    var gainNode = audioCtx.createGain();
    var biquadFilter = audioCtx.createBiquadFilter();
    var convolver = audioCtx.createConvolver();

    // distortion curve for the waveshaper, thanks to Kevin Ennis
    // http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

    function makeDistortionCurve(amount) {
        var k = typeof amount === 'number' ? amount : 50,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    // grab audio track via XHR for convolver node

    var soundSource, concertHallBuffer;

    ajaxRequest = new XMLHttpRequest();

    ajaxRequest.open('GET', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', true);

    ajaxRequest.responseType = 'arraybuffer';


    ajaxRequest.onload = function() {
        var audioData = ajaxRequest.response;

        audioCtx.decodeAudioData(audioData, function(buffer) {
            concertHallBuffer = buffer;
            soundSource = audioCtx.createBufferSource();
            soundSource.buffer = concertHallBuffer;
        }, function(e) {
            "Error with decoding audio data" + e.err
        });

        soundSource.connect(audioCtx.destination);
        soundSource.loop = true;
        soundSource.start();
    };

    ajaxRequest.send();
}
