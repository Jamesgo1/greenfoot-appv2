<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      error: false,
      colCannotEdit: ["tree_id", "long_lat", "nickname", "tree_change_desc"],
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
      submissionErrors: []


    }

  },
  computed: {
  },
  watch: {},
  methods: {
    changeToViewDisplay() {
      this.$emit("changeToView");
    },
    async switchEditDropdown() {

    },
    getTreeVal(name, treeHistEntry) {
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
      return !this.colCannotEdit.includes(name);
    },
    async runEditDropdown(nameDetails) {
      if (!nameDetails.dropdownOptions) {
        await this.callOptionVals(name);
        nameDetails.dropdownOptions = this.currentOptions;
      }
      nameDetails.dropdownClass = "dropdown is-right is-active"
    },
    async runEditInput(nameDetails) {
      nameDetails.edit = true;

    },
    async undoEditDropdown() {
      this.currentFormDetail.dropdownClass = "dropdown";
      this.currentFormDetail.edit = false;
      this.currentFormDetail.newData = null;

    },
    async undoEditInput() {
      this.currentFormDetail.edit = false
      this.currentFormDetail.newData = null;
    },

    async runEdit() {
      if (this.currentFormDetail.dropdownClass) {
        await this.runEditDropdown();
      } else {
        await this.runEditInput();
      }
    },
    async undoEdit() {
      if (this.currentFormDetail.dropdownClass) {
        await this.undoEditDropdown(this.currentFormDetail);
      } else {
        await this.undoEditInput(this.currentFormDetail);
      }
    },
    async runEditUndoButtonClick(name) {
      this.currentFormDetail = this.formOutput[name];
      if (this.isBeingEdited(name)) {
        await this.undoEdit();
      } else {
        await this.runEdit();
      }
    },
    updateDropdownSelection(newInput) {
      this.formOutput[name].newData = newInput;
      this.formOutput[name].dropdownClass = "dropdown";
    },
    getPlaceholderDropdown(name, treeHistEntry) {
      let placeholder = this.getTreeVal(name, treeHistEntry)
      const newData = this.formOutput[name].newData
      if (newData) {
        placeholder = newData
      }
      return placeholder;
    },
    showTreeHistoryEntry(index) {
      return (index === 0 || !this.editMode);

    },
    colEditButton(name) {

      let buttonName = "Edit";
      if (this.formOutput[name].edit) {
        buttonName = "Undo";
      }
      return buttonName;
    },
    updateEditMode() {
      this.editMode = !this.editMode
      this.colEdits = {}
    },
    async callOptionVals(name) {
      const apiName = name.replace("_desc", "")
      console.log(`${process.env.VUE_APP_API_SERVER_URL}/table-options/table_val=${apiName}`)
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/table-options/?table_val=${apiName}`)
          .then(response => (this.currentOptions = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    addDropdownData(name, val) {
      this.formOutput[name].newData = val;
      this.switchEditDropdown(name);
      this.formOutput[name].edit = true;
    },
    validateEditSubmission() {
      Object.entries(this.colEdits).forEach((key, val) => {
        if (!val) {
          this.submissionErrors.push(`The field ${this.colOptions[name]} has an empty value`)
        }
      })
    },
    submit() {
      console.log("Final output:")
      console.log(this.formOutput)
    }
  },
  mounted() {
  },
  name: 'TreeInfo',
  components: {
  },
  props: ["colOptions", "treeInfo"]
}


</script>

<template>

  <div class="container">
    <div class="field is-grouped is-grouped-centered mx-5">
      <div class="buttons">

        <div>
          <button class="button is-info" @click="this.changeToViewDisplay">View</button>
        </div>

      </div>
    </div>


    <template v-for="(treeHistEntry, treeIndex) in this.treeInfo" :key="treeIndex">

      <div class="box table-container mx-5 my-5" v-if="treeIndex === 0">
        <table class="table has-text-centered is-fullwidth is-narrow is-striped is-bordered mx-auto">
          <tr v-for="(val, name, index) in colOptions" :key="index">
            <template v-if="isEditableField(name)">
              <td>
                {{ val }}
              </td>
              <td v-if="this.isBeingEdited(name)">

                <template v-if="formOutput[name].dropdownClass">
                  <div :class="this.formOutput[name].dropdownClass">
                    <div class="dropdown-trigger" @click="switchEditDropdown(name)">
                      <div class="is-success is-light" aria-haspopup="true" aria-controls="dropdown-menu">
                        {{ getPlaceholderDropdown(name, treeHistEntry) }}
                        <span class="icon is-small">
                            <i class="fas fa-angle-down"></i>
                          </span>
                      </div>
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
                  <input class="input" v-model="this.formOutput[name].newData"
                         :placeholder="getTreeVal(name, treeHistEntry)"/>
                </template>
              </td>

              <td v-else>
                {{ getTreeVal(name, treeHistEntry) }}
              </td>

              <td>
                <button class="button is-info is-light is-small" @click="updateEdits(name, val)">{{
                    colEditButton(name)
                  }}
                </button>
              </td>

            </template>

          </tr>
        </table>
        <div class="buttons is-centered">
          <button class="button is-success" @click="submit()">Submit</button>
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

