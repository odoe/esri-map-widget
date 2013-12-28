/*global define, describe, it, expect, beforeEach, afterEach, sinon*/
define([
  'esri/map',
  'esri/tasks/PrintTask',
  'widgets/map/converter'
], function(
  Map,
  PrintTask,
  converter
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
        sinon.stub(Map.prototype, 'constructor');
        sinon.stub(PrintTask.prototype, '_getPrintDefinition');
      });

      afterEach(function() {
        document.body.removeChild(mapDiv);
        Map.prototype.constructor.restore();
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
                PrintTask.prototype._getPrintDefinition.called
              ).to.be.ok();
            }
          );

        }
      );

      describe(
        '#fromWebMapAsJSON',
        function() {

          it(
            'will generate map and layers from web map spec json',
            function() {
              converter.fromWebMapAsJSON(options);
              expect(Map.prototype.constructor).to.be.ok();
            }
          );

        }
      );

    });

});

