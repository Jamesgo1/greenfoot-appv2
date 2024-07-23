<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";
import TheTabularDisplay from "@/components/data-components/TheTabularDisplay.vue";

export default {
  data() {
    return {}
  },
  name: 'DataTable',
  props: {
    pageTitle: String
  },
  components: {
    ThePageHero,
    TheTabularDisplay

  }
}
</script>

<template>
  <ThePageHero title="Data Explorer" subtitle="Explore Belfast's Trees" description="Find the biggest, tallest trees. Find ones that may need help. Or help to improve
          our tree data quality."></ThePageHero>
  <TheTabularDisplay></TheTabularDisplay>
</template>



