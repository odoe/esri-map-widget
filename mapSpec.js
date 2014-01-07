/*global define, expect, describe, it, beforeEach, afterEach, sinon*/
/*jshint laxcomma:true*/
define([
  'dojo/on',
  'dojo/topic',
  'widgets/map/converter',
  'widgets/map/map'
], function(
  on, topic,
  converter,
  MapWidget
) {
  'use strict';

  var options = {
    infoWindowSize: {
      width: 100,
      height: 100
    },
    mapOptions: {}
  };

  return describe('widgets/map/map', function() {
    var widget
      , data;

    data = {
      map: {
        addLayers: function(){},
        graphics: {
          clear: function(){}
        },
        infoWindow: {
          resize: function(){}
        }
      }
    };

    beforeEach(function() {
      sinon.stub(converter, 'fromWebMapAsJSON')
      .returns(data);
      sinon.stub(on, 'once');
      sinon.stub(data.map, 'addLayers');
      sinon.stub(data.map.graphics, 'clear');
      sinon.stub(data.map.infoWindow, 'resize');

      widget = new MapWidget(options);
      widget.postCreate();
      widget.startup();
      widget._init();
    });

    afterEach(function() {
      converter.fromWebMapAsJSON.restore();
      on.once.restore();
      data.map.addLayers.restore();
      data.map.graphics.clear.restore();
      data.map.infoWindow.resize.restore();
      widget.destroy();
    });

    it('is valid when created', function() {
      expect(widget).to.be.ok();
    });

    it(
      'has options passed to it',
      function() {
        expect(widget.options).to.eql(options);
      }
    );

    describe(
      '#startup',
      function() {
        it(
          'will call converter on startup',
          function() {
            expect(converter.fromWebMapAsJSON.called).to.be.ok();
          }
        );
        it(
          'will set the data map to widget map',
          function() {
            expect(widget.get('map')).to.eql(data.map);
          }
        );
        it(
            'will resize infoWindow when size provided in options',
            function() {
              expect(data.map.infoWindow.resize.called).to.be.ok();
            }
          );
        it(
          'will listen for the map to add layers',
          function() {
            expect(on.once.called).to.be.ok();
            expect(data.map.addLayers.called).to.be.ok();
          }
        );

      }
    );

    describe(
      '#_init',
      function() {

        it(
          'will load the widget when done',
          function() {
            expect(widget.loaded).to.be.ok();
          }
        );

        it(
          'will emit parameters when loaded',
          function(done) {
            on(widget, 'map-ready', function(params) {
              expect(params).to.be.ok();
              expect(params.map).to.eql(data.map);
              done();
            });
            widget.startup();
            widget._init();
          }
        );

      }
    );

    describe(
      '#_clear',
      function() {

        it(
          'will clear graphics when topic publishes request',
          function() {
            topic.publish('map-clear', {});
            expect(data.map.graphics.clear.called).to.be.ok();
          }
        );

      }
    );

  });

});
