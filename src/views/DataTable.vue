<script>
import axios from "axios";
import PageHero from "@/components/PageHero";

export default {
  data() {
    return {
      info: null,
      loading: true,
      error: false,
      tableColMap: {
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
    }
  },
  computed: {
    colArray: function () {
      var newColNames = [];
      for (const key of Object.keys(this.info[0])) {
        if (key in this.tableColMap) {
          newColNames.push(this.tableColMap[key])
        }
      }
      return newColNames
    },
    displayArray: function () {
      const wantedProps = Object.keys(this.info[0]).filter(x => Object.keys(this.tableColMap).includes(x));
      const displayArray = [];
      this.info.forEach((row) => {
        let newObj = {}
        for (const [k, v] of Object.entries(row)) {
          if (wantedProps.includes(k)) {
            newObj[k] = v
          }
        }
        displayArray.push(newObj)
      })
      return displayArray
    }
  },
  watch: {},
  methods: {},
  mounted() {
    axios
        .get('http://127.0.0.1:8000/all-tree-info/?limit=50')
        .then(response => (this.info = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  },
  name: 'DataTable',
  props: {
    pageTitle: String
  },
  components: {
    PageHero
  }
}
</script>

<template>
  <PageHero title="Data Explorer" subtitle="Explore Belfast's Trees" description="Find the biggest, tallest trees. Find ones that may need help. Or help to improve
          our tree data quality."></PageHero>
  <!--  <h1>{{ pageTitle }}</h1>-->
  <!--  <h1>{{ info }}</h1>-->
  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please try
      again later</p>
  </div>
  <div class="container" v-else>
    <table class="table mx-auto has-text-centered">
      <tr>
        <th class="has-text-centered" v-for="newcol in colArray" :key="newcol.id">
          <button>{{ newcol }}</button>
        </th>
      </tr>
      <tbody v-for="item in displayArray" :key="item.id">
      <tr>
        <td v-for="val in item" :key="val.id">
          {{ val }}

        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>



