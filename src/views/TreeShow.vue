<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import axios from "axios";
import TheTreeEditDisplay from "@/components/data-components/TheTreeEditDisplay.vue";
import TheTreeViewDisplay from "@/components/data-components/TheTreeViewDisplay.vue";

export default {
  data() {
    return {
      loading: true,
      error: false,
      colOptions: {
        "tree_id": "Tree Number",
        "tree_species_desc": "Species",
        "tree_species_type_desc": "Species Type",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
        "long_lat": "Coordinate (long/lat)",
        "tree_change_desc": "Tree Change Reason",
        "nickname": "Changed By"
      },
      editMode: false,
      treeInfo: {},
      imageInfo: null,
      invalidEdit: false
    }

  },
  computed: {
    treeID() {
      return parseInt(this.$route.params.id)
    },
    isAuthenticated() {
      return this.$auth0.isAuthenticated;
    }

  },
  watch: {},
  methods: {
    dynamicTitle(route) {
      return "Tree " + route;
    },
    updateEditMode() {
      if (!this.editMode && this.$store.getters.getSession.user_type_id < 1) {
        this.invalidEdit = true;
      } else {
        this.editMode = !this.editMode
      }
      console.log("Edit invalid is: " + this.invalidEdit)
    },

    async getTreeImages() {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/tree/approved-images/${this.$route.params.id}?limit=10`)
          .then(response => (this.imageInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getTreeHist() {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/tree/all-tree-info-hist/?limit=50&tree_id=${this.$route.params.id}`)
          .then(response => (this.treeInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },

    async runAPICalls() {
      await this.getTreeHist();
      await this.getTreeImages();
      console.log("This is the image data object:")
      console.log(this.imageInfo)
    }
  },
  async mounted() {
    await this.runAPICalls();
  },
  name: 'TreeInfo',
  components: {
    ThePageHero,
    TheTreeEditDisplay,
    TheTreeViewDisplay
  },
}


</script>

<template>

  <ThePageHero v-if="!editMode" :title="dynamicTitle(treeID)"
               subtitle="Get more info on this tree"
               description="Change the data you wish to view with the buttons below"/>


  <ThePageHero v-else :title="dynamicTitle(treeID)"
               subtitle="Edit the info on this tree"
               description="Help improve tree data quality by editing a tree near you"/>
  <div class="container my-5">

    <div class="field is-grouped is-grouped-centered mx-5">

    </div>
  </div>
  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>
  <div class="container" v-else>


    <template v-if="!editMode && !invalidEdit">
      <TheTreeViewDisplay
          :tree-info="treeInfo"
          :col-options="colOptions"
          :image-info="imageInfo"
          @changeToEdit="updateEditMode"></TheTreeViewDisplay>
    </template>
    <template v-else-if="invalidEdit">
      <div class="container">
        <div class="box mx-5 mb-3 has-text-centered">
          <div v-if="isAuthenticated" class="content has-text-success has-text-centered is-size-5">You are unable to edit data as
            you
            have
            not signed the site's terms and conditions. Please approve it
            <router-link to="/profile"> on your profile
            </router-link>
            if you wish to contribute.

          </div>
          <div v-else class="content has-text-success has-text-centered is-size-5">You are not logged in and so are unable to edit
            data. Please either create an account or log in.
            Once you have you are in your account, please sign the terms and conditions on your profile page to start
            editing</div>
          <div class="content has-text-success has-text-centered is-size-5">
            Thank you for your interest in contributing to the community!
          </div>
        </div>
      </div>

    </template>
    <template v-else>
      <TheTreeEditDisplay
          :tree-info="treeInfo"
          :col-options="colOptions"
          :image-info="imageInfo"
          @changeToView="updateEditMode">
      </TheTreeEditDisplay>
    </template>

  </div>
</template>


