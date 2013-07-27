'use strict';

var dgMapsModule = angular.module("dg-maps", []);

dgMapsModule.directive("dgMap", ["$log", "$timeout", "$filter", function ($log, $timeout,
                                                                          $filter) {

    var controller = function () {

    };

    return {
        restrict: "ECA",
        priority: 100,
        transclude: true,
        template: "<div class='angular-dg-map' ng-transclude></div>",
        replace: true,
        scope: {
            latitude: "=latitude", // required
            longitude: "=longitude", // required
            zoom: "=zoom", // required
            markers: "=markers", // optional
            zoomControls: "=zoomControls",
            fullscreenControls: "=fullscreenControls"
        },
        controller: controller,
        link: function (scope, element, attrs, ctrl) {

            // latitude and longitude must be specified
            if (!angular.isDefined(scope.latitude)) {
                $log.error("angular-dg-maps: could not find a valid latitude property");
                return;
            }

            if (!angular.isDefined(scope.longitude)) {
                $log.error("angular-dg-maps: could not find a valid longitude property");
                return;
            }

            if (!angular.isDefined(scope.zoom)) {
                $log.error("angular-dg-maps: map zoom property not set");
                return;
            }

            angular.element(element).addClass("angular-dg-map");

            var _m = new DG.Map(element.attr('id'));

            // Set map center and zoom
            _m.setCenter(new DG.GeoPoint(scope.longitude, scope.latitude), scope.zoom);

            var _zoom = new DG.Controls.Zoom();
            // Add zoom controls
            _m.controls.add(_zoom);

            if(!angular.isDefined(scope.zoomControls) || scope.zoomControls) {
                _zoom.show();
            } else {
                _zoom.hide();
            }

            if(!angular.isDefined(scope.fullscreenControls) || scope.fullscreenControls) {
                _m.fullscreen.enable();
            } else {
                _m.fullscreen.disable();
            }

            // Put the map into the scope
            scope.map = _m;

            // Update map when center coordinates change
            scope.$watch("latitude", function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                _m.setCenter(new DG.GeoPoint(scope.longitude, newValue), scope.zoom);
            }, true);

            scope.$watch("longitude", function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                _m.setCenter(new DG.GeoPoint(newValue, scope.latitude), scope.zoom);
            }, true);

            scope.$watch("zoom", function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                _m.setZoom(newValue);
            }, true);

            scope.$watch('zoomControls', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }

                if(newValue) {
                    _zoom.show();
                } else {
                    _zoom.hide();
                }
            });

            scope.$watch('fullscreenControls', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }

                if(newValue) {
                    _m.fullscreen.enable();
                } else {
                    _m.fullscreen.disable();
                }
            });

        }
    };

}]);