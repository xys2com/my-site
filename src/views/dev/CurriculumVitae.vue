<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-12-03 14:13:08
  * @LastEditors: xuyushu
-->
<template>
  <div class="curriculum-vitae">
    <div class="warp">
      <div class="page" :style="$PageStyle">
        <div class="content">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <g filter="url(#conformv2)">
              <text x="0" y="36" font-size="36px" color="">内容</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
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
  background: #fff3;
  left: 0;
  top: 0;
  position: fixed;
}
.warp {
  padding: 80px 0;
}
.page {
  margin: 0 auto;
  position: relative;
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
</style>
