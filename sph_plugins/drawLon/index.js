sph.plugins.drawLon = function (latlon){
    loadSphere(0);
    var xy = latlon2xy(latlon);
    var x = xy[0];
    var height = 1024;


    var oppositeLon = latlon[1] - 180;
    var xy2 = latlon2xy([latlon[0], oppositeLon]);

    var _drawLon = function () {
        var canvas = sph.getcanvas();
        ctx = canvas.getContext('2d');
        ctx.strokeStyle="#20a81c";
        ctx.lineWidth=5;
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,height-1);
        ctx.stroke();
        sph.emitter.emit("drawLon:clickRegion", { region: "lon", lat: latlon[0], lon: latlon[1] });
    };

    var _drawSouthern = function () {
        var canvas = sph.getcanvas();
        ctx = canvas.getContext('2d');
        ctx.strokeStyle="#ce6557";
        ctx.lineWidth=5;
        ctx.beginPath();
        ctx.moveTo(x, height/2);
        ctx.lineTo(x, height);

        ctx.moveTo(xy2[0], height/2);
        ctx.lineTo(xy2[0], height);
        ctx.stroke();

        sph.emitter.emit("drawLon:clickRegion", { region: "southern", lat: latlon[0], lon: latlon[1] });
    };

    var _drawNorthern = function () {
        var canvas = sph.getcanvas();
        ctx = canvas.getContext('2d');
        ctx.strokeStyle="#007fa8";
        ctx.lineWidth=5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height/2);

        ctx.moveTo(xy2[0], 0);
        ctx.lineTo(xy2[0], height/2);
        ctx.stroke();
        sph.emitter.emit("drawLon:clickRegion", { region: "northern", lat: latlon[0], lon: latlon[1] });
    };


    setTimeout(function () {
        var y = xy[1];
        var northernCutoff = 0.3 * height;
        var southernCutoff = 0.7 * height;

        if (y > northernCutoff && y < southernCutoff) {
            _drawLon()
        } else if (y <= northernCutoff) {
            _drawNorthern();
        } else if (y >= southernCutoff) {
            _drawSouthern()
        }

    }, 100);
};
