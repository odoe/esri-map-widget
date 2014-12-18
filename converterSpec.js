/*jshint expr:true*/
define([
  'esri/map',
  'esri/tasks/PrintTask',
  'widgets/map/converter',
  'esri/arcgis/utils'
], function(
  Map,
  PrintTask,
  converter,
  arcgisUtils
) {
  'use strict';

   return describe(
    'widgets/map/converter',
    function() {

      var expect = chai.expect;

      var options = {
        webmapid: 999,
        mapOptions: {}
      };

      var mapDiv = document.createElement('div');
      mapDiv.id = 'map';

      beforeEach(function() {
        document.body.appendChild(mapDiv);
        sinon.stub(arcgisUtils, 'createMap').returns({
          then: function() {}
        });
        sinon.stub(PrintTask.prototype, '_getPrintDefinition');
      });

      afterEach(function() {
        document.body.removeChild(mapDiv);
        arcgisUtils.createMap.restore();
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
              ).to.be.ok;
            }
          );

        }
      );

      describe(
        '#fromWebMapAsJSON',
        function() {

          it(
            'will use arcgisUtils to create a map',
            function() {
              converter.fromWebMapAsJSON(options);
              expect(arcgisUtils.createMap.called).to.be.ok;
            }
          );

        }
      );

    });

});

