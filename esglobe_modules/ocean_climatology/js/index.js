$(document).ready(function () {
    const esglobe = new Esglobe();

    esglobe.loadWidget('titleWidget', { position: 'top', col: 6 });
    esglobe.loadWidget('colorBarWidget', {
        position: 'bottom',
        col: 2,
        height: 285,
        width: 100
    });

    esglobe.loadWidget('globeControlsWidget', { position: 'bottom', col: 8, height: 60 });

    esglobe.loadWidget('globeRotateControlsWidget', { position: 'top', col: 6 });
});