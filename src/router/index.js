import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/agenda",
      name: "agenda",
      component: () => import("@/views/AgendaView.vue"),
    },
    {
      path: "/speakers",
      name: "speaker",
      component: () => import("@/views/SpeakersView.vue"),
    },
    {
      path: "/2013",
      name: "2013WebConf",
      component: () => import("@/views/WebConf2013.vue"),
    },
    {
      path: "/speaker",
      name: "speaker-modal",
      component: () => import("@/components/speaker/Modal.vue"),
    },
  ],
});

export default router;
