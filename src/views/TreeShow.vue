<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import axios from "axios";
import TheTreeEditDisplay from "@/components/data-components/TheTreeEditDisplay.vue";
import TheTreeViewDisplay from "@/components/data-components/TheTreeViewDisplay.vue";

export default {
  data() {
    return {
      loading: true,
      error: false,
      colOptions: {
        "tree_id": "Tree Number",
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
        "long_lat": "Coordinate (long/lat)",
        "tree_change_desc": "Tree Change Reason",
        "nickname": "Changed By"
      },
      editMode: false,
      treeInfo: {}
    }

  },
  computed: {
    treeID() {
      return parseInt(this.$route.params.id)
    },
    editButton() {
      let buttonName = "Edit";
      if (this.editMode) {
        buttonName = "View";
      }
      return buttonName;
    },

  },
  watch: {},
  methods: {
    dynamicTitle(route) {
      return "Tree " + route;
    },
    updateEditMode() {
      this.editMode = !this.editMode
      this.colEdits = {}
    },
  },
  mounted() {
    axios
        .get(`${process.env.VUE_APP_API_SERVER_URL}/all-tree-info-hist/?limit=50&tree_id=${this.$route.params.id}`)
        .then(response => (this.treeInfo = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  },
  name: 'TreeInfo',
  components: {
    ThePageHero,
    TheTreeEditDisplay,
    TheTreeViewDisplay
  },
}


</script>

<template>

  <ThePageHero v-if="!editMode" :title="dynamicTitle(treeID)"
               subtitle="Get more info on this tree"
               description="Change the data you wish to view with the buttons below"/>


  <ThePageHero v-else :title="dynamicTitle(treeID)"
               subtitle="Edit the info on this tree"
               description="Help improve tree data quality by editing a tree near you"/>
  <div class="container my-5">

    <div class="field is-grouped is-grouped-centered mx-5">

    </div>
  </div>
  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>
  <div class="container" v-else>


    <template v-if="!editMode">
      <TheTreeViewDisplay
          :tree-info="treeInfo"
          :col-options="colOptions"
          @changeToEdit="updateEditMode"></TheTreeViewDisplay>
    </template>

    <template v-else>
      <TheTreeEditDisplay
          :tree-info="treeInfo"
          :col-options="colOptions"
          @changeToView="updateEditMode">
      </TheTreeEditDisplay>
    </template>

  </div>
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

