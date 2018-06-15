import Vuex from 'vuex'
import Vue from 'vue'
// import { AeternityClient } from '@aeternity/aepp-sdk'
// import { reject } from 'any-promise'

Vue.use(Vuex)

// import { walletPriv, walletPub } from '.envrc'

// console.log(walletPriv, walletPub)

const store = new Vuex.Store({
  state: {
    account: {
      pub: process.env.WALLET_PUB,
      priv: process.env.WALLET_PRIV
    }
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  }
})

export default store
