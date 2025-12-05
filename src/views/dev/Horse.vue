<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-12-04 11:16:52
  * @LastEditors: xuyushu
-->
<template>
  <!-- 183 -->
  <div class="horse" :style="`background-position:${$left}px 0;`"></div>
</template>
<script lang="ts" setup>
const count = ref(0);
const max = 15;
const min = 0;
const $left = computed(() => {
  return -183 * count.value;
});
const run = (e: any) => {
  const { deltaY } = e;
  if (deltaY > 0) count.value += 1;
  else count.value -= 1;
  if (count.value > max) count.value = min;
  if (count.value < min) count.value = max;
};
const startrun = () => {
  document.body.addEventListener("wheel", run);
};
const stoprun = () => {
  document.body.removeEventListener("wheel", run);
};
onMounted(() => {
  startrun();
});
onUnmounted(() => {
  stoprun();
});
</script>
<style lang="scss" scoped>
@mixin scaleN($n) {
  transform: scale($n);
  bottom: calc((-122px * (1 - $n)) / 2 + 10px);
  right: calc((-183px * (1 - $n)) / 2 + 10px);
}
.horse {
  width: 183px;
  height: 122px;
  overflow: hidden;
  background: url("@/assets/imgs/horse.png");
  position: absolute;
  @include scaleN(0.35);
}
</style>
