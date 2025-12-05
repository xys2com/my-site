<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-12-05 14:35:07
  * @LastEditors: xuyushu
-->
<template>
  <div v-if="show" class="html-iframe" @click="show = false">
    <Svg name="close" color="#61afef" size="48" @click="show = false" />
    <div class="wrap" @click.stop>
      <div class="list">
        <div
          v-for="(item, i) in webList"
          :key="i"
          class="item"
          @click="setIframeUrl(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <iframe :src="iframeUrl" frameborder="0"></iframe>
    </div>
  </div>
</template>
<script lang="ts" setup>
const $props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const $emit = defineEmits(["update:modelValue"]);
const show = computed({
  get() {
    return $props.modelValue;
  },
  set(v) {
    $emit("update:modelValue", v);
  },
});
const webList = ref([
  {
    name: "2048",
    src: "/html/game-2048.html",
  },
  {
    name: "贪吃蛇",
    src: "/html/game-snk.html",
  },
  {
    name: "手绘风引擎",
    src: "/html/hand.html",
  },
]);
const iframeUrl = ref("/html/game-2048.html");
const setIframeUrl = (item) => {
  iframeUrl.value = item.src;
};
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.html-iframe {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 1099;
  left: 0;
  top: 0;
  background: #0006;
  iframe {
    width: 100%;
    height: calc(100% - 80px);
  }
  .svg-coms {
    filter: drop-shadow(0 0 6px #61afef);
    position: absolute;
    cursor: pointer;
    right: 10px;
    top: 10px;
  }
  .wrap {
    margin: 0 40px;
    height: calc(100vh - 80px);
    padding-top: 0px;
    margin-top: 40px;
    background: #fff;
    border-radius: 8px;
    .list {
      height: 80px;
      display: flex;
      padding: 0 40px;
      font-size: 24px;
      text-decoration: underline;
      align-items: center;
      border-bottom: 1px solid #aaa;
      .item {
        cursor: pointer;
        padding: 0 12px;
        & + .item {
          margin-left: 40px;
        }
      }
    }
  }
}
</style>
