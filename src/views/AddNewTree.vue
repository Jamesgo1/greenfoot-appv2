<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import axios from "axios";

export default {
  data() {
    return {
      formOutput: {
        "diameter_cm": {
          userOutputName: "Diameter (cm)",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: false
        },
        "spread_radius_m": {
          userOutputName: "Spread Radius (m)",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: false
        },
        "tree_height_m": {
          userOutputName: "Height (m)",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: false
        },
        "longitude": {
          userOutputName: "Longitude",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: false
        },
        "latitude": {
          userOutputName: "Latitude",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: false
        },
        "tree_type_desc": {
          userOutputName: "Tree Type",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_species_type_desc": {
          userOutputName: "Species Type",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_species_desc": {
          userOutputName: "Species",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_age_group_desc": {
          userOutputName: "Age Type",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_surround_desc": {
          userOutputName: "Surround",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_vigour_desc": {
          userOutputName: "Vigour",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
        "tree_condition_desc": {
          userOutputName: "Condition",
          dropdownOptions: null,
          newData: null,
          edit: false,
          dropdownClass: "dropdown"
        },
      },
      userLat: null,
      userLong: null,
      submissionErrors: [],
      user: this.$auth0.user,
      loading: false,
      error: false,
      submissionSuccessful: false
    }
  },
  computed: {},
  watch: {},
  methods: {
    getPlaceholderDropdown(name) {
      let placeholder = "Choose"
      const newData = this.formOutput[name].newData;

      if (newData) {
        placeholder = newData.table_desc;
      } else if (name === "tree_species_desc" && !this.formOutput["tree_species_type_desc"].newData) {
        placeholder = "Choose species type first"
      }
      return placeholder;
    },
    async addDropdownData(name, val) {
      console.log("Now adding dropdown data...")
      this.formOutput[name].newData = val;
      // this.formOutput[name].dropdownClass = "dropdown";
      this.formOutput[name].edit = true;
      console.log("Here is the new form output for " + name)
      console.log(this.formOutput[name].newData)
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
    async getEditOptions(name) {
      if (!this.formOutput[name].dropdownOptions || name === "tree_species_type_desc" || name === "tree_species_desc") {
        await this.callOptionVals(name);
        this.formOutput[name].dropdownOptions = this.currentOptions;
      }
    },
    async switchEditUndo(name) {
      if (this.formOutput[name].dropdownClass === "dropdown is-right is-active") {
        this.formOutput[name].dropdownClass = "dropdown";
      } else if (this.formOutput[name].dropdownClass === "dropdown") {
        await this.getEditOptions(name);
        this.formOutput[name].dropdownClass = "dropdown is-right is-active";
      }
    },
    getUserLocation() {
      navigator.geolocation.getCurrentPosition(
          position => {
            this.userLat = position.coords.latitude;
            this.userLong = position.coords.longitude;
            console.log(this.userLat, this.userLong)
          },
          error => {
            console.log(error.message);
          },)
    },
    addUserLocationToForm(name) {
      if (name === "latitude") {
        this.formOutput.latitude.newData = this.userLat;
        return this.userLat;
      } else {
        this.formOutput.longitude.newData = this.userLong;
        return this.userLong;
      }
    },
    getInputClass(name) {
      let inputClass;
      if (this.formOutput[name].dropdownClass) {
        inputClass = "button is-small"
      } else {
        inputClass = "input"
      }
      if (this.formOutput[name].newData) {
        inputClass = inputClass + " has-background-success-light"
      }
      return inputClass
    },
    validateEditSubmission() {
      this.submissionErrors = [];
      Object.entries(this.formOutput).forEach(([key, currentColObj]) => {
        console.log("Here is the first key: " + key)
        console.log("Here is the current col object:")
        console.log(currentColObj)
        let newInput = currentColObj.newData;
        console.log("Here is the new data: " + newInput)
        // Check a new value has been entered
        if (!newInput) {
          this.submissionErrors.push(` - The field ${currentColObj.userOutputName} has not been updated`)
        } else if (key === "longitude") {
          if (!/^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(currentColObj.newData)) {
            this.submissionErrors.push(" - Invalid latitude entered")
          }
        } else if (key === "latitude") {
          if (!/^-?((1[0-7]\d(\.\d+)?|180(\.0+)?)|([1-9]?\d(\.\d+)?))$/.test(currentColObj.newData)) {
            this.submissionErrors.push(" - Invalid longitude entered")
          }
        }
        // Check numeric input
        else if (!currentColObj.dropdownClass) {

          if (!/^\d+$/.test(newInput)) {
            this.submissionErrors.push(` - The field ${currentColObj.userOutputName} contains a character that is not a number, only whole numbers are allowed here`)
          } else if (key === "diameter_cm" && (parseInt(newInput) < 1 || parseInt(newInput) > 1100)) {
            this.submissionErrors.push(` - The field ${currentColObj.userOutputName} is outside a reasonable range`)
          } else if (key === "spread_radius_m" && (parseInt(newInput) < 1 || parseInt(newInput) > 140)) {
            this.submissionErrors.push(` - The field ${currentColObj.userOutputName} is outside a reasonable range`)
          } else if (key === "tree_height_m" && (parseInt(newInput) < 1 || parseInt(newInput) > 115)) {
            this.submissionErrors.push(` - The field ${currentColObj.userOutputName} is outside a reasonable range`)
          }
        }
      });
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
    async formatSubmissionData() {
      const newSubmission = {}
      Object.entries(this.formOutput).forEach(([key, currentColObj]) => {
        let submissionKey = key.replace("_desc", "_id")
        let currentData = currentColObj.newData;
        if (["latitude", "longitude"].includes(key)) {
          if (typeof currentData === "string") {
            newSubmission[submissionKey] = parseFloat(currentData)
          } else {
            newSubmission[submissionKey] = currentData
          }
        } else if (typeof currentData === "string") {
          newSubmission[submissionKey] = parseInt(currentData);
        } else {
          newSubmission[submissionKey] = currentData.table_id;
        }
      });
      newSubmission["tree_change_desc"] = "User submitted new tree";

      await this.getUserDetails();
      newSubmission["user_id"] = this.userDetails.user_id;
      newSubmission["is_live_change_ind"] = 0;
      newSubmission["tree_data_quality_id"] = 2;
      this.finalSubmission = newSubmission;

      console.log("Here is the updated data:")
      console.log(newSubmission)

    },
    async postSubmission() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/tree/add-new-tree/`, this.finalSubmission)
          .then(response => (this.submissionOutput = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async submit() {
      console.log("Here is the final form output:")
      console.log(this.formOutput);
      this.validateEditSubmission();
      if (this.submissionErrors.length === 0) {
        this.loading = true;
        await this.formatSubmissionData();
        await this.postSubmission();
        this.submissionSuccessful = true;

      }

    }
  },
  mounted() {
  },
  name: 'HomePage',
  components: {
    ThePageHero
  }
}
</script>

<template>
  <ThePageHero title="New Tree" subtitle="Add a new tree to our database"
               description="Please enter as much detail as you can about the tree."/>
  <template v-if="loading">
    <div class="container">
      <p class="title has-text-success has-text-centered">Submitting data, please wait...</p>
    </div>
  </template>
  <template v-else-if="this.submissionSuccessful">
    <div class="container">
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
  </template>
  <template v-else>
    <div class="box table-container mx-5 my-3 has-background-success-light">
      <div class="content">
        Please ensure that the tree does not already exist by taking at look at the
        <router-link to="/explore">Explore
        </router-link>
        page if you have not already.
      </div>
    </div>
    <div class="buttons is-centered mt-4">
      <button @click="getUserLocation()" class="button is-success is-light">Use Current Location For Lat/Long</button>
    </div>
    <div class="box table-container mx-5 my-5">
      <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto my-5">
        <tr>
          <th class="has-text-centered">Type</th>
          <th class="has-text-centered">Value</th>
        </tr>
        <tr v-for="(obj, name, index) in formOutput" :key="index">
          <td>
            {{ obj.userOutputName }}
          </td>
          <td>

            <template v-if="formOutput[name].dropdownClass">
              <div :class="this.formOutput[name].dropdownClass">
                <div class="dropdown trigger" @click="switchEditUndo(name)">
                  <div class="has-text-centered is-success is-light" aria-haspopup="true"
                       aria-controls="dropdown-menu">
                    <div :class="getInputClass(name)">
                      {{ getPlaceholderDropdown(name) }}
                    </div>
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
              </div>
            </template>
            <template v-else-if="name === 'latitude' && this.userLat">
              <div class="has-background-success-light">{{ this.addUserLocationToForm(name) }}</div>

            </template>
            <template v-else-if="name === 'longitude' && this.userLong">
              <div class="has-background-success-light">{{ this.addUserLocationToForm(name) }}</div>

            </template>
            <template v-else>
              <input :class="getInputClass(name)" v-model="this.formOutput[name].newData"
                     placeholder="Choose Value"/>
            </template>
          </td>
        </tr>
      </table>

      <div class="has-text-danger" v-if="submissionErrors.length > 0">
        The following errors occurred with your submission:

      </div>
      <div class="has-text-danger my-2" v-for="(errorMessage, index) in submissionErrors" :key="index">
        {{ errorMessage }}
      </div>
      <div class="buttons is-centered my-5">
        <button class="button is-success" @click="submit()">Submit</button>
      </div>
    </div>
  </template>
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