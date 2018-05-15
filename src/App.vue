<template>
  <div id="app">
    <h2 v-if="!accessKey">MISSING ACCESS KEY!</h2>
    <h4 v-if="!accessKey">Please access the app as https://URL/?secret=POS-secret-here</h4>
    <div v-if="accessKey" class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { AeHeader, AeButton } from '@aeternity/aepp-components'

export default {
  name: 'app',
  components: {
    AeHeader,
    AeButton
  },
  data () {
    return {
      goToRoute: '',
      amount: 0
    }
  },
  computed: {
    account () {
      return this.$store.state.account
    },
    accessKey () {
      return this.$store.getters.accessKey
    },
    accessKeyFromQuery () {
      return this.$route.query.secret
    }
  },
  mounted () {
    if (this.accessKeyFromQuery) {
      // console.info('Vue App mounted', this.accessKeyFromQuery)
      this.$store.dispatch('setAccessKey', this.accessKeyFromQuery)
    }
  }
}
</script>
