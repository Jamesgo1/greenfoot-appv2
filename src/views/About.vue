<script>
import ThePageHero from "@/components/ui-components/ThePageHero.vue";

export default {
  data() {
    return {
  }
  },
  computed: {
  },
  watch: {},
  methods: {},
  mounted() {
  },
  name: 'HomePage',
  components: {
    ThePageHero
  }
}
</script>

<template>
  <ThePageHero title="About page" subtitle="About the GreenFoot Community" description=""/>
<!--  <div class="box table-container mx-5 my-3">-->

<!--  </div>-->
  <div class="box table-container mx-5 my-3 has-background-success-light">
    Thanks for your interest in the Greenfoot project, we're happy to have you here!
    <br><br>

    The site was created by me, James Gough, as part of my MSc in software development at Queen's University Belfast.
    <br><br>
    Greenfoot is a mobile web app for a community of people in the Belfast area that help to keep track of
    the trees in our local area.
    <br><br>
    Trees have enormous value for our health, wellbeing, and economy. We feel they are
    worth keeping safe.
    <br><br>
    This site aims to help you <router-link to="/explore">explore trees</router-link> near you, and also offers the
    opportunity to improve what we know about these trees.
    <br><br>
    Our original data is based on the work done by <a href="https://admin.opendatani.gov.uk/dataset/belfast-trees">
    Belfast City Council
  </a>.
    However, this data is many years out of data and the quality of the data is imperfect. Your contributions are
    extremely valuable in improving that data and helping to keep trees safe in your area, and helping others to enjoy them too.
  </div>

</template>



