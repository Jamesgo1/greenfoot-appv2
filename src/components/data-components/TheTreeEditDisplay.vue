<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      error: false,
      formOutput: {
        "tree_species_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
        "tree_species_type_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
        "diameter_cm": {dropdownOptions: null, newData: null, edit: false, dropdownClass: false},
        "spread_radius_m": {dropdownOptions: null, newData: null, edit: false, dropdownClass: false},
        "tree_height_m": {dropdownOptions: null, newData: null, edit: false, dropdownClass: false},
        "tree_age_group_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
        "tree_surround_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
        "tree_vigour_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
        "tree_condition_desc": {dropdownOptions: null, newData: null, edit: false, dropdownClass: "dropdown"},
      },
      currentFormDetail: null,
      submissionErrors: [],
      numEdits: 0,
      origLiveData: null,
      changeReason: null,
      userDetails: null,
      user: this.$auth0.user,
      finalSubmission: null,
      submissionOutput: null,
      loadingSubmission: false,
      submissionSuccessful: false,
      selectedFile: null,
      imageFormData: null,
      imageResponse: null,
      imageTags: null,
      imageErrors: [],
      imageTagsLoading: false
    }

  },
  computed: {},
  watch: {},
  methods: {
    changeToViewDisplay() {
      this.$emit("changeToView");
    },
    getTreeVal(name) {
      const treeHistEntry = this.treeInfo[0]
      if (name === "long_lat") {
        return `(${treeHistEntry.longitude}, ${treeHistEntry.latitude})`

      } else {
        return treeHistEntry[name]
      }
    },
    isBeingEdited(name) {
      return this.formOutput[name].edit;
    },
    isEditableField(name) {
      return Object.keys(this.formOutput).includes(name);
    },
    getPlaceholderDropdown(name) {
      let placeholder = this.getTreeVal(name)
      const newData = this.formOutput[name].newData;

      if (newData) {
        placeholder = newData.table_desc;
      }
      return placeholder;
    },
    colEditButton(name) {

      let buttonName = "Edit";
      if (this.formOutput[name].edit) {
        buttonName = "Undo";
      }
      return buttonName;
    },
    async callOptionVals(name) {
      const apiName = name.replace("_desc", "")
      let apiURI = `${process.env.VUE_APP_API_SERVER_URL}/util/table-options/?table_val=${apiName}`
      if (apiName === "tree_species") {
        const correspondingVal = this.getPlaceholderDropdown("tree_species_type_desc");
        apiURI = apiURI + `&tree_species_type=${correspondingVal}`
      }
      return axios
          .get(apiURI)
          .then(response => (this.currentOptions = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async addDropdownData(name, val) {
      this.formOutput[name].newData = val;
      this.formOutput[name].dropdownClass = "dropdown";
      this.formOutput[name].edit = true;
      if (name === "tree_species_type_desc") {
        await this.getEditOptions("tree_species_desc")
        this.formOutput["tree_species_desc"].edit = true;
        console.log("Here are species dropdowns:")
        console.log(this.currentOptions);
        console.log("First option: " + this.currentOptions[0].table_desc)
        this.formOutput["tree_species_desc"].newData = this.currentOptions[0];
        console.log("Here's the form output:")
        console.log(this.formOutput["tree_species_desc"])
      }
    },
    async getEditOptions(name) {
      if (!this.formOutput[name].dropdownOptions || name === "tree_species_type_desc" || name === "tree_species_desc") {
        await this.callOptionVals(name);
        this.formOutput[name].dropdownOptions = this.currentOptions;
      }
    },
    async switchEditUndo(name) {
      const currentFormDetails = this.formOutput[name];
      const keepSpeciesEdited = name === "tree_species_desc" && this.formOutput["tree_species_type_desc"].edit
      if (keepSpeciesEdited) {
        if (currentFormDetails.dropdownClass !== "dropdown is-right is-active") {
          this.formOutput[name].dropdownClass = "dropdown is-right is-active";
        } else {
          this.formOutput[name].dropdownClass = "dropdown"
        }
      } else if (currentFormDetails.edit) {
        if (currentFormDetails.dropdownClass) {
          this.formOutput[name].dropdownClass = "dropdown";
        }
        this.formOutput[name].edit = false;
        this.formOutput[name].newData = null;

      } else {
        if (currentFormDetails.dropdownClass) {
          await this.getEditOptions(name);
          this.formOutput[name].dropdownClass = "dropdown is-right is-active";
        }
        this.formOutput[name].edit = true;
      }
      console.log("current form output for " + name + ":")
      console.log(this.formOutput[name])
    },
    editColorClass(name) {
      let colorClass = "";
      if (this.formOutput[name].dropdownClass) {
        colorClass = "has-background-primary-light";
      }
      return colorClass;
    },
    async validateEditSubmission() {
      const treeHistEntry = this.treeInfo[0]
      this.submissionErrors = [];
      this.numEdits = 0;
      Object.entries(this.formOutput).forEach(([key, currentColObj]) => {
        if (currentColObj.edit) {
          this.numEdits += 1;
          let newInput = currentColObj.newData;
          // Check a new value has been entered
          if (!newInput) {
            this.submissionErrors.push(` - The field ${this.colOptions[key]} has been edited but has an empty value`)
          }
          // Check the value has been updated to a new value
          else if (newInput === String(treeHistEntry[key])) {
            this.submissionErrors.push(` - The field ${this.colOptions[key]} has been edited but contains the original value`)
          }
          // Check numeric input
          else if (!currentColObj.dropdownClass) {

            if (!/^\d+$/.test(newInput)) {
              this.submissionErrors.push(` - The field ${this.colOptions[key]} contains a character that is not a number, only whole numbers are allowed here`)
            } else if (key === "diameter_cm" && (parseInt(newInput) < 1 || parseInt(newInput) > 1100)) {
              this.submissionErrors.push(` - The field ${this.colOptions[key]} is outside a reasonable range`)
            } else if (key === "spread_radius_m" && (parseInt(newInput) < 1 || parseInt(newInput) > 140)) {
              this.submissionErrors.push(` - The field ${this.colOptions[key]} is outside a reasonable range`)
            } else if (key === "tree_height_m" && (parseInt(newInput) < 1 || parseInt(newInput) > 115)) {
              this.submissionErrors.push(` - The field ${this.colOptions[key]} is outside a reasonable range`)
            }

          }
        }
      })
      if (this.formOutput["tree_species_desc"].edit || this.formOutput["tree_species_type_desc"].edit) {
        await this.callOptionVals("tree_species_desc");
        const currentTreeSpeciesType = this.getPlaceholderDropdown("tree_species_type_desc");
        const currentTreeSpecies = this.getPlaceholderDropdown("tree_species_desc");
        console.log(`The current tree species type is ${currentTreeSpeciesType} and the current tree species is ${currentTreeSpecies}. Here are the current tree species options`)
        console.log(this.currentOptions)

        if (!this.currentOptions.some(obj => Object.values(obj).includes(currentTreeSpecies))) {
          this.submissionErrors.push(` - You have an invalid species (${currentTreeSpecies}) for tree species type ${currentTreeSpeciesType}`)
        }
      }
      if (!this.numEdits && !this.selectedFile) {
        this.submissionErrors.push(" - No edits have been made")
      }
      if (!this.changeReason && !this.selectedFile) {
        this.submissionErrors.push(" - You have not submitted a reason for the change")
      }
      if (this.imageTagsLoading) {
        this.submissionErrors.push(" - Still processing image. Please wait.")
      } else if (this.selectedFile && !this.imageTags.some(obj => obj.Name === "Tree")) {
        this.submissionErrors.push(" - Sorry, a clear image of a tree was not found in the picture you uploaded. Please check and choose a clearer image if you have one.")
      }
    },
    async getUserDetails() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/user/user-details/`, {"user_auth0_sub": this.user.sub})
          .then(response => (this.userDetails = response.data[0]))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getLatestLiveData() {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/tree/all-tree-info-full-table/?&tree_id=${this.$route.params.id}`)
          .then(response => (this.origLiveData = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async formatSubmissionData() {
      this.finalSubmission = null;
      await this.getLatestLiveData();
      console.log("Here is the latest live data:")
      console.log(this.origLiveData);

      const newSubmission = {...this.origLiveData[0]};
      Object.entries(this.formOutput).forEach(([key, currentColObj]) => {
        if (currentColObj.edit) {
          let submissionKey = key.replace("_desc", "_id")
          if (Object.keys(newSubmission).includes(submissionKey)) {
            let currentData = currentColObj.newData;
            if (typeof currentData === "string") {
              newSubmission[submissionKey] = parseInt(currentData);
              console.log("Changing string val")
            } else {
              newSubmission[submissionKey] = currentData.table_id;
            }
          }
        }
      });
      newSubmission["tree_change_desc"] = this.changeReason;

      await this.getUserDetails();
      newSubmission["user_id"] = this.userDetails.user_id;
      newSubmission["is_live_change_ind"] = 0
      this.finalSubmission = newSubmission;

      console.log("Here is the updated data:")
      console.log(newSubmission)

    },
    async postSubmission() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/tree/add-new-tree-detail/`, this.finalSubmission)
          .then(response => (this.submissionOutput = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async submit() {
      this.submissionOutput = null;
      await this.validateEditSubmission();
      console.log("Here are the number of submission errors: " + this.submissionErrors.length)
      if (this.submissionErrors.length === 0) {
        this.loadingSubmission = true;
        await this.formatSubmissionData();
        if (this.numEdits) {
          console.log("Now awaiting format submission data...")
          await this.postSubmission();

        }
        if (this.selectedFile) {
          await this.postImage()
        }
        this.loadingSubmission = false;
      }

      console.log(this.submissionErrors)
      console.log("Final output:")
      console.log(this.formOutput)
      if (this.submissionOutput && Object.keys(this.submissionOutput).length > 0) {
        this.submissionSuccessful = true;
      } else if (this.selectedFile && this.submissionErrors.length === 0) {
        this.submissionSuccessful = true;
      }
    },
    async validateDeletion() {
      this.submissionErrors = []
      Object.entries(this.formOutput).forEach(([key, currentColObj]) => {
        if (currentColObj.edit) {
          this.submissionErrors.push(` - The field ${this.colOptions[key]} has been edited. Please undo all edits if requesting deletion`)
        }
      });
      if (!this.changeReason) {
        this.submissionErrors.push(" - You have not submitted a reason for deletion")
      }
    },
    async formatForDeletion() {
      this.finalSubmission = null;
      await this.getLatestLiveData();

      const newSubmission = {...this.origLiveData[0]};
      newSubmission["is_live_change_ind"] = -2
      newSubmission["tree_change_desc"] = this.changeReason;
      await this.getUserDetails();
      newSubmission["user_id"] = this.userDetails.user_id;
      this.finalSubmission = newSubmission;
    },
    async requestDelete() {
      await this.validateDeletion();
      if (this.submissionErrors.length === 0) {
        this.loadingSubmission = true;
        await this.formatForDeletion();
        await this.postSubmission();
        this.loadingSubmission = false;
        if (this.submissionOutput && Object.keys(this.submissionOutput).length > 0) {
          this.submissionSuccessful = true;
        }
      }
    },
    async getImageTags() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/images/image-validation/`,
              this.imageFormData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
          .then(response => (this.imageTags = response.data))
          .catch(error => {
            if (error.response.status === 400 || error.response.status === 503) {
              this.imageErrors.push(error.response.data.detail)
            } else {
              console.log(error);
              this.error = true;
            }
          })
          .finally(() => {
            this.imageTagsLoading = false;
          });
    },
    async handleFileChange(event) {
      this.imageTagsLoading = true;
      this.imageErrors = [];
      this.selectedFile = event.target.files[0];
      await this.runImageUpload();
      await this.getImageTags();
    },
    async postImage() {
      console.log("Here is the user id: " + this.userDetails.user_id);
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/images/uploadfile/${this.$route.params.id}/${this.userDetails.user_id}`,
              this.imageFormData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
          .then(response => (this.imageResponse = response.data))
          .catch(error => {
            if (error.response.status === 409) {
              this.submissionErrors.push(error.response.data.detail)
            } else {
              console.log(error);
              this.error = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
    },
    async runImageUpload() {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.imageFormData = formData
    }
  },
  mounted() {
  },
  name: 'TreeInfo',
  components: {},
  props: ["colOptions", "treeInfo"]
}


</script>

<template>
  <div class="container" v-if="this.loadingSubmission">
    <p class="title has-text-success has-text-centered">Submitting data, please wait...</p>
  </div>
  <div class="container" v-else-if="this.error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>

  <div class="container" v-else-if="this.submissionSuccessful">
    <div class="box table-container mx-5 my-5">
      <p class="is-size-5 has-text-centered">Your data has been successfully submitted and stored!
        <br>
        <br>
        If your data is approved, it will then be shown on the site.
        <br>
        <br>
        Thank you for helping to improve what we know about trees in the Belfast area.
      </p>
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

  <div class="container" v-else>
    <div class="field is-grouped is-grouped-centered mx-5">
      <div class="buttons">

        <div>
          <button class="button is-info" @click="this.changeToViewDisplay">View</button>
        </div>
      </div>
    </div>


    <template v-for="(treeHistEntry, treeIndex) in this.treeInfo" :key="treeIndex">

      <div class="box table-container mx-5 my-5" v-if="treeIndex === 0">
        <div class="box table-container mx-1 mb-3">
          <div class="buttons is-centered">
            <button class="button is-success is-light">Upload Image</button>
            <input class="mt-2 has-text-success" type="file" @change="handleFileChange"/>
          </div>
          <template v-if="!imageTagsLoading">
            <div v-if="!this.selectedFile" class="content is-centered has-text-success mx-6 is-size-6">
              Images are a great way to help improve the site!
            </div>
            <div v-else class="content is-centered has-text-success mx-6">
              Thanks for adding an image! Click Submit at the bottom of the page to add it to the site.
            </div>
          </template>
          <template v-else>
            <div class="content is-centered has-text-success mx-6">
              Analysing image. Please wait before submitting...
            </div>
          </template>
        </div>
        <div v-if="this.formOutput['tree_species_type_desc'].edit" class="content">
          Please note that only a valid species will be chosen for species type
        </div>
        <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
          <tr v-for="(val, name, index) in colOptions" :key="index">
            <template v-if="isEditableField(name)">
              <td>
                {{ val }}
              </td>
              <td v-if="this.isBeingEdited(name)" :class="editColorClass(name)">

                <template v-if="formOutput[name].dropdownClass">
                  <div :class="this.formOutput[name].dropdownClass">
                    <div class="has-text-centered is-success is-light" aria-haspopup="true"
                         aria-controls="dropdown-menu">
                      {{ getPlaceholderDropdown(name) }}
                      <span class="icon is-small">
                            <i class="fas fa-angle-down"></i>
                          </span>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                      <div class="dropdown-content">
                        <div class="dropdown-item" v-for="(val, index) in formOutput[name].dropdownOptions"
                             :key="index" @click="addDropdownData(name, val)">{{ val.table_desc }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <input class="input has-background-primary-light" v-model="this.formOutput[name].newData"
                         :placeholder="getTreeVal(name)"/>
                </template>
              </td>
              <td v-else>
                {{ getTreeVal(name) }}
              </td>

              <td>
                <button class="button is-info is-light is-small" @click="switchEditUndo(name)">{{
                    colEditButton(name)
                  }}
                </button>
              </td>

            </template>

          </tr>
        </table>
        <div class="field has-text-centered">
          <input class="input" v-model="this.changeReason"
                 placeholder="Change Description"/>
        </div>
        <div class="has-text-danger" v-if="submissionErrors.length > 0">
          The following errors occurred with your submission:

        </div>
        <div class="has-text-danger my-2" v-for="(errorMessage, index) in submissionErrors" :key="index">
          {{ errorMessage }}
        </div>
        <div class="buttons is-centered">
          <button class="button is-success" @click="submit()">Submit</button>
          <button class="button is-danger" @click="requestDelete()">Request Delete</button>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.dropdown-content {
  max-height: 15em;
  overflow: auto;
}

.table {
  overflow-x: auto;
}
</style>

