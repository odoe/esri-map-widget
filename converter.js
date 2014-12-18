/**
 * for details refer to:
 *   - http://resources.arcgis.com/en/help/arcgis-web-map-json/#/Web_map_data/02qt0000000q000000/
 *   - http://resources.arcgis.com/en/help/main/10.1/index.html#//0154000004w8000000
 **/
define([
  'esri/tasks/PrintTask',
  'esri/arcgis/utils'
], function(
  PrintTask,
  arcgisUtils
) {
  'use strict';

  return {

    toWebMapAsJSON: function(map) {
      return PrintTask.prototype._getPrintDefinition(map);
    },

    fromWebMapAsJSON: function(options) {
      if (options.webmapid) {
        return arcgisUtils.createMap(
          options.webmapid, options.id
        );
      } else if (options.webmap) {
        return arcgisUtils.createMap(
          options.webmap,
          options.id,
          {
            mapOptions: options.mapOptions
          }
        );
      }
    }

  };

});
