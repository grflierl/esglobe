var colorBarWidget = angular.module('colorBarWidget', []);
colorBarWidget.controller('ColorBarWidgetController', function ($scope, $timeout) {
    $scope.sph = parent.sph;
    $scope.input = {};
    $scope.sph.emitter.subscribe("iframeMessage", function (data) {
        if (data && data.action === 'loadColorbar') {
            $scope.$apply(() => {
                $scope.input.colorbarSrc = `/esglobe_modules/ocean_climatology/data/output/${data.colorbarFilename}`;
            });
        }
    });
});