import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('@/views/AgendaView.vue'),
    },
    {
      path: '/speaker',
      name: 'speaker',
      component: () => import('@/views/SpeakerView.vue'),
    },
    {
      path: '/2013WebConf',
      name: '2013WebConf',
      component: () => import('@/views/TimeMachine.vue'),
    },
    {
      path: '/speaker-modal',
      name: 'speaker-modal',
      component: () => import('@/components/speaker-modal/SpeakerModal.vue'),
    },
  ],
});

export default router;
