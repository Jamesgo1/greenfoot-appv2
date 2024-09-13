<script>
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
      editableFields: {
        "tree_species_desc": "Species (Species Type)",
        "diameter_cm": "Diameter (cm)",
        "spread_radius_m": "Spread Radius (m)",
        "tree_height_m": "Height (m)",
        "tree_age_group_desc": "Age Type",
        "tree_surround_desc": "Surround",
        "tree_vigour_desc": "Vigour",
        "tree_condition_desc": "Condition",
      },
      changeList: null,
      updateOutput: null,
      numChanges: 0,
      numApproved: 0,
      submitSuccessful: false,
      submissionErrors: null,
      prevSubmissionObj: null,
      conflictVals: []
    }
  },
  computed: {},
  watch: {},
  async created() {
  },
  methods: {
    async getTreeHistData() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/admin/tree-to-approve-by-id/${this.treeToEdit}`)
          .then(response => (this.treeInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async createDefaultChangeList() {
      await this.getTreeHistData();
      this.conflictVals = [];
      this.changeList = {};
      const allTreeVals = {};
      this.numChanges = 0;
      this.treeInfo.forEach(treeHistObj => {
        const treeHistID = treeHistObj.tree_history_id;
        if (!(treeHistID in this.changeList)) {
          this.changeList[treeHistID] = {};
        }
        Object.entries(treeHistObj).forEach(([name, val]) => {
          if (this.doDisplayName(name, val, treeHistObj.tree_id)) {
            this.numChanges += 1;
            let nameForVal = name
            if (name in allTreeVals && allTreeVals[name] !== val) {
              this.conflictVals.push(name);
            } else {
              allTreeVals[name] = val;
            }
            if (name.includes("_desc")) {
              nameForVal = nameForVal.replace("_desc", "_id")
            }
            this.changeList[treeHistID][name] = {
              "approval": "0",
              "dataCol": this.editableFields[name],
              "dataDesc": val,
              "newDataCol": nameForVal,
              "newData": treeHistObj[nameForVal],
            };
          }
        })
      });
      console.log("Here's the default change list:")
      console.log(this.changeList);
      console.log("Here's the conflict list:")
      console.log(this.conflictVals)
    },
    getUserFriendlyDate(date) {
      const dateObj = new Date(date)
      return dateObj.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    },
    async getLiveTreeInfo(treeID) {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/tree/all-tree-info-full-table/?tree_id=${treeID}`)
          .then(response => (this.currentLiveTreeInfo = response.data[0]))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)

    },
    getConflictClass(name) {
      let conflictClass = ""
      if (this.conflictVals.includes(name)) {
        conflictClass = "has-background-danger-light"
      }
      return conflictClass;

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
    getOriginalVal(name, treeID) {
      if (this.origValsInfo) {
        const origValObj = this.origValsInfo.find(obj => obj.tree_id === treeID);
        if (name === "tree_species_desc") {
          return `${origValObj[name]} (${origValObj["tree_species_type_desc"]})`
        }
        return origValObj[name];
      }
      return null;
    },
    getNewValOutput(name, val, treeHistObj) {
      if (name === "tree_species_desc") {
        return `${treeHistObj[name]} (${treeHistObj["tree_species_type_desc"]})`;
      } else {
        return val;
      }
    },
    getNumNewChanges(treeIDVal) {
      return this.treeInfo.reduce((count, obj) => {
        return obj["tree_id"] === treeIDVal ? count + 1 : count;
      }, 0);
    },

    addToApproveOrDeny(treeHistID, name, optionSelected) {

      this.changeList[treeHistID][name]["approval"] = optionSelected;
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
    validateSubmissions() {
      const submissionsList = [];
      const allApprovedFields = [];
      this.submissionErrors = [];
      this.numApproved = 0;
      if (!this.changeList || this.changeList.length < 1) {
        this.submissionErrors.push("No approvals found. Please approve or deny each change and then submit.")
      } else {
        console.log("Change list:")
        console.log(this.changeList);
        Object.entries(this.changeList).forEach(([treeHistID, treeChangesObj]) => {
          console.log("Here is the treeHistID: " + treeHistID)
          const submissionObj = {"tree_history_id": treeHistID}
          Object.values(treeChangesObj).forEach(approvalObj => {
            const approvalVal = approvalObj.approval;
            if (approvalVal === "0") {
              console.log(typeof treeHistID)
              const treeHistObj = this.treeInfo.find(obj => obj.tree_history_id === parseInt(treeHistID));
              const subdate = treeHistObj["tree_change_datetime"]
              this.submissionErrors.push(`The value ${approvalObj.dataCol} has not been chosen for ${this.getUserFriendlyDate(subdate)}`)
            } else if (approvalVal === "1") {
              if (allApprovedFields.includes(approvalObj.newDataCol)) {
                this.submissionErrors.push(`The value ${approvalObj.dataCol} has already been approved. You cannot approve conflicting values. Please only approve one.`)
              } else {
                submissionObj[approvalObj.newDataCol] = approvalObj.newData;
                allApprovedFields.push(approvalObj.newDataCol);
                this.numApproved += 1;

              }
            }
          });
          submissionsList.push(submissionObj)
        });
      }
      return submissionsList
    },

    async formatForSubmission(submissionsList) {
      const allAssignmentsArray = []
      const origValObj = await this.getLiveTreeInfo(this.treeToEdit);
      let prevSubmissionObj = {...origValObj};
      delete prevSubmissionObj["tree_change_desc"]
      for (const submissionObj of submissionsList) {
        let subObj = null;
        console.log("Here is the submission:")
        console.log(submissionObj)
        if (Object.keys(submissionObj).length === 1) {
          console.log("None approved for tree history id" + submissionObj.tree_history_id)
          subObj = {"tree_history_id": parseInt(submissionObj.tree_history_id), "is_live_change_ind": -1}
        } else {
          subObj = {...prevSubmissionObj}
          console.log("Here is the object before adding new changes:")
          console.log(subObj)
          Object.entries(submissionObj).forEach(([col, val]) => {
            subObj[col] = val;
          });
          subObj["tree_history_id"] = parseInt(submissionObj.tree_history_id);
          subObj["is_live_change_ind"] = 1
          prevSubmissionObj = {...subObj}
        }
        allAssignmentsArray.push(subObj);
      }
      return allAssignmentsArray;

    },
    async submit() {
      console.log("Here is the approval output:")
      console.log(this.changeList)
      console.log("Running validation...")
      const subList = this.validateSubmissions()
      console.log("Submit: here's the validation errors:")
      console.log(this.submissionErrors)
      console.log("Here is the subList:")
      console.log(subList)

      if (this.submissionErrors.length === 0) {
        const outputUpdates = await this.formatForSubmission(subList);
        console.log("Here are the output updates:")
        console.log(outputUpdates)

        console.log("Total approved: " + this.numApproved)
        console.log("Total changes: " + this.numChanges)
        await this.patchChanges(outputUpdates);
        this.submitSuccessful = true;
      }
    }
  },

  async mounted() {
    // await this.getTreeHistData();
    await this.createDefaultChangeList();

  },
  props: ["treeToEdit", "origValsInfo"],
  name: 'HomePage',
  components: {}
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
  <div class="container" v-else>
    <div class="container" v-if="this.submitSuccessful">
      <div class="box table-container mx-5 my-5">
        <div class="content is-size-5 has-text-centered">Your changes have been successfully updated!
          <br>
          <br>
          Here are a summary of the changes:
          <ul>
            <li>Total changes to approve: {{ this.numChanges }}</li>
            <li>Approved: {{ this.numApproved }}</li>
            <li>Denied: {{ this.numChanges - this.numApproved }}</li>
          </ul>
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
    <div class="container" v-else>
      <template v-for="(treeSubmission, treeIndex) in this.treeInfo" :key="treeIndex">
        <div class="box table-container mx-5 my-3 has-background-success-light"
             v-if="treeIndex === 0">

          <div class="has-text-centered is-size-6 is-underlined">
            New changes for tree {{ treeSubmission.tree_id }}
          </div>
          <div class="has-text-centered is-size 6">
            - The number of submissions for this tree is {{ this.getNumNewChanges(treeSubmission.tree_id) }}.
            <br>
            - The number of conflicting changes is {{ this.conflictVals.length }}
            <br>
            Please review all changes before submitting!
          </div>
        </div>


        <div class="box table-container mx-5 my-5">
          <div class="has-text-centered is-size-6 my-3">
            By: {{ treeSubmission.nickname }}
            <br>
            On: {{ this.getUserFriendlyDate(treeSubmission.tree_change_datetime) }}
            <br>
            Reason: {{ treeSubmission.tree_change_desc }}
          </div>

          <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
            <tr>
              <th class="is-size-7">
                Data Type
              </th>
              <th class="is-size-7">
                Old
              </th>
              <th class="is-size-7">
                New
              </th>
              <th class="is-size-7">
                Choice
              </th>
            </tr>
            <template v-for="(val, name, index) in treeSubmission" :key="index">
              <tr :class="this.getConflictClass(name)">
                <template v-if="doDisplayName(name, val, treeSubmission.tree_id)">
                  <td class="is-size-7">
                    {{ this.editableFields[name] }}
                  </td>
                  <td class="is-size-7">
                    {{ getOriginalVal(name, treeSubmission.tree_id) }}
                  </td>

                  <td class="is-size-7">
                    {{ getNewValOutput(name, val, treeSubmission) }}
                  </td>
                  <td>
                    <div class="control">
                      <div class="select is-small">
                        <select @change="addToApproveOrDeny(
                          treeSubmission.tree_history_id,
                          name,
                          $event.target.value)">
                          <option value="0">Choose</option>
                          <option value="1">Aprpove</option>
                          <option value="-1">Deny</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </template>

              </tr>
            </template>
          </table>


        </div>
      </template>
      <div class="box table-container mx-5 my-5" v-if="this.submissionErrors && this.submissionErrors.length > 0">
        <div class="has-text-danger my-2">
          The following errors occurred with the submission. Please fix them and try and approve again.
        </div>
        <div class="has-text-danger my-2 mx-2" v-for="(errorMessage, index) in submissionErrors" :key="index">
          - {{ errorMessage }}
        </div>
      </div>
      <div class="buttons is-centered">
        <button class="button is-success mb-5" @click="submit()">Submit</button>
      </div>

    </div>
  </div>
</template>

<style>
.table {
  overflow-x: auto;
}
</style>

