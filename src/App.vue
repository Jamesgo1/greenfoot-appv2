<script>
import TheNavHeader from "@/components/ui-components/TheNavHeader.vue";
import PageLoader from "@/views/PageLoader.vue";

export default {
  name: 'App',
  data() {
    return {
      isLoading: this.$auth0.isLoading
    }
  },
  components: {
    TheNavHeader,
    PageLoader
  }
}
</script>

<template>
  <div v-if="isLoading" class="container">
    <PageLoader/>
  </div>
  <div class="container" v-else>
    <TheNavHeader></TheNavHeader>
    <router-view></router-view>
  </div>
</template>

<style>
@import "~bulma/css/bulma.css";
</style>
