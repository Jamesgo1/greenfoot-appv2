<script>

import TreeShow from "@/views/TreeShow.vue";

export default {
  data() {
    return {
      selectedRow: null,
      isAuthenticated: this.$auth0.isAuthenticated
    }
  }
  ,
  computed: {
    TreeShow() {
      return TreeShow
    },
    colArray: function () {
      var newColNames = [];
      for (const key of Object.keys(this.apiInfo[0])) {
        if (key in this.tableColMap) {
          newColNames.push(this.tableColMap[key])
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
    doDisplayElement(valKey) {
      let displayEl = false;
      if (Object.keys(this.tableColMap).includes(valKey)) {
        displayEl = true;
      }
      return displayEl;
    },
    isTreeID(apiName) {
      let isTreeID = false;
      if (apiName === "tree_id") {
        isTreeID = true;
      }
      return isTreeID
    }
  }
  ,
  name: 'TheTabularDisplay',
  props: ["apiInfo", "tableColMap", "displayCol"],
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
        <td v-if="isAuthenticated">
            <router-link :to="{name: 'TreeDetails', params:{id: item.tree_id}}">
              View
            </router-link>
        </td>

      </tr>
    </table>
  </div>
</template>
