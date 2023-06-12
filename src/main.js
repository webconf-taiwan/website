import { createApp } from "vue";
import { createPinia } from "pinia";
import gsap from "gsap";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.provide("gsap", gsap);
app.use(createPinia());
app.use(router);

app.mount("#app");
