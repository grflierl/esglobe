var globeControlsWidget = angular.module('globeControlsWidget', ['ngResource', 'app-esrl.services', 'app-esrl.defaults']);

globeControlsWidget.controller('GlobeControlsWidgetController', function ($scope, $timeout, EsrlResource, defaults) {
    $scope.title = "Potential Temperature";
    $scope.input = {
        delay: 1000
    };
    $scope.loop = {};

    if (parent && parent.sph) {
        $scope.sph = parent.sph;
    }
    $scope.data = {};
    $scope.data.fields = {
        pottmp: "Potential Temperature",
        hgt: "Geopotential Height",
        uwnd: "U-wind",
        vwnd: "V-wind",
        omega: "Omega",
        air: "Air Temperature",
        shum: "Specific Humidity",
        rhum: "Relative Humidity",
        wspd: "Wind Speed"
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

    $scope.data.levels = [1000, 925, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30, 20, 10];

    $scope.esrl = {};
    $scope.esrl.input = {};
    $scope.esrl.flags = {};
    $scope.esrl.flags.moviePlay = true;

    $scope.esrl.input.time = "Jan";
    $scope.esrl.input.press = "1000";
    $scope.esrl.input.field = 'pottmp';
    $scope.esrl.input.lat = 30;
    $scope.esrl.input.lon = 0;
    $scope.esrl.input.contour = true;
    $scope.esrl.input.press = $scope.data.levels[0];

    $scope.esrl.flags.delay = "1";
    $scope.esrl.flags.showNow = true;



    $scope.esrlInputWatchCount = 0;

    // Functions to execute on load
    $timeout(function () {
        console.log("===globeControl 001 ===");
        $scope.setDefaults($scope.esrl.input.field);
        console.log("===globeControl 002 ===");
        /!*------ Watches ----*!/
        $scope.$watchCollection('esrl.input', function (newVal, oldVal) {
            if (!oldVal)
                return;
            if ($scope.esrl.flags.showNow) {
                console.log("===globeControl 003 ===");
                // trigger a refresh
                // restart movie if false;
                $scope.esrl.flags.movie = false;
                $scope.esrl.flags.moviePlay = true;

                // pause the main view
                $scope.message({
                    action: 'pause'
                });

                console.log("===globeControl 004 ===");

                // do not update if lat lon changes for ESRL
                if (newVal.lat !== oldVal.lat || newVal.lon !== oldVal.lon) {
                    // do nothing
                } else {
                    if (oldVal.field !== newVal.field || oldVal.press !== newVal.press) {
                        console.log("===globeControl 005 ===");
                        $scope.setDefaults(newVal.field);
                        console.log("===globeControl 006 ===");
                    }

                    if (!$scope.esrlForm.$invalid) {
                        console.log("===globeControl 007 ===");
                        if ($scope.esrlInputWatchCount === 0) {
                            $scope.esrlInputWatchCount++;
                            $scope.submitEsrlForm().then(function () {
                                console.log("===globeControl 008 ===");
                                $scope.esrlInputWatchCount--;
                            });
                        }
                    }

                }
            }
        });
    });

    $scope.esrl.submit = function () {
        console.log("===00 submitEsrlForm===");
        $scope.esrl.flags.showNow = false;
        $scope.submitEsrlForm()
            .then(function () {
                $scope.esrl.flags.showNow = true;
            });

    };

    $scope.setDefaults = function (input) {
        // console.log("=== 001 esrl set defaults ==", { input: input });
        var defaultRes = defaults.getEsrlDefaultsByLevel(input, $scope.esrl.input.press);
        $scope.esrl.input.contourStep = defaultRes.contour;
        $scope.esrl.input.min = defaultRes.min;
        $scope.esrl.input.max = defaultRes.max;
    };

    $scope.submitEsrlForm = function () {
        var res = new EsrlResource();

        console.log("===submitEsrlForm===");
        res.time = $scope.esrl.input.time;
        res.press = $scope.esrl.input.press;
        res.field = $scope.esrl.input.field;
        res.lat= $scope.esrl.input.lat;
        res.lon = $scope.esrl.input.lon || 0;
        res.field2 = "none";
        res.flatr = "0, 90";
        res.flon = "zonal av";
        res.fpress = "1000, 200";
        res.model = "clim2.py";
        res.action = "esrl";
        res.min = $scope.esrl.input.min;
        res.max = $scope.esrl.input.max;
        res.pressureRange = $scope.esrl.input.pressRange || 100;
        if ($scope.esrl.input.saveData)
            res.saveData = true;

        res.contour = true;
        res.contourStep = $scope.esrl.input.contourStep;

        res.action = "esrl";
        $scope.isLoading = true;

        $scope.message({
            titleWidget: {
                title: $scope.data.fields[res.field],
                level: res.press,
                timepoint: res.time
            }
        });

        return res.$submitForm().then(function (results) {
            if ($scope.esrl.flags.showNow)
                results.bypassOrient = true;

            if ($scope.esrl.input.time === "Movie") {
                results.movie = true;
                $scope.esrl.flags.movie = true;
                $scope.esrl.flags.moviePlay = true;
            }
            results.press = $scope.esrl.input.press;

            $scope._updateGlobe(results);

            $scope.isLoading = false;
            $scope.message({ action: "loadColorbar", colorbarFilename: results.colorbarFilename});
            $scope.message({ action: "globeDoneLoading" });

            delete $scope.esrl.input.saveData;

            return results;
        });

    };

    $scope.globeSetup = function () {
        $scope.message({
            globeInput: $scope.esrl.input
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

        var field = $scope.esrl.input.field;
        var time = $scope.esrl.input.time;
        var level = $scope.esrl.input.press;
        link.download = `globeData-${field}-${time}-level${level}.zip`; //this is an example file to download, use yours

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    $scope._updateGlobe = function(newVal) {
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

            $scope.sph.show('/esglobe/esglobe_modules/climatology/data/output/' + newVal.filename);
            if (!newVal.bypassOrient)
                $scope.sph.orient(newVal.lat, newVal.lon);
        }

        $timeout(() => {
            if ($scope.input.latlon && _.isFunction($scope.sph.plugins.drawLon)) {
                $scope.sph.plugins.drawLon($scope.input.latlon);
            }
        }, 200);
    };

    $scope.timeoutLoop = function (filename) {
        $scope.input.movieLoop = setTimeout(function() {
            $scope.message( { movie: true, frame: $scope.loop.i });

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

            $scope.$apply();
        }, $scope.input.delay);
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        $scope.sph.show(filename_frame, '/esglobe/esglobe_modules/climatology/data/output');
    };

    $scope.toggleMoviePause = function () {
        // $scope.esrl.flags.moviePlay = !$scope.esrl.flags.moviePlay;
        $scope.pause = !$scope.pause;
        if (!$scope.pause)
            $scope.timeoutLoop($scope.input.filename);
        /*$scope.message({
            action: $scope.esrl.flags.moviePlay ? 'play' : 'pause'
        });*/
    };

    $scope.stepBack = function () {
        if ($scope.esrl.flags.movie) {
            $scope.loop.i--;
            if ($scope.loop.i < 0)
                $scope.loop.i = 11;
            $scope.getFrame($scope.input.filename, $scope.loop.i);
        } else {
            var idx = $scope.data.timeDropdown.indexOf($scope.esrl.input.time);
            idx--;
            if (idx < 1)
                idx = $scope.data.timeDropdown.length - 1;
            $scope.esrl.input.time = $scope.data.timeDropdown[idx];
        }

        $scope.message( { movie: true, frame: $scope.loop.i });
    };

    $scope.stepForward = function () {
        if ($scope.esrl.flags.movie) {
            $scope.loop.i++;
            if ($scope.loop.i === 12)
                $scope.loop.i = 0;
            $scope.getFrame($scope.input.filename, $scope.loop.i);
        } else {
            var idx = $scope.data.timeDropdown.indexOf($scope.esrl.input.time);
            idx++;
            if (idx > $scope.data.timeDropdown.length - 1)
                idx = 1;
            $scope.esrl.input.time = $scope.data.timeDropdown[idx];
        }

        $scope.message( { movie: true, frame: $scope.loop.i });
    };

    $scope.setDelay = function () {
        $scope.input.delay = 1 / $scope.esrl.flags.delay * 1000;
    };

    $scope.downloadFile = function (filename, type) {
        //Initialize file format you want csv or xls
        var uri = `/esrl/output/${filename}.zip`;

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";

        var field = $scope.esrl.input.field;
        var time = $scope.esrl.input.time;
        var level = $scope.esrl.input.press;
        link.download = `globeData-${field}-${time}-level${level}.zip`; //this is an example file to download, use yours

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    $scope.sph.emitter.subscribe('esglobe:sphereClick', function(data) {
        $scope.$apply(() => {
            $scope.input.latlon = [data.latlon[0], data.latlon[1]];
        });
    });

    $scope.sph.emitter.subscribe("iframeMessage", function(message) {
        $timeout(() => {
            if (message && message.downloadData) {
                $scope.esrl.input.saveData = true;
                $scope.submitEsrlForm()
                    .then(function (results) {
                        $scope.downloadFile(results.base_filename)
                    });
            }

            if (message && message.action === 'sectionDownloadGlobeData') {
                $scope.esrl.input.saveData = true;
                $scope.submitEsrlForm()
                    .then(function (results) {
                        $scope.downloadFile(results.base_filename)
                    })
            }

            if (message && message.time) {
                $scope.esrl.input.time = message.time;
            }

            if (message && message.field) {
                $scope.esrl.input.field = message.field;
            }

            if (message && typeof message.lon !== 'undefined') {
                var latlon = $scope.sph.getCurrentLatLon();
                if (latlon) {
                    $scope.sph.plugins.drawLon([latlon[0], message.lon]);
                }
            }

            if (message && (message.min || message.max)) {

                $scope.esrl.input.min = parseFloat(message.min);
                $scope.esrl.input.max = parseFloat(message.max);
                if (message.contourStep)
                    $scope.esrl.input.contourStep = parseFloat(message.contourStep);

            }

            if (message && message.level) {
                var matchIdx = $scope.data.levels.indexOf(message.level);
                if (matchIdx){
                    $scope.esrl.input.press = $scope.data.levels[matchIdx];
                }
            }

            if (message && message.showLon && message.latlon) {
                console.log("===globeControls message.showLon===", message.showLon, message.latlon);
                $scope.esrl.input.showLon = message.latlon;
            }

            if (message && message.action && message.action === 'saveGlobeSettings') {
                _.merge($scope.esrl.input, message.input);
            }
        });
    });

    $scope.message = function (data) {
        /*$parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });*/
        $scope.sph.emitter.emit('iframeMessage', data);
    };

    $scope.openLightboxModal = function (filename) {
        $scope.message({ action: "lightboxModal", input: $scope.section.input, filename: filename });
    };

    /*$parentScope.esrlScope = $scope;*/
});