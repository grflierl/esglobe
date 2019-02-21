// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services', 'app-esrl.defaults', 'ui.bootstrap','ngAnimate','ui.toggle']);

/*esrl.factory('$parentScope', function ($window) {
    if ($window.parent && $window.parent.angular) {
        return $window.parent.angular.element($window.frameElement).scope();
    } else {
        return {};
    }
});*/


esrl.controller('EsrlChildController', function ($scope, $timeout, $uibModal, $location, $q, $templateCache, $compile, EsrlResource, defaults) {
    $scope.sph = parent.sph;
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

    console.log("=======FEB 19 I AM HERE+===");

    $scope.data.levelArr = [1000, 925, 800, 700, 600, 500, 400, 300, 250, 200, 150, 100, 70, 50, 30, 20, 10];
    $scope.data.timeArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Year', 'Movie'];

    $scope.input = {}; // for inputs that don't trigger watch

    $scope.section = {};
    $scope.section.input = {};
    $scope.section.input.levelIndicatorIdx = 0;
    $scope.section.input.time = "Jan";
    $scope.section.input.press = "100";
    $scope.section.input.field = "pottmp";
    $scope.section.input.lon = 0;

    $scope.section.input.logScale = true;
    $scope.section.input.zonalAverage = true;
    $scope.section.flags = {};
    $scope.section.flags.keyboardControl = false;
    $scope.section.flags.showNow = true;

    $scope.initialLoad = true;

    $scope.sectionInputWatchCount = 0;

    // Functions to execute on load
    $timeout(function () {
        $scope.setDefaults($scope.section.input.field);

        /*------ Watches ----*/
        $scope.$watchCollection('section.input', function (newVal, oldVal) {
            var submitForm = true;

            if (newVal.filename && newVal.filename !== oldVal.filename) {
                submitForm = false;
            }

            if (oldVal && newVal) {
                if (oldVal.field && newVal.field && oldVal.field !== newVal.field) {
                    $scope.setDefaults(newVal.field, "field1");
                }

                if (oldVal.field2 && newVal.field2 && oldVal.field2 !== newVal.field2) {
                    $scope.setDefaults(newVal.field2, "field2");
                }

                if (!oldVal.field2 && newVal.field2) {
                    $scope.setDefaults(newVal.field2, "field2");
                }

                // pressure change
                if (oldVal.press !== newVal.press) {
                    if ($scope.section.input.field === "pottmp" && !$scope.section.input.field2) {
                        if (newVal.press === "10") {
                            // set contour default ot 20
                            $scope.section.input.contour = 20;
                        } else if (newVal.press === "1") {
                            // set contour default ot 20
                            $scope.section.input.contour = 20;
                        } else {
                            $scope.setDefaults(newVal.field, "field1");
                        }
                    }
                    $scope.setLevelIndicator();
                }

                // log change
                if (oldVal.logScale !== newVal.logScale) {
                    $scope.setLevelIndicator();
                }

            }
            if (!$scope.esrlForm.$invalid) {
                if (newVal && oldVal && newVal.time !== oldVal.time) {
                    $timeout.cancel($scope.section.flags.timeTimeout);
                    $scope.section.flags.timeTimeout = $timeout(function () {
                        $scope.message({
                            action: "sectionTimeChanged",
                            time: $scope.section.input.time
                        });
                    }, 500);
                }

                if (newVal && oldVal && newVal.field !== oldVal.field) {
                    $timeout.cancel($scope.section.flags.fieldTimeout);
                    $scope.section.flags.fieldTimeout = $timeout(function () {
                        $scope.message({
                            action: "field",
                            field: $scope.section.input.field
                        });
                    }, 500);
                }

                /*if (newVal && oldVal && newVal.lon !== oldVal.lon) {
                    $timeout.cancel($scope.section.flags.lonTimeout);
                    $scope.section.flags.lonTimeout = $timeout(function () {
                        $scope.message({
                            action: "lon",
                            lon: $scope.section.input.lon
                        });
                    }, 500);
                }*/

                // don't submit if we are only changing the sectionidx
                if (typeof newVal.levelIndicatorIdx !== 'undefined' && oldVal.levelIndicatorIdx !== newVal.levelIndicatorIdx) {
                    $timeout.cancel($scope.section.flags.levelTimeout);
                    $scope.section.flags.levelTimeout = $timeout(function () {
                        $scope.message({
                            action: "sectionLevelChanged",
                            level: $scope.data.levelArr[newVal.levelIndicatorIdx],
                        });
                        $scope.globeLoading = true;

                        // timeout the globeLoading after 2 seconds, so we don't freeze the UI
                        $timeout(function () {
                            $scope.globeLoading = false;
                        }, 2000);

                    }, 500);

                    submitForm = false;
                }

                // don't submit form if the lon changes and we are in zonal average
                if (oldVal.lon && newVal.lon && oldVal.lon !== newVal.lon) {
                    if ($scope.section.input.zonalAverage) {
                        submitForm = false;
                    }
                }

                $timeout(() => {
                    if (submitForm && oldVal) {
                        if ($scope.sectionInputWatchCount === 0) {
                            $scope.sectionInputWatchCount++;
                            $scope.submitSectionForm().then(function () {
                                $scope.sectionInputWatchCount--;
                            });
                        }
                    }
                }, 100);
            }
        });
    });

    $scope.downloadGlobeData = function () {
        $scope.message({
            action: 'sectionDownloadGlobeData'
        });
    };

    $scope.downloadFile = function (filename, type) {
        console.log("=== downloadoing file ==");
        $timeout(() => {
            //Initialize file format you want csv or xls
            var uri = `/esglobe/esglobe_modules/climatology/data/output/${filename}.zip`;

            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;

            //set the visibility hidden so it will not effect on your web-layout
            link.style = "visibility:hidden";


            var field = $scope.section.input.field;
            var lon = $scope.section.input.lon;
            var time = $scope.section.input.time;
            link.download = `sectionData-${field}-${time}-lon${lon}.zip`; //this is an example file to download, use yours

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            console.log("===link ====", link);
            link.click();
            document.body.removeChild(link);
        }, 100);

    };

    /**
     *
     * @param options
     * options.pixels = { start, end }
     * options.values = { start, end }
     * options.scale = log/linear
     * options.target = value
     */
    $scope.interpolate = function (options) {
        // get the % advance of the target value.
        const fullRange = -1 * (options.values.end - options.values.start);
        const pixelRange = options.pixels.end - options.pixels.start;
        const valRangeFrac = -1 * (options.targetValue - options.values.start) / fullRange;

        let output = 0;

        if (options.scale === "log") {
            const log = Math.log10(options.targetValue);
            const logStart = Math.log10(options.values.start);
            const logEnd = Math.log10(options.values.end);
            const logRange = logStart - logEnd;

            // normalizes the log range from 0 - 1
            const normalizedLogFrac = -1 * (log - logStart)/(logRange);
            // console.log("interpolate", {options, fullRange, log, valRangeFrac, normalizedLogFrac, output });
            output = options.pixels.start + (pixelRange * normalizedLogFrac);
        } else {
            output = options.pixels.start + valRangeFrac * pixelRange;
        }

        if (output > options.pixels.end) {
            output = options.pixels.end
        }

        if (output < options.pixels.start) {
            output = options.pixels.start;
        }

        return output;


    };

    $scope.interpolatePixelRange = function (type) {
        let endOffset = 0;
        const field = $scope.section.input.field;
        const field2 = $scope.section.input.field2;
        let scalebarVisible = false;
        if (field2 && field && field != field2) {
            scalebarVisible = true;
        }

        if ($scope.section.input.field === 'rhum' || $scope.section.input.field === 'shum' || $scope.section.input.field2 === 'rhum' || $scope.section.input.field2 === 'shum') {
            return {
                start: 45,
                end: scalebarVisible ? 545: 520
            }
        }
        else if ($scope.section.input.press === "10") {
            return {
                start: 118,
                end: scalebarVisible ? 545: 520
            }
        } else if ($scope.section.input.press === "1") {
            return {
                start: 45,
                end: scalebarVisible ? 545: 530
            }
        }  else if (typeof type === "undefined") {
            return {
                start: 45,
                end: scalebarVisible ? 545: 520
            }
        }
    };

    $scope.interpolateValueRange = function () {
        if ($scope.section.input.field === 'rhum' || $scope.section.input.field === 'shum' || $scope.section.input.field2 === 'rhum' || $scope.section.input.field2 === 'shum') {
            return {
                start: 1000,
                end: 300
            }
        }
        else if ($scope.section.input.press === "10") {
            return {
                start: 500,
                end: 10
            }
        } else if ($scope.section.input.press === "1") {
            return {
                start: 100,
                end: 10
            }
        } else if ($scope.section.input.press === "100") {
            return {
                start: 1000,
                end: 100
            }
        } else if ($scope.section.input.press === "500") {
            return {
                start: 1000,
                end: 500
            }
        } else {
            return {};
        }
    };

    $scope.timePrev = function () {
        if ($scope.isLoading)
            return;
        let idx = $scope.data.timeArr.indexOf($scope.section.input.time);
        if (idx > 0) {
            idx--;
            $scope.section.input.time = $scope.data.timeArr[idx];
        }
    };

    $scope.timeNext = function () {
        if ($scope.isLoading)
            return;
        let idx = $scope.data.timeArr.indexOf($scope.section.input.time);
        if (idx < $scope.data.timeArr.length - 1) {
            idx++;
            $scope.section.input.time = $scope.data.timeArr[idx];
        }
    };

    $scope.levelUp = function () {
        if ($scope.isLoading || $scope.globeLoading)
            return;

        if ($scope.section.input.levelIndicatorIdx < $scope.data.levelArr.length - 1)
            $scope.section.input.levelIndicatorIdx++;

        // get the level
        $scope.setLevelIndicator();
    };

    $scope.levelDown = function () {
        if ($scope.isLoading || $scope.globeLoading)
            return;
        if ($scope.section.input.levelIndicatorIdx > 0)
            $scope.section.input.levelIndicatorIdx--;

        // get the level
        $scope.setLevelIndicator();
    };

    $scope.setLevelIndicator = function () {
        // get the defaults
        const level = $scope.data.levelArr[$scope.section.input.levelIndicatorIdx];
        const pixels = $scope.interpolatePixelRange();
        const values = $scope.interpolateValueRange();
        const pxOutput = $scope.interpolate({
            targetValue: level,
            pixels,
            values,
            scale: $scope.section.input.logScale ? "log" : "linear"
        });
        // I know you shouldn't do DOM manipulation in the controller, todo: move to directive
        angular.element(".level-indicator").css("bottom", `${pxOutput}px`);
    };

    $scope.toggleKeyboardControl = function () {
        $scope.section.flags.keyboardControl = !$scope.section.flags.keyboardControl

        if ($scope.section.flags.keyboardControl) {
            angular.element(document).bind('keyup', function (e) {
                if (e.keyCode === 38) { // up arrow
                    $scope.levelUp();
                    $scope.$digest();
                }

                if (e.keyCode === 40) { // down arrow
                    $scope.levelDown();
                    $scope.$digest();
                }

                if (e.keyCode === 37) { // left arrow
                    $scope.timePrev();
                    $scope.$digest();
                }

                if (e.keyCode === 39) { // right arrow
                    $scope.timeNext();
                    $scope.$digest();
                }
            });
        } else {
            angular.element(document).unbind('keyup');
        }
    };

    $scope.getLevelIndicatorClass = function (levelIdx) {
        const indicatorClass = {};
        const level = $scope.data.levelArr[levelIdx];
        indicatorClass[`level${level}`] = true;
        indicatorClass['log'] = true;

        return indicatorClass;
    };

    $scope.section.submit = function () {
        $scope.submitSectionForm()
            .then(function () {
                $scope.section.flags.showNow = true;
            });
    };

    $scope.downloadSectionData = function () {
        $scope.input.saveData = true;
        $scope.submitSectionForm()
            .then(result => {
                console.log("=== download section data result ==", result);
                $scope.downloadFile(result.filename)
            })
    };

    $scope.getFrame = function (filename, frame) {
        $scope.section.filepath = "./data/output/";
        if (_.isNil(frame)) {
            $scope.section.filename = filename + '.png';
        } else {
            $scope.section.filename = filename + '-' + frame + '.png';
        }
    };

    $scope.downloadGlobeData = function () {
        $scope.message({
            action: 'sectionDownloadGlobeData'
        });
    };

    $scope.setDefaults = function (input, field) {
        var defaultRes = defaults.getEsrlDefaults(input);
        if (field && field === "field1") {
            $scope.section.input.contour = defaultRes.contour;
            $scope.section.input.min = defaultRes.min;
            $scope.section.input.max = defaultRes.max;
        } else if (field && field === "field2") {
            $scope.section.input.contour2 = defaultRes.contour;
            $scope.section.input.min2 = defaultRes.min;
            $scope.section.input.max2 = defaultRes.max;
        } else {
            $scope.section.input.contour = defaultRes.contour;
            $scope.section.input.min = defaultRes.min;
            $scope.section.input.max = defaultRes.max;

            $scope.section.input.contour2 = defaultRes.contour;
            $scope.section.input.min2 = defaultRes.min;
            $scope.section.input.max2 = defaultRes.max;
        }

        // console.log("=== esrl set deaults ===", { input, field }, defaultRes, $scope.section.input);
    };

    $scope.submitSectionForm = function () {
        var res = new EsrlResource();
        res.action = "section";
        res.time = $scope.section.input.time;
        res.press = $scope.section.input.press;
        res.field = $scope.section.input.field;
        res.logScale = $scope.section.input.logScale ? 'True' : 'False';
        res.zonalAverage = $scope.section.input.zonalAverage ? 'True' : 'False';
        res.fillContour = true;
        res.sectionRegion = $scope.section.input.sectionRegion;

        if ($scope.input.saveData)
            res.saveData = true;

        if ($scope.section.input.field2) {
            res.field2 = $scope.section.input.field2;
            if ($scope.section.input.max2) {
                res.max2 = $scope.section.input.max2
            }
            if ($scope.section.input.min2) {
                res.min2 = $scope.section.input.min2
            }
            if ($scope.section.input.contour2) {
                res.contour2 = $scope.section.input.contour2;
            }

        } else {
            res.fillContour = true;
            res.field2 = $scope.section.input.field;
            if ($scope.section.input.min)
                res.min2 = $scope.section.input.min;
            if ($scope.section.input.max)
                res.max2 = $scope.section.input.max;

            res.contour2 = $scope.section.input.contour;
        }

        res.lon = $scope.section.input.lon;
        res.contour = $scope.section.input.contour;

        if ($scope.section.input.max) {
            res.max = $scope.section.input.max
        }
        if ($scope.section.input.min) {
            res.min = $scope.section.input.min
        }

        if ($scope.section.input.fillContour) {
            res.fillContour = $scope.section.input.fillContour
        }

        // if either Field1 or Field2 is shum or rhum, we set the Pressure Range to 500
        if ($scope.section.input.field === 'shum' || $scope.section.input.field === 'rhum' || $scope.section.input.field2 === 'shum' || $scope.section.input.field2 === 'rhum') {
            if ($scope.section.input.press === '100')
                $scope.section.input.press = '500';
        }

        $scope.isLoading = true;

        console.log("======res===", JSON.stringify(res, null, 4));

        return res.$submitForm().then(function (results) {
            $scope.section.input.filename = results.filename;
            if ($scope.section.input.time === 'Movie'){
                $scope.getFrame(results.filename, $scope.data.frame);
            } else {
                $scope.getFrame(results.filename);
            }

            $scope.isLoading = false;
            $scope.section.flags.showNow = true;

            delete $scope.section.input.saveData;
            return results;
        });

    };

    $scope.sph.emitter.subscribe("drawLon:clickRegion", region => {
        $scope.$apply(() => {
            $scope.section.input.zonalAverage = false;
            $scope.section.input.sectionRegion = region.region;
            $scope.section.input.lon = parseInt(region.lon);
        });
    });

    $scope.sph.emitter.subscribe('esglobe:sphereClick', function(data) {
        $scope.$apply(() => {
            console.log("===data===", data);
            if (data.latlon) {
                $scope.sph.plugins.drawLon(data.latlon);
            }
            // $scope.section.input.lon = parseInt(data.latlon[1]);
            // $scope.section.input.lat = parseInt(data.latlon[0]);
            // $scope.section.input.zonalAverage = false;
        });
    });

    $scope.sph.emitter.subscribe('iframeMessage', function(message) {
        if (message && message.action === 'globeDoneLoading') {
            $scope.globeLoading = false;
        }

        if (message && message.frame) {
            $scope.loop = message.frame;
        }

        if (message && message.lon) {
            // set the lat and lon to where the user clicked
            $scope.section.input.lon = parseInt(message.lon);
        }

        if (message && message.time) {
            $scope.section.input.time = message.time;
        }

        if (message && message.movie) {
            if ($scope.section.input.time === 'Movie' && !$scope.isLoading && $scope.section.input.filename) {
                $scope.data.frame = message.frame;
                $scope.getFrame($scope.section.input.filename, message.frame);
            }
        }

        if (message && message.globeInput) {
            $scope.openGlobeSettingsModal(message.globeInput)
        }

        if (message && message.press) {

            const idx = $scope.data.levelArr.indexOf(message.press);
            if (idx != -1)
                $scope.section.input.levelIndicatorIdx = idx;

            $scope.setLevelIndicator();
        }

        if (message && message.globeDoneLoading) {
            $scope.globeLoading = false;
        }

        if(!$scope.$$phase) {
            $scope.$apply()
        }

    });


    $scope.message = function (data) {
        $scope.sph.emitter.emit("iframeMessage", data);
    };

    $scope.openLightboxModal = function (filename) {
        const lightboxModal = document.querySelector('#lightboxModal').innerHTML;
        const template = Handlebars.compile(lightboxModal);

        const html = template({ title: "Section Image", input: $scope.section.input, filename: `/esglobe/esglobe_modules/climatology/data/output/${filename}` });

        // const html = $compile(lightboxModal)({ filename: "foo" });
        $scope.sph.emitter.emit('lightboxModal', { html });
    };

    $scope.openSettingsModal = function () {
        var input = $scope.section.input;
        var field1 = $scope.section.input.field;
        var field2 = $scope.section.input.field2;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'sectionSettingsModal.html',
            controller: 'SectionSettingsModalCtrl',
            controllerAs: 'ctrl',
            size: "md",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                field1: function () {
                    return field1;
                },
                field2: function () {
                    return field2;
                }
            }
        });

        modalInstance.result.then(function (result) {
            _.merge($scope.section.input, result);
        });
    };

    $scope.openGlobeSettingsModal = function (input) {
        var field = input.field;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'globeSettingsModal.html',
            controller: 'GlobeSettingsModalCtrl',
            controllerAs: 'ctrl',
            size: "md",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                field: function () {
                    return field;
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.message({
                action: "saveGlobeSettings",
                input: result
            })
        });
    };

    // $parentScope.esrlScope = $scope;

});

