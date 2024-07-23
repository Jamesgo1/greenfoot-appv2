<script>
import axios from "axios";

export default {
  data() {
    return {
      info: null,
      loading: true,
      error: false,
      selectedRow: null,
      isAuthenticated: this.$auth0.isAuthenticated,
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
      }
    }
  }
  ,
  computed: {
    colArray: function () {
      var newColNames = [];
      for (const key of Object.keys(this.info[0])) {
        if (key in this.tableColMap) {
          newColNames.push(this.tableColMap[key])
        }
      }
      if (this.isAuthenticated) {
        newColNames.push("Edit")
      }
      return newColNames
    }
  }
  ,
  watch: {}
  ,
  methods: {
    selectRow(row) {
      this.selectedRow = row;
    },
    doDisplayElement(valKey) {
      let displayEl = false;
      if (Object.keys(this.tableColMap).includes(valKey)) {
        displayEl = true;
      }
      return displayEl;
    }
  }
  ,
  mounted() {
    axios
        .get('http://127.0.0.1:8000/all-tree-info/?limit=50')
        .then(response => (this.info = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  }
  ,
  name: 'TheTabularDisplay',
  props: [],
  components: {
  }
}
</script>

<template>
  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>
  <div class="container" v-else>
    <section>
      <table class="table mx-auto has-text-centered">
        <tr>
          <th class="has-text-centered" v-for="newcol in colArray" :key="newcol.id">
            <button>{{ newcol }}</button>
          </th>
        </tr>
        <tr v-for="(item, id) in info" @click="selectRow(id)" :key="item.id"
            :class="{'is-selected': (id === selectedRow)}">
          <template v-for="(val, name, index) in item" :key="index">
            <td v-if="doDisplayElement(name)">
              {{ val }}
            </td>
          </template>
          <td v-if="isAuthenticated">
            <router-link :to="item.tree_id.toString()">
              Edit
            </router-link>

          </td>
        </tr>
      </table>
    </section>
  </div>
</template>
