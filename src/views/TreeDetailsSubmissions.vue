<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheApproveTree from "@/components/admin-components/TheApproveTree.vue";
import TheApproveNewTree from "@/components/admin-components/TheApproveNewTree.vue";
import TheApproveDeletions from "@/components/admin-components/TheApproveDeletions.vue";
import TheApproveTreeImage from "@/components/admin-components/TheApproveTreeImage.vue";
import TheImageAnalysisPage from "@/components/admin-components/TheImageAnalysisPage.vue";
import axios from "axios";

export default {
  data() {
    return {
      treeInfo: null,
      loading: true,
      error: false,
      displayName: false,
      currentTreeNumber: 0,
      currentLiveTreeInfo: null,
      numChanges: 0,
      editableFields: {
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
      },
      colsToDisplay: {
        "tree_id": "Tree Number",
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_type_desc": "Tree Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "tree_change_desc": "Tree Change Reason",
        "nickname": "Changed By"
      },
      origValsInfo: null,
      changeList: null,
      updateOutput: null,
      numApproved: 0,
      numDenied: 0,
      numUnchanged: 0,
      submitSuccessful: false,
      approveSubmissionPage: false,
      treeToEdit: null,
      conflictErrorArray: [],
      treeNumCountObj: {},
      newTreesInfo: null,
      treeDeletionInfo: null,
      newTreeToApprove: null,
      newTreeApprovalPage: false,
      currentPage: "submissions",
      newDeletionToApprove: null,
      imageToApprove: null,
      allImagesToApprove: null
    }
  },
  computed: {},
  watch: {},
  async created() {
  },
  methods: {
    async getAllTreeSubmissions() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/admin/all-tree-info-to-approve/?limit=100`)
          .then(response => (this.treeInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getDeletionSubmissions() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/admin/trees-requested-deletion/?limit=100`)
          .then(response => (this.treeDeletionInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getLiveTreeInfoAll() {
      return axios.post(`${process.env.VUE_APP_API_SERVER_URL}/tree/all-tree-info-list-input/`,
          await this.treeInfo.map(treeObj => treeObj.tree_id))
          .then(response => (this.origValsInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getNewTreesToApprove() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/admin/all-new-trees-to-approve/?limit=100`)
          .then(response => (this.newTreesInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getNewTreeImagesToApprove() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/admin/images-to-approve/?limit=100`)
          .then(response => (this.allImagesToApprove = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },

    async loadInitialData() {
      await this.getAllTreeSubmissions();
      await this.getDeletionSubmissions();
      await this.getLiveTreeInfoAll();
      await this.getNewTreesToApprove();
      await this.getTreeNumCount();
      await this.getNewTreeImagesToApprove();
    },
    async getTreeNumCount() {
      const treeNumCount = {};
      for (const treeHistObj of this.treeInfo) {
        const treeID = treeHistObj.tree_id;
        if (!(treeID in treeNumCount)) {
          this.currentLiveTreeInfo = this.origValsByTreeID(treeID);
          treeNumCount[treeID] = {sub_count: 0, total_changes: 0, last_changed: null}
        }
        treeNumCount[treeID]["sub_count"] = treeNumCount[treeID].sub_count + 1;
        treeNumCount[treeID]["last_changed"] = this.getUserFriendlyDate(treeHistObj.tree_change_datetime);
        Object.entries(treeHistObj).forEach(([key, value]) => {
          if (this.doDisplayName(key, value, treeID)) {
            treeNumCount[treeID]["total_changes"] = treeNumCount[treeID].total_changes + 1;
          }
        })
      }
      console.log(treeNumCount)
      this.treeNumCountObj = treeNumCount;
    },
    origValsByTreeID(treeID) {
      console.log("Here's the orig vals object")
      console.log(this.origValsInfo)
      return this.origValsInfo.find(obj => obj.tree_id === treeID);

    },
    goToEdit(treeID) {
      this.treeToEdit = treeID
      this.currentPage = "edits";
    },
    goToApproval(uniqueID, page) {
      if (page === "newtree") {
        this.newTreeToApprove = this.newTreesInfo.find(obj => obj.tree_history_id === uniqueID);
        this.currentPage = 'newtree';
      } else if (page === "deletions") {
        this.newDeletionToApprove = this.treeDeletionInfo.find(obj => obj.tree_history_id === uniqueID);
        this.currentPage = "deletions";
      } else if (page === "images") {
        this.imageToApprove = this.allImagesToApprove.find(obj => obj.image_id === uniqueID);
        console.log("Here is the image to approve:")
        console.log(this.imageToApprove)
        this.currentPage = "images";
      }
      else if(page === "ai_analysis"){
        this.currentPage = "ai_analysis"
      }

      console.log(this.currentPage)

    },
    async returnToSubmissions() {
      await this.loadInitialData();
      this.currentPage = "submissions";
    },
    getUserFriendlyDate(date) {
      const dateObj = new Date(date)
      return dateObj.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    doDisplayName(name, val, treeID) {
      if (this.origValsInfo && Object.keys(this.editableFields).includes(name)) {
        const origValObj = this.origValsInfo.find(obj => obj.tree_id === treeID);
        if (origValObj[name] !== val) {
          return true
        }
      }
      return false
    },
  },

  async mounted() {
    await this.loadInitialData();
  },
  name: 'HomePage',
  components: {
    ThePageHero,
    TheApproveTree,
    TheApproveNewTree,
    TheApproveDeletions,
    TheApproveTreeImage,
    TheImageAnalysisPage
  }
}
</script>

<template>
  <template v-if="['edits', 'newtree', 'deletions', 'images', 'ai_analysis'].includes(this.currentPage)">
    <ThePageHero
        title="Tree Submissions"
        subtitle="Admin Page"
        description="Approve or Decline User Submissions"/>
    <div class="field is-grouped is-grouped-centered mx-5 my-5">
      <div class="buttons">

        <div>
          <button class="button is-info" @click="this.returnToSubmissions()">Back to submissions</button>
        </div>

      </div>

    </div>
    <TheApproveTree v-if="this.currentPage === 'edits'" :tree-to-edit="this.treeToEdit" :orig-vals-info="origValsInfo">
    </TheApproveTree>
    <TheApproveNewTree v-else-if="this.currentPage === 'newtree'" :new-tree-to-approve="this.newTreeToApprove"
                       :cols-to-display="this.colsToDisplay">
    </TheApproveNewTree>
    <TheApproveDeletions v-else-if="this.currentPage === 'deletions'" :new-tree-to-approve="this.newDeletionToApprove"
                         :cols-to-display="this.colsToDisplay"></TheApproveDeletions>
    <TheApproveTreeImage v-else-if="this.currentPage === 'images'" :new-tree-to-approve="this.imageToApprove"
                         :cols-to-display="this.colsToDisplay"></TheApproveTreeImage>
    <TheImageAnalysisPage v-else-if="this.currentPage === 'ai_analysis'"></TheImageAnalysisPage>


  </template>
  <template v-else>
    <ThePageHero
        title="Tree Submissions"
        subtitle="Admin Page"
        description="Choose a tree to approve submissions"/>

    <template v-if="loading">
      <div class="container">
        <p class="title has-text-success has-text-centered">Loading data...</p>
      </div>
    </template>
    <template v-else-if="error">
      <div class="container">
        <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment,
          please
          try
          again later</p>
      </div>
    </template>
    <template v-else>
      <div class="box table-container mx-2 my-5">
        <div class="content has-text-centered is-underlined">
          Tree Edits To Approve
        </div>
        <table class="table has-text-centered is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="is-size-7">
              Tree Num
            </th>
            <th class="is-size-7">
              Sub Count
            </th>
            <th class="is-size-7">
              Total Changes
            </th>
            <th class="is-size-7">
              Last Change
            </th>
            <th class="is-size-7">
              View
            </th>
          </tr>
          <tr v-for="(treeStatusObj, treeID, index) in this.treeNumCountObj" :key="index">
            <td class="is-size-7">
              {{ treeID }}
            </td>
            <td class="is-size-7" v-for="(statVal, statName, statIndex) in treeStatusObj" :key="statIndex">
              {{ statVal }}
            </td>
            <td>
              <div class="button has-background-success-light is-small" @click="goToEdit(treeID)">
                View
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="box table-container mx-2 my-5">
        <div class="content has-text-centered is-underlined">
          New Trees to Approve
        </div>

        <table class="table has-text-centered is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="is-size-7">
              Tree Num
            </th>
            <th class="is-size-7">
              Date
            </th>
            <th class="is-size-7">
              View
            </th>
          </tr>
          <tr v-for="(newTreesObj, index) in this.newTreesInfo" :key="index">
            <td class="is-size-7">
              {{ newTreesObj.tree_id }}
            </td>
            <td class="is-size-7">
              {{ this.getUserFriendlyDate(newTreesObj.tree_change_datetime) }}
            </td>
            <td>
              <div class="button has-background-success-light is-small"
                   @click="goToApproval(newTreesObj.tree_history_id, 'newtree')">
                View
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="box table-container mx-2 my-5">
        <div class="content has-text-centered is-underlined">
          Trees Requesting Deletion
        </div>

        <table class="table has-text-centered is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="is-size-7">
              Tree Num
            </th>
            <th class="is-size-7">
              Date
            </th>
            <th class="is-size-7">
              View
            </th>
          </tr>
          <tr v-for="(newTreesObj, index) in this.treeDeletionInfo" :key="index">
            <td class="is-size-7">
              {{ newTreesObj.tree_id }}
            </td>
            <td class="is-size-7">
              {{ this.getUserFriendlyDate(newTreesObj.tree_change_datetime) }}
            </td>
            <td>
              <div class="button has-background-success-light is-small"
                   @click="goToApproval(newTreesObj.tree_history_id, 'deletions')">
                View
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="box table-container mx-2 my-5">
        <div class="content has-text-centered is-underlined">
          Images of Trees to Approve
        </div>

        <table class="table has-text-centered is-narrow is-striped is-bordered mx-auto">
          <tr>
            <th class="is-size-7">
              Tree Num
            </th>
            <th class="is-size-7">
              Date
            </th>
            <th class="is-size-7">
              Submitted by
            </th>
            <th class="is-size-7">
              View
            </th>
          </tr>
          <tr v-for="(newTreesObj, index) in this.allImagesToApprove" :key="index">
            <td class="is-size-7">
              {{ newTreesObj.tree_id }}
            </td>
            <td class="is-size-7">
              {{ this.getUserFriendlyDate(newTreesObj.image_add_datetime) }}
            </td>
            <td class="is-size-7">
              {{ newTreesObj.nickname }}
            </td>
            <td>
              <div class="button has-background-success-light is-small"
                   @click="goToApproval(newTreesObj.image_id, 'images')">
                View
              </div>
            </td>
          </tr>
        </table>
      </div>
      <div class="box table-container mx-2 my-5">
        <div class="content has-text-centered is-underlined">
          Run AI Image Analysis
        </div>
        <div class="buttons is-centered mt-4">
          <button @click="goToApproval(0, 'ai_analysis')" class="button has-background-success-light">
            View Page
          </button>
        </div>
      </div>
    </template>
  </template>
</template>

<style>
.table {
  overflow-x: auto;
}
</style>

