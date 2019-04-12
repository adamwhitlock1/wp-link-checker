import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import { Tabs, Tab } from "vue-tabs-component";

Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.component("tabs", Tabs);
Vue.component("tab", Tab);

new Vue({
  render: h => h(App)
}).$mount("#app");
