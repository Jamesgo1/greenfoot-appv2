<script>

export default {
  data() {
  },
  computed: {
  },
  watch: {},
  methods: {},
  mounted() {
  },
  name: 'PageHero',
    props: ["title", "subtitle", "description"]
}
</script>

<template>
  <section class="hero is-small is-background-success has-text-centered mx-auto">
    <div class="hero-body">
      <div class="is-centered">
        <p class="title has-text-white">{{title}}</p>
        <p class="subtitle has-text-white">{{subtitle}}</p>
        <p class="has-text-white">{{description}}</p>
      </div>

    </div>
  </section>

</template>



