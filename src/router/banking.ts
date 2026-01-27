import type { RouteRecordRaw } from 'vue-router';

const bankingRoutes: RouteRecordRaw[] = [
  {
    path: '/banking',
    name: 'Banking',
    component: () => import('@/views/Banking.vue'),
    meta: {
      requiresAuth: true,
      title: 'Banking - CoinQuest'
    }
  }
];

export default bankingRoutes;
