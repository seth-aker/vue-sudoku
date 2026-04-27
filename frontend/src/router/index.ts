import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/sudoku/:difficulty',
      name: 'sudoku',
      props: true,
      component: () => import('../views/sudoku/Standard.vue')
    },
    // {
    //   path: '/sudoku/hard',
    //   name: 'hard',
    //   component: () => import('../views/sudoku/Standard.vue')
    // },
    // {
    //   path: '/sudoku/impossible',
    //   name: 'impossible',
    //   component: () => import('../views/sudoku/Standard.vue')
    // }
  ],
})

export default router
