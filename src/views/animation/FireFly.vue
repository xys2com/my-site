<template>
  <div class="firefly"></div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from "vue";
import animation from "@/utils/animation";
import Firefly from "@/utils/animation/firefly";

const createFirefly = () => {
  const height = document.body.clientHeight;
  const width = document.body.clientWidth;
  const firefly = new Firefly({
    count: 2048,
    el: ".firefly",
    sx: 0,
    sy: document.body.clientHeight,
    ex: width,
    ey: height,
    speed: 1,
    mousedownSpeedRatio: 2,
    createSpeed: 128,
    followMouse: true,
    success: async () => {
      await nextTick();
      firefly.canvas.style.position = "absolute";
      firefly.canvas.style.left = "0";
      firefly.canvas.style.top = "0";
      const id = `firefly_${Math.random().toString(32).slice(-8)}`;
      animation.$register({
        name: "firefly",
        id,
        callback: () => {
          firefly.flying();
        },
      });
    },
  });
};
onMounted(() => {
  createFirefly();
});
</script>
<style lang="scss" scoped>
.firefly {
  width: 100vw;
  height: 100vh;
  background: #0006;
}
</style>
