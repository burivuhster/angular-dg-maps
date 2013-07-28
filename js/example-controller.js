(function() {
    var module = angular.module("angular-dg-maps-example", ["dg-maps"]);
}());

function ExampleController($scope, $timeout, $log) {
    $scope.lat = 55.028936234826;
    $scope.lon = 82.927810142519;
    $scope.zoom = 15;

    $scope.staticLat = 55.7368;
    $scope.staticLon = 37.632618;
    $scope.staticZoom = 14;
    $scope.staticMarkers = [[37.64272,55.7368,99], [37.632618,55.7361]];

    $scope.zoomControls = true;
    $scope.fullscreenControls = true;

    $scope.markers = [
        {
            latitude: 55.028936234826,
            longitude: 82.927810142519,
            draggable: true,

            dragStop: function(marker) {
                var pos = marker.getPosition();
                console.log('Marker drag stop: ' + pos.lon + ' ' + pos.lat);
            }
        }
    ];
}