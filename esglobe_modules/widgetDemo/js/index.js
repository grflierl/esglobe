$(document).ready(function (){
    const esglobe = new Esglobe();
    var sph = esglobe.getSph();

    $('#demoButton').click(function () {
        sph.emitter.emit("demoButtonClicked", { message: `this is a demo message from the main module ${new Date().getTime()}` });
    });

    sph.emitter.subscribe("widgetButtonClicked", function (data) {
        $("#moduleMsg").html(data && data.message);
    });

    $('#progressBar').change(function () {
        console.log($(this).val());
        sph.emitter.emit("progressBar", { value: $(this).val()});
    });

    $('#loadDataButton').click(function () {
        $.get('/api/widgetDemo', function (data) {
            // console.log("=== data ==", data);
            $('#dataOut').html(JSON.stringify(data));
            sph.reset();
        });
    });

    $('#loadPythonButton').click(function () {
        esglobe.runScript('hello_world.py', { firstName: 'Tony', lastName: 'Stark'}, function(data) {
            $('#dataOut2').html(data.results.message);
            esglobe.show(data.results.image);
        })
    });

    $('#loadResource').click(function () {
        const resource = $('#loadResourceText').val();
        console.log("=== load resource ====", resource);
        esglobe.show(resource);
    });

    esglobe.loadWidget('topLeft');
    esglobe.loadWidget('topRight');
    esglobe.loadWidget('bottomLeft');
    esglobe.loadWidget('bottomRight');

    esglobe.loadForm('example_form', function(data) {
        console.log("=== form result ===", data);
        $('#message').show();
        $('#message').html(data.results.message);
        esglobe.show(data.results.image);
    });
});