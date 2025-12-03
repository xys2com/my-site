<template>
  <div class="layout-wrap">
    <div class="ly-header-wrap">
      <Header />
      <!-- <HeaderMenu /> -->
    </div>
    <div class="ly-content-wrap">
      <Main />
    </div>
  </div>
  <filter id="noise" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence
      type="fractalNoise"
      baseFrequency="0 0.000001"
      result="NOISE"
      numOctaves="2"
    />
    <feDisplacementMap
      in="SourceGraphic"
      in2="NOISE"
      scale="30"
      xChannelSelector="R"
      yChannelSelector="R"
    ></feDisplacementMap>
  </filter>
</template>
<script lang="ts" setup>
import { Header, Main, HeaderMenu } from "./layout";
</script>
<style lang="scss" scoped>
.ly-header-wrap {
  position: absolute;
  z-index: 9999;
  width: 100vw;
  height: 80px;
}
.ly-content-wrap {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
</style>
