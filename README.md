leaflet-osm is a [Leaflet](http://leaflet.cloudmade.com/) plugin for rendering
tile and vector data from openstreetmap.org.

For example, the openstreetmap.org website could use it to highlight a particular
[way](http://www.openstreetmap.org/?way=52477381) or [node](http://www.openstreetmap.org/?node=164979149)
on the base map.

## Usage Examples

### Tile Layers

```
new L.OSM.Mapnik().addTo(map);
// or L.OSM.CycleMap, L.OSM.TransportMap, or L.OSM.MapQuestOpen
```

### Data Layer

```
$.ajax({
  url: "http://www.openstreetmap.org/api/0.6/node/164979149",
  // or "http://www.openstreetmap.org/api/0.6/way/52477381/full"
  dataType: "xml",
  success: function (xml) {
    var layer = new L.OSM.DataLayer(xml).addTo(map);
    map.fitBounds(layer.getBounds());
  }
});
```

## Contributing

leaflet-osm is tested with node.js using [mocha](http://visionmedia.github.com/mocha/) and [chai](http://chaijs.com/):

```
$ npm install -g mocha
$ npm install
$ mocha
```

## License

Copyright 2012 John Firebaugh

BSD License (see the BSD-LICENSE file)

Portions derived from [OpenLayers](https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Format/OSM.js).
See BSD-LICENSE for details.
