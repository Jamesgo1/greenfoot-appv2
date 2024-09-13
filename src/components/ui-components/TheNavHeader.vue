<script>

import axios from "axios";

export default {
  data() {
    return {
      isAuthenticated: this.$auth0.isAuthenticated,
      navBurgerActive: false,
      navBurgerClass: "navbar-burger",
      navMenuClass: "navbar-menu",
      user: this.$auth0.user,
      userDetails: [],
      showAdmin: false,
      notificationDropdown: "dropdown",
      notificationData: null,
      newNotiDate: null,
      iconColors: {
        success: "color: hsl(141, 71%, 48%)",
        danger: "color: hsl(348, 100%, 61%)"
      },
      iconType: {
        "image": "fas fa-image",
        "edit": "fas fa-marker",
        "new tree": "fas fa-tree",
        "deletion": "fas fa-trash"
      },
      currentNotiDetails: null,
    }
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    getSession() {
      return this.$store.getters.getSession;
    },
    notificationCount() {
      let notiCount = 0;
      console.log("Notification data in computed:")
      console.log(this.notificationData)
      if (this.notificationData) {
        for (let notiObj of this.notificationData) {
          if (!notiObj.noti_clicked_ind) {
            notiCount++;
          }
        }
      }
      console.log(notiCount)
      notiCount = notiCount === 0 ? null : notiCount
      console.log(notiCount);
      return notiCount;
    },
    notificationIconColor() {
      let notiColor = "color: hsl(0, 0%, 71%)"
      if (this.notificationCount > 0) {
        notiColor = "color: hsl(141, 71%, 48%)"
      }
      return notiColor;
    }
  },
  watch: {
  },
  methods: {
    handleLogin() {
      this.$auth0.loginWithRedirect({
        appState: {
          target: "/profile",
        },
      });
    },
    handleSignUp() {
      this.$auth0.loginWithRedirect({
        appState: {
          target: "/profile",
        },
        authorizationParams: {
          screen_hint: "signup",
        },
      });
    },
    handleLogout() {
      this.$auth0.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      console.log("Ending session")
      this.$store.dispatch("endSession");
      console.log("Here's the session after logout: " + this.getSession)
    },

    async startSession() {
      let sessionUserTypeID = 0;
      if (!this.getSession || (!this.getSession.user_type_id && this.getSession.user_type_id !== 0)) {
        this.$store.dispatch("startSession", {"session": true})
        if (this.isAuthenticated) {
          console.log("Calling user details API")
          await this.getUserDetails();
          if (this.userDetails.length > 0) {
            sessionUserTypeID = this.userDetails[0].user_type_id;
          } else {
            sessionUserTypeID = 0;
          }
        } else {
          sessionUserTypeID = 0
        }
        this.$store.dispatch("addSessionData", {"user_type_id": sessionUserTypeID})
        console.log("Created session")
      } else {
        console.log("Session already started:")
        console.log(this.getSession)
      }
    },
    getNavClass(routeName) {
      let navClass = "navbar-item"
      if (this.currentRouteName === routeName) {
        navClass = navClass + " is-selected"
      }
      return navClass
    },
    toggleNavBurgerActivity() {
      if (this.navBurgerActive) {
        this.navBurgerClass = "navbar-burger"
        this.navMenuClass = "navbar-menu"
      } else {
        this.navBurgerClass = this.navBurgerClass + " is-active"
        this.navMenuClass = this.navMenuClass + " is-active"
      }
      this.navBurgerActive = !this.navBurgerActive;
    },
    async getUserDetails() {
      return axios
          .post(`${process.env.VUE_APP_API_SERVER_URL}/user/user-details/`, {"user_auth0_sub": this.user.sub})
          .then(response => (this.userDetails = response.data))
          .catch(error => {
            console.log(error);
            this.error = true;
          })
          .finally(() => this.loading = false)
    },
    async getUserTypeFromSession() {
      if (!this.getSession) {
        await this.startSession();
      }
      return this.getSession.user_type_id;
    },
    async isAdmin() {
      console.log("Checking user type...")
      let admin = false;
      let sessionUserTypeID = await this.getUserTypeFromSession();
      console.log("The session user type is " + sessionUserTypeID)
      if (sessionUserTypeID > 1) {
        admin = true;
      }
      this.showAdmin = admin;

    },
    async getUserNotifications() {
      if (this.userDetails.length > 0) {
        const userID = this.userDetails[0].user_id
        console.log("User ID is: " + userID)
        return axios
            .get(`${process.env.VUE_APP_API_SERVER_URL}/user/notif-changes/?user_id=${userID}&limit=5`)
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
    async updateNotificationDate() {
      if (this.userDetails.length > 0) {
        const userID = this.userDetails[0].user_id
        return axios
            .patch(`${process.env.VUE_APP_API_SERVER_URL}/user/update-notification-date/?user_id=${userID}`)
            .then(response => (this.newNotiDate = response.status))
            .catch(error => {
              console.log(error);
              this.error = true;
            })
            .finally(() => this.loading = false)
      } else {
        return null;
      }
    },
    async switchNotificationDD() {
      if (this.notificationDropdown === "dropdown") {
        await this.updateNotificationDate();
        await this.getUserNotifications();
        this.notificationDropdown = "dropdown is-active"
      } else {
        this.notificationDropdown = "dropdown"
      }
      console.log("Notification is now: " + this.notificationDropdown)
    }
    ,
    getUserFriendlyDate(date) {
      const dateObj = new Date(date)
      return dateObj.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    getNotificationText(notifObj) {
      let acceptanceDesc = "declined";
      if (notifObj.change_ind > 0) {
        acceptanceDesc = "approved"
      }
      return `${this.getUserFriendlyDate(notifObj.comb_date)}: Your ${notifObj.change_type} request for tree ${notifObj.tree_id} was ${acceptanceDesc}`
    },
    getNotificationColor(notifObject) {
      return notifObject.change_ind > 0 ? this.iconColors.success : this.iconColors.danger
    },
    getNotificationType(notifObject) {
      return this.iconType[notifObject.change_type]
    },
  }
  ,
  async mounted() {
    await this.startSession();
    await this.isAdmin();
    console.log("Here is the user details:")
    console.log(this.userDetails)
    await this.getUserNotifications();
    console.log("Here is the notification API response: ")
    console.log(this.notificationData)
    this.interval = setInterval(this.getUserNotifications, 30000)
  },
  beforeUnmount() {
    this.$store.dispatch("endSession");
    clearInterval(this.interval);
  },
  name: 'NavHeader',
}
</script>

<template>
  <nav class="navbar is-vcentered" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="59px" height="59px"
             viewBox="0 0 59 59" version="1.1">
          <title>Tree</title>
          <desc>Created with Sketch.</desc>
          <defs/>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Artboard" transform="translate(-308.000000, -212.000000)">
              <g id="Tree" transform="translate(309.000000, 212.000000)">
                <circle id="Oval-15" fill="#22BA8E" cx="47" cy="11" r="8"/>
                <circle id="Oval-15" fill="#22BA8E" cx="29" cy="16" r="8"/>
                <circle id="Oval-15" fill="#80D25B" cx="38" cy="8" r="8"/>
                <circle id="Oval-15" fill="#80D25B" cx="50" cy="21" r="8"/>
                <circle id="Oval-15" fill="#80D25B" cx="44" cy="29" r="8"/>
                <path
                    d="M38,23 L42,23 C42,23 41.486833,31.7629936 42,41 C42.513167,50.2370064 46,59 46,59 L34,59 C34,59 37.513167,49.7629936 38,41 C38.486833,32.2370064 38,23 38,23 Z"
                    id="Rectangle-26" fill="#BD7575"/>
                <path d="M2,58 L54.0864666,58" id="Line" stroke="#22BA8E" stroke-width="2" stroke-linecap="square"/>
                <circle id="Oval-14" fill="#22BA8E" cx="40" cy="19" r="14"/>
                <circle id="Oval-15" fill="#80D25B" cx="32" cy="27" r="8"/>
                <polyline id="Path-8" stroke="#BD7575" stroke-width="2" stroke-linecap="round"
                          points="0 11.2623404 3.46449565 13.3024878 6.93950495 11"/>
                <polyline id="Path-8" stroke="#BD7575" stroke-width="2" stroke-linecap="round"
                          points="4 16.2623404 7.46449565 18.3024878 10.9395049 16"/>
                <polyline id="Path-8" stroke="#BD7575" stroke-width="2" stroke-linecap="round"
                          points="12 6.26234042 15.4644957 8.30248779 18.9395049 6"/>
              </g>
            </g>
          </g>
        </svg>
      </router-link>
      <div class="navbar-item" v-if="getSession && getSession.user_type_id > 0">
        <div :class="notificationDropdown">
          <div class="dropdown-trigger" @click="switchNotificationDD()">
            <div class="notification-icon" :style="notificationIconColor">
          <span class="icon has-badge"
                style="width: 39px;
                height: 45px;
                font-size: 25px;">
          <i class="fas fa-bell"><span class="content is-size-6">&nbsp;{{ this.notificationCount }}</span></i>
        </span>
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content" v-for="(notifObject, index) in notificationData" :key="index">

                <router-link to="/profile" class="has-text-black">
                  <div class="box">
                    <div class="content">
                  <span class="icon is-small">
                    <i :class="getNotificationType(notifObject)" :style="getNotificationColor(notifObject)"></i>
                  </span>
                      &nbsp;&nbsp;{{ this.getNotificationText(notifObject) }}
                    </div>
                  </div>
                </router-link>
              </div>

            </div>
          </div>
        </div>
      </div>
      <a role="button" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample"
         @click="toggleNavBurgerActivity" :class="navBurgerClass">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" :class="navMenuClass">
      <div class="navbar-start">
        <router-link @click="toggleNavBurgerActivity" :class="getNavClass('Home')" to="/">Home</router-link>

        <router-link @click="toggleNavBurgerActivity" :class="getNavClass('Explore')" to="/explore">Explore
        </router-link>
        <template v-if="isAuthenticated">
          <router-link @click="toggleNavBurgerActivity" :class="getNavClass('UserDetails')" to="/details">Details
          </router-link>
        </template>
        <template v-if="isAuthenticated">
          <router-link @click="toggleNavBurgerActivity" :class="getNavClass('ProfileDetails')" to="/profile">Profile
          </router-link>
        </template>
        <template v-if="isAuthenticated && getSession && getSession.user_type_id > 0">
          <router-link @click="toggleNavBurgerActivity" :class="getNavClass('NewTree')" to="/new-tree">Add Tree
          </router-link>
        </template>
        <router-link @click="toggleNavBurgerActivity" :class="getNavClass('Analytics')" to="/analytics"
        >Analytics
        </router-link>
        <template v-if="showAdmin">
          <router-link @click="toggleNavBurgerActivity"
                       :class="getNavClass('TreeDetailsSubmissions')"
                       to="/submissions">
            Tree Submissions
          </router-link>
        </template>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            More
          </a>

          <div class="navbar-dropdown">
            <router-link @click="toggleNavBurgerActivity" :class="getNavClass('About')" to="/about">About</router-link>
            <a class="navbar-item">
              Contact
            </a>
            <hr class="navbar-divider">
            <a class="navbar-item">
              Report an issue
            </a>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons" v-if="isAuthenticated">
            <a class="button is-info" @click="handleLogout">
              <strong>Log Out</strong>
            </a>
          </div>
          <div class="buttons" v-else>
            <a class="button is-primary" @click="handleSignUp">
              <strong>Sign up</strong>
            </a>
            <a class="button is-light" @click="handleLogin">
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>

</template>

<style>
.icon {
  /* This sets the size of the Font Awesome icon */
  //color: hsl(140, 4%, 84%)
}

</style>

