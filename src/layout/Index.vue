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
</template>
<script lang="ts" setup>
import { Header, Main } from "./layout";
</script>
<style lang="scss" scoped>
.ly-header-wrap {
  position: absolute;
  z-index: 101;
  width: 100vw;
  height: 80px;
}
.ly-content-wrap {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 100;
}
</style>
