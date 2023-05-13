import { createApp } from 'vue'
import { createPinia } from 'pinia'
import gsap from 'gsap'
// import AOS from 'aos'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.provide('gsap', gsap)
// app.provide('AOS', AOS)
app.use(createPinia())
app.use(router)

app.mount('#app')
