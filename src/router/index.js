import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/pages/Home.vue'
import { validateToken } from '@/services/authService';
import Cookies from 'js-cookie';
import { toast } from 'vue3-toastify';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/pages/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/pages/auth/Register.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const token = Cookies.get('auth_token');

  const publicPaths = ['/login', '/register'];

  if (publicPaths.includes(to.path)) {
    if (token) {
      try {
        const isValid = await validateToken(token);
        if (isValid) {
          toast('Already logged in. Redirecting...', {
            type: "info",
            autoClose: 2000,
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          next('/');
        } else {
          Cookies.remove('auth_token');
          next();
        }
      } catch (err) {
        console.error(err);
        Cookies.remove('auth_token');
        next();
      }
    } else {
      next();
    }
  } else {
    if (token) {
      try {
        const isValid = await validateToken(token);
        if (isValid) {
          next();
        } else {
          Cookies.remove('auth_token');
          next('/login');
        }
      } catch (err) {
        console.error(err);
        Cookies.remove('auth_token');
        next('/login');
      }
    } else {
      next('/login');
    }
  }
});

export default router;
