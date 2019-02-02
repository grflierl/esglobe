var app = angular.module('oceanClimatology', ['ngResource', 'backend.services', 'resources.defaults', 'ui.bootstrap','ngAnimate','ui.toggle']);

app.controller('OceanClimatologyCtrl', function ($scope, $timeout, BackendResource, defaults) {
    $scope.sph = parent.sph;
    $scope.data = {};
    $scope.input = {};

    $scope.data.filePath = "./data/output/";
    $scope.data.timeArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Year', 'Movie'];
    $scope.data.fields = {
        THETA: "Ocean Temperature",
        EVELMASS: "Eastward Velocity",
        NVELMASS: "Northward Velocity"
    };

    $scope.data.depthRegion= {
        FULL: "Full Depth",
        THERMOCLINE: "Thermocline (0-1000m)",
        ABYSS: "Abyss (>1000m)"
    };

    /**
     *  Set the default dropdown values
     */
    $scope.input.field = 'THETA';
    $scope.input.depthRegion = 'FULL';
    $scope.input.time= $scope.data.timeArr[0];
    $scope.input.lon = 0;
    $scope.input.logScale = true;

    /**
     * Subscribe sphere click to get longitude
     */
    $scope.sph.emitter.subscribe('esglobe:sphereClick', function(data) {
        $scope.$apply(() => {
            $scope.input.lon = parseInt(data.latlon[1]);
        });
    });

    $scope.sph.emitter.subscribe("iframeMessage", function(message) {
        $timeout(() => {
            if (message && message.globe && message.globe.time) {
                if ($scope.input.time !== message.globe.time)
                    $scope.input.time = message.globe.time;
            }
        });
    });

    /** Watch inputs **/
    $timeout(() => {
        $scope.setDefaults();
        $scope.submitForm();
        $scope.watchInputs();
    });


    $scope.setDefaults = function (input) {
        var defaultRes = defaults.getDefaultContours(input);
        $scope.input.contourStep = defaultRes.contourStep;
        $scope.input.min = defaultRes.min;
        $scope.input.max = defaultRes.max;
    };

    $scope.watchInputs = function () {
        if (_.isFunction($scope.clearWatchInputs)) {
            $scope.clearWatchInputs();
        }

        $scope.clearWatchInputs = $scope.$watch('input', function (newVal, oldVal) {
            // console.log("===watchcollection main===", newVal, oldVal);
            // do not update if lat lon changes for ESRL
            if(newVal === oldVal || oldVal === undefined  ){
                return;
            }

            if (newVal.field !== oldVal.field) {
                $scope.setDefaults(newVal.field);
            }

            if (!$scope.myForm.$invalid) {
                $scope.clearWatchInputs();
                $scope.submitForm()
            }
        }, true);
    };

    $scope.submitForm = function (timeIdx) {
        $scope.isLoading = true;
        var res = new BackendResource();
        if (timeIdx) {
            res.time = $scope.data.timeDropdown[timeIdx];
            // clear the watcher
            $scope.input.time = $scope.data.timeDropdown[timeIdx];
        } else {
            res.time = $scope.input.time;
        }

        res.action = 'section';
        res.lon = $scope.input.lon || 0;
        res.field = $scope.input.field;
        res.min = -50;
        res.max = 50;
        res.depthRegion = $scope.input.depthRegion;
        res.logScale = $scope.input.logScale ? 'True' : 'False';

        $scope.message({
            section: {
                field: $scope.input.field,
                time: $scope.input.time,
            }
        });

        if ($scope.input.saveData)
            res.saveData = true;

        res.contour = $scope.input.contourStep;
        $scope.isLoading = true;

        return res.$submitForm().then(function (results) {
            $scope.data.filename = results.filename;
            // reinitWatcher
            $scope.watchInputs();
            $scope.message({ sectionLoaded: true });
            $scope.isLoading = false;
            return results;
        });
    };

    $scope.message = function (data) {
        $scope.sph.emitter.emit('iframeMessage', data);
    };
});