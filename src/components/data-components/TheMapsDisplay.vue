<script>

export default {

  data() {
    return {
      center: {lat: this.userLat, lng: this.userLong},
      openedMarkerID: null,
      includeColumn: false,
      boundsCheck: "",
      useBounds: true,
      showLocation: true,
      heatMapMode: false,
      heatMapVal: "diameter_cm",
      hmapDropdownClass: "dropdown"

    }
  },
  computed: {
    markersArray: function () {
      const markersArray = [];
      this.apiInfo.forEach((element) => {
            let currentObj = {};
            currentObj["position"] = {
              lat: element.latitude,
              lng: element.longitude
            }
            for (const [key, value] of Object.entries(element)) {
              if (key in this.tableColMap) {
                currentObj[key] = value
              }
            }
            markersArray.push(currentObj);
          }
      );
      if (this.userLat && this.userLong && this.showLocation) {
        markersArray.push({
          "position": this.centerPoint,
          "iscenterpoint": "You are here",
          "centerlatlong": `(${this.userLat}, ${this.userLong})`
        });
      }
      console.log("Here's the markers array:")
      console.log(markersArray)
      return markersArray;
    },
    heatMapArray: function () {
      const markersArray = [];
      this.apiInfo.forEach((element) => {
            let currentObj = {};
            currentObj["location"] = new window.google.maps.LatLng(element.latitude, element.longitude)
            for (const [key, value] of Object.entries(element)) {
              if (key === this.heatMapVal) {
                currentObj["weight"] = value;
              }
            }
            markersArray.push(currentObj);
          }
      );
      console.log("Here's the heatmap array:")
      console.log(markersArray)
      return markersArray;
    },
    centerPoint: function () {
      let dynamicCentre = this.center;
      if (!this.userLat || !this.userLong) {
        dynamicCentre = {lat: 54.59488, lng: -5.9266323}
      }
      return dynamicCentre
    }
  },
  watch: {
    useBounds(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onMapReady()
      }
    },
    showLocation(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onMapReady()
      }
    },
    apiInfo(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.onMapReady();
      }
    },
    heatMapMode(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!this.useBounds || this.showLocation) {
          this.useBounds = true;
          this.showLocation = false;
        } else {
          this.onMapReady();
        }
      }
    }
  },
  methods: {
    onMapReady() {
      this.$refs.gmap.$mapPromise.then((googleMap) => {
            if (this.useBounds) {
              const streetView = googleMap.getStreetView();
              streetView.setVisible(false);


              const bounds = new window.google.maps.LatLngBounds();

              // Extend the bounds to include each location
              this.markersArray.forEach((marker) => {
                let location = marker.position;
                if (location) {
                  bounds.extend(location);
                }
              });

              // Fit the map to the bounds
              this.boundsCheck = bounds;
              googleMap.fitBounds(bounds);
            } else {
              this.$refs.gmap.$mapPromise.then((googleMap) => {


                const bounds = null;
                googleMap.fitBounds(bounds);

                googleMap.setCenter(this.centerPoint);
                googleMap.setZoom(5);
              });

            }
          }
      )
    },
    openMarker(id) {
      this.openedMarkerID = id;
    },
    getColName(col) {
      return this.tableColMap[col]
    },
    isInTableColMap(col) {
      let includeCol = false;
      if (!["position", "iscenterpoint", "centerlatlong"].includes(col)) {
        includeCol = true;
      }
      return includeCol
    },
    getButtonDisplay() {
      if (this.useBounds) {
        return "Navigate Map"
      } else {
        return "Image Map"
      }
    },
    getLocationDisplay() {
      if (this.showLocation) {
        return "Hide Location"
      } else {
        return "Show Location"
      }
    },
    getHeatmapModeDisplay() {
      if (this.heatMapMode) {
        return "Leave Heatmap"
      } else {
        return "Show Heatmap"
      }
    },
    iconToUse(marker) {
      if (Object.keys(marker).includes("iscenterpoint")) {
        return null
      }
      return 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/16x16/tree.png';
    },
    getMapStyle() {
      let defaultStyle = "width: 100vw; height: 20rem"
      if (this.adjustWidth) {
        defaultStyle = defaultStyle.replace("100", "80");
      }
      return defaultStyle
    },
    switchDropdown() {
      this.ddClicked = true;
      if (this.hmapDropdownClass === "dropdown") {
        this.hmapDropdownClass = "dropdown is-active"
      } else {
        this.hmapDropdownClass = "dropdown"
      }
    },
    updateHeatMapVal(name){
      this.heatMapVal = name;
      this.hmapDropdownClass = "dropdown";

    }
  },
  mounted() {

  }
  ,
  name: 'HomePage',
  props:
      ["apiInfo", "tableColMap", "userLat", "userLong", "adjustWidth", "heatMapOptions"],
}
</script>
<template>
  <div class="buttons is-centered mt-4">
    <button v-if="!this.heatMapMode" @click="this.useBounds = !this.useBounds" class="button">{{
        getButtonDisplay()
      }}
    </button>
    <button v-if="!this.heatMapMode" @click="this.showLocation = !this.showLocation" class="button">
      {{ getLocationDisplay() }}
    </button>
    <button @click="this.heatMapMode= !this.heatMapMode" class="button">{{ getHeatmapModeDisplay() }}</button>
    <div v-if="this.heatMapMode" :class="this.hmapDropdownClass">
      <div class="dropdown-trigger" @click="switchDropdown()">
        <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
          {{ this.heatMapOptions[this.heatMapVal] }}&ensp;
          <span class="icon is-small">
            <i class="fas fa-angle-down"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content" v-for="(val, name, index) in heatMapOptions" :key="index">
          <a class="dropdown-item" @click="this.updateHeatMapVal(name)">{{ val }}</a>
        </div>
      </div>
    </div>
  </div>
  <GMapMap
      ref="gmap"
      :center="centerPoint"
      :zoom="10"
      map-type-id="terrain"
      :style="this.getMapStyle()"
      @bounds_changed="onMapReady"
      :options="{
        zoomControl: !this.useBounds,
        mapTypeControl: !this.useBounds,
        scaleControl: !this.useBounds,
        streetViewControl: !this.useBounds,
        rotateControl: true,
        fullscreenControl: true
      }"
  >
    <GMapHeatmap v-if="heatMapMode" :data="heatMapArray"></GMapHeatmap>
    <template v-if="!heatMapMode">


      <GMapMarker
          v-for="marker in markersArray"
          :key="marker.tree_id"
          :position="marker.position"
          :clickable="true"
          @click="openMarker(marker.tree_id)"
          :icon="iconToUse(marker)"
      >
        <GMapInfoWindow
            :closeclick="true"
            @closeclick="openMarker(null)"
            :opened="openedMarkerID === marker.tree_id"
        >
          <template v-for="(val, name, index) in marker" :key="index">
            <div v-if="isInTableColMap(name)">
              <b>{{ getColName(name) }}:{{ val }}</b>
            </div>
            <div v-else-if="['iscenterpoint', 'centerlatlong'].includes(name)">
              <b>{{ val }}</b>
            </div>
            <div v-if="name === 'tree_id'">
              <router-link :to="{name: 'TreeDetails', params:{id: val}}">
                View This Tree's Details
              </router-link>
            </div>
          </template>

        </GMapInfoWindow>
      </GMapMarker>
    </template>
  </GMapMap>

</template>


