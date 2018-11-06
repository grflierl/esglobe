$(document).ready(function () {
    var sph = parent.sph;
    sph.emitter.subscribe('demoButtonClicked', function(data) {
        $("#widgetMsg").html(data && data.message);
    });

    sph.emitter.subscribe('progressBar', function (data) {
        $("#progressBar").css({
            width: `${data.value}%`
        });
    });

    $('#widgetButton').click(function () {
        sph.emitter.emit("widgetButtonClicked", { message: "Widget button clicked: BOTTOM LEFT"});
    });

});