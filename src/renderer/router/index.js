import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ustid-check',
      component: require('@/components/UstidCheck')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
