<template>
  <div class="svg-coms" v-html="svgHtml" :style="`max-width:${size + 'px'}`" />
</template>
<script lang="ts" setup>
import simpleSvgData from "@/assets/simple-svg-data";
import complexSvgData from "@/assets/complex-svg-data";
import PageResize from "@/utils/PageResize";

const $svgData = [...simpleSvgData, ...complexSvgData];

const $props = defineProps({
  // svg name
  name: {
    type: String,
  },
  // 填充颜色
  color: {
    type: String,
    default: "#000",
  },
  // 边线颜色（如果有 line）
  line: {
    type: String,
  },
  // svg 展示尺寸
  size: {
    type: [String, Number],
    default: 40,
  },
  // svg 文本内容（如果有文本）
  text: {
    type: String,
    default: "",
  },
  // 文本颜色（如果有文本）
  tcolor: {
    type: String,
    default: "#fff",
  },
  // 文本大小（如果有文本）
  fontSize: {
    type: [String, Number],
    default: 15,
  },
  // svg 绘制尺寸
  wh: {
    type: [Array, Object],
    default: null,
  },
  // 某些特殊的定位
  positionX: {
    type: [String, Number],
    default: 40,
  },
  positionY: {
    type: [String, Number],
    default: 50,
  },
  // 是否根据屏幕尺寸缩放
  zoom: {
    type: Boolean,
    default: false,
  },
});
// 注册监听
const svgId = Math.random().toString(32).slice(-8);
const $size = ref((document.body.clientWidth / 1920) * Number($props.size));
const viewChange = () => {
  PageResize.push({
    id: svgId,
    fun: () => {
      $size.value = (document.body.clientWidth / 1920) * Number($props.size);
    },
    params: {},
  });
};

// 渲染内容
const svgHtml = computed(() => {
  $svgData
    .filter((e: any) => !e.formatted)
    .forEach((e: any) => {
      e.template = e.template
        .replace(/size=[\"|\'](.*?)[\'|\"]/, "size={size}")
        .replace(/width=[\"|\'](.*?)[\'|\"]/, "width={width}")
        .replace(/fill=[\"|\'](.*?)[\'|\"]/, "fill={color}")
        .replace(/stroke=[\"|\'](.*?)[\'|\"]/g, "stroke={line}")
        .replace(/height=[\"|\'](.*?)[\'|\"]/g, "height={height}");
    });
  const item: any = $svgData.find((e: any) =>
    e.name.split("|").includes($props.name)
  );
  if (!item) throw `name ${$props.name} undefined`;

  const line = $props.line || $props.color;
  const size = $props.size;
  const wh = $props.wh
    ? Array.isArray($props.wh)
      ? $props.wh
      : [$props.wh.width, $props.wh.height]
    : [size, size];
  const width = wh[0];
  const height = wh[1];
  let str = item.template
    .replace(`{size}`, size)
    .replace(`{width}`, width)
    .replace(`{height}`, height)
    .replace(/{color}/g, $props.color)
    .replace(/{line}/g, line)
    .replace(/{positionX}/g, $props.positionX)
    .replace(/{positionY}/g, $props.positionY)
    .replace(/{fontSize}/g, $props.fontSize);
  if ($props.text)
    str = str.replace(`{text}`, $props.text).replace(`{tcolor}`, $props.tcolor);

  return str;
});

onMounted(() => {
  if ($props.zoom) viewChange();
});
onUnmounted(() => {
  if ($props.zoom) PageResize.pop(svgId);
});
</script>
<style scoped>
.svg-coms {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
