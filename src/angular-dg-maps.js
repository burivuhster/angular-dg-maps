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
                this.addMarker = function(marker, tries){
                    this._markers.push(marker);
                    
                    tries = tries || 1;
                    
                    if (!$scope.map && tries < 5) {
                        return $timeout(
                                (function (self, marker, tries) {
                                    return function ()
                                    {
                                        self.addMarker(marker, tries);
                                    };
                                })(this, marker, tries++),
                                500
                                );
                    }

                    // If map is already initialized
                    if($scope.map) {
                        marker.addTo($scope.map);
                    }
                };

                /**
                 * Remove marker from map
                 * @param {DG.Marker} marker
                 */
                this.removeMarker = function(marker) {
                    if($scope.map) {
                        marker.removeFrom($scope.map);
                    }
                    
                    var index = this._markers.indexOf(marker);
                    if(index !== -1){
                        return this._markers.splice(i, 1);
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
                
                DG.then(function () {
                    
                    var mapParams = {
                        zoom: scope.zoom,
                        fullscreenControl:false,
                        zoomControl:false
                    };
                    
                    // Set map center and zoom
                    if (angular.isDefined(scope.latitude) && angular.isDefined(scope.longitude)) {
                        angular.extend(mapParams, {center:[scope.latitude, scope.longitude]});
                    }
                    
                    if(angular.isDefined(scope.draggable) && !scope.draggable) {
                        angular.extend(mapParams, {dragging:false});
                    }
                    
                    if(angular.isDefined(scope.geoclicker)){
                        angular.extend(mapParams, {geoclicker:scope.geoclicker});
                    }
                    
                    // Create DG Map object
                    var _m = new DG.map(innerMapEl.attr('id'), mapParams),
                    // Create DG Controls
                        _zoomControll       = new DG.Control.Zoom(),
                        _fullscreenControll = new DG.Control.Fullscreen();
                    
                    if (!angular.isDefined(scope.zoomControls) || scope.zoomControls) {
                        _zoomControll.addTo(_m);
                    }
                    
                    if (!angular.isDefined(scope.fullscreenControls) || scope.fullscreenControls) {
                        _fullscreenControll.addTo(_m);
                    }
                    
                    var dragging = false;

                    // Put the map into the scope
                    scope.map = _m;

                    // Update map when center coordinates change
                    scope.$watch("latitude", function(newValue, oldValue) {
                        if (newValue === oldValue || dragging) {
                            return;
                        }

                        _m.panTo([newValue, scope.longitude]);
                    }, true);

                    scope.$watch("longitude", function(newValue, oldValue) {
                        if (newValue === oldValue || dragging) {
                            return;
                        }

                        _m.panTo([scope.latitude, newValue]);
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
                        if (newValue === oldValue) {
                            return;
                        }

                        if (newValue) {
                            _zoomControll.addTo(_m);
                        } else {
                            _zoomControll.removeFrom(_m);
                        }
                    });

                    // Update fulscreen control visibility when model changes
                    scope.$watch('fullscreenControls', function(newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }

                        if (newValue) {
                            _fullscreenControll.addTo(_m);
                        } else {
                            _fullscreenControll.removeFrom(_m);
                        }
                    });

//                    scope.$watch('markers', function(markers) {
//                        if(dragging) {
//                            return;
//                        }
//
//                        if(markers) {
//                            _m.markers.removeAll();
//                            angular.forEach(scope.markers, function(markerConfig) {
//                                scope.addMarker(markerConfig);
//                            });
//
//                            if(scope.fitToMarkers) {
//                                var markersBounds = _m.markers.getBounds();
//                                _m.setBounds(markersBounds);
//                            }
//                        }
//                    }, true);

                    // Update model properties on map events
                    _m.on('zoomend', function(evt){
                        if (!$rootScope.$root.$$phase) {
                            scope.$apply(function() {
                                scope.zoom = evt.target.getZoom();
                            });
                        } else {
                            scope.zoom = evt.target.getZoom();
                        }
                    });

                    _m.on('drag', function(evt) {
                        var pos = evt.target.getCenter();
                        if(pos) {
                            if (!$rootScope.$root.$$phase) {
                                scope.$apply(function() {
                                    scope.latitude = pos.lat;
                                    scope.longitude = pos.lng;
                                });
                            } else {
                                scope.latitude = pos.lat;
                                scope.longitude = pos.lng;
                            }
                        }
                    });

                    _m.on('dragstart', function() {
                        dragging = true;
                    });

                    _m.on('dragend', function() {
                        dragging = false;
                    });
                    
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
                draggable: '=',
                dgClick: '&ngClick',
                alt: '=',
                show: '=',
                hint: '=',
                icon: "=",
                dragStop: '&',
                dragStart: '&'
            },
            link: function(scope, element, attrs, dgMapCtrl) {
                
                var markerConfig = {
                    draggable: !!attrs.draggable,
                    title: attrs.hint
                };

                if (angular.isDefined(scope.alt)) {
                    angular.extend(markerConfig, {alt: scope.alt});
                }

                var marker = new DG.marker([scope.lat, scope.lon], markerConfig);

                if (angular.isDefined(scope.popup) && scope.popup) {
                    marker.bindPopup(scope.popup);
                }
                
                if(angular.isDefined(attrs.ngClick)) {
                    marker.on('click', function(evt){
                        var cb = scope.dgClick || angular.noop;
                        cb(evt);
                    });
                }

                marker.on('dragstart', function (evt) {
                    var pos = marker.getLatLng();
                    
                    scope.$apply(function() {
                        scope.lat  = pos.lat;
                        scope.lon = pos.lng;
                    });
                    
                    var cb = scope.dragStart || angular.noop;
                    cb.call(marker, evt);
                });

                marker.on('dragend', function (evt) {
                    var pos = marker.getLatLng();
                    
                    scope.$apply(function() {
                        scope.lat  = pos.lat;
                        scope.lon = pos.lng;
                    });
                    
                    var cb = scope.dragStop || angular.noop;
                    cb.call(marker, evt);
                });

                if(attrs.iconSrc) {
                    if(angular.isDefined(attrs.iconWidth) && angular.isDefined(attrs.iconHeight)) {
                        var icon = new DG.Icon({
                            iconUrl: attrs.iconSrc,
                            iconSize: [
                                parseInt(attrs.iconWidth, 10), 
                                parseInt(attrs.iconHeight, 10)
                            ]
                        });
                        marker.setIcon(icon);
                    } else {
                        $log.error("angular-dg-marker: icon width and height should be specified");
                    }
                }

                dgMapCtrl.addMarker(marker);

                // Watch for marker's position on scope and update DG.Marker when needed
                scope.$watch('lon', function(lon) {
                    if(!angular.isDefined(lon)) {
                        return;
                    }
                    
                    var pos = marker.getLatLng();
                    pos.lng = lon;
                    marker.setLatLng(pos);
                });

                scope.$watch('lat', function(lat) {
                    if(!angular.isDefined(lat)) {
                        return;
                    }

                    var pos = marker.getLatLng();
                    pos.lat = lat;
                    marker.setLatLng(pos);
                });

                scope.$watch('hint', function(hint) {
                    if(!angular.isDefined(hint)) {
                        return;
                    }

                    marker.bindLabel(hint);
                });

                scope.$watch('draggable', function(draggable) {
                    if(!angular.isDefined(draggable)) {
                        return;
                    }

                    if(marker.dragging){
                        marker.dragging[(draggable ? 'enable' : 'disable')]();
                    }

                });

                element.bind('$destroy', function() {
                    dgMapCtrl.removeMarker(marker);
                });
            }
        };
    }]);

    dgMapsModule.service('geocoder', function() {
        return {
            get: function(data, success, error) {
                angular.extend(data, {type: 'geo'});
                DG.ajax('//catalog.api.2gis.ru/2.0/search', {
                    data: data,
                    success: (success || angular.noop),
                    error: (error || angular.noop)
                });
            }
        };
    });
})();