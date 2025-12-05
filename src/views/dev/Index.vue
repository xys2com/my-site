<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-11-28 14:42:49
  * @LastEditors: xuyushu
-->
<template>
  <div class="dev-tool">
    <div
      v-for="btn in btns"
      class="switch-btn"
      @click="showDialog(btn.key)"
      :title="btn.title"
    >
      <Svg :name="btn.name" :color="btn.color" size="80" />
    </div>
    <SvgList v-model="view.svg" />
    <BulletScreen v-model="view.bullet" />
    <CurriculumVitae v-model="view.horse" />
    <HtmlView v-model="view.html" />
  </div>
</template>
<script lang="ts" setup>
import SvgList from "./SvgDemo.vue";
import BulletScreen from "./BulletScreen.vue";
import CurriculumVitae from "./CurriculumVitae.vue";
import HtmlView from "./HtmlView.vue";
import { random } from "@/utils/tools";
const view = reactive({
  svg: false,
  bullet: false,
  curriculumVitae: false,
  horse: false,
  html: false,
});

const btns = ref([
  {
    name: "huaihuaibiaoqing",
    key: "svg",
    title: "SVG自动注册组件",
    color: `hsl(${random(0, 360)}, 75%, 50%)`,
  },
  {
    name: "bullet",
    key: "bullet",
    title: "滚动弹幕（DOM版本）",
    color: `hsl(${random(0, 360)}, 75%, 50%)`,
  },
  {
    name: "horse",
    key: "horse",
    title: "牛马简历",
    color: `hsl(${random(0, 360)}, 75%, 50%)`,
  },
  {
    name: "javascript",
    key: "html",
    title: "JS小玩意",
    color: `hsl(${random(0, 360)}, 75%, 50%)`,
  },
]);

const showDialog = (key) => {
  view[key] = true;
};
</script>
<style lang="scss" scoped>
.dev-tool {
  position: fixed;
  width: 160px;
  top: 80px;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1001;
  background: #0000;
  padding: 20px 0;
  transition: all 0.3s;
  border-right: 0.5px solid #589dda66;
  box-shadow: 0px 0 6px #589dda66;
  &:hover {
    background: #0005;
  }
  .switch-btn {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: #fff4;
    top: calc((100vh - 110px) / 2);
    box-shadow: 0 0 10px #fff8;
    border-radius: 20px;
    transition: all 0.3s;
    margin-bottom: 20px;
    &:hover {
      transform: scale(1.2);
      background: #53f4ff88;
      box-shadow: 0 0 20px #01e9fa;
      border-radius: 50px;
    }
  }
}
</style>
