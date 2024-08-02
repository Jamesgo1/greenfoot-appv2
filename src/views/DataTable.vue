<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheTabularDisplay from "@/components/data-components/TheTabularDisplay.vue";
import TheMapsDisplay from "@/components/data-components/TheMapsDisplay.vue";
import axios from "axios";

export default {
  data() {
    return {
      info: null,
      tableColMap: {
        "tree_id": "Tree Number",
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition"
      },
      loading: true,
      error: false,
      tableActive: true,
      tableButtonClass: "button is-primary",
      mapButtonClass: "button is-info is-light"
    }
  },
  mounted() {
    axios
        .get(`${process.env.VUE_APP_API_SERVER_URL}/all-tree-info/?limit=50`)
        .then(response => (this.info = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  },
  methods: {
    toggleMapTableDisplay() {
      if (this.tableActive) {
        this.tableButtonClass = this.tableButtonClass + " is-light"
        this.mapButtonClass = "button is-info"
      } else {
        this.mapButtonClass = this.mapButtonClass + " is-light"
        this.tableButtonClass = "button is-primary"
      }
      this.tableActive = !this.tableActive
    }

  },
  name: 'DataTable',
  props: {
    pageTitle: String
  },
  components: {
    ThePageHero,
    TheTabularDisplay,
    TheMapsDisplay

  }
}
</script>
<template>
  <ThePageHero title="Data Explorer" subtitle="Explore Belfast's Trees" description="Find the biggest, tallest trees. Find ones that may need help. Or help to improve
          our tree data quality."></ThePageHero>
  <div class="buttons is-centered">
    <button @click="toggleMapTableDisplay()" :class="tableButtonClass">Table</button>
    <button @click="toggleMapTableDisplay()" :class="mapButtonClass">Map</button>
  </div>
  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>

  <div class="table-container" v-else>
    <template v-if="tableActive">
      <TheTabularDisplay :api-info="info" :table-col-map="tableColMap"></TheTabularDisplay>
    </template>
    <template v-else>
      <TheMapsDisplay :api-info="info" :table-col-map="tableColMap"></TheMapsDisplay>
    </template>
  </div>
</template>



