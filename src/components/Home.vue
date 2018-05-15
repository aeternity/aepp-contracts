<template>
  <div class="home">
    <div v-if="account && account.pub">
      <span>Hello {{account.domain}}</span>
      <span>shows balance, history of transactions. If the user has an outstanding beer order that should be shown here too.</span>
    </div>
    <div v-else>
      <span>You are not logged in. Please visit this by opening the provided short url</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {
  },
  computed: {
    account () {
      return this.$store.state.account
    }
  },
  data () {
    return {
    }
  },
  props: {
    query: {
      type: Object
    }
  },
  methods: {
  },
  mounted () {
  }
}
</script>

<style scoped lang="scss">
</style>
