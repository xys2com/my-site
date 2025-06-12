import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layout/Index.vue"),
    children: [
      {
        path: "home",
        component: () => import("@/views/home/Index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(() => {
  NProgress.start();
});
router.afterEach(() => {
  NProgress.done();
});

export default router;
