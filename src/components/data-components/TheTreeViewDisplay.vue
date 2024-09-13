<script>
import TheGoBackButton from "@/components/ui-components/TheGoBackButton.vue";

export default {
  data() {
    return {
      addInfoOptions: {
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
        "long_lat": "Coordinate (long/lat)",

      },
      colsToDisplay: {
        "tree_id": "Tree Number",
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "tree_change_desc": "Tree Change Reason",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "nickname": "Changed By",
      },
      addInfoDropdownClass: "dropdown",
      removeInfoDropdownClass: "dropdown",
      showImages: true


    }

  },
  computed: {},
  watch: {},
  methods: {
    changeToEditDisplay() {
      this.$emit("changeToEdit");
    },
    changeImageButtonDisplay() {
      if (this.showImages) {
        return "Hide Images"
      } else {
        return "Show Images"
      }
    },
    doDisplayName(name) {
      return Object.keys(this.colsToDisplay).includes(name);
    },
    switchaddInfoDropdown() {
      if (this.addInfoDropdownClass === "dropdown") {
        this.addInfoDropdownClass = "dropdown is-active"
      } else {
        this.addInfoDropdownClass = "dropdown"
      }
    },
    switchRemoveInfoDropdown() {
      if (this.removeInfoDropdownClass === "dropdown") {
        this.removeInfoDropdownClass = "dropdown is-active"
      } else {
        this.removeInfoDropdownClass = "dropdown"
      }
    },
    addToDisplay(name, val) {
      this.switchaddInfoDropdown();
      this.colsToDisplay[name] = val;
      delete this.addInfoOptions[name];
    },
    removeFromDisplay(name, val) {
      this.switchRemoveInfoDropdown();
      this.addInfoOptions[name] = val;
      delete this.colsToDisplay[name];
    },
    getUserFriendlyDate(date) {
      const dateObj = new Date(date)
      return dateObj.toLocaleString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    },
    getSummaryInfo() {
      const numUpdates = this.treeInfo.length;
      const latestInfo = this.treeInfo[0]
      const lastDate = new Date(latestInfo.tree_change_datetime);
      const lastDateStr = lastDate.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      if (numUpdates === 1) {
        return `There is ${numUpdates} live update to this tree and this was at ${lastDateStr}`
      } else {
        return `There are ${numUpdates} live updates to this tree with the latest one being on ${lastDateStr}`
      }
    },
    getRowClassForChangedVal(name, indexNum){
      let rowClass = "";
      const treeInfoLen = this.treeInfo.length;
      if(indexNum < treeInfoLen - 1){
        const prevTreeObj = this.treeInfo[indexNum + 1]
        const currentTreeObj = this.treeInfo[indexNum]
        const prevValue = this.getTreeVal(name, prevTreeObj);
        const currentValue = this.getTreeVal(name, currentTreeObj)
        if(currentValue !== prevValue){
          rowClass = "has-background-success-light"
        }
      }
      return rowClass;


    },
    getTreeVal(name, treeHistEntry) {
      if (name === "long_lat") {
        return `(${treeHistEntry.longitude}, ${treeHistEntry.latitude})`
      } else {
        return treeHistEntry[name]
      }
    },
    getImagePath(currentObj) {
      return `${process.env.VUE_APP_API_SERVER_URL}/${currentObj.image_path}`
    }
  },
  name: 'TreeInfo',
  components: {TheGoBackButton},
  props: ["colOptions", "treeInfo", "imageInfo"]

}


</script>

<template>
  <TheGoBackButton></TheGoBackButton>
  <div class="box mx-5">
    <div class="has-text-centered is-size-5">
      {{ this.getSummaryInfo() }}
    </div>
  </div>
  <div class="field is-grouped is-grouped-centered mx-5">
    <div class="buttons">

      <div :class="this.addInfoDropdownClass">
        <div class="dropdown-trigger " @click="switchaddInfoDropdown()">
          <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
            Add Info&nbsp;&nbsp;
            <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
          <div class="dropdown-content" v-for="(name, val, index) in addInfoOptions" :key="index">
            <a class="dropdown-item" @click="addToDisplay(val, name)">{{ name }}</a>
          </div>
        </div>
      </div>

      <div>
        <button class="button is-info" @click="this.changeToEditDisplay">Edit</button>
      </div>


      <div :class="this.removeInfoDropdownClass">
        <div class="dropdown-trigger" @click="switchRemoveInfoDropdown()">
          <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
            Remove Info&nbsp;&nbsp;
            <span class="icon is-small">
            <i class="fas fa-angle-down"></i>
          </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
          <div class="dropdown-content" v-for="(name, val, index) in colsToDisplay" :key="index">
            <a class="dropdown-item" @click="removeFromDisplay(val, name)">{{ name }}</a>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!--  <template v-if="this.imageInfo.length > 0">-->
  <div class="buttons is-centered mt-4">
    <button @click="this.showImages = !this.showImages" class="button is-primary">
      {{ this.changeImageButtonDisplay() }}
    </button>
  </div>
  <template v-if="this.showImages">
    <template v-for="(imageObj, imageIndex) in this.imageInfo" :key="imageIndex">
      <div class="box table-container mx-5 my-5">
        <img :src="getImagePath(imageObj)" alt="Tree Image"/>
        <div class="content is-size-7">
          Submitted by {{ imageObj.nickname }} on {{ this.getUserFriendlyDate(imageObj.image_add_datetime) }}
        </div>
      </div>
    </template>
  </template>
  <!--  </template>-->
  <template v-for="(treeHistEntry, treeIndex) in this.treeInfo" :key="treeIndex">

    <div class="box table-container mx-5 my-5">
      <div class="has-text-centered is-size-5">
        Tree update: {{ this.getUserFriendlyDate(treeHistEntry.tree_change_datetime) }}
      </div>
      <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
        <tr v-for="(val, name, index) in colOptions" :key="index" :class="getRowClassForChangedVal(name, treeIndex)">
          <template v-if="doDisplayName(name)">
            <td>
              {{ val }}
            </td>

            <td>
              {{ getTreeVal(name, treeHistEntry) }}
            </td>
          </template>

        </tr>
      </table>
    </div>

  </template>
</template>

<style scoped>
.dropdown-content {
  max-height: 15em;
  overflow: auto;
}

.table {
  overflow-x: auto;
}
</style>

