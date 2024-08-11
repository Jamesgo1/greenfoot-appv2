<script>
import {GMapMap, GMapMarker, GMapInfoWindow} from '@fawmi/vue-google-maps';

export default {

  data() {
    return {
      center: {lat: this.userLat, lng: this.userLong},
      openedMarkerID: null,
      includeColumn: false,
      boundsCheck: ""
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
      )
      ;
      return markersArray;
    },
    centerPoint: function () {
      let dynamicCentre = this.center;
      if (!this.userLat || !this.userLong) {
        dynamicCentre = {lat: 54.59488, lng: -5.9266323}
        console.log(dynamicCentre)
        console.log(typeof dynamicCentre.lat)
      }
      return dynamicCentre
    }
  },
  watch: {},
  methods: {
    onMapReady() {
      this.$refs.gmap.$mapPromise.then((googleMap) => {

        // eslint-disable-next-line no-undef
        const bounds = new google.maps.LatLngBounds();

        // Extend the bounds to include each location
        this.markersArray.forEach((marker) => {
          let location = marker.position;
          bounds.extend(location);
        });

        // Fit the map to the bounds
        this.boundsCheck = bounds;
        googleMap.fitBounds(bounds);
      })
    },
    openMarker(id) {
      this.openedMarkerID = id;
    },
    getColName(col) {
      return this.tableColMap[col]
    },
    isInTableColMap(col) {
      let includeCol = false;
      if (col !== "position") {
        includeCol = true;
      }
      return includeCol
    },
    userCentre() {
      console.log(this.userLat)
      console.log(typeof this.userLat)
      if (!this.userLat || !this.userLong) {
        return {lat: 54.59488, long: -5.9266323}
      } else {
        return null
      }
    },
  },
  mounted() {
    this.$refs.gmap.$mapPromise.then((mapObject) => {
      // console.log(new this.google.maps.Map())
      // console.log(bounds);
      console.log('map is loaded now', mapObject);
    });
  },
  name: 'HomePage',
  props: ["apiInfo", "tableColMap", "userLat", "userLong"],
  components: {GMapMarker, GMapMap, GMapInfoWindow}
}
</script>
<!--<tr v-for="(item, id) in apiInfo" @click="selectRow(id)" :key="item.id"
          :class="{'is-selected': (id === selectedRow)}">
        <template v-for="(val, name, index) in item" :key="index">
          <td v-if="doDisplayElement(name)">
            {{ val }}
          </td>
        </template>-->
<template>
  {{ boundsCheck }}
  <GMapMap
      ref="gmap"
      :center="centerPoint"
      :zoom="10"
      map-type-id="terrain"
      style="width: 100vw; height: 20rem"
      @bounds_changed="onMapReady"
      :options="{
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      }"
  >
    <GMapMarker
        v-for="marker in markersArray"
        :key="marker.tree_id"
        :position="marker.position"
        :clickable="true"
        @click="openMarker(marker.tree_id)"
        :icon="'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/16x16/tree.png'"
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
        </template>


      </GMapInfoWindow>
    </GMapMarker>
  </GMapMap>

</template>


