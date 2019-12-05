import Vue from 'vue'
import App from './App.vue'
{{#vueRouter}}
import router from '@/router'
{{/vueRouter}}

{{#vux}}
import store from '@/store'
{{/vux}}

  new Vue({
  el: '#app',
  {{#vueRouter}}
  router,
  {{/vueRouter}}
  {{#vux}}
  store,
  {{/vux}}
  render: h => h(App)
})
