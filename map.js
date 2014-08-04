/*global define */
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/unload',
  'dojo/topic',
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/dom-construct',
  'dojo/json',
  // dijit stuff
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'widgets/map/converter'
], function(
  declare, lang, arrayUtil, baseUnload,
  topic, on, Evented, Deferred,
  domConstruct, dojoJson,
  _WidgetBase, _TemplatedMixin,
  converter
) {
  'use strict';

  function head(t) {
    return t[0];
  }

  function supports_local_storage() {
    var test = 'has_local';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

  return declare([_WidgetBase, _TemplatedMixin, Evented], {

    options: {},

    templateString: '<div id="container-main"></div>',

    constructor: function(options) {
      this.options = options || {};
      if (options.webmap) {
        this.operationalLayers = options.webmap.itemData.operationalLayers;
        this.layerIds = arrayUtil.map(this.operationalLayers, function(lyr) {
          return lyr.id;
        }, this);
      }
    },

    postCreate: function() {
      domConstruct.place(this.domNode, document.body);
      this.own(
        topic.subscribe('map-clear', lang.hitch(this, '_clear'))
      );
    },

    startup: function() {
      var data = converter.fromWebMapAsJSON(
        this.options
      ).then(lang.hitch(this, '_mapCreated'), lang.hitch(this, function(err) {
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
        ).then(lang.hitch(this, '_mapCreated'));
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
      arrayUtil.forEach(map.layerIds, function(id) {
        var layer, opLayer;
        layer = map.getLayer(id);
        opLayer = this._findLayerById(id);
        if (opLayer) {
          layer.title = opLayer.title;
        }
      }, this);
      this._init();
    },

    _findLayerById: function(id) {
      return head(arrayUtil.filter(this.operationalLayers, function(lyr) {
        return lyr.id === id;
      }, this));
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
      if (this.options.saveLocationOnUnload && supports_local_storage()) {
        var vals, data, iOS, handler;
        vals = localStorage.getItem(location.href + '--location');
        if (vals) {
          data = dojoJson.parse(vals);
          this.get('map').centerAndZoom(data.center, data.zoom);
        }
        // handle this bug https://bugs.webkit.org/show_bug.cgi?id=19324
        // In my testing, a refresh of the browser in iOS will not fire
        // window.onbeforeunload, so if iOS, use map event to write
        // zoom and center to localStorage
        iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        handler = lang.hitch(this, '_onUnload');
        if (!iOS) {
          baseUnload.addOnUnload(handler);
        } else {
          this.own(
            on(this.get('map'), 'extent-change', lang.hitch(handler))
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

