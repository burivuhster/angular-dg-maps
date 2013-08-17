[Angular 2GIS Maps](http://burivuhster.github.io/angular-dg-maps)
===============

Angular-dg-maps is a set of directives that enables seamless integration of [2GIS Maps API](http://api.2gis.ru/doc/maps/info/) into your [AngularJS](https://github.com/angular/angular.js) app.

Check out docs here: http://burivuhster.github.io/angular-dg-maps

Pull-requests are welcome!

# Usage
## Installation
Before using angular-dg-maps you must include the main Angular.js library, the 2GIS library and the angular-dg-maps.js script:
```html
<script type="text/javascript" src="http://maps.api.2gis.ru/1.0"></script>
<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.0.6/angular.min.js"></script>
<script src="/path/to/angular-dg-maps.js"></script>
<script src="/path/to/your-angular-controller.js"></script>
```

Another way is to use [Bower](http://bower.io):
```
bower install angular-dg-maps
```

Than you will be able to include angular-dg-maps like this:
```html
<script type="text/javascript" src="http://maps.api.2gis.ru/1.0"></script>
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/angular-dg-maps/build/angular-dg-maps.min.js"></script>
<script src="/path/to/your-angular-controller.js"></script>
```

## Dependency
You will need to make your application's module depend on the `dg-maps` module:
```javascript
var app = angular.module("myApp", ["dg-maps"]);
```

## Controller
Next, inside your controller, you'll need to define some properties required for the directive to work:
```javascript
angular.extend($scope, {
    lat: 55.028936234826, // initial map center latitude
    lon: 82.927810142519, // initial map center longitude
    zoom: 15,   // the zoom level
    marks: [{   
        longitude: 37.64272,
        latitude: 55.7368,
        hint: "hm, 99"
    }];
});
```

## Map
Now, include the `<dg-map>` element in your template:
```html
<dg-map 
        latitude="lat" 
        longitude="lon" 
        zoom="zoom" 
        markers="marks" 
        style="height: 500px; width: 500px;"></dg-map>
```

## Markers
You can put markers on your map by adding `<dg-marker>` elements as children of `<dg-map>` element:
```html
<dg-map latitude="lat" longitude="lon" zoom="zoom" style="height: 500px; width: 500px;">
    <dg-marker 
        ng-repeat="marker in markers" 
        latitude="marker.latitude" 
        longitude="marker.longitude" 
        hint="marker.hint"></dg-marker>
</dg-map>
```

## Static Maps API
You can also use [Static 2GIS Maps API](http://api.2gis.ru/doc/maps/static/) in your angular application.
To insert static map into your page simply include the `dg-static-map` element in your template:
```html
<dg-static-map
        latitude="55.058883"
        longitude="82.911182"
        zoom="15"
        width="500"
        markers="[[37.64272,55.7368,99],[37.632618,55.7361]]"
        height="500"></dg-static-map>
```
Please note, all attributes above are required.

## Static map markers
Use `dg-static-marker` elements to add markers on your static map:
```html
<dg-static-map
        latitude="staticLat"
        longitude="staticLon"
        zoom="staticZoom"
        width="500"
        height="500">
        <dg-static-marker latitude="55.7368" longitude="37.64272"></dg-static-marker>
        <dg-static-marker latitude="55.7361" longitude="37.632618" hint="10"></dg-static-marker>
</dg-static-map>
```
