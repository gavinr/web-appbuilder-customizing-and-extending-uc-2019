///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',

  "./GBFS",
  "esri/layers/GraphicsLayer",

  "esri/SpatialReference",
  "dojo/on",
  "esri/dijit/Search",

  "esri/geometry/Multipoint",
  "esri/geometry/geometryEngine",
  "esri/geometry/webMercatorUtils",
  "esri/graphic"

],
function(
  declare, 
  BaseWidget,

  GBFS, 
  GraphicsLayer,

  SpatialReference,
  on,
  Search,

  Multipoint,
  geometryEngine,
  webMercatorUtils,
  Graphic
) {
  var clazz = declare([BaseWidget], {

    baseClass: "bikeshare",

    postCreate: function() {
      this.inherited(arguments);

      this.gbfs = new GBFS(this.config.gbfsUrl);
      this.createSearchWidget();

    },

    onOpen: function() {
      this.showBikesLayer();
    },

    onClose: function() {
      this.map.removeLayer(this.graphicsLayer);
    },

    showBikesLayer: async function() {
      return new Promise(async (resolve, reject) => {
        this.graphicsLayer = new GraphicsLayer();
        this.map.addLayer(this.graphicsLayer);

        try {
          var resBikeStatusInfo = await this.gbfs.free_bike_status();

          resBikeStatusInfo.graphics.forEach(graphic => {
            this.graphicsLayer.add(graphic);
          });
          resolve();
        } catch (e) {
          console.error("Error getting bike status:", e);
          reject(e);
        }
      });
    },


    createSearchWidget: function() {
      // Create a new "Search" widget (https://developers.arcgis.com/javascript/3/jsapi/search-amd.html) inside our
      // widget.
      this.search = new Search(
        {
          map: this.map,
          autoNavigate: false
        },
        this.searchWidgetWrapper
      );
      this.search.startup();

      // Setup an event listener so when a search is completed, we'll take that point location and do a Yelp search
      // with it:
      on(this.search, "select-result", evt => {
        this.showClosest(evt.result.feature.geometry);
      });
    },

    showClosest: function(point) {
      var multiPoint = new Multipoint(new SpatialReference(4326));
      this.graphicsLayer.graphics.forEach(graphic => {
        multiPoint.addPoint(graphic.geometry);
      });

      var closestPointInfo = geometryEngine.nearestCoordinate(
        multiPoint,
        webMercatorUtils.webMercatorToGeographic(point)
      );

      this.map.graphics.clear();
      this.map.graphics.add(
        new Graphic(closestPointInfo.coordinate, this.gbfs.highlightSymbol)
      );
      this.map.centerAndZoom(closestPointInfo.coordinate, 14);
    }


  });
  return clazz;
});