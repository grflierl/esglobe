var colorBarWidget = angular.module('colorBarWidget', []);
colorBarWidget.controller('ColorBarWidgetController', function ($scope, $timeout) {
    $scope.sph = parent.sph;
    $scope.input = {};
    $scope.sph.emitter.subscribe("iframeMessage", function (data) {
        if (data && data.action === 'loadColorbar') {
            console.log("===colorbar widget===", data);
            $scope.$apply(() => {
                $scope.input.colorbarSrc = `/esglobe/esglobe_modules/climatology/data/output/${data.colorbarFilename}`;
            });
        }
    });
});