esrl.controller("SectionSettingsModalCtrl", function ($uibModalInstance, input, field1, field2, defaults) {
    this.input = angular.copy(input);
    this.input.globe = {};
    this.resetDefaults = function () {
        if (field1) {
            var defaultRes = defaults.getEsrlDefaults(field1);
            this.input.contour = defaultRes.contour;
            this.input.min = defaultRes.min;
            this.input.max = defaultRes.max;
        }

        if (field2) {
            var defaultRes = defaults.getEsrlDefaults(field2);
            this.input.contour2 = defaultRes.contour;
            this.input.min2 = defaultRes.min;
            this.input.max2 = defaultRes.max;
        }
    };

    this.ok = function () {
        $uibModalInstance.close(this.input);
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };
});

esrl.controller("GlobeSettingsModalCtrl", function ($uibModalInstance, input, field, defaults) {
    this.input = {};
    this.input.globe = angular.copy(input);
    this.resetDefaults = function () {
        if (field) {
            var defaultRes = defaults.getEsrlDefaults(field);
            this.input.globe.contourStep = defaultRes.contour;
            this.input.globe.min = defaultRes.min;
            this.input.globe.max = defaultRes.max;
        }
    };

    this.ok = function () {
        $uibModalInstance.close(this.input.globe);
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };
});

esrl.controller("LightboxModalCtrl", function ($uibModalInstance, input, filename) {
    this.filename = filename;
    this.input = input;
});

esrl.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});