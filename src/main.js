import Vue from 'vue'
import App from './App.vue'

import VueCodemirror from 'vue-codemirror'

import './index.css'

Vue.config.productionTip = false

Vue.use(VueCodemirror)

new Vue({
  render: h => h(App),
  beforeCreate () {}
}).$mount('#app')
