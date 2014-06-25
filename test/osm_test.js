var chai  = require('chai'),
    jsdom = require("jsdom");

global.window    = jsdom.jsdom().createWindow();
global.document  = window.document;
global.navigator = window.navigator;

L = require('leaflet');
require('..');

chai.should();

describe("L.OSM.Mapnik", function () {
  it("has the appropriate URL", function () {
    new L.OSM.Mapnik()._url.should.eq('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
});

describe("L.OSM.CycleMap", function () {
  it("has the appropriate URL", function () {
    new L.OSM.CycleMap()._url.should.eq('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.CycleMap().getAttribution().should.contain('Andy Allan');
  });
});

describe("L.OSM.TransportMap", function () {
  it("has the appropriate URL", function () {
    new L.OSM.TransportMap()._url.should.eq('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.TransportMap().getAttribution().should.contain('Andy Allan');
  });
});

describe("L.OSM.MapQuestOpen", function () {
  it("has the appropriate URL", function () {
    new L.OSM.MapQuestOpen()._url.should.eq('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png');
  });

  it("has the appropriate attribution", function () {
    new L.OSM.MapQuestOpen().getAttribution().should.contain('MapQuest');
  });
});

describe("L.OSM.DataLayer", function () {
  function fixture(name) {
    var fs = require("fs"),
      data = document.createElement("div");
    data.innerHTML = fs.readFileSync(__dirname + "/fixtures/" + name + ".xml");
    return data;
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
      layer.interestingNode({}, [], []).should.be.true;
    });

    it("returns true when the node has an interesting tag", function () {
      var node = {tags: {interesting: true}};
      layer.interestingNode(node, [{nodes: [node]}], []).should.be.true;
    });

    it("returns false when the node is used in a way and has uninteresting tags", function () {
      var node = {tags: {source: 'who cares?'}};
      layer.interestingNode(node, [{nodes: [node]}], []).should.be.false;
    });

    it("returns true when the node is used in a way and is used in a relation", function () {
      var node = {};
      layer.interestingNode(node, [{nodes: [node]}], [{members: [node]}]).should.be.true;
    });
  });
});
