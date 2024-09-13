<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import axios from "axios";
import CryptoJS from "crypto-js";

export default {
  data() {
    return {
      loading: true,
      error: false,
      info: null,
      user: this.$auth0.user,
      form: {
        "given_name": {"edit": false, "output": "", "input_error": ""},
        "family_name": {"edit": false, "output": "", "input_error": ""},
        "nickname": {"edit": false, "output": "", "input_error": ""}
      },
      tcCheckBox: {"edit": false, "output": "", "input_error": ""},
      inputErrors: 0,
      nicknameAvailable: null,
      submissionErrors: null,
      userDetailsParams: {},
      addUserResponse: null,
      hasSubmitted: null,
      existingUserChangeParams: {}
    }

  },
  computed: {
    hasDBDetails: function () {
      return this.info.length >= 1;
    },
    latestUserDetails: function () {
      if (this.hasDBDetails) {
        return this.info[0];
      }
      return this.user;
    }
  },
  watch: {},
  methods: {
    doDisplayName(name) {
      return Object.keys(this.form).includes(name);
    },
    displayNameOutput(origName) {
      return origName.replace("_", " ")
    },
    getUserGreeting() {
      if (this.user.given_name) {
        return "Hi, " + this.user.given_name + "!"
      }
      return "Hi!"
    },
    changeToInputForm(key) {
      this.form[key]["edit"] = true;
    },
    removeTCError() {
      this.tcCheckBox.input_error = "";
    },
    async checkNicknameTaken(nickname) {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/user/username-available/?nickname=${nickname}`)
          .then(response => (this.nicknameAvailable = response.data.user_available))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
    },
    async checkSubmission() {
      this.inputErrors = 0;
      this.submissionErrors = [];
      let numEditCols = 0;

      Object.keys(this.form).forEach(key => {
        let currentEnry = this.form[key]
        if (currentEnry.edit) {
          numEditCols += 1;
          let entry_len = currentEnry.output.length;
          if (entry_len < 1) {
            currentEnry.input_error = "Value is too short: input a value of at least 2 characters";
            this.inputErrors += 1;
          } else if (entry_len > 20) {
            currentEnry.input_error = "Value is too long: input a value of 20 characters or less";
            this.inputErrors += 1;
          } else {
            currentEnry.input_error = "";
          }

        } else {
          currentEnry.output = this.latestUserDetails[key]
        }
      })
      if (!this.hasDBDetails) {
        if (!this.tcCheckBox.output) {
          this.tcCheckBox.input_error = "You have not accepted the terms and conditions. If you wish to contribute to the website, please tick the box and submit again"
          this.inputErrors += 1;
        } else {
          this.tcCheckBox.input_error = "";
        }
        await this.checkNicknameTaken(this.form.nickname.output);
        if (!this.nicknameAvailable) {
          const nicknameTakenError = "Sorry, your nickname is already taken, please choose a different one and submit again";
          this.submissionErrors.push(nicknameTakenError);
          this.inputErrors += 1;
        }
      } else {
        if (!numEditCols) {
          const noEditsMadeError = "No details updated - nothing to submit!"
          this.submissionErrors.push(noEditsMadeError);
          this.inputErrors += 1;
        }
      }
    },
    async postNewUser() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/user/add-user/`, this.userDetailsParams)
          .then(response => (this.addUserResponse = response.status))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async encryptPII(stringToEncrypt) {
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(stringToEncrypt, CryptoJS.enc.Utf8.parse(process.env.VUE_APP_ENCRYPT_KEY), {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7
      });
      return iv.toString() + ':' + encrypted.toString();

    },
    async decryptPII(objectToDecrypt) {
      const textParts = objectToDecrypt.split(':');
      const iv = CryptoJS.enc.Hex.parse(textParts.shift());
      const encryptedText = textParts.join(':');
      const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(process.env.VUE_APP_ENCRYPT_KEY), {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    },

    async getNewUserDetailsParams() {
      Object.keys(this.form).forEach(key => {
        let currentEnry = this.form[key]
        this.userDetailsParams[key] = currentEnry.output
      });
      let verified_email = 0;
      if (this.user.email_verified) {
        verified_email = 1;
      }
      this.userDetailsParams["email_verified"] = verified_email;
      this.userDetailsParams["user_auth0_sub"] = this.user.sub;
      this.userDetailsParams["email"] = await this.encryptPII(this.user.email);
      this.userDetailsParams["is_active"] = 1;
      this.userDetailsParams["user_type_id"] = 1;
    },
    async getExistingUserEdits() {
      this.existingUserChangeParams = {};
      Object.keys(this.form).forEach(key => {
        let currentEnry = this.form[key]
        if (currentEnry.edit) {
          this.existingUserChangeParams[key] = currentEnry.output;
        }
      })
    },
    async patchExistingUser() {
      return axios
          .patch(`${process.env.VUE_APP_API_SERVER_URL}/user/change-user-details/${this.user.sub}`,
              this.existingUserChangeParams)
          .then(response => (this.addUserResponse = response.status))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)

    },
    async submit() {
      await this.checkSubmission();
      if (!this.inputErrors) {
        console.log("api response:")
        console.log(this.nicknameAvailable)
        if (this.hasDBDetails) {
          await this.getExistingUserEdits();
          console.log("Params to patch:")
          console.log(this.existingUserChangeParams)
          await this.patchExistingUser();
        } else {
          await this.getNewUserDetailsParams();
          console.log("User details params:")
          console.log(this.userDetailsParams);
          await this.postNewUser();
          console.log(this.addUserResponse);
          this.$store.dispatch("addSessionData", {"user_type_id": this.userDetailsParams["user_type_id"]})
        }
        this.hasSubmitted = true;
      }

    },
  }
  ,
  mounted() {
    axios
        .post(`${process.env.VUE_APP_API_SERVER_URL}/user/user-details/`, {"user_auth0_sub": this.user.sub})
        .then(response => (this.info = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  }
  ,
  name: 'HomePage',
  components:
      {
        ThePageHero
      }
}
</script>

<template>
  <ThePageHero title="Profile" subtitle="Edit Your Details Here" description=""/>

  <div class="container" v-if="loading">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </div>
  <div class="container" v-else-if="error">
    <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
      try
      again later</p>
  </div>
  <div v-else>
    <template v-if="!hasSubmitted">
      <div class="box mx-5">
        {{ getUserGreeting() }}
        <br>
        <br>
        <template v-if="hasDBDetails">
          Here you can update your personal details, including your nickname.
          <br>
          <br>
          You have agreed to the terms and conditions of the website.
        </template>
        <template v-else>
          Thank you for signing up to help improve Belfast tree data.
          <br>
          <br>
          <b>Please note that in order to contribute information
            on Belfast's trees you will need to agree to the website's terms and conditions below.</b>
          <br>
          <br>
          You can also update your personal information below such as adding your name and changing your nickname for
          the
          website.
        </template>
      </div>
      <form class="box mx-5 my-5">

        <div class="columns is-mobile is-centered mx-5" v-for="(val, name, index) in latestUserDetails" :key="index">
          <div v-if="doDisplayName(name)" class="column is-centered">
            <div class="columns is-mobile is-centered is-capitalized">
              <div class="column is-half-mobile has-text-centered">{{ this.displayNameOutput(name) }}: <strong>{{
                  val
                }}</strong></div>
              <div class="column is-half-mobile is-centered" v-if="this.form[name].edit">
                <input class="input" v-model="this.form[name].output" placeholder="New Name"/>
              </div>

              <div class="column is-half is-centered" v-else>
                <div class="button is-primary is-mobile" @click="changeToInputForm(name)">
                  Edit
                </div>
              </div>
            </div>
            <div v-if="this.form[name].input_error">
              <div class="has-text-danger">{{ this.form[name].input_error }}</div>
            </div>
          </div>
        </div>

        <div class="columns is-mobile is-centered">

          <div class="column is-one-third is-centered" v-if="!hasDBDetails">
            <label class="checkbox">
              <input type="checkbox" v-model="this.tcCheckBox.output" @click="removeTCError()"/>
              I agree to the <a href="#">terms and conditions</a>
            </label>
            <div v-if="this.tcCheckBox.input_error">
              <div class="has-text-danger">{{ this.tcCheckBox.input_error }}</div>
            </div>
          </div>

        </div>

        <div class="columns is-mobile is-centered">
          <div class="column is-one-third is-centered">
            <div class="button is-primary is-centered is-mobile" @click="submit()">
              Submit
            </div>
          </div>
        </div>
        <div class="has-text-danger" v-for="(errorMessage, index) in submissionErrors" :key="index">
          {{ errorMessage }}
        </div>
      </form>
    </template>
    <template v-else>
      <div class="box mx-5">
        <template v-if="hasDBDetails">
          Your details have been successfully updated!
        </template>
        <template v-else>
          Thank you! You are now able to edit information on trees in your local area and help to keep Belfast's trees
          safe!
        </template>
      </div>

      <div class="columns is-mobile is-centered">
        <div class="column is-one-third is-centered">
          <div class="button is-centered is-mobile has-text-black" @click="submit()">
            <router-link to="/">Return Home</router-link>
          </div>
        </div>
        <div class="column is-one-third is-centered">
          <div class="button is-centered is-mobile" @click="submit()">
            <router-link to="/explore">Explore Trees</router-link>
          </div>
        </div>
      </div>
    </template>
  </div>


</template>
