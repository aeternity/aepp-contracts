// import socketio from 'socket.io'
import VueSocketio from 'vue-socket.io'
import './custom.scss'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import getRouter from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(VueRouter)

// Debug Ape Unit (Andrea's machine): http://192.168.111.108:5000
// Local dev: http://localhost:5000
// LIVE: https://republica-pos.aepps.com
Vue.use(VueSocketio, 'https://republica-pos.aepps.com', store)

console.info('about to render Vue App')
new Vue({
  sockets: {
    connect () {
      this.$socket.emit('get_bar_state', (res) => {
        if (res && res.state) {
          store.commit('SET_BAR_STATUS', res.state)
        }
        // this.$socket.emit('set_bar_state', this.accessKey, res.state)
      })
      console.log('connected')
    }
  },
  router: getRouter(store),
  store,
  render: h => h(App),
  beforeCreate () {
    try {
      // eslint-disable-next-line no-undef
      store.commit('SET_ACCOUNT')
    } catch (e) {
      console.log(e)
    }
  }
}).$mount('#app')
