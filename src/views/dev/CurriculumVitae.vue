<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-12-03 14:13:08
  * @LastEditors: xuyushu
-->
<template>
  <div v-if="show" class="curriculum-vitae" @click="show = false">
    <div
      class="warp"
      :style="`width:${$Width + 10}px;height:${$Height}px`"
      @click.stop
    >
      <div class="page-container">
        <div class="page" :style="$PageStyle">
          <div class="content">
            <div class="name">内容</div>
          </div>
        </div>
        <div class="page" :style="$PageStyle">
          <div class="content">
            <div class="name">内容</div>
          </div>
        </div>
      </div>
      <Horse />
    </div>
  </div>
</template>
<script lang="ts" setup>
import Horse from "./Horse.vue";
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

const DPI = Math.round(window.devicePixelRatio * 96);
const UniMM = (DPI / 96) * 3.78; // 1mm 的像素

// a4纸宽度/高度
const $Width = UniMM * 210;
const $Height = UniMM * 297;
// a4 padding
const $PaddingVertical = 8 + 3 * UniMM;
const $PaddingAcross = 8 + 7 * UniMM;

const $PageStyle = computed(() => {
  return `height:${$Height}px;width:${$Width}px;padding:${$PaddingVertical}px ${$PaddingAcross}px`;
});
</script>
<style lang="scss" scoped>
.curriculum-vitae {
  height: 100vh;
  width: 100vw;
  background: #0003;
  left: 0;
  top: 0;
  position: fixed;
}
.warp {
  margin: 0px auto;
  margin-top: 120px;
  position: relative;
}
.page-container {
  overflow-y: auto;
  height: 100%;
  width: 100%;
  .page {
    position: relative;
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
    .content {
      filter: url(#conform);
      color: #000;
      font-size: 20px;
      .name {
        font-size: 32px;
        font-weight: bold;
        text-shadow: 0px 0px 3px #000;
      }
      .title {
        font-size: 28px;
        font-weight: bold;
      }
      .item {
      }
      .label {
        font-weight: bold;
      }
      .text-val {
      }
      .subitem {
      }
    }
    * {
      z-index: 9;
      position: relative;
    }
    &::before {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      filter: url("#roughpaper");
      background: #efeecb;
      z-index: 0;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>
