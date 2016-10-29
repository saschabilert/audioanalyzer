function drawSpec() {

    var cWidth = 2060;
    var cHigh = 1025;

    var specData = Audiodata.spectrogram;
    draw();

    function draw() {
        var canvas = document.getElementById("canvasSpec");
        var ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, cWidth, cHigh);
        ctx.scale(specData.length / cWidth, specData[1].length / cHigh);

        for (var i = 1; i < specData.length; i++) {

            for (var j = 1; j < specData[1].length; j++) {
                point = 20 * Math.log10(specData[i][j] / 2048);
                point += 80;
                point = Math.max(point, 0);
                point /= 80;
                point *= 255;
                point = Math.floor(point);

                ctx.fillStyle = 'rgb(' + point + ',' + point + ',' +
                    point + ')';
                ctx.fillRect(cWidth - i, specData[1].length - j, 1, 1);

            }

        }



        function writeMessage(canvas, message) {
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, 400, 30);

            context.font = '18pt Calibri';
            context.fillStyle = 'white';
            context.fillText(message, 10, 25);
        }

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: Math.floor(evt.clientX - rect.left),
                y: Math.floor(evt.clientY - rect.top)
            };
        }
    }
    var canvasDraw = document.getElementById('canvasDraw');
    var context = canvasDraw.getContext('2d');
    var drawRect = 0;
    var coordStartDraw;
    var coordStoppDraw;

    //  canvasDraw.addEventListener("wheel", MouseWheelHandler,false)
}
