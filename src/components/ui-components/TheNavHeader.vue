<script>

export default {
  data() {
    return {
      isAuthenticated: this.$auth0.isAuthenticated,
      navBurgerActive: false,
      navBurgerClass: "navbar-burger",
      navMenuClass: "navbar-menu"
    }
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    }
  },
  watch: {},
  methods: {

    handleLogin() {
      this.$auth0.loginWithRedirect({
        appState: {
          target: "/",
        },
      });
    },
    handleSignUp() {
      this.$auth0.loginWithRedirect({
        appState: {
          target: "/",
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
    }
  },
  mounted() {
  },
  name: 'NavHeader',
}
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="59px" height="59px"
             viewBox="0 0 59 59" version="1.1">
          <!-- Generator: Sketch 43.2 (39069) - http://www.bohemiancoding.com/sketch -->
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
          <router-link @click="toggleNavBurgerActivity" :class="getNavClass('Profile')" to="/profile">Profile
          </router-link>
        </template>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            More
          </a>

          <div class="navbar-dropdown">
            <router-link @click="toggleNavBurgerActivity" :class="getNavClass('About')" to="/about">About</router-link>
            <a class="navbar-item">
              Jobs
            </a>
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



