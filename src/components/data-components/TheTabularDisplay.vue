<script>
import svgTrees from "@/assets/svg_tree";

export default {
  data() {
    return {
      selectedRow: null,
      isAuthenticated: this.$auth0.isAuthenticated,
      svgTrees: svgTrees,
      currentImage: null
    }
  }
  ,
  computed: {
    colArray: function () {
      var newColNames = [];
      for (const key of Object.keys(this.apiInfo[0])) {
        if (key in this.tableColMap) {
          if (this.doAddColumn(key)) {
            newColNames.push(this.tableColMap[key])
          }
        }
      }
      if (this.isAuthenticated) {
        newColNames.push("Details")
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
    doAddColumn(col) {
      let addCol = true;
      if (col === "tree_id" && this.userLat) {
        addCol = false
      } else if (col === "tree_number" && !this.userLat) {
        addCol = false
      }
      return addCol
    },
    doDisplayElement(valKey) {
      let displayEl = false;
      if (Object.keys(this.tableColMap).includes(valKey)) {
        displayEl = !(this.userLat && valKey === "tree_id");

      }
      return displayEl;
    },
    treeHasImage(item) {
      return "image_paths" in item && item.image_paths;
    },
    getTreeImagePath(item) {
      const imageStr = item.image_paths;
      const imageDir = imageStr.split(";")[0]
      return `${process.env.VUE_APP_API_SERVER_URL}/${imageDir}`
    },
    getSVGTreeType(speciesName) {
      let svg = this.svgTrees[speciesName];
      if (!svg) {
        svg = this.svgTrees.basic_tree;
      }
      return svg;
    }
  }
  ,
  name: 'TheTabularDisplay',
  props: ["apiInfo", "tableColMap", "displayCol", "userLat"],
  components: {}
}
</script>

<template>
  <div class="table-container mx-5">
    <table class="table has-text-centered is-fullwidth is-narrow is-striped mx-auto">
      <tr>
        <th class="has-text-centered" v-for="newcol in colArray" :key="newcol.id">
          <button>{{ newcol }}</button>
        </th>
      </tr>
      <tr v-for="(item, id) in apiInfo" @click="selectRow(id)" :key="item.id"
          :class="{'is-selected': (id === selectedRow)}">
        <template v-for="(val, name, index) in item" :key="index">
          <td v-if="doDisplayElement(name)">
            {{ val }}
          </td>
        </template>
        <td>
          <router-link :to="{name: 'TreeDetails', params:{id: item.tree_id}}">
            <template v-if="treeHasImage(item)">
              <img :src="getTreeImagePath(item)" alt="Tree Image"/>

            </template>
            <template v-else>
              <span v-html="getSVGTreeType(item.tree_species_type_desc)"></span>
            </template>
          </router-link>
        </td>

      </tr>
    </table>
  </div>
</template>
