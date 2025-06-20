import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const routes: readonly RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layout/Index.vue"),
    redirect: "/firefly",
    children: [
      {
        path: "home",
        component: () => import("@/views/home/Index.vue"),
      },
      {
        path: "firefly",
        component: () => import("@/views/animation/FireFly.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
router.beforeEach(() => {
  NProgress.start();
});
router.afterEach(() => {
  NProgress.done();
});

export default router;
