/*global define, describe, it, expect, beforeEach, afterEach, sinon*/
define([
  'esri/map',
  'esri/tasks/PrintTask',
  'widgets/map/converter',
  'widgets/map/layerutil'
], function(
  Map,
  PrintTask,
  converter, layerUtil
) {
  'use strict';

  describe(
    'widgets/map/converter',
    function() {

      var options = {
        mapOptions: {}
      };

      var mapDiv = document.createElement('div');
      mapDiv.id = 'map';

      beforeEach(function() {
        document.body.appendChild(mapDiv);
        sinon.stub(layerUtil, 'loadLayers').returns([1,2,3]);
        sinon.stub(PrintTask.prototype, '_getPrintDefinition');
      });

      afterEach(function() {
        document.body.removeChild(mapDiv);
        layerUtil.loadLayers.restore();
        PrintTask.prototype._getPrintDefinition.restore();
      });

      describe(
        '#toWebMapAsJSON',
        function() {

          it(
            'will use the PrintTask to generate a web map spec json',
            function() {
              converter.toWebMapAsJSON();
              expect(
                PrintTask.prototype._getPrintDefinition.calledOnce
              ).to.be.ok();
            }
          );

        }
      );

      describe(
        '#fromWebMapAsJSON',
        function() {

          it(
            'will generate map from web map spec json',
            function() {
              var data = converter.fromWebMapAsJSON(options);
              expect(data.map).to.be.a(Map);
            }
          );

          it(
            'will return a layers array from web map spec json',
            function() {
              var data = converter.fromWebMapAsJSON(options);
              expect(data.layers).to.eql([1,2,3]);
            }
          );

        }
      );

    });

});

