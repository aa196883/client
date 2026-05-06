import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CollectionsView from '@/views/CollectionsView.vue';
import SearchInterfaceView from '@/views/SearchInterfaceView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/plus',
      name: 'plus',
      component: () => import('@/views/PlusView.vue'),
    },
    {
      path: '/collections',
      name: 'collections',
      component: CollectionsView,
    },
    {
      path: '/references',
      name: 'references',
      component: () => import('@/views/ReferencesView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/HelpView.vue'),
    },
    {
      path: '/searchInterface',
      name: 'searchInterface',
      component: SearchInterfaceView,
    },
    {
      path: '/contour-search',
      name: 'contourSearch',
      component: () => import('@/views/ContourSearchView.vue'),
    }
    // If you add a page here, do not forget to also add the route into the `const urls` of `frontend.git/index.js` to be able to get the page.
  ],
  scrollBehavior(to, from, savedPosition) {
    return { left: 0, top: 0 };
  },
});

export default router;
