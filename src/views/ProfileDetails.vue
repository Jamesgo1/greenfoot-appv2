<script>
import {useRoute} from 'vue-router';
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheNewsFeedDisplay from "@/components/ui-components/TheNewsFeedDisplay.vue";
import axios from "axios";


export default {
  setup() {
    const route = useRoute();
    const userData = route.params.userData;

    return {userData};
  },
  data() {
    return {
      pageTitle: "Profile Details",
      pageSubtitle: "Find out the contributions by this user",
      loading: false,
      error: false,
      notificationData: null,
      currentDisplay: "changes"
    }
  },
  computed: {},
  watch: {},
  methods: {
    getPageTitle() {
      return `Profile for ${this.userData.nickname}`
    },
    getPageSubtitle() {
      return `Find out more about ${this.userData.nickname}'s contributions and achievements`
    },
    getNewsFeedTitle() {
      return `Here are ${this.userData.nickname}'s contributions`
    },
    async getUserNotifications() {
      if (this.userData) {
        this.loading = true
        const userID = this.userData.user_id
        console.log("User ID is: " + userID)
        return axios
            .get(`${process.env.VUE_APP_API_SERVER_URL}/user/notif-changes/?user_id=${userID}&limit=50&approved_only=true`)
            .then(response => (this.notificationData = response.data))
            .catch(error => {
              console.log(error);
              this.error = true;
            })
            .finally(() => this.loading = false)
      } else {
        return []
      }
    },
    toggleDisplay(displayClicked){
      this.currentDisplay = displayClicked
    }
  },
  async mounted() {
    await this.getUserNotifications()

  },
  name: 'HomePage',
  components: {
    ThePageHero,
    TheNewsFeedDisplay
  }
};
</script>

<template>
  <template v-if="!userData">
    <p class="title has-text-success has-text-centered">Loading data...</p>
  </template>
  <template v-else>
    <ThePageHero :title="getPageTitle()" :subtitle="getPageSubtitle()"></ThePageHero>
    <div class="container" v-if="loading">
      <p class="title has-text-success has-text-centered">Loading data...</p>
    </div>
    <div class="container" v-else-if="error">
      <p class="title has-text-centered">We're sorry, we're not able to retrieve this information at the moment, please
        try
        again later</p>
    </div>
    <div v-else>
      <div class="buttons is-centered mt-4">
        <button @click="toggleDisplay('changes')" class="button is-info">Changes</button>
        <button @click="toggleDisplay('badges')" class="button is-primary">Badges</button>
      </div>
      <template v-if="currentDisplay === 'changes'">
        <TheNewsFeedDisplay :news-feed-data="notificationData" :title="getNewsFeedTitle()"></TheNewsFeedDisplay>
      </template>
      <template v-else-if="currentDisplay === 'badges'">
        Here the badges are displayed...
      </template>
    </div>


  </template>
</template>