<script>

export default {
  data() {
    return {
      iconType: {
        "image": {"name": "fas fa-image", "color": "has-background-primary-light"},
        "edit": {"name": "fas fa-marker", "color": "has-background-info-light"},
        "new tree": {"name": "fas fa-tree", "color": "has-background-success-light"},
        "deletion": {"name": "fas fa-trash", "color": "has-background-danger-light"}
      },
    }
  },
  computed: {},
  watch: {},
  methods: {
    getChangeTypeDetails(treeObj) {
      return this.iconType[treeObj.change_type]
    },
    getNewsBoxClass(treeObj) {
      let boxClass = "box table-container mx-5 my-5 "
      const changeDetails = this.getChangeTypeDetails(treeObj)
      return boxClass + changeDetails.color;
    },
    getNewsIcon(treeObj) {
      const changeDetails = this.getChangeTypeDetails(treeObj);
      return changeDetails.name;
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
  },
  mounted() {
  },
  name: 'HomePage',
  components: {},
  props: ["newsFeedData", "title", "showDeclined"]
}
</script>

<template>
  <div v-if="newsFeedData" class="box table-container mx-5 my-5">
    <div class="content is-underlined has-text-centered">
      <b>{{ title }}</b>
    </div>
    <div :class="getNewsBoxClass(treeObj)"
         v-for="(treeObj, tree_index) in newsFeedData" :key="tree_index">
      <div class="content has-text-centered">
        <span class="icon is-small">
            <i :class="getNewsIcon(treeObj)"></i>
          </span>
        <router-link :to="{name: 'TreeDetails', params:{id: treeObj.tree_id}}">
          Tree {{ treeObj.tree_id }}
        </router-link>
        updated by <b>{{ treeObj.nickname }}</b> on
        {{ this.getUserFriendlyDate(treeObj.comb_date) }}

      </div>

    </div>
  </div>

</template>



