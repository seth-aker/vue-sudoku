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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/sudoku/easy',
      name: 'easy',
      component: () => import('../views/sudoku/Standard.vue')
    },
    {
      path: '/sudoku/medium',
      name: 'medium',
      component: () => import('../views/sudoku/Standard.vue')
    },
    {
      path: '/sudoku/hard',
      name: 'hard',
      component: () => import('../views/sudoku/Standard.vue')
    },
    {
      path: '/sudoku/impossible',
      name: 'impossible',
      component: () => import('../views/sudoku/Standard.vue')
    }
  ],
})

export default router
