<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";

export default {
  data() {
  },
  computed: {},
  watch: {},
  methods: {
    dynamicTitle(route) {
      return "Curremt tree id: " + route
    }
  },
  mounted() {
  },
  name: 'TreeInfo',
  components: {
    ThePageHero
  }
}
</script>

<template>
  <ThePageHero :title="dynamicTitle($route.params.id)" subtitle="Tree Details" description="Some tree info"/>
</template>



