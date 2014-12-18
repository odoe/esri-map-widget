define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/unload',
  'dojo/topic',
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/dom-construct',
  'dojo/json',

  'dojox/lang/functional/curry',
  // dijit stuff
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'widgets/map/converter'
], function(
  declare, lang, baseUnload,
  topic, on, Evented, Deferred,
  domConstruct, dojoJson,
  curry,
  _WidgetBase, _TemplatedMixin,
  converter
) {
  'use strict';

  var hitch = lang.hitch;

  var findLayerById = curry(function(arr, id) {
    return arr.filter(function(x) {
      return x.id === id;
    }).shift();
  });

  function supportsLocalStorage() {
    var test = 'has_local';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  return declare([_WidgetBase, _TemplatedMixin, Evented], {

    templateString: '<div id="container-main"></div>',

    constructor: function(options) {
      this.options = options || {};
      if (options.webmap) {
        this.operationalLayers = options.webmap.itemData.operationalLayers;
        this.layerIds = this.operationalLayers.map(function(lyr) {
          return lyr.id;
        });
      }
    },

    postCreate: function() {
      domConstruct.place(this.domNode, document.body);
      this.own(
        topic.subscribe('map-clear', hitch(this, '_clear'))
      );
    },

    startup: function() {
      converter.fromWebMapAsJSON(
        this.options
      ).then(hitch(this, '_mapCreated'), hitch(this, function(err) {
        // TODO - figure out how to tell what kind of error occured and fix it
        /*
           this.options.webmap.itemData.baseMap.baseMapLayers[0] = {
           "url": "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
           "opacity": 1,
           "visibility": true,
           "visibleLayer": [0],
           "title": "Topo Basemap"
           };
           converter.fromWebMapAsJSON(
           this.options
           ).then(hitch(this, '_mapCreated'));
           */
      }));
    },

    // private methods
    _mapCreated: function(response) {
      this.set('map', response.map);
      // need to set titles for layers
      var map = this.get('map');
      if (this.options.infoWindowSize) {
        map.infoWindow.resize(this.options.infoWindowSize);
      }
      if (this.options.hideZoomSlider) {
        map.hideZoomSlider();
      }

      var findLayer = findLayerById(this.operationalLayers);

      map.layerIds.map(function(id) {
        var layer = map.getLayer(id);
        var opLayer = findLayer(id);
        if (opLayer) {
          layer.title = opLayer.title;
        }
      });

      this._init();
    },

    _clear: function() {
      this.get('map').graphics.clear();
    },

    _onUnload: function() {
      var data = {
        center: this.get('map').extent.getCenter(),
        zoom: this.get('map').getLevel()
      };
      localStorage.setItem(
        location.href + '--location', dojoJson.stringify(data)
      );
    },

    _init: function() {
      if (this.options.saveLocationOnUnload && supportsLocalStorage()) {
        var vals = localStorage.getItem(location.href + '--location');
        if (vals) {
          var data = dojoJson.parse(vals);
          this.get('map').centerAndZoom(data.center, data.zoom);
        }
        // handle this bug https://bugs.webkit.org/show_bug.cgi?id=19324
        // In my testing, a refresh of the browser in iOS will not fire
        // window.onbeforeunload, so if iOS, use map event to write
        // zoom and center to localStorage
        var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        var handler = hitch(this, '_onUnload');
        if (!iOS) {
          baseUnload.addOnUnload(handler);
        } else {
          this.own(
            on(this.get('map'), 'extent-change', hitch(handler))
          );
        }
      }
      this.set('loaded', true);
      var params = {
        map: this.get('map'),
        config: this.options
      };
      this.emit('map-ready', params);
    }

  });

});
