import Vue from 'vue'
import Router from 'vue-router'
import ContractsEditor from '@/components/ContractsEditor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ContractsEditor',
      component: ContractsEditor
    }
  ]
})
