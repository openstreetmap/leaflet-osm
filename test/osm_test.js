require('jsdom-global')()

var chai  = require('chai'),
    jsdom = require("jsdom"),
    dom = new jsdom.JSDOM;

global.window    = dom.window;
global.document  = window.document;
global.navigator = window.navigator;
global.Document  = window.Document;

L = require('leaflet');
require('..');

chai.should();

describe("L.OSM.Mapnik", function () {
  it("has the appropriate URL", function () {
    new L.OSM.Mapnik()._url.should.eq('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});

describe("L.OSM.CyclOSM", function () {
  it("has the appropriate URL", function () {
    new L.OSM.CyclOSM()._url.should.eq('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.CyclOSM().getAttribution().should.contain('France');
  });
});

describe("L.OSM.CycleMap", function () {
  it("has the appropriate URL", function () {
    new L.OSM.CycleMap()._url.should.eq('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey={apikey}');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.CycleMap().getAttribution().should.contain('Andy Allan');
  });
});

describe("L.OSM.TransportMap", function () {
  it("has the appropriate URL", function () {
    new L.OSM.TransportMap()._url.should.eq('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey={apikey}');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.TransportMap().getAttribution().should.contain('Andy Allan');
  });
});

describe("L.OSM.OPNVKarte", function () {
  it("has the appropriate URL", function () {
    new L.OSM.OPNVKarte()._url.should.eq('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.OPNVKarte().getAttribution().should.contain('MeMoMaps');
  });
});

describe("L.OSM.TracestrackTopo", function () {
  it("has the appropriate URL", function () {
    new L.OSM.TracestrackTopo()._url.should.eq('https://tile.tracestrack.com/topo__/{z}/{x}/{y}.webp?key={apikey}');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.TracestrackTopo().getAttribution().should.contain('Tracestrack');
  });
});

[ "xml", "json"].forEach(format => {

  describe(`L.OSM.DataLayer (${format})`, function () {
    function fixture(name) {
      var fs = require("fs");
      var contents = fs.readFileSync(__dirname + "/fixtures/" + name + "." + format, "utf8");
      if (format === "xml") {
        const parser = new window.DOMParser();
        return parser.parseFromString(contents, "text/xml");
      }
      else
      {
        return JSON.parse(contents);
      }
    }

    function layers(layerGroup) {
      var layers = [];
      layerGroup.eachLayer(function (layer) {
        layers.push(layer);
      });
      return layers;
    }

    beforeEach(function () {
      this.map = L.map(document.createElement("div"));
    });

    it("is can be added to the map", function () {
      (new L.OSM.DataLayer()).addTo(this.map);
    });

    it("creates a Polyline for a way", function () {
      var osm = new L.OSM.DataLayer(fixture("way"));
      layers(osm).length.should.eq(1);
      layers(osm)[0].should.be.an.instanceof(L.Polyline);
    });

    it("creates a Polygon for an area", function () {
      var osm = new L.OSM.DataLayer(fixture("area"));
      layers(osm).length.should.eq(1);
      layers(osm)[0].should.be.an.instanceof(L.Polygon);
    });

    it("creates a CircleMarker for an interesting node", function () {
      var osm = new L.OSM.DataLayer(fixture("node"));
      layers(osm).length.should.eq(1);
      layers(osm)[0].should.be.an.instanceof(L.CircleMarker);
    });

    it("creates a Rectangle for a changeset", function () {
      var osm = new L.OSM.DataLayer(fixture("changeset"));
      layers(osm).length.should.eq(1);
      layers(osm)[0].should.be.an.instanceof(L.Rectangle);
    });

    it("sets the feature property on a layer", function () {
      var osm = new L.OSM.DataLayer(fixture("node"));
      layers(osm)[0].feature.should.have.property("type", "node");
      layers(osm)[0].feature.should.have.property("id", "356552551");
    });

    it("sets a way's style", function () {
      var osm = new L.OSM.DataLayer(fixture("way"), {styles: {way: {color: "red"}}});
      layers(osm)[0].options.should.have.property("color", "red");
    });

    it("sets an area's style", function () {
      var osm = new L.OSM.DataLayer(fixture("area"), {styles: {area: {color: "green"}}});
      layers(osm)[0].options.should.have.property("color", "green");
    });

    it("sets a node's style", function () {
      var osm = new L.OSM.DataLayer(fixture("node"), {styles: {node: {color: "blue"}}});
      layers(osm)[0].options.should.have.property("color", "blue");
    });

    describe("asynchronously", function() {
      function sleep(time = 0) {
        return new Promise(res => {
          setTimeout(() => res(), time);
        });
      }

      it("can be added to the map", function () {
        (new L.OSM.DataLayer(null, {asynchronous: true})).addTo(this.map);
      });

      it("creates a Polyline for a way", async function () {
        var osm = new L.OSM.DataLayer(fixture("way"), {asynchronous: true});
        await sleep(1);
        layers(osm).length.should.eq(1);
        layers(osm)[0].should.be.an.instanceof(L.Polyline);
      });

      it("creates a Polygon for an area", async function () {
        var osm = new L.OSM.DataLayer(fixture("area"), {asynchronous: true});
        await sleep(1);
        layers(osm).length.should.eq(1);
        layers(osm)[0].should.be.an.instanceof(L.Polygon);
      });

      it("creates a CircleMarker for an interesting node", async function () {
        var osm = new L.OSM.DataLayer(fixture("node"), {asynchronous: true});
        await sleep(1);
        layers(osm).length.should.eq(1);
        layers(osm)[0].should.be.an.instanceof(L.CircleMarker);
      });

      it("creates a Rectangle for a changeset", async function () {
        var osm = new L.OSM.DataLayer(fixture("changeset"), {asynchronous: true});
        await sleep(1);
        layers(osm).length.should.eq(1);
        layers(osm)[0].should.be.an.instanceof(L.Rectangle);
      });

      it("sets the feature property on a layer", async function () {
        var osm = new L.OSM.DataLayer(fixture("node"), {asynchronous: true});
        await sleep(1);
        layers(osm)[0].feature.should.have.property("type", "node");
        layers(osm)[0].feature.should.have.property("id", "356552551");
      });

      it("sets a way's style", async function () {
        var osm = new L.OSM.DataLayer(fixture("way"), {styles: {way: {color: "red"}}, asynchronous: true});
        await sleep(1);
        layers(osm)[0].options.should.have.property("color", "red");
      });

      it("sets an area's style", async function () {
        var osm = new L.OSM.DataLayer(fixture("area"), {styles: {area: {color: "green"}}, asynchronous: true});
        await sleep(1);
        layers(osm)[0].options.should.have.property("color", "green");
      });

      it("sets a node's style", async function () {
        var osm = new L.OSM.DataLayer(fixture("node"), {styles: {node: {color: "blue"}}, asynchronous: true});
        await sleep(1);
        layers(osm)[0].options.should.have.property("color", "blue");
      });
    });

    describe("#buildFeatures", function () {
      it("builds a node object", function () {
        var features = new L.OSM.DataLayer().buildFeatures(fixture("node"));
        features.length.should.eq(1);
        features[0].type.should.eq("node");
      });

      it("builds a way object", function () {
        var features = new L.OSM.DataLayer().buildFeatures(fixture("way"));
        features.length.should.eq(1);
        features[0].type.should.eq("way");
      });
    });

    describe("#interestingNode", function () {
      var layer = new L.OSM.DataLayer();

      it("returns true when the node is not in any ways", function () {
        layer.interestingNode({id: 1}, {}, {}).should.be.true;
      });

      it("returns true when the node has an interesting tag", function () {
        var node = {id: 1, tags: {interesting: true}};
        layer.interestingNode(node, {1: true}, {1: true}).should.be.true;
      });

      it("returns false when the node is used in a way and has uninteresting tags", function () {
        var node = {id: 1, tags: {source: 'who cares?'}};
        layer.interestingNode(node, {1: true}, {}).should.be.false;
      });

      it("returns true when the node is used in a way and is used in a relation", function () {
        var node = {id: 1};
        layer.interestingNode(node, {1: true}, {1: true}).should.be.true;
      });
    });
  });
});