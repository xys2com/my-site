<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-11-27 15:24:51
  * @LastEditors: xuyushu
-->
<template>
  <el-drawer
    v-model="show"
    size="60%"
    direction="ltr"
    :before-close="handleClose"
  >
    <div class="list-title">—— SVG ——</div>
    <div class="list-wrap">
      <div
        v-for="item in $list"
        :key="item.icon"
        class="item"
        @click="svgCopy(item.text)"
      >
        <Svg :name="item.icon" :color="item.color" size="60" />
        <div>{{ item.name }}</div>
      </div>
    </div>
    <div class="list-title">—— 表情包 ——</div>
    <div class="list-wrap">
      <div
        v-for="item in memelist"
        :key="item.name"
        class="item"
        @click="imgCopy(item.text)"
      >
        <img :src="item.src" alt="" />
        <div>{{ item.name }}</div>
      </div>
    </div>
  </el-drawer>
</template>
<script lang="ts" setup>
import simpleSvgData from "@/assets/simple-svg-data";
import complexSvgData from "@/assets/complex-svg-data";
import biaoqing from "@/assets/meme/index";
import { ElMessage } from "element-plus";
import { copy } from "@/utils/tools";
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
const $list = [...simpleSvgData, ...complexSvgData].map((item, i) => {
  return {
    icon: item.name,
    name: item.name,
    text: `<Svg name="${item.name}" color="#000" size="40" />`,
    color: `hsl(${i * 10}, 75%, 50%)`,
  };
});
const memelist = ref([]);
for (let k in biaoqing) {
  memelist.value.push({
    src: biaoqing[k],
    text: `<img src="${biaoqing[k]}"/>`,
    name: k,
  });
}

const handleClose = () => {
  show.value = false;
};
const svgCopy = async (str: string) => {
  try {
    await copy(str);
    ElMessage.success("已复制组件");
  } catch (error) {
    ElMessage.error(error);
  }
};
const imgCopy = async (str: string) => {
  try {
    await copy(str);
    ElMessage.success("已复制图片");
  } catch (error) {
    ElMessage.error(error);
  }
};
</script>
<style lang="scss" scoped>
.list-title {
  font-size: 30px;
  line-height: 40px;
  margin-top: 20px;
}
.list-wrap {
  display: flex;
  flex-wrap: wrap;
  .item {
    width: 100px;
    height: 100px;
    margin: 10px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 0 10px #3333;
    background: #fff;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
    transition: transform 0.2s;
    img {
      width: 60px;
      height: 60px;
    }
    & > div {
      font-size: 14px;
      padding: 0 8px;
      text-align: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
