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
define(['dojo/_base/declare',
  'jimu/BaseWidget',

  "./GBFS",
  "esri/layers/GraphicsLayer",

],
function(
  declare, 
  BaseWidget,

  GBFS, 
  GraphicsLayer
) {
  var clazz = declare([BaseWidget], {

    baseClass: "bikeshare",

    postCreate: function() {
      this.inherited(arguments);

      this.gbfs = new GBFS(this.config.gbfsUrl);
    },

    onOpen: function() {
      this.showBikesLayer();
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


  });
  return clazz;
});