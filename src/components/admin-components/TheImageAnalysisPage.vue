<script>

import axios from "axios";

export default {
  data() {
    return {
      submitSuccessful: false,
      modelStatus: null,
      analysisData: null,
      showTreeInfo: false,
      updateOutput: null,
      error: false,
      loading: false,
      runAnalysisClicked: false,
      newAnalysisOutput: null,
      imageDetails: {
        "tree_id": "Tree Number",
        "tree_change_datetime": "Tree Last Edited",
        "nickname": "Last Edited By",
        "image_add_datetime": "Image Added Date",
        "image_nickname": "Image Added By",
        "tree_species_type_desc": "Current Species Type"
      },
      approvalChange: {}
    }

  },
  computed: {},
  watch: {},
  methods: {
    lastAnalysisDate() {
      if (this.analysisData) {
        const lastRunDateObj = this.analysisData.reduce((latest, current) => {
          return new Date(current.last_ai_analysis) > new Date(latest.last_ai_analysis) ? current : latest;
        })
        return this.getUserFriendlyDate(lastRunDateObj.last_ai_analysis);
      }
      return "Unknown"
    },
    addToApprovalChange(treeID, treeImageID, value, index){
      this.approvalChange[index] = {"tree_id": treeID, "tree_image_id": treeImageID, "change": value};
      console.log("Here is the current approval changes:")
      console.log(this.approvalChange)
    },
    doDisplayName(name) {
      return name in this.imageDetails;
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
      } else {
        this.error = true;
      }

    },
    async runNewAnalysis() {
      this.runAnalysisClicked = true;
      axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/admin/custom-model-species-image-analysis/`)
          .then(response => (this.newAnalysisOutput = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    treeInfoDisplay() {
      let treeInfoDisplay = "Show Tree Info";
      if (this.showTreeInfo) {
        treeInfoDisplay = "Hide Tree Info"
      }
      return treeInfoDisplay;
    },
    getImagePath(obj) {
      const imagePath = `${process.env.VUE_APP_API_SERVER_URL}/${obj.image_path}`
      console.log(imagePath);
      return imagePath
    },
    getJSONModelSuggestions(obj) {
      const modelString = obj.latest_labels;
      const validModelString = modelString.replace(/'/g, '"');

      console.log("Here's the model string:")
      console.log(validModelString)
      return JSON.parse(validModelString);
    },
    getDisplayModelStatus() {
      if (!this.modelStatus) {
        return "unknown"
      } else if (this.modelStatus["a_model_status"] === "STOPPED") {
        return "not running"
      } else {
        return "running"
      }
    },
    async checkModelRunning() {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/admin/check-model-status/`)
          .then(response => (this.modelStatus = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getLatestAnalysis() {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/admin/latest-species-image-analysis/`)
          .then(response => (this.analysisData = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    }
  },
  async mounted() {
    await this.checkModelRunning();
    await this.getLatestAnalysis();

  },
  name: 'TreeInfo',
  components: {},
  props: []

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
    <template v-else-if="runAnalysisClicked">
      <div class="container">
        <div class="box table-container mx-5 my-5">
          <div class="content is-size-5 has-text-centered">New analysis running...
            <br>
            <br>
            This can take up to 30 minutes to complete. Feel free to close the page and wait for the new analysis output
            to appear.
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
          Here, you can check the images uploaded for trees and see if they align with the current species type.
          The suggested trees species type uses a custom AI model based on a dataset trained on the species types
          available on this site.
          <br> <br>
          <b>The model was last run on {{ lastAnalysisDate() }}</b>
          <br><br>
          It is certainly not foolproof so please use your own judgement on determining whether a conflict exists and
          the action to take.
          <br> <br>
          A confidence score is provided as a guide to assess how strongly the model views the image to be of a certain
          species type.
          <br>
          <br>
          You can also run a new analysis at the bottom of the page but bear in mind that it can take up to
          30 minutes to run the model so please check back to view the results.
          <br>
          <br>
          Choose whether to remove the image, update the species type, or take no action.
        </div>
      </div>
      <div class="box table-container mx-5 my-3" v-for="(obj, index) in this.analysisData" :key="index">
        <img class="my-4" :src="getImagePath(obj)" alt="Tree Image"/>
        <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="has-text-centered">Type</th>
            <th class="has-text-centered">Value</th>
          </tr>
          <tr v-for="(val, name, index) in obj" :key="index">
            <template v-if="doDisplayName(name)">
              <td>
                {{ this.imageDetails[name] }}
              </td>
              <td>
                {{ val }}
              </td>
            </template>
          </tr>

        </table>
        <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="has-text-centered">Model Suggested Species Type</th>
            <th class="has-text-centered">Confidence (%)</th>
          </tr>
          <tr v-for="(modelObj, index) in getJSONModelSuggestions(obj)" :key="index">
            <template v-if="index < 3">
              <td>
                {{ modelObj.Name }}
              </td>
              <td>
                {{ modelObj.Confidence.toFixed(2) }}
              </td>
            </template>

          </tr>
        </table>
        <div class="control is-centered">
          <div class="select">
            <select @change="addToApprovalChange(
                          obj.tree_id,
                          obj.tree_image_id,
                          $event.target.value,
                          index)">
              <option value="no_change">No Action</option>
              <option value="remove_image">Remove Image</option>
              <option v-for="(modelObj, index) in getJSONModelSuggestions(obj)" :value="modelObj.Name" :key="index">
                Change to {{modelObj.Name}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="box table-container mx-5 my-5" v-if="this.getDisplayModelStatus() === 'not running'">
        Here you can rerun the model to get updated suggestions on the species type of a tree.
        <br>
        <br>
        Please only rerun the analysis sparingly (suggested once a week) due to costs incurred in running it.
        The model was last run on {{ lastAnalysisDate() }}.
        <div class="buttons is-centered mt-4">
          <button @click="this.showTreeInfo = !this.showTreeInfo" class="button is-primary">
            Rerun Analysis
          </button>
        </div>

      </div>
      <div class="box table-container mx-5 my-5">

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

