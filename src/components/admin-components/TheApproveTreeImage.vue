<script>

import axios from "axios";

export default {
  data() {
    return {
      submitSuccessful: false,
      info: null,
      showTreeInfo: false,
      updateOutput: null,
      error: false,
      loading: false
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
    async patchImageChanges(patchParams) {
      console.log("Entering patch changes..")
      return axios
          .patch(`${process.env.VUE_APP_API_SERVER_URL}/admin/update-image-approval/`,
              patchParams)
          .then(response => (this.updateOutput = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async approveImage(approve) {
      let submissionObj = {...this.newTreeToApprove};
      if (approve) {
        submissionObj["image_approved_ind"] = 1;
        console.log("Approved")
      } else {
        submissionObj["image_approved_ind"] = -1;
        console.log("Denied")
      }
      console.log("This is the final submission:")
      console.log(submissionObj)
      await this.patchImageChanges(submissionObj);
      if (this.updateOutput && submissionObj.image_approved_ind === this.updateOutput.image_approved_ind) {
        this.submitSuccessful = true;
      }
      else{
        this.error = true;
      }

    },
    treeInfoDisplay() {
      let treeInfoDisplay = "Show Tree Info";
      if (this.showTreeInfo) {
        treeInfoDisplay = "Hide Tree Info"
      }
      return treeInfoDisplay;
    },
    getImagePath() {
      const imagePath = `${process.env.VUE_APP_API_SERVER_URL}/${this.newTreeToApprove.image_path}`
      console.log(imagePath);
      return imagePath
    }
  },
  mounted() {
    axios
        .get(`${process.env.VUE_APP_API_SERVER_URL}/tree/all-tree-info/?limit=50&tree_id=${this.newTreeToApprove.tree_id}`)
        .then(response => (this.info = response.data[0]))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  },
  name: 'TreeInfo',
  components: {},
  props: ["newTreeToApprove", "colsToDisplay"]

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
  <div v-else>
    <template v-if="this.submitSuccessful">
      <div class="container">
        <div class="box table-container mx-5 my-5">
          <div class="content is-size-5 has-text-centered">Your changes have been successfully updated!
            <br>
            <br>
            This tree image has now been added and can be viewed on the images tab
            <router-link :to="{name: 'TreeDetails', params:{id: this.newTreeToApprove.tree_id}}">
              here.
            </router-link>
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
          This image was added on <b>{{ this.getUserFriendlyDate(this.newTreeToApprove.image_add_datetime) }} </b>
          by user <b>{{ this.newTreeToApprove.nickname }}</b>
          <br>
          <br>
          Please either approve or deny adding this image to the database.
        </div>
      </div>
      <div class="box table-container mx-5 my-5">
        <img :src="getImagePath()" alt="Tree Image"/>
      </div>
      <div class="box table-container mx-5 my-5">
        <div class="buttons is-centered mt-4">
          <button @click="this.showTreeInfo = !this.showTreeInfo" class="button is-primary">
            {{ this.treeInfoDisplay() }}
          </button>
        </div>
        <table v-if="this.showTreeInfo"
               class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="has-text-centered">Type</th>
            <th class="has-text-centered">Value</th>
          </tr>
          <tr v-for="(val, name, index) in this.info" :key="index">
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
          <button @click="approveImage(true)" class="button is-primary">Approve</button>
          <button @click="approveImage(false)" class="button is-danger">Deny</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

.table {
  overflow-x: auto;
}
</style>

