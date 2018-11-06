$(document).ready(function () {
    var sph = parent.sph;
    sph.emitter.subscribe('demoButtonClicked', function(data) {
        $("#widgetMsg").html(data && data.message);
    });

    $('#widgetButton').click(function () {
        sph.emitter.emit("widgetButtonClicked", { message: "Widget button clicked: TOP RIGHT"});
    });



});