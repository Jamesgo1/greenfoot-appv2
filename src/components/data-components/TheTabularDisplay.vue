<script>

export default {
  data() {
    return {
      selectedRow: null,
      isAuthenticated: this.$auth0.isAuthenticated
    }
  }
  ,
  computed: {
    colArray: function () {
      var newColNames = [];
      for (const key of Object.keys(this.apiInfo[0])) {
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
  name: 'TheTabularDisplay',
  props: ["apiInfo", "tableColMap"],
  components: {}
}
</script>

<template>
  <div class="table-container">
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
          <router-link :to="item.tree_id.toString()">
            Edit
          </router-link>

        </td>
      </tr>
    </table>
  </div>
</template>
