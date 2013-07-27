(function() {
    var module = angular.module("angular-dg-maps-example", ["dg-maps"]);
}());

function ExampleController($scope, $timeout, $log) {
    $scope.lat = 55.028936234826;
    $scope.lon = 82.927810142519;
    $scope.zoom = 15;

    $scope.zoomControls = true;
    $scope.fullscreenControls = true;
}