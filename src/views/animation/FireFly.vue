<template>
  <div class="firefly"></div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from "vue";
import animation from "@/utils/animation";
import Firefly from "@/utils/animation/firefly";

const fireflyInstance = ref();
const createFirefly = () => {
  const height = document.body.clientHeight;
  const width = document.body.clientWidth;
  fireflyInstance.value = new Firefly({
    count: 2048,
    el: ".firefly",
    sx: 0,
    sy: document.body.clientHeight,
    ex: width,
    ey: height,
    speed: 1,
    mousedownSpeedRatio: 10,
    createSpeed: 512,
    followMouse: true,
    success: async () => {
      await nextTick();
      register();
      fireflyInstance.value.canvas.style.position = "absolute";
      fireflyInstance.value.canvas.style.left = "0";
      fireflyInstance.value.canvas.style.top = "0";
      const id = `firefly_${Math.random().toString(32).slice(-8)}`;
      animation.$register({
        name: "firefly",
        id,
        callback: () => {
          fireflyInstance.value.flying();
        },
      });
    },
  });
};
const mousedown = ($event) => {
  fireflyInstance.value?.mouseDown($event);
};
const mousemove = ($event) => {
  fireflyInstance.value?.mouseMove($event);
};
const mouseup = ($event) => {
  fireflyInstance.value?.mouseUp($event);
};
const register = () => {
  document.body.addEventListener("mousedown", mousedown);
  document.body.addEventListener("mousemove", mousemove);
  document.body.addEventListener("mouseup", mouseup);
};
const writeoff = () => {
  document.body.removeEventListener("mousedown", mousedown);
  document.body.addEventListener("mousemove", mousemove);
  document.body.removeEventListener("mouseup", mouseup);
};
onMounted(() => {
  createFirefly();
});
onUnmounted(() => {
  writeoff();
});
</script>
<style lang="scss" scoped>
.firefly {
  width: 100vw;
  height: 100vh;
  background: #0006;
}
</style>
