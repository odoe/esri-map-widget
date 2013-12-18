/*global define, expect*/
/*jshint laxcomma:true*/
(function() {
  'use strict';

  define([
    'widgets/map/map'
  ], function(MapWidget) {

    return describe('widgets/map/map', function() {
      var widget;

      beforeEach(function() {
        widget = new MapWidget();
      });

      afterEach(function() {
        widget.destroy();
      });

      it('is valid when created', function() {
        expect(widget).to.be.ok();
      });

    });

  });

})();
