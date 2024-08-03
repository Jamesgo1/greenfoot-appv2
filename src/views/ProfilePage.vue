<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import axios from "axios";

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
      showNickNameTaken: false,
      nicknameError: "Sorry, your nickname is already taken, please choose a different one and submit again",
      userDetailsParams: {},
      addUserResponse: null
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
    createPostParams(user_obj) {

      const postParams = {
        "user_auth0_sub": user_obj.sub,
        "nickname": user_obj.nickname,
      };
      if (user_obj.given_name) {
        postParams["given_name"] = user_obj.given_name
      }
      if (user_obj.family_name) {
        postParams["family_name"] = user_obj.family_name
      }
      let email_verified = 0;
      if (user_obj.email_verified) {
        email_verified = 1;
      }
      postParams["email_verified"] = email_verified;
      return postParams;
    },
    doDisplayName(name) {
      const includeAsField = Object.keys(this.form).includes(name);

      return includeAsField;
    },
    displayNameOutput(origName) {
      return origName.replace("_", " ")
    },
    getUserGreeting() {
      let userFirstName = this.user.given_name;
      if (this.hasDBDetails) {
        userFirstName = this.info.given_name;
      }
      if (userFirstName) {
        return "Hi, " + userFirstName + "!"
      }
      return "Hi!"
    },
    addTAndCToForm() {
      this.tcCheckBox.input_error = true;
    },
    changeToInputForm(key) {
      this.form[key]["edit"] = true;
    },
    removeTCError() {
      this.tcCheckBox.input_error = "";
    },
    async checkNicknameTaken(nickname) {
      return axios
          .get(`${process.env.VUE_APP_API_SERVER_URL}/username-available/?nickname=${nickname}`)
          .then(response => (this.nicknameAvailable = response.data.user_available))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
    },
    async checkSubmission() {
      Object.keys(this.form).forEach(key => {
        this.inputErrors = 0;
        let currentEnry = this.form[key]
        if (currentEnry.edit) {
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
      }
    },
    async postNewUser() {
       return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/add-user/`, this.userDetailsParams)
          .then(response => (this.addUserResponse = response.status))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
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
      this.userDetailsParams["email"] = this.user.email;
      this.userDetailsParams["is_active"] = 1;
      this.userDetailsParams["user_type_id"] = 1;
    },

    async submit() {
      await this.checkSubmission();
      if (!this.inputErrors) {
        await this.checkNicknameTaken(this.form.nickname.output);
        console.log("api response:")
        console.log(this.nicknameAvailable)
        this.showNickNameTaken = !this.nicknameAvailable;
        if (this.nicknameAvailable) {
          await this.getNewUserDetailsParams();
          console.log("User details params:")
          console.log(this.userDetailsParams);
          await this.postNewUser();
          console.log(this.addUserResponse);
        }
      }
    },
  },
  mounted() {
    axios
        .post(`${process.env.VUE_APP_API_SERVER_URL}/user-details/`, {"user_auth0_sub": this.user.sub})
        .then(response => (this.info = response.data))
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
  },
  name: 'HomePage',
  components: {
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
    {{ this.info }}
    {{ this.info.length }}
    <div class="box mx-5">
      {{ getUserGreeting() }}
      <br>
      <br>
      <template v-if="hasDBDetails">
        Here you can update your personal details, including your nickname.
        <br>
        <br>
        You have agreed to the terms and conditions of the website. You can delete your account to remove all personal
        information below.
      </template>
      <template v-else>
        Thank you for signing up to help improve Belfast tree data.
        <br>
        <br>
        <b>Please note that in order to contribute information
          on Belfast's trees you will need to agree to the website's terms and conditions below.</b>
        <br>
        <br>
        You can also update your personal information below such as adding your name and changing your nickname for the
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
            <div class="has-text-danger" v-if="showNickNameTaken">{{ this.nicknameError }}</div>
          </div>
        </div>

      </div>
    </form>
    Orig vals:
    {{ this.form }}
    {{ this.inputErrors }}
    {{ this.nicknameAvailable }}
    <br>
    <br>
    {{ this.user }}
  </div>
</template>
