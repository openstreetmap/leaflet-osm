leaflet-osm is a [Leaflet](http://leaflet.cloudmade.com/) plugin for rendering
tile and vector data from openstreetmap.org.

For example, the openstreetmap.org website could use it to highlight a particular
[way](http://www.openstreetmap.org/way/368033990) or [node](http://www.openstreetmap.org/node/5369192667)
on the base map.

## Usage Examples

### Tile Layers

```js
new L.OSM.Mapnik().addTo(map);

// L.OSM.CycleMap and L.OSM.TransportMap require an API key:
// http://www.thunderforest.com/blog/apikeys-now-available/
new L.OSM.CycleMap({apikey: '...'}).addTo(map);
new L.OSM.TransportMap({apikey: '...'}).addTo(map);
```

### Data Layer

```js
$.ajax({
  url: "http://www.openstreetmap.org/api/0.6/node/5369192667",
  // or "http://www.openstreetmap.org/api/0.6/way/368033990/full"
  dataType: "xml",
  success: function (xml) {
    var layer = new L.OSM.DataLayer(xml).addTo(map);
    map.fitBounds(layer.getBounds());
  }
});
```

## Contributing

leaflet-osm is tested with node.js using [mocha](http://mochajs.org/) and [chai](http://chaijs.com/):

```bash
$ npm install
$ npm test
```

## License

Copyright 2012 John Firebaugh

BSD License (see the BSD-LICENSE file)

Portions derived from [OpenLayers](https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Format/OSM.js).
See BSD-LICENSE for details.
