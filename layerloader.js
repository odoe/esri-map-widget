/*global define*/
/* jshint indent:false */
// TODO - add loaders for other maptypes
define([
  'dojo/_base/array',
  'esri/lang',
  'esri/SpatialReference',
  'esri/layers/FeatureLayer',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/ArcGISImageServiceLayer',
  'esri/renderers/jsonUtils'
], function(
  arrayUtil,
  esriLang,
  SpatialReference,
  FeatureLayer, ArcGISDynamicMapServiceLayer,
  ArcGISTiledMapServiceLayer, ArcGISImageServiceLayer,
  jsonUtils
) {
  'use strict';

  /**
   * Private function to create a Dynamic Layer from config file
   * @param {Object} Layer options from config
   * @return {ArcGISDynamicMapServiceLayer} Dynamic Map Service Layer for map
   */
  function dynamicLoader(lyr) {
    var dlyr = new ArcGISDynamicMapServiceLayer(lyr.url, lyr);
    dlyr.title = lyr.title;
    dlyr.setVisibleLayers(lyr.visibleLayers);
    return dlyr;
  }

  function tiledLoader(lyr) {
    var tlyr = new ArcGISTiledMapServiceLayer(lyr.url, lyr);
    tlyr.title = lyr.title;
    return tlyr;
  }

  /**
   * Private function to create a Dynamic Layer from config file
   * @param {Object} Layer options from config
   * @return {ArcGISImageServiceLaye} Image Map Service Layer for map
   */
  function imageLoader(lyr) {
    if (esriLang.isDefined(lyr.spatialReference)) {
      lyr.spatialReference = new SpatialReference(lyr.spatialReference);
    }
    return new ArcGISImageServiceLayer(lyr.url, lyr);
  }

  /**
   * Private function to create a FeatureLayer from config file
   * @param {Object} Layer options from config
   * @return {FeatureLayer} Feature Layer for map
   */
  function featureLoader(lyr) {
    if (lyr.drawingInfo) {
      return renderFeature(lyr, jsonUtils.fromJson(lyr.drawingInfo.renderer));
    }
    return new FeatureLayer(lyr.url, lyr);
  }

  function renderFeature(lyr, renderer, selectionSymbol) {
    var flyr = new FeatureLayer(lyr.url, lyr);
    if (renderer) {
      flyr.setRenderer(renderer);
    }
    if (selectionSymbol) {
      flyr.setSelectionSymbol(selectionSymbol);
    }
    return flyr;
  }

  function parseLayers(lyr) {
    var url = lyr.url.toLowerCase();
    if (url.indexOf('/mapserver') > -1) {
      if (lyr.type !== 'tiled') {
        return dynamicLoader(lyr);
      } else {
        return tiledLoader(lyr);
      }
    }

    if (url.indexOf('/featureserver') > -1) {
      return featureLoader(lyr);
    }

    if (url.indexOf('/imageserver') > -1) {
      return imageLoader(lyr);
    }
    console.warn(['ERROR - Layer type not currently supported for: ', lyr.url].join(' '));
    return null;
  }

  /**
   * The purpose of this function is to parse config layers to map layers
   * @param {Array} layers
   * @return {Object} object
   */
  function loadLayers(layers) {
    return arrayUtil.map(layers, function(lyr) {
        return parseLayers(lyr);
    });
  }

  return loadLayers;

});

