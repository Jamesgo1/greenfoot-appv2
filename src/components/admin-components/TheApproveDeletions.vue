<script>

import axios from "axios";

export default {
  data() {
    return {
      submitSuccessful: false
    }

  },
  computed: {},
  watch: {},
  methods: {
    doDisplayName(name) {
      return name in this.colsToDisplay;
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
    async markTreeInactive(treeID){
      console.log("Entering patch marking inactive...")
      return axios
          .patch(`${process.env.VUE_APP_API_SERVER_URL}/admin/authorise-tree-inactive/${treeID}`)
          .then(response => (this.updateOutput = response.status))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async patchChanges(patchParams) {
      console.log("Entering patch changes..")
      return axios
          .patch(`${process.env.VUE_APP_API_SERVER_URL}/admin/update-tree-status/`,
              patchParams)
          .then(response => (this.updateOutput = response.status))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async submitNewTree(approve) {
      let submissionObj = {tree_history_id: this.newTreeToApprove.tree_history_id}
      if (approve) {
        submissionObj["is_live_change_ind"] = 4;
        await this.markTreeInactive(this.newTreeToApprove.tree_id)
        console.log("Approved")
      } else {
        submissionObj["is_live_change_ind"] = -5;
        console.log("Denied")
      }
      console.log("This is the final submission:")
      console.log(submissionObj)
      console.log("Posting submission for tree hist id: " + this.newTreeToApprove.tree_history_id)
      await this.patchChanges([submissionObj]);
      if (!this.error) {
        this.submitSuccessful = true;
      }

    }
  },
  name: 'TreeInfo',
  components: {},
  props: ["newTreeToApprove", "colsToDisplay"]

}


</script>

<template>
  <template v-if="this.submitSuccessful">
    <div class="container">
      <div class="box table-container mx-5 my-5">
        <div class="content is-size-5 has-text-centered">Your changes have been successfully updated!
          <br>
          <br>
          Thank you for helping to improve what we know about trees in the Belfast area.
        </div>
        <div class="field is-grouped is-grouped-centered mx-5 my-5">
          <div class="buttons">

            <div class="button is-centered is-success is-light">
              <router-link to="/">Return Home</router-link>
            </div>

            <div class="button is-centered is-info is-light">
              <router-link to="/explore">Explore Trees</router-link>
            </div>

          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="box table-container mx-5 my-3 has-background-success-light">
      <div class="has-text-centered is-size-6">
        This tree was added on <b>{{ this.getUserFriendlyDate(this.newTreeToApprove.tree_change_datetime) }} </b>
        by user <b>{{ this.newTreeToApprove.nickname }}</b>
        <br>
        <br>
        The reason for deletion is: <br> '<b>{{this.newTreeToApprove.tree_change_desc}}</b>'
        <br>
        <br>
        Please either approve or deny adding this tree to the database.
      </div>
    </div>
    <div class="box table-container mx-5 my-5">
      <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
        <tr>
          <th class="has-text-centered">Type</th>
          <th class="has-text-centered">Value</th>
        </tr>
        <tr v-for="(val, name, index) in this.newTreeToApprove" :key="index">
          <template v-if="doDisplayName(name)">
            <td>
              {{ this.colsToDisplay[name] }}
            </td>
            <td>
              {{ val }}
            </td>
          </template>

        </tr>
      </table>
      <div class="buttons is-centered mt-4">
        <button @click="submitNewTree(false)" class="button is-primary">Keep</button>
        <button @click="submitNewTree(true)" class="button is-danger">Approve Delete</button>
      </div>
    </div>
  </template>
</template>

<style scoped>

.table {
  overflow-x: auto;
}
</style>

