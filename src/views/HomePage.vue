<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheNewsFeedDisplay from "@/components/ui-components/TheNewsFeedDisplay.vue";
import axios from "axios";

export default {
  data() {
    return {
      isAuthenticated: this.$auth0.isAuthenticated,
      user: this.$auth0.user,
      userDetails: null,
      dailyImageInfo: null,
      latestChanges: null,
      currentTreeInLoop: 0,
      isLoading: true,
    }
  },
  computed: {},
  watch: {},
  methods: {
    async getUserDetails() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/user/user-details-obj/`, {"user_auth0_sub": this.user.sub})
          .then(response => (this.userDetails = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getDailyImage() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/tree/get-daily-image/`)
          .then(response => (this.dailyImageInfo = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async runAPICalls() {
      await this.getDailyImage();
      await this.getLatestTreeEdits();
      if (this.isAuthenticated && this.$store.getters.getSession && this.$store.getters.getSession.user_type_id > 0) {
        await this.getUserDetails();
      }
      this.isLoading = false;
    },
    getImagePath() {
      const imagePath = `${process.env.VUE_APP_API_SERVER_URL}/${this.dailyImageInfo.image_path}`
      console.log(imagePath);
      return imagePath
    },
    async getLatestTreeEdits() {
      return axios.get(`${process.env.VUE_APP_API_SERVER_URL}/user/notif-changes/?limit=5`)
          .then(response => (this.latestChanges = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
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
    handleLogin() {
      this.$auth0.loginWithRedirect({
        appState: {
          target: "/",
        },
      });
    }
  },
  async mounted() {
    await this.runAPICalls();

  },
  name: 'HomePage',
  components: {
    ThePageHero,
    TheNewsFeedDisplay
  }
}
</script>

<template>
  <ThePageHero title="Welcome to Greenfoot" subtitle="Helping to keep Belfast's trees safe" description=""/>
  <div v-if="!this.isLoading" class="box table-container mx-5 my-3 has-background-success-light">
    <div v-if="this.isAuthenticated && this.userDetails" class="has-text-centered is-size-6">
      Welcome back to Greenfoot, {{ this.userDetails.given_name }}!
      <br>
      <br>
      <router-link to="/explore">
        Explore trees
      </router-link>
      near you where you can upload images and make changes to the tree's data,
      <router-link to="/new-tree">add new trees</router-link>
      to improve the trees we track, or get insights into our
      trees through the
      <router-link to="/analytics">analytics</router-link>
      page.
      <br><br>
      Check out the
      <router-link to="/about">about page</router-link>
      for more information on our goal with the
      Greenfoot project!

    </div>
    <div v-else class="has-text-centered is-size-6">
      Welcome to Greenfoot!
      <br>
      <br>
      Get insights into our
      trees through the
      <router-link to="/analytics">analytics</router-link>
      page.
      <br><br>
      We recommend <span @click="handleLogin" class="has-text-link">setting up an account</span> or
      <span @click="handleLogin" class="has-text-link">logging in</span> if you already have an account
      so that you can add data to trees near you.
      <br><br>
      Check out the
      <router-link to="/about">about page</router-link>
      for more information on our goal with the
      Greenfoot project!
    </div>
  </div>
  <div v-if="this.dailyImageInfo" class="box table-container mx-5 my-5">
    <div class="content is-underlined has-text-centered">
      <b>Picture of the Day</b>
    </div>
    <img :src="getImagePath()" alt="Tree Image"/>
    <div class="content is-size-7 has-text-centered">
      Submitted by {{ this.dailyImageInfo.nickname }} on
      {{ this.getUserFriendlyDate(this.dailyImageInfo.image_add_datetime) }}
      <br>
      Find out more about this tree
      <router-link :to="{name: 'TreeDetails', params:{id: this.dailyImageInfo.tree_id}}">
        here
      </router-link>
    </div>
  </div>
  <TheNewsFeedDisplay :news-feed-data="latestChanges" title="News Feed"></TheNewsFeedDisplay>


</template>



