define([
  "dojo/_base/declare",
  "esri/request",
  "esri/config",
  "esri/graphic",
  "esri/geometry/Point",
  "esri/SpatialReference",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/Color",
  "esri/InfoTemplate"
], function(
  declare,
  esriRequest,
  esriConfig,
  Graphic,
  Point,
  SpatialReference,
  SimpleMarkerSymbol,
  Color,
  InfoTemplate
) {
  return declare([], {
    rootUrl: "https://san.jumpbikes.com/opendata/",

    // Note - we are using ES6 features here, which are now supported in all browsers EXCEPT IE
    // If you need IE support you will need to either transpile this code or convert the
    // es6 features to their older equivalents (in parents)
    //
    // asyc/await (Promises): https://caniuse.com/#feat=async-functions
    // arrow functions (functions + bind): https://caniuse.com/#feat=arrow-functions
    // template strings (string concatenation): https://caniuse.com/#feat=template-literals
    // default parameters: https://caniuse.com/#feat=es6

    constructor: function(rootUrl) {
      if (rootUrl) {
        this.rootUrl = rootUrl;
        esriConfig.defaults.io.corsEnabledServers.push(rootUrl);
      } else {
        console.error("Error getting root url.");
      }

      this.standardSymbol = new SimpleMarkerSymbol()
        .setStyle(SimpleMarkerSymbol.STYLE_CIRCLE)
        .setColor(new Color([255, 0, 0, 0.5]));
      this.highlightSymbol = new SimpleMarkerSymbol()
        .setStyle(SimpleMarkerSymbol.STYLE_SQUARE)
        .setColor(new Color([0, 255, 0, 0.5]));
    },

    /**
     * Given a point (x/y), return nearest restaurants sorted by distance.
     * @param {number} x - the x attiribute of the lat/long
     * @param {number} y - the y attribute of the lat/long
     * @returns {promise} returns a promise that will resolve to the results.
     */
    free_bike_status(symbol) {
      // set symbol if one is not passed in:
      symbol = typeof symbol !== "undefined" ? symbol : this.standardSymbol;

      return new Promise((resolve, reject) => {
        esriRequest(
          {
            url: this.rootUrl + "free_bike_status.json",
            handleAs: "json"
          },
          {
            usePost: false
          }
        ).then(
          function(response) {
            console.log("response", response);
            if (
              response &&
              response.hasOwnProperty("data") &&
              response.data.hasOwnProperty("bikes")
            ) {
              // transform the GBFS to Esri Graphics:
              var graphics = response.data.bikes.map(function(bikeInfo) {
                var point = new Point(
                  bikeInfo.lon,
                  bikeInfo.lat,
                  new SpatialReference(4326)
                );
                var attributes = {
                  bike_id: bikeInfo.bike_id,
                  is_disabled: bikeInfo.is_disabled,
                  is_reserved: bikeInfo.is_reserved,
                  jump_ebike_battery_level: bikeInfo.jump_ebike_battery_level,
                  jump_vehicle_type: bikeInfo.jump_vehicle_type,
                  lat: bikeInfo.lat,
                  lon: bikeInfo.lon,
                  name: bikeInfo.name
                };

                var infoTemplate = new InfoTemplate(
                  "${bike_id}",
                  "Type: ${jump_vehicle_type}<br />Battery: ${jump_ebike_battery_level}"
                );
                return new Graphic(point, symbol, attributes, infoTemplate);
              });

              resolve({
                last_updated: response.last_updated,
                graphics: graphics
              });
            } else {
              reject("Error getting proper bike information.");
            }
          },
          function(err) {
            console.error("Error:", err);
          }
        );
      });
    }
  });
});
