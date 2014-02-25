/*global define */
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/dom',
  'dojo/dom-construct',
  // dijit stuff
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'widgets/map/converter'
], function(
  declare, lang,
  topic, on, Evented, Deferred,
  dom, domConstruct,
  _WidgetBase, _TemplatedMixin,
  converter
) {
  'use strict';

  return declare([_WidgetBase, _TemplatedMixin, Evented], {

    options: {},

    templateString: '<div id="container-main"><div id="map"></div></div>',

    constructor: function(options) {
      this.options = options || {};
      this.mapOptions = this.options.mapOptions || {};
    },

    postCreate: function() {
      var elem;
      if (this.options.target) {
        elem = dom.byId(this.options.target);
      } else {
        elem = document.body;
      }
      domConstruct.place(this.domNode, elem);
      this.own(
        topic.subscribe('map-clear', lang.hitch(this, '_clear'))
      );
    },

    startup: function() {
      var data = converter.fromWebMapAsJSON(this.options);

      // initialize the map
      this.set('map', data.map);

      if (this.options.infoWindowSize) {
        var w, h;
        w = this.options.infoWindowSize.width;
        h = this.options.infoWindowSize.height;
        this.map.infoWindow.resize(w, h);
      }

      this.own(
        on.once(this.get('map'), 'layers-add-result',
                lang.hitch(this, '_layersAddedHandler'))
      );
      this.map.addLayers(data.layers);
    },

    // private methods
    _layersAddedHandler: function() {
      this._init();
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
