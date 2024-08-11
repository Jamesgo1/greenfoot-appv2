<script>

export default {
  data() {
    return {
      addInfoOptions: {
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
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
        "nickname": "Changed By"
      },
      addInfoDropdownClass: "dropdown",
      removeInfoDropdownClass: "dropdown",


    }

  },
  computed: {},
  watch: {},
  methods: {
    changeToEditDisplay(){
      this.$emit("changeToEdit");
    },
    doDisplayName(name) {
      if (this.editMode) {
        return this.isEditableField(name);
      }
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
        return `There is ${numUpdates} update to this tree and this was at ${lastDateStr}`
      } else {
        return `There are ${numUpdates} updates to this tree with the latest one being on ${lastDateStr}`
      }
    },
    getTreeVal(name, treeHistEntry) {
      if (name === "long_lat") {
        return `(${treeHistEntry.longitude}, ${treeHistEntry.latitude})`
      } else {
        return treeHistEntry[name]
      }
    },
  },
  name: 'TreeInfo',
  components: {},
  props: ["colOptions", "treeInfo"]

}


</script>

<template>

  <div class="box mx-5">
    <div class="has-text-centered is-size-5">
      {{ this.getSummaryInfo() }}
    </div>
  </div>
    <div class="field is-grouped is-grouped-centered mx-5">
      <div class="buttons">
        <div :class="this.addInfoDropdownClass" v-if="!editMode">
          <div class="dropdown-trigger " @click="switchaddInfoDropdown()">
            <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
              Add Info
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


        <div :class="this.removeInfoDropdownClass" v-if="!editMode">
          <div class="dropdown-trigger" @click="switchRemoveInfoDropdown()">
            <button class="button is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
              Remove Info
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


  <template v-for="(treeHistEntry, treeIndex) in this.treeInfo" :key="treeIndex">

    <div class="box table-container mx-5 my-5">
      <div class="has-text-centered is-size-5">
        Tree update: {{ this.getUserFriendlyDate(treeHistEntry.tree_change_datetime) }}
      </div>
      <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
        <tr v-for="(val, name, index) in colOptions" :key="index">
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

