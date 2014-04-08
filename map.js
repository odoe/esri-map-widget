/*global define */
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/topic',
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/dom-construct',
  // dijit stuff
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'widgets/map/converter'
], function(
  declare, lang, arrayUtil,
  topic, on, Evented, Deferred,
  domConstruct,
  _WidgetBase, _TemplatedMixin,
  converter
) {
  'use strict';

  function head(t) {
    return t[0];
  }

  return declare([_WidgetBase, _TemplatedMixin, Evented], {

    options: {},

    templateString: '<div id="container-main"></div></div>',

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
      ).then(lang.hitch(this, '_mapCreated'));
    },

    // private methods
    _mapCreated: function(response) {
        this.set('map', response.map);
        // need to set titles for layers
        var map = this.get('map');
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

    _init: function() {
      this.set('loaded', true);
      var params = {
        map: this.get('map'),
        config: this.options
      };
      this.emit('map-ready', params);
    }

  });

});

