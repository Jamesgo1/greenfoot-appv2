<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";

export default {
  data() {
  },
  computed: {
    title: null,

  },
  watch: {},
  methods: {
    somethingToTheData() {
      return this.myTreeData
    }
  },
  mounted() {
  },
  name: 'HomePage',
  props: ["myTreeData"],
  components: {
    ThePageHero
  }
}
</script>

<template>
  <ThePageHero title="Some title" subtitle="About GreenFoot" description="More detail about the site"/>
  {{myTreeData}}
  <!--  <h1>{{ pageTitle }}</h1>-->
  <!--  <h1>{{ info }}</h1>-->

</template>