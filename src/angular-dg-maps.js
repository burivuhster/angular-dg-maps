/*!
 * Angular-dg-maps.js
 * http://burivuhster.github.io/angular-dg-maps
 *
 * Copyright 2013 Eugene Molodkin <burivuh@gmail.com>
 * Released under the MIT license
 * https://github.com/burivuhster/angular-dg-maps/blob/master/LICENSE
 */

(function() {
    'use strict';

    var dgMapsModule = angular.module("dg-maps", []);

    dgMapsModule.directive("dgMap", ["$log", "$timeout", "$rootScope", function($log, $timeout, $rootScope) {

        var innerMapEl = angular.element('<div class="inner-dg-map" style="height: 100%; width: 100%;"></div>');

        return {
            restrict: "E",
            priority: 100,
            transclude: true,
            template: "<div class='angular-dg-map'> <dg-markers ng-transclude></dg-markers></div>",
            replace: true,
            scope: {
                latitude: "=", // required
                longitude: "=", // required
                zoom: "=", // required
                zoomControls: "=",
                fullscreenControls: "=",
                fitToMarkers: "=",
                draggable: "=",
                geoclicker: "="
            },
            controller: ['$scope', function($scope) {

                this._markers = [];

                /**
                 * Add marker
                 * @param {DG.Marker} marker
                 */
                this.addMarker = function(marker) {
                    this._markers.push(marker);

                    // If map is already initialized
                    if($scope.map) {
                        $scope.map.markers.add(marker);
                    }
                };

                /**
                 * Remove marker from map
                 * @param {DG.Marker} marker
                 */
                this.removeMarker = function(marker) {
                    if($scope.map) {
                        $scope.map.markers.remove(marker);
                    }

                    for(var i = 0; i < this._markers.length; i++) {
                        if(this._markers[i] === marker) {
                            this._markers.splice(i, 1);
                            return;
                        }
                    }

                    $log.error("angular-dg-maps: error while removing marker - marker not found");
                };

            }],

            compile: function(tElem) {
                tElem.append(innerMapEl.attr('id', 'map' + Math.round(Math.random() * 1000000)));
                return this.link;
            },

            link: function(scope, element, attrs, ctrl) {
                if (!angular.isDefined(scope.zoom)) {
                    $log.error("angular-dg-maps: map zoom property not set");
                    return;
                }

                // Create DG Map object
                var _m = new DG.Map(innerMapEl.attr('id'));

                // Set map center and zoom
                if (angular.isDefined(scope.latitude) && angular.isDefined(scope.longitude)) {
                    _m.setCenter(new DG.GeoPoint(scope.longitude, scope.latitude), scope.zoom);
                }

                // Add zoom controls
                var _zoom = new DG.Controls.Zoom();
                _m.controls.add(_zoom);

                var dragging = false;

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

                if(angular.isDefined(scope.draggable) && !scope.draggable) {
                    _m.disableDragging();
                }

                if(angular.isDefined(scope.geoclicker) && !scope.geoclicker) {
                    _m.geoclicker.disable();
                }

                // Put the map into the scope
                scope.map = _m;

                // Update map when center coordinates change
                scope.$watch("latitude", function(newValue, oldValue) {
                    if (newValue === oldValue || dragging) {
                        return;
                    }

                    _m.setCenter(new DG.GeoPoint(scope.longitude, newValue), scope.zoom);
                }, true);

                scope.$watch("longitude", function(newValue, oldValue) {
                    if (newValue === oldValue || dragging) {
                        return;
                    }

                    _m.setCenter(new DG.GeoPoint(newValue, scope.latitude), scope.zoom);
                }, true);

                // Update map zoom when it changes
                scope.$watch("zoom", function(newValue, oldValue) {
                    if (newValue === oldValue || dragging) {
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

//                scope.$watch('markers', function(markers) {
//                    if(dragging) {
//                        return;
//                    }
//
//                    if(markers) {
//                        _m.markers.removeAll();
//                        angular.forEach(scope.markers, function(markerConfig) {
//                            scope.addMarker(markerConfig);
//                        });
//
//                        if(scope.fitToMarkers) {
//                            var markersBounds = _m.markers.getBounds();
//                            _m.setBounds(markersBounds);
//                        }
//                    }
//                }, true);

                // Update model properties on map events
                _m.addEventListener(_m.getContainerId(), 'DgZoomChange', function(evt) {
                    if (!$rootScope.$root.$$phase) {
                        scope.$apply(function() {
                            scope.zoom = evt.getZoom();
                        });
                    } else {
                        scope.zoom = evt.getZoom();
                    }
                });

                _m.addEventListener(_m.getContainerId(), 'DgMapMove', function(evt) {
                    var pos = evt.getCenter();
                    if(pos) {
                        if (!$rootScope.$root.$$phase) {
                            scope.$apply(function() {
                                scope.latitude = pos.lat;
                                scope.longitude = pos.lon;
                            });
                        } else {
                            scope.latitude = pos.lat;
                            scope.longitude = pos.lon;
                        }
                    }
                });

                _m.addEventListener(_m.getContainerId(), 'DgDragStart', function() {
                    dragging = true;
                });

                _m.addEventListener(_m.getContainerId(), 'DgDragStop', function() {
                    dragging = false;
                });
            }
        };

    }]);

    dgMapsModule.directive("dgMarker", ["$log", function($log) {
        return {
            restrict: "E",
            require: "^dgMap",
            scope: {
                lon: "=longitude",
                lat: "=latitude",
                dgClick: '&ngClick',
                show: '=',
                hint: '=',
                dragStop: '&',
                dragStart: '&'
            },
            link: function(scope, element, attrs, dgMapCtrl) {
                var markerConfig = {
                    geoPoint: new DG.GeoPoint(scope.lon, scope.lat),
                    draggable: !!attrs.draggable,
                    hint: attrs.hint,
                    dragStartCallback: function() {
                        scope.dragStart();
                    },
                    dragStopCallback: function() {
                        // Update properties on scope
                        var pos = marker.getPosition();
                        if(pos) {
                            scope.$apply(function() {
                                scope.lon = pos.lon;
                                scope.lat = pos.lat;
                            });
                        }

                        // Call event handler
                        scope.dragStop();
                    }
                };

                if(angular.isDefined(attrs.ngClick)) {
                    angular.extend(markerConfig, {
                        clickCallback: function() {
                            scope.dgClick();
                        }
                    });
                }

                if(attrs.iconSrc) {
                    if(angular.isDefined(attrs.iconWidth) && angular.isDefined(attrs.iconHeight)) {
                        var icon = new DG.Icon(attrs.iconSrc, new DG.Size(parseInt(attrs.iconWidth, 10), parseInt(attrs.iconHeight, 10)));
                        angular.extend(markerConfig, { icon: icon });
                        //marker.setIcon(icon);
                    } else {
                        $log.error("angular-dg-marker: icon width and height should be specified");
                    }
                }

                var marker = new DG.Markers.Common(markerConfig);
                dgMapCtrl.addMarker(marker);

                // Watch for marker's position on scope and update DG.Marker when needed
                scope.$watch('lon', function(lon) {
                    if(!angular.isDefined(lon)) {
                        return;
                    }

                    var pos = marker.getPosition();
                    pos.lon = lon;
                    marker.setPosition(pos);
                });

                scope.$watch('lat', function(lat) {
                    if(!angular.isDefined(lat)) {
                        return;
                    }

                    var pos = marker.getPosition();
                    pos.lat = lat;
                    marker.setPosition(pos);
                });

                scope.$watch('show', function(show) {
                    if(!angular.isDefined(show)) {
                        return;
                    }

                    if(show) {
                        marker.show();
                    } else {
                        marker.hide();
                    }
                });

                scope.$watch('hint', function(hint) {
                    if(!angular.isDefined(hint)) {
                        return;
                    }

                    marker.setHintContent(hint);
                });

                scope.$watch('draggable', function(draggable) {
                    if(!angular.isDefined(draggable)) {
                        return;
                    }

                    if(draggable) {
                        marker.enableDraggable();
                    } else {
                        marker.disableDraggable();
                    }
                });

                element.bind('$destroy', function() {
                    dgMapCtrl.removeMarker(marker);
                });
            }
        };
    }]);

    dgMapsModule.directive('dgStaticMap', ['$log', function($log) {
        return {
            restrict: "E",
            transclude: true,
            template: "<img class='angular-dg-static-map' ng-src='{{ mapSrc }}'><dg-static-markers ng-transclude></dg-static-markers>",
            //replace: true,
            scope: {
                latitude: "=", // required
                longitude: "=", // required
                zoom: "=", // required
                width: "=", //required
                height: "=" // required
            },
            controller: ['$scope', function($scope) {
                $scope.markers = [];

                /**
                 * Add marker to static map
                 * @param {Object} markerConfig
                 */
                this.addMarker = function(markerConfig) {
                    $scope.markers.push(markerConfig);
                };

                this.removeMarker = function(markerConfig) {
                    angular.forEach($scope.markers, function(marker, ind) {
                        if(marker === markerConfig) {
                            $scope.markers.splice(ind, 1);
                        }
                    });
                };
            }],
            link: function(scope, element, attrs) {
                if(!angular.isDefined(scope.latitude)) {
                    $log.error("angular-dg-static-maps: map latitude property not set");
                    return;
                }

                if(!angular.isDefined(scope.longitude)) {
                    $log.error("angular-dg-static-maps: map longitude property not set");
                    return;
                }

                if(!angular.isDefined(scope.markers) && !angular.isDefined(scope.zoom)) {
                    $log.error("angular-dg-static-maps: map zoom property not set");
                    return;
                }

                if(!angular.isDefined(scope.width) || !angular.isDefined(scope.height)) {
                    $log.error("angular-dg-static-maps: width and height properties should be set");
                    return;
                }

                angular.element(element).addClass("angular-dg-static-map");

                var src = 'http://static.maps.api.2gis.ru/1.0?';
                src += 'center=' + scope.longitude + ',' + scope.latitude;
                src += '&zoom=' + scope.zoom;
                src += '&size=' + scope.width + ',' + scope.height;

                if(angular.isDefined(scope.markers) && angular.isArray(scope.markers) && scope.markers.length) {
                    var tmpMarkers = [];
                    angular.forEach(scope.markers, function(marker) {
                        tmpMarkers.push(marker.lon + ',' + marker.lat + (marker.hint ? (',' + marker.hint) : ''));
                    });

                    src += '&markers=' + tmpMarkers.join('~');
                }

                scope.mapSrc = src;
            }
        };
    }]);

    dgMapsModule.directive('dgStaticMarker', ['$log', function($log) {
        return {
            restrict: 'E',
            priority: 100,
            require: '^dgStaticMap',
            link: function(scope, element, attrs, ctrl) {
                if('hint' in attrs && (!angular.isNumber(parseInt(attrs.hint, 10)) || parseInt(attrs.hint, 10) != attrs.hint)) {
                        $log.error('angular-dg-static-marker: hint should be a number');
                    return;
                }

                ctrl.addMarker({
                    lon: attrs.longitude,
                    lat: attrs.latitude,
                    hint: parseInt(attrs.hint, 10)
                });
            }
        };
    }]);

    dgMapsModule.service('geocoder', function() {
        return {
            get: function(query, options) {
                return DG.Geocoder.get(query, options);
            }
        };
    });
})();