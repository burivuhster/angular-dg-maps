(function() {
    'use strict';

    var dgMapsModule = angular.module("dg-maps", []);

    dgMapsModule.directive("dgMap", ["$log", "$timeout", "$filter", "$rootScope", function($log, $timeout, $filter, $rootScope) {

        var controller = function() {

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
            link: function(scope, element, attrs, ctrl) {

                // latitude and longitude must be specified
//            if (!angular.isDefined(scope.latitude)) {
//                $log.error("angular-dg-maps: could not find a valid latitude property");
//                return;
//            }
//
//            if (!angular.isDefined(scope.longitude)) {
//                $log.error("angular-dg-maps: could not find a valid longitude property");
//                return;
//            }

                if (!angular.isDefined(scope.zoom)) {
                    $log.error("angular-dg-maps: map zoom property not set");
                    return;
                }

                angular.element(element).addClass("angular-dg-map");

                // Create DG Map object
                var _m = new DG.Map(element.attr('id'));

                // Set map center and zoom
                if (angular.isDefined(scope.latitude) && angular.isDefined(scope.longitude)) {
                    _m.setCenter(new DG.GeoPoint(scope.longitude, scope.latitude), scope.zoom);
                }

                // Add zoom controls
                var _zoom = new DG.Controls.Zoom();
                _m.controls.add(_zoom);

                if (!angular.isDefined(scope.zoomControls) || scope.zoomControls) {
                    _zoom.show();
                } else {
                    _zoom.hide();
                }

                if (!angular.isDefined(scope.fullscreenControls) || scope.fullscreenControls) {
                    _m.fullscreen.enable();
                } else {
                    _m.fullscreen.disable();
                }

                // Add marker utility function
                scope.addMarker = function(markerConfig) {
                    if (markerConfig.latitude && markerConfig.longitude) {
                        var markerDGConfig = {
                            geoPoint: new DG.GeoPoint(markerConfig.longitude, markerConfig.latitude),
                            draggable: !!markerConfig.draggable,
                            hint: markerConfig.hint || ""
                        };

                        if (markerConfig.click && typeof markerConfig.click === "function") {
                            markerDGConfig.clickCallback = markerConfig.click;
                        }

                        if (markerConfig.dragStart && typeof markerConfig.dragStart === "function") {
                            markerDGConfig.dragStartCallback = markerConfig.dragStart;
                        }

                        if (markerConfig.draggable) {
                            markerDGConfig.dragStopCallback = function(evt) {
                                var pos = evt.getPosition();
                                scope.$apply(function() {
                                    markerConfig.latitude = pos.lat;
                                    markerConfig.longitude = pos.lon;
                                });

                                if (markerConfig.dragStop && typeof markerConfig.dragStop === "function") {
                                    markerConfig.dragStop.apply(this, arguments);
                                }
                            }
                        }


                        var marker = new DG.Markers.Common(markerDGConfig);

                        _m.markers.add(marker);
                    }
                };

                // Create markers
                if (angular.isDefined(scope.markers) && angular.isArray(scope.markers) && scope.markers.length) {
                    angular.forEach(scope.markers, function(markerConfig) {
                        scope.addMarker(markerConfig);
                    });
                }

                // Put the map into the scope
                scope.map = _m;

                // Update map when center coordinates change
                scope.$watch("latitude", function(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }

                    _m.setCenter(new DG.GeoPoint(scope.longitude, newValue), scope.zoom);
                }, true);

                scope.$watch("longitude", function(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }

                    _m.setCenter(new DG.GeoPoint(newValue, scope.latitude), scope.zoom);
                }, true);

                // Update map zoom when it changes
                scope.$watch("zoom", function(newValue, oldValue) {
                    if (newValue === oldValue) {
                        return;
                    }

                    _m.setZoom(newValue);
                }, true);

                // Update zoom controls visibility when model changes
                scope.$watch('zoomControls', function(newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }

                    if (newValue) {
                        _zoom.show();
                    } else {
                        _zoom.hide();
                    }
                });

                // Update fulscreen control visibility when model changes
                scope.$watch('fullscreenControls', function(newValue, oldValue) {
                    if (newValue == oldValue) {
                        return;
                    }

                    if (newValue) {
                        _m.fullscreen.enable();
                    } else {
                        _m.fullscreen.disable();
                    }
                });

                scope.$watch('markers', function(markers) {
                    _m.markers.removeAll();
                    angular.forEach(scope.markers, function(markerConfig) {
                        scope.addMarker(markerConfig);
                    })
                }, true);

                // Update model properties on map events
                _m.addEventListener(_m.getContainerId(), 'DgZoomChange', function(evt) {
                    if (!$rootScope.$root.$$phase) {
                        scope.$apply(function() {
                            scope.zoom = evt.getZoom();
                        });
                    } else {
                        scope.$eval(function() {
                            scope.zoom = evt.getZoom();
                        });
                    }
                });

                _m.addEventListener(_m.getContainerId(), 'DgMapMove', function(evt) {
                    if (!$rootScope.$root.$$phase) {
                        scope.$apply(function() {
                            var pos = evt.getCenter();
                            scope.latitude = pos.lat;
                            scope.longitude = pos.lon;
                        });
                    } else {
                        scope.$eval(function() {
                            var pos = evt.getCenter();
                            scope.latitude = pos.lat;
                            scope.longitude = pos.lon;
                        });
                    }
                });
            }
        };

    }]);

    dgMapsModule.service('geocoder', function() {
        return {
            get: function(query, options) {
                return DG.Geocoder.get(query, options);
            }
        }
    });
})();