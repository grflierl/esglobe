var titleWidget = angular.module('titleWidget', ['ngResource']);

titleWidget.controller('TitleWidgetController', function ($scope, $timeout) {
    $scope.title = "Potential Temperature";
    $scope.sph = parent.sph;

    const dateMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    $scope.sph.emitter.subscribe('iframeMessage', function(data) {
        if (data && data.titleWidget) {
            $scope.$apply(function () {
                $scope.title = data.titleWidget.title;
                $scope.depth = data.titleWidget.depth;
                $scope.timepoint = data.titleWidget.timepoint;
            })
        }

        if (data && typeof data.frame !== 'undefined') {
            $scope.$apply(function () {
                $scope.timepoint = dateMap[data.frame];
            });
        }
    });

    $scope.message = function (data) {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });
    };
});