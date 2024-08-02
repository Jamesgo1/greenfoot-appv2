<script>

export default {
  data() {
    return {
      center: {lat: 54.59488, lng: -5.9266323},
      openedMarkerID: null,
      includeColumn: false
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
    }
  },
  watch: {},
  methods: {
    openMarker(id) {
      this.openedMarkerID = id;
    },
    getColName(col) {
      return this.tableColMap[col]
    },
    isInTableColMap(col){
      let includeCol = false;
      if(col!== "position"){
        includeCol = true;
      }
      return includeCol
    }
  },
  mounted() {
  },
  name: 'HomePage',
  props: ["apiInfo", "tableColMap"],
  components: {}
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
  <GMapMap
      :center=center
      :zoom="10"
      map-type-id="terrain"
      style="width: 100vw; height: 20rem"
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


  <!--  {{markersArray}}-->
</template>





