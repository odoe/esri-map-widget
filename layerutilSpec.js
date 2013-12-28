/*global define, describe, it, expect, beforeEach, afterEach, sinon*/
define([
  'widgets/map/layerutil',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/ArcGISImageServiceLayer',
  'esri/layers/FeatureLayer'
], function(
  layerUtil,
  ArcGISDynamicMapServiceLayer,
  ArcGISTiledMapServiceLayer,
  ArcGISImageServiceLayer,
  FeatureLayer
) {
  'use strict';

  describe(
    'widgets/map/layerutil',
    function() {

      var dynamic, feature, tiled, image;

      dynamic = {
        type: 'dynamic',
        url: 'http://test/mapserver/test',
        title: 'DynamicLayer',
        id: 'DynamicLayer'
      };

      feature = {
        type: 'feature',
        url: 'http://test/featureserver/test/1',
        title: 'FeatureLayer',
        id: 'FeatureLayer',
        drawingInfo: {
          renderer: {
            type: 'simple'
          }
        }
      };

      tiled = {
        type: 'tiled',
        url: 'http//test/mapserver/test',
        title: 'TiledLayer',
        id: 'TiledLayer'
      };

      image = {
        url: 'http://test/imageserver/test',
        title: 'ImageService',
        id: 'ImageService'
      };

      beforeEach(function() {
        sinon.spy(FeatureLayer.prototype, 'setRenderer');
      });

      afterEach(function() {
        FeatureLayer.prototype.setRenderer.restore();
      });

      describe(
          '#loadLayers',
          function() {

            it(
              'will return an empty array given no arguments',
              function() {
                var layers = layerUtil.loadLayers();
                expect(layers).to.eql([]);
              }
            );

            it(
              'will load a dynamic layer',
              function() {
                var layers = layerUtil.loadLayers([dynamic]);
                expect(layers.length).to.eql(1);
                expect(layers[0].title).to.eql(dynamic.title);
                expect(layers[0]).to.be.an(ArcGISDynamicMapServiceLayer);
              }
            );

            it(
              'will load a tiled layer',
              function() {
                var layers = layerUtil.loadLayers([tiled]);
                expect(layers.length).to.eql(1);
                expect(layers[0].title).to.eql(tiled.title);
                expect(layers[0]).to.be.an(ArcGISTiledMapServiceLayer);
              }
            );

            it(
              'will load an image layer',
              function() {
                var layers = layerUtil.loadLayers([image]);
                expect(layers.length).to.eql(1);
                expect(layers[0]).to.be.an(ArcGISImageServiceLayer);
              }
            );

            it(
              'will load a feature layer',
              function() {
                var layers = layerUtil.loadLayers([feature]);
                expect(layers.length).to.eql(1);
                expect(layers[0]).to.be.an(FeatureLayer);
                expect(FeatureLayer.prototype.setRenderer.calledOnce).to.be.ok();
              }
            );

            it(
              'will load multiple layers',
              function() {
                var layers = layerUtil.loadLayers(
                  [dynamic, tiled, feature, image]
                );
                expect(layers.length).to.eql(4);
                expect(layers[0]).to.be.an(ArcGISDynamicMapServiceLayer);
                expect(layers[1]).to.be.an(ArcGISTiledMapServiceLayer);
                expect(layers[2]).to.be.a(FeatureLayer);
                expect(layers[3]).to.be.an(ArcGISImageServiceLayer);
              }
            );

            it(
              'will return a null value for unsupported layers',
              function() {
                var layers = layerUtil.loadLayers([{ url: 'test'  }]);
                expect(layers.length).to.eql(1);
                expect(layers[0]).not.to.be.ok();
              }
            );

          }
      );

    });

});

