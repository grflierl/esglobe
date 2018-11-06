var app = angular.module('app', ['p5globe', 'ui.bootstrap'])
    .config(function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

app.controller('MainCtrl', function ($scope, $rootScope, $log, $window, $timeout, $uibModal, $location, p5globe) {
    $scope.loop = {};
    $scope.input = {};
    $scope.input.delay = 1000;
    $scope.input.loaders = {
        sectionInitialLoad: false,
        globeInitialLoad: false
    };

    $scope.qs = $location.search();
    $scope.sph = sph;

    $scope.loadInitialQueryString = function () {
        // initialize query string options if any exist
        $timeout(function () {
            if ($scope.qs && $scope.qs.field) {
                $scope.messageGlobeControlsWidget({
                    field: $scope.qs.field1,
                    level: parseInt($scope.qs.level),
                    time: $scope.qs.time
                });
                $scope.message({
                    field: $scope.qs.field,
                    field2: $scope.qs.field2,
                    time: $scope.qs.time,
                    pressRange: $scope.qs.press,
                    lon: $scope.qs.lon
                });
            }

            $scope.$watch('qs', function(newVal, oldVal) {
                $location.search(newVal);
            }, true);

        }, 1000);
    };

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("esrl2").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.messageTitleWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("title-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }

    };

    $scope.messageGlobeControlsWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("globe-controls-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.messageGlobeColorBarWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("globe-colorbar-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.timeoutLoop = function (filename) {
        $scope.input.movieLoop = setTimeout(function() {
            if (!$scope.pause) {
                $scope.getFrame(filename, $scope.loop.i);
                $scope.loop.i++;
            }

            if ($scope.loop.i === 12)
                $scope.loop.i = 0;

            if (!$scope.pause)
                $scope.timeoutLoop(filename);
            else {
                clearTimeout($scope.input.movieLoop);
            }
        }, $scope.input.delay);
    };

    $scope.showGlobeImage = function (filename) {
        p5globe.sph.show(filename, "/graphics");
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        p5globe.sph.show(filename_frame);
        $timeout(function () {
            $scope.messageGlobeControlsWidget({ frame: frame+1 });
        });
    };


    $scope.openLightboxModal = function (input, filename) {
        console.log("===openLightboxModal ", {input, filename });
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'lightboxModal.html',
            controller: 'LightboxModalCtrl',
            controllerAs: 'ctrl',
            size: "lg",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                filename: function () {
                    return filename;
                }
            }
        });

        modalInstance.result.then(function () {
            $ctrl.selected = selectedItem;
        });
    };

    /*---------------------------------
    ----------- WATCHES ---------------
    ----------------------------------*/
    $rootScope.$on('latlon', function(event, data) {
        $scope.qs.lon = null;
        $timeout(() => {
            $scope.qs.lon = Math.round(data.latlon[1], 1);
        });

        $scope.message({ latlon: data});
    });

    $scope.$watch(function () {
        return $scope.input.loaders.sectionInitialLoad && $scope.input.loaders.globeInitialLoad;
    }, function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
            $scope.loadInitialQueryString();
        }
    });

    $scope.sph.emitter.subscribe('iframeMessage', function(newVal) {
        console.log("==main.js subscribe==", newVal);
        if (newVal && newVal.form === 'esrl' && newVal.filename) {
            $scope.$apply(function() {
                $scope.messageGlobeColorBarWidget({ colorbarFilename: newVal.colorbarFilename });

                // if it's a movie
                if(newVal.movie) {
                    var filename = newVal.filename.split("-")[0];
                    $scope.input.filename = filename;
                    $scope.loop.i = 0;
                    $scope.pause = false;
                    clearTimeout($scope.input && $scope.input.movieLoop);
                    $scope.timeoutLoop(filename, $scope.input.delay)
                } else {
                    // updates from globe-controls
                    if (newVal.time) {
                        // sync the time w/ section plot
                        $scope.message({ time: newVal.time });
                    }

                    if (newVal.field) {
                        // sync the time w/ section plot
                        $scope.message({ field: newVal.field });
                    }

                    if (newVal.press) {
                        $scope.message( { press: newVal.press });
                    }

                    $scope.sph.show(newVal.filename);
                    if (!newVal.bypassOrient)
                        $scope.sph.orient(newVal.lat, newVal.lon);
                }
            })

        }
    });

    /**
     * Replace this watch with a subscription
     */
    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal && newVal.form === 'esrl' && newVal.filename) {
            $scope.messageGlobeColorBarWidget({ colorbarFilename: newVal.colorbarFilename });

            // if it's a movie
            if(newVal.movie) {
                var filename = newVal.filename.split("-")[0];
                $scope.input.filename = filename;
                $scope.loop.i = 0;
                $scope.pause = false;
                clearTimeout($scope.input && $scope.input.movieLoop);
                $scope.timeoutLoop(filename, $scope.input.delay)
            } else {
                // updates from globe-controls
                if (newVal.time) {
                    // sync the time w/ section plot
                    $scope.message({ time: newVal.time });
                }

                if (newVal.field) {
                    // sync the time w/ section plot
                    $scope.message({ field: newVal.field });
                }

                if (newVal.press) {
                    $scope.message( { press: newVal.press });
                }

                p5globe.sph.show(newVal.filename);
                if (!newVal.bypassOrient)
                    p5globe.sph.orient(newVal.lat, newVal.lon);
            }
        }

        if (newVal && newVal.titleWidget) {
            $scope.messageTitleWidget(newVal.titleWidget);
        }

    });
});

app.controller("LightboxModalCtrl", function ($uibModalInstance, input, filename) {
    console.log("=== LightboxModalCtrl input ==", input, filename);
    this.filename = filename;
    this.input = input;
});
