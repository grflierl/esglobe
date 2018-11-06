angular.module('oceanClimatology.services', []).factory('OceanResource', function($resource) {
    return $resource('backend/ocean.php', {}, {
        submitForm: {
            method: 'POST',
            isArray: false,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: function (data, headersGetter) {
                var str = [];
                for (var d in data)
                    str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                return str.join("&");
            }
        }
    });
});