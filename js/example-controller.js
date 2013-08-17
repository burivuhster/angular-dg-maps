(function() {
    var module = angular.module("angular-dg-maps-example", ["dg-maps"]);
}());

function ExampleController($scope, $timeout, $log) {
    $scope.lat = 55.028;
    $scope.lon = 82.925;
    $scope.zoom = 15;

    $scope.staticLat = 55.7368;
    $scope.staticLon = 37.632618;
    $scope.staticZoom = 14;

    $scope.zoomControls = true;
    $scope.fullscreenControls = true;

    $scope.markers = [
        {
            latitude: 55.023,
            longitude: 82.926,
            draggable: false,

            hint: 'Click me!',

            onClick: function(ind) {
                alert('click');
            }
        },
        {
            latitude: 55.028,
            longitude: 82.922,
            draggable: true,

            hint: 'Drag me!',

            onClick: function(ind) {
                alert('other marker click');
            }
        }
    ];
}