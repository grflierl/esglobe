var globeControlsWidget = angular.module('globeControlsWidget', ['ngResource', 'backend.services', 'resources.defaults']);

globeControlsWidget.controller('GlobeControlsWidgetController', function ($scope, $timeout, BackendResource, defaults) {
    $scope.title = "Ocean Temperature";
    $scope.input = {
        delay: 1000
    };

    $scope.loop = {};

    if (parent && parent.sph) {
        $scope.sph = parent.sph;
    }
    $scope.data = {};
    $scope.data.fields = {
        THETA: "Ocean Temperature",
        EVELMASS: "Eastward Velocity",
        NVELMASS: "Northward Velocity",
        oceTAUE: "Eastward surface wind stress",
        oceTAUN: "Northward surface wind stress"
    };

    $scope.data.timeDropdown = [
        "Movie",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Year"
    ];


    $scope.data.depths = [5.0, 15.0, 25.0, 35.0, 45.0, 55.0, 65.0, 75.0, 85.0, 95.1, 105.3, 115.9, 127.2, 139.7, 154.5, 172.4, 194.7, 222.7, 257.5, 299.9, 350.7, 409.9, 477.5, 552.7, 634.7, 722.4, 814.5, 909.7, 1007.2, 1105.9, 1205.5, 1306.2, 1409.2, 1517.1, 1634.2, 1765.1, 1914.2, 2084.0, 2276.2, 2491.3, 2729.3, 2990.3, 3274.3, 3581.3, 3911.3, 4264.3, 4640.3, 5039.3, 5461.3, 5906.3];

    $scope.esrl = {};
    $scope.input = {};
    $scope.flags = {};

    $scope.input.time = "Jan";
    $scope.input.field = 'THETA';
    $scope.input.lat = 30;
    $scope.input.lon = 0;
    $scope.input.contour = true;
    $scope.input.depth = $scope.data.depths[0];

    $scope.flags.delay = "1";
    $scope.esrlInputWatchCount = 0;

    // Functions to execute on load
    $timeout(function () {
        $scope.setDefaults($scope.input.field);
        $scope.setDelay();
        /*------ Watches ----*/
        $scope.watchCollection = $scope.setWatchInputs();
    });

    $scope.setWatchInputs = function () {
        return $scope.$watchCollection('input', function (newVal, oldVal) {
            if (!oldVal)
                return;

            // do not update if lat lon changes for ESRL
            if (newVal.latlon !== oldVal.latlon) {
                // do nothing
                $timeout(() => {
                    if ($scope.input.latlon && _.isFunction($scope.sph.plugins.drawLon)) {
                        $scope.sph.plugins.drawLon($scope.input.latlon);
                    }
                }, 100);
            } else {
                if (oldVal.field !== newVal.field || oldVal.depth !== newVal.depth) {
                    $scope.flags.bypassSphReset = false;
                    $scope.setDefaults(newVal.field);
                }

                if (oldVal.time !== newVal.time) {
                    // do nothing; if we are changing the time, don't reset the sphere. Otherwise, reset it
                    // because there might be transparency issues.
                } else if (!$scope.flags.bypassSphReset) {
                    $scope.sph.reset();
                }

                if (!$scope.esrlForm.$invalid) {
                    if ($scope.esrlInputWatchCount === 0) {
                        $scope.esrlInputWatchCount++;
                        $scope.submitForm().then(function () {
                            $scope.esrlInputWatchCount--;
                        });

                    }
                }
            }
        });
    };

    $scope.setDefaults = function (input) {
        var defaultRes = defaults.getDefaultContours(input, $scope.input.depth);
        console.log("==default Res==", defaultRes, input);
        $scope.input.contourStep = defaultRes.contourStep;
        $scope.input.min = defaultRes.min;
        $scope.input.max = defaultRes.max;
    };

    $scope.submitForm = function (timeIdx) {
        var res = new BackendResource();

        if (timeIdx) {
            res.time = $scope.data.timeDropdown[timeIdx];

            // clear the watcher
            $scope.watchCollection();
            $scope.input.time = $scope.data.timeDropdown[timeIdx];
        } else {
            res.time = $scope.input.time;
        }

        res.action = 'globe';
        res.depth = $scope.data.depths.indexOf($scope.input.depth);
        res.lat= $scope.input.lat;
        res.field2 = "none";
        res.field = $scope.input.field;
        res.min = $scope.input.min;
        res.max = $scope.input.max;
        res.contourStep = $scope.input.contourStep;

        if ($scope.input.saveData)
            res.saveData = true;

        res.contour = true;
        $scope.isLoading = true;

        $scope.message({
            titleWidget: {
                title: $scope.data.fields[res.field],
                depth: $scope.input.depth,
                timepoint: res.time
            }
        });

        // updates from globe-controls
        if (res.time) {
            // sync the time w/ section plot
            $scope.message({
                globe: {
                    time: res.time,
                }
            });
        }

        return res.$submitForm().then(function (results) {
            results.bypassOrient = true;
            if ($scope.input.time === "Movie") {
                results.movie = true;
                $scope.flags.movie = true;
            }
            results.depth = $scope.input.depth;
            $scope._updateGlobe(results);

            $scope.isLoading = false;
            $scope.message({ action: "loadColorbar", colorbarFilename: results.colorbarFilename});
            $scope.message({ action: "globeDoneLoading" });

            if (timeIdx) {
                // re-enable watchers
                $scope.watchCollection = $scope.setWatchInputs();
            }

            delete $scope.input.saveData;
            return results;
        });
    };

    $scope.playMovie = function () {
        $scope.flags.movie = true;
        $scope.flags.pause = false;
        $scope.flags.sectionLoaded = true;
        $scope.playMovieLoop();
    };

    $scope.playMovieLoop = function () {
        $scope.flags.movieLoop = setTimeout(function () {
            if ($scope.flags.sectionLoaded) {
                console.log("==section loaded===");
                $scope.flags.sectionLoaded = false;
                $scope.stepForward()
                    .then(() => {
                        if (!$scope.flags.pause) {
                            $scope.playMovieLoop();
                        } else {
                            clearTimeout($scope.flags.movieLoop);
                        }
                    });
            } else {
                // go to next loop
                console.log("==WAITING FOR SECTION LOAD===");
                if (!$scope.flags.pause) {
                    $scope.playMovieLoop();
                } else {
                    console.log("==pause movie clear timeout===");
                    clearTimeout($scope.flags.movieLoop);
                }
            }

        }, $scope.input.delay);
    };

    $scope.pauseMovie = function () {
        $scope.flags.movie = false;
        $scope.flags.pause = true;
    };

    $scope.globeSetup = function () {
        $scope.message({
            globeInput: $scope.input
        })
    };

    $scope.downloadFile = function (filename, type) {
        //Initialize file format you want csv or xls
        var uri = `/esrl/output/${filename}.zip`;

        console.log("===globe download file ===", uri);

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";

        var field = $scope.input.field;
        var time = $scope.input.time;
        var depth = $scope.input.depth;
        link.download = `globeData-${field}-${time}-depth${depth}.zip`; //this is an example file to download, use yours

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    $scope._updateGlobe = function(newVal) {
        // if it's a movie
        $scope.sph.show(newVal.filename, '/esglobe_modules/ocean_climatology/data/output');
        if (!newVal.bypassOrient)
            $scope.sph.orient(newVal.lat, newVal.lon);

        $timeout(() => {
            if ($scope.input.latlon && _.isFunction($scope.sph.plugins.drawLon)) {
                $scope.sph.plugins.drawLon($scope.input.latlon);
            }
        }, 100);
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        $scope.sph.show(filename_frame, '/esglobe_modules/ocean_climatology/data/output');
    };

    $scope.stepBack = function () {
        if ($scope.flags.movie) {
            $scope.loop.i--;
            if ($scope.loop.i < 0)
                $scope.loop.i = 11;
            $scope.getFrame($scope.input.filename, $scope.loop.i);
        } else {
            var idx = $scope.data.timeDropdown.indexOf($scope.input.time);
            idx--;
            if (idx < 1)
                idx = $scope.data.timeDropdown.length - 1;
            $scope.input.time = $scope.data.timeDropdown[idx];
        }

    };

    $scope.stepForward = function () {
        var idx = $scope.data.timeDropdown.indexOf($scope.input.time);
        idx++;
        if (idx > $scope.data.timeDropdown.length - 2)
            idx = 1;

        $scope.flags.bypassSphReset = true;

        return $scope.submitForm(idx);
    };

    $scope.setDelay = function () {
        $scope.input.delay = 1 / $scope.flags.delay * 1000;
    };

    $scope.downloadFile = function (filename, type) {
        //Initialize file format you want csv or xls
        var uri = `/esrl/output/${filename}.zip`;

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";

        var field = $scope.input.field;
        var time = $scope.input.time;
        var depth = $scope.input.depth;
        link.download = `globeData-${field}-${time}-depth${depth}.zip`; //this is an example file to download, use yours

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    $scope.sph.emitter.subscribe('esglobe:sphereClick', function(data) {
        $scope.$apply(() => {
            $scope.input.latlon = [data.latlon[0], data.latlon[1]];
            $scope.flags.movie = false;
            $scope.flags.pause = true;
        });
    });

    $scope.sph.emitter.subscribe("iframeMessage", function(message) {
        $timeout(() => {
            if (message && message.downloadData) {
                $scope.input.saveData = true;
                $scope.submitForm()
                    .then(function (results) {
                        $scope.downloadFile(results.base_filename)
                    });
            }

            if (message && message.action === 'sectionDownloadGlobeData') {
                $scope.input.saveData = true;
                $scope.submitForm()
                    .then(function (results) {
                        $scope.downloadFile(results.base_filename)
                    })
            }

            if (message && message.section && message.section.time) {
                $scope.input.time = message.section.time;
            }

            if (message && message.section && message.section.field) {
                $scope.input.field = message.section.field;
            }

            if (message && typeof message.lon !== 'undefined') {
                var latlon = $scope.sph.getCurrentLatLon();
                $scope.sph.plugins.drawLon([latlon[0], message.lon]);
                /*$scope.input.latlon = [latlon[0], message.lon];*/
            }

            if (message && message.showLon && message.latlon) {
                $scope.input.showLon = message.latlon;
            }

            if (message && message.sectionLoaded) {
                $scope.flags.sectionLoaded = message.sectionLoaded;
            }
        });

    });

    $scope.message = function (data) {
        $scope.sph.emitter.emit('iframeMessage', data);
    };

    $scope.openLightboxModal = function (filename) {
        $scope.message({ action: "lightboxModal", input: $scope.section.input, filename: filename });
    };
});