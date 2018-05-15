import Vuex from 'vuex'
import Vue from 'vue'
import { AeternityClient } from '@aeternity/aepp-sdk'

// import { reject } from 'any-promise'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    access_key: '',
    barState: 'open', // open, closed, out_of_beer
    socketConnected: true,
    account: {
      pub: 'ak$3TRJBCvcvaegewQkexWVQkt7bEFf1tCvhvj6jfErZQNWyJ4NoyxUwkGrVVWDefxPpPEiY534fTutPaURn72HrGKCYaNWPM',
      priv: '',
      domain: 'beer_bar.aet',
      name: 'Beer Bar'
    },
    posTransactions: [],
    balance: 0
  },
  getters: {
    lastBeerHash (state) {
      if (state.posTransactions.length <= 0) {
        return null
      }
      return state.posTransactions[0]
    },
    posTransactions (state) {
      return state.posTransactions
    },
    socketConnection (state) {
      return state.socketConnected
    },
    barBalance (state) {
      return state.balance
    },
    barStatus (state) {
      return state.barState
    },
    accessKey (state) {
      // eslint-disable-next-line no-undef
      const localKey = localStorage.getItem('access_key')
      console.log('Local:', localKey, ' state:', state.access_key)
      return localKey || state.access_key
    },
    client () {
      const provider = new AeternityClient.providers.HttpProvider(
        'republica.aepps.com',
        443,
        { secured: true, internal: false }
      )
      return new AeternityClient(provider)
    },
    clientInternal () {
      const provider = new AeternityClient.providers.HttpProvider(
        'republica.aepps.com',
        443,
        { secured: true, internal: true }
      )
      return new AeternityClient(provider)
    }
  },
  mutations: {
    SET_ACCESS_KEY (state, accessKey) {
      console.log('SET_ACCESS_KEY', accessKey)
      // eslint-disable-next-line no-undef
      localStorage.setItem('access_key', accessKey)
      state.access_key = accessKey
    },
    SET_BALANCE (state, newBalance) {
      state.balance = newBalance
    },
    ADD_TRANSACTION (state, transaction) {
      transaction.ts = Date.now()
      state.posTransactions.unshift(transaction)
      // eslint-disable-next-line no-undef
      localStorage.setItem('posTransactions', JSON.stringify(state.posTransactions))
    },
    SET_TRANSACTIONS (state, transactions) {
      state.posTransactions = transactions
      // eslint-disable-next-line no-undef
      localStorage.setItem('posTransactions', JSON.stringify(state.posTransactions))
    },
    SET_ACCOUNT (state) {
      // eslint-disable-next-line no-undef
      localStorage.setItem('account', JSON.stringify(state.account))
    },
    SET_BAR_STATUS (state, newStatus) {
      state.barState = newStatus
    },
    SOCKET_CONNECT (state, status) {
      console.log('mutation: SOCKET_CONNECT')
      state.socketConnected = true
    },
    SOCKET_CONNECT_ERROR (state, error) {
      console.log('mutation: CONNECT_ERROR, Reason:', error)
      state.socketConnected = false
    },
    SOCKET_DISCONNECT (state, data) {
      console.log('mutation: SOCKET_DISCONNECT', data)
      state.socketConnected = false
    },
    SOCKET_GET_BAR_STATE (state, status) {
      console.log('mutation: SOCKET_GET_BAR_STATE')
      // this.SET_BAR_STATUS(status)
    },
    SOCKET_SET_BAR_STATE (state, status) {
      console.log('mutation: SOCKET_SET_BAR_STATE')
    },
    SOCKET_BAR_STATE (state, obj) {
      console.log('mutation: SOCKET_BAR_STATE', obj)
      state.barState = obj.state
    }
  },
  actions: {
    setAccessKey ({ commit, state, getters }, accessKey) {
      commit('SET_ACCESS_KEY', accessKey)
    },
    async updateBalance ({ commit, state, getters }) {
      const pubKey = state.account.pub
      if (pubKey) {
        try {
          const balance = await getters.clientInternal.accounts.getBalance(pubKey)
          commit('SET_BALANCE', balance)
          return balance
        } catch (err) {
          console.log(err)
        }
      }
      return 0
    }
    // async getSenderFromTransaction ({ commit, state, getters }, transaction) {
    //   try {
    //     const theTransaction = await getters.client.tx.getTransaction(transaction)
    //     console.log('sender', theTransaction.tx.sender)
    //     // commit('SET_BALANCE', balance)
    //     // return balance
    //     return transaction
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
  }
})

export default store
