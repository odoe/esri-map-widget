/*global define */
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
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
  declare, lang,
  topic, on, Evented, Deferred,
  domConstruct,
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
      domConstruct.place(this.domNode, document.body);
      this.own(
        topic.subscribe('map-clear', lang.hitch(this, this._clear))
      );
    },

    startup: function() {
      var data = converter.fromWebMapAsJSON(this.options);

      // initialize the map
      this.set('map', data.map);
      on.once(this.get('map'), 'layers-add-result',
              lang.hitch(this, this._layersAddedHandler));
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
