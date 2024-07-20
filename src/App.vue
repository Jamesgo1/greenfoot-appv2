<script>
import NavHeader from "@/components/NavHeader";

export default {
  name: 'App',
  data() {
    return {

    }
  },
  components: {
    NavHeader
  }
}
</script>

<template>
  <div class="container">
    <NavHeader></NavHeader>
    <router-view></router-view>
  </div>
</template>

<style>
@import "~bulma/css/bulma.css";
</style>
