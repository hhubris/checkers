import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import GameView from './views/GameView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/game' },
    { path: '/home', component: HomeView },
    { path: '/game', component: GameView },
  ],
})

export default router
