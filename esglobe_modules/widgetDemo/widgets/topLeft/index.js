$(document).ready(function () {
    var sph = parent.sph;
    if (sph) {
        sph.emitter.subscribe('demoButtonClicked', function(data) {
            $("#widgetMsg").html(data && data.message);
        });
    }

    $('#widgetButton1').click(function () {
        console.log("==widget clicked==");
        sph.emitter.emit("widgetButtonClicked", { message: "Widget button clicked: TOP LEFT"});
    });
});