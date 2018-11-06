var globeRotateControlsWidget = angular.module('globeRotateControlsWidget', ['ngResource']);

globeRotateControlsWidget.controller('GlobeRotateControlsWidgetCtrl', function ($scope, $timeout) {
    $scope.rotate = false;
    if (parent && parent.sph) {
        $scope.sph = parent.sph;
    }

    $scope.sph.emitter.subscribe("esglobe:mousePressed", function (data) {
        $scope.$apply(() => {
            $scope.rotate = false;
            $scope.sph.rotStop();
        });
    });

    $scope.toggleRotate = function () {
        $scope.rotate = !$scope.rotate;
        if (!$scope.rotate) {
            $scope.sph.rotStop();
        } else {
            $scope.sph.rot(0.004);
        }
    };
});