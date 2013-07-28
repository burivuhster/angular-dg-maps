[Angular 2GIS Maps](http://burivuhster.github.io/angular-dg-maps)
===============

Angular-dg-maps is a set of directives that enables seamless integration of [2GIS Maps API](http://api.2gis.ru/doc/maps/info/) into your [AngularJS](https://github.com/angular/angular.js) app.

Check out docs here: http://burivuhster.github.io/angular-dg-maps

Pull-requests are welcome!

# Usage
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

You will need to make your application's module depend on the `dg-maps` module:
```javascript
var app = angular.module("myApp", ["dg-maps"]);
```

Next, inside your controller, you'll need to define some properties required for the directive to work:
```javascript
angular.extend($scope, {
    lat: 55.028936234826, // initial map center latitude
    lon: 82.927810142519, // initial map center longitude
    zoom: 15 // the zoom level
});
```

Now, include the `<dg-map>` element in your template:
```html
<dg-map 
        latitude="lat" 
        longitude="lon" 
        zoom="zoom" 
        style="height: 500px; width: 500px;"></dg-map>
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
        height="500"></dg-static-map>
```
Please note, all attributes above are required.
