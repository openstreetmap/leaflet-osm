L.OSM = L.FeatureGroup.extend({
  options: {
    areaTags: ['area', 'building', 'leisure', 'tourism', 'ruins', 'historic', 'landuse', 'military', 'natural', 'sport'],
    uninterestingTags: ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by']
  },

  initialize: function (xml, options) {
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this);

    if (xml) {
      this.addData(xml);
    }
  },

  addData: function (xml) {
    var nodes = L.OSM.getNodes(xml),
         ways = L.OSM.getWays(xml);

    for (var i = 0; i < ways.length; i++) {
      var way = ways[i],
        latLngs = new Array(way.nodes.length);

      for (var j = 0; j < way.nodes.length; j++) {
        latLngs[j] = nodes[way.nodes[j]].latLng;
      }

      if (this.isWayArea(way)) {
        latLngs.pop(); // Remove last == first.
        L.polygon(latLngs).addTo(this);
      } else {
        L.polyline(latLngs).addTo(this);
      }
    }

    for (var node_id in nodes) {
      var node = nodes[node_id];
      if (this.interestingNode(node)) {
        L.circleMarker(node.latLng, {radius: 6}).addTo(this);
      }
    }
  },

  isWayArea: function (way) {
    if (way.nodes[0] != way.nodes[way.nodes.length - 1]) {
      return false;
    }

    for (var key in way.tags) {
      if (~this.options.areaTags.indexOf(key)) {
        return true;
      }
    }

    return false;
  },

  interestingNode: function (node) {
    for (var key in node.tags) {
      if (!~this.options.uninterestingTags.indexOf(key)) {
        return true;
      }
    }

    return false;
  }
});

L.Util.extend(L.OSM, {
  getNodes: function (xml) {
    var result = {};

    var node_list = xml.getElementsByTagName("node");
    for (var i = 0; i < node_list.length; i++) {
      var node = node_list[i];
      result[node.getAttribute("id")] = {
        latLng: L.latLng(node.getAttribute("lat"),
                         node.getAttribute("lon"),
                         true),
        tags: this.getTags(node)
      };
    }

    return result;
  },

  getWays: function (xml) {
    var result = [];

    var way_list = xml.getElementsByTagName("way");
    for (var i = 0; i < way_list.length; i++) {
      var way = way_list[i],
        node_list = way.getElementsByTagName("nd");

      var way_object = {
        id: way.getAttribute("id"),
        nodes: new Array(node_list.length),
        tags: this.getTags(way)
      };

      for (var j = 0; j < node_list.length; j++) {
        way_object.nodes[j] = node_list[j].getAttribute("ref");
      }

      result.push(way_object);
    }

    return result;
  },

  getTags: function (xml) {
    var result = {};

    var tags = xml.getElementsByTagName("tag");
    for (var j = 0; j < tags.length; j++) {
      result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
    }

    return result;
  }
});
