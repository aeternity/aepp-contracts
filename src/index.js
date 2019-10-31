import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import getRouter from './router'
import store from './store'

import VueCodemirror from 'vue-codemirror'

import "tailwindcss/dist/preflight.css";
import "tailwindcss/dist/components.css";
import "tailwindcss/dist/utilities.css";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(VueCodemirror)

console.info('about to render Vue App')
new Vue({
  router: getRouter(store),
  // store,
  render: h => h(App),
  beforeCreate () {}
}).$mount('#app')
