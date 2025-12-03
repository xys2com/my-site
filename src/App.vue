<template>
  <Filter />
  <RouterView />
  <DevTool />
</template>
<script lang="ts" setup>
import DevTool from "@/views/dev/Index.vue";
import Filter from "@/views/svg-filter/Index.vue";
</script>
<style lang="scss"></style>
