angular.module('resources.defaults', []).factory('defaults', function() {
    var service = {};
    service.getDefaultContours = function (input, depth) {
        switch(input) {
            case "THETA":
                if (!depth) {
                    return {
                        contourStep: 2,
                        min: -50,
                        max: 50
                    };
                }

                if (depth < 100) {
                    return {
                        contourStep: 2,
                        min: -50,
                        max: 50
                    };
                } else if (depth < 1000) {
                    return {
                        contourStep: 1,
                        min: -50,
                        max: 50
                    };
                } else if (depth < 1500) {
                    return {
                        contourStep: 0.5,
                        min: -50,
                        max: 50
                    };
                } else if (depth < 2500) {
                    return {
                        contourStep: 0.2,
                        min: -50,
                        max: 50
                    };
                } else {
                    return {
                        contourStep: 0.1,
                        min: -50,
                        max: 50
                    };
                }
                break;
            case "EVELMASS":
                return {
                    contourStep: 0.1,
                    min: -1,
                    max: 1
                };
                break;
            case "NVELMASS":
                return {
                    contourStep: 0.1,
                    min: -1,
                    max: 1
                };
                break;
            case "oceTAUE":
                return {
                    contourStep: 0.02,
                    min: -0.5,
                    max: 0.5
                };
                break;
            case "oceTAUN":
                return {
                    contourStep: 0.02,
                    min: -0.5,
                    max: 0.5
                };
                break;
            default:
                return {
                    contourStep: 1,
                    min: 0,
                    max: 100
                };
        }
    };
    return service;
});