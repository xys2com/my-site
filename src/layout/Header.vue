<template>
  <div class="header">
    <div class="nav-list">
      <div
        v-for="(item, i) in navlist"
        :class="['item', active === i ? 'active' : '']"
        :key="i"
        @click="itemClick($event, item, i)"
      >
        {{ item.name }}
      </div>
    </div>

    <div class="header-right">
      <div class="note" v-html="chooseNote"></div>
      <p class="subtitle" v-html="chooseSubtitle"></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import animation from "@/utils/animation";
import Firefly from "@/utils/animation/firefly";

// 创建头部萤火虫动画
const active = ref(0);
const created = ref(false);
const createFirefly = ({ x, y }, item) => {
  showTips(null, item);
  if (created.value) return;
  const firefly = new Firefly({
    count: 500,
    el: ".header",
    sx: x,
    ex: 1920,
    ey: 80,
    sy: y,
    success: async () => {
      await nextTick();
      created.value = true;
      firefly.canvas.style.position = "absolute";
      firefly.canvas.style.left = "0";
      firefly.canvas.style.top = "0";
      firefly.canvas.style.userSelect = "none";
      firefly.canvas.style.zIndex = "1";
      const id = `firefly_${Math.random().toString(32).slice(-8)}`;
      animation.$register({
        name: "firefly",
        id,
        callback: () => {
          firefly.flying();
        },
      });
    },
  });
};

const chooseNote = ref("");
const chooseSubtitle = ref("");
const showTips = (e, item) => {
  chooseNote.value = item.note
    .split("")
    .map((e, i) => {
      return `<span style="animation-delay:${(i * 0.1).toFixed(
        1
      )}s">${e}</span>`;
    })
    .join("");
  chooseSubtitle.value = item.subtitle
    .split("")
    .map((e, i) => {
      return `<span style="animation-delay:${(
        i * 0.05 +
        item.note.length * 0.1
      ).toFixed(2)}s">${e}</span>`;
    })
    .reverse()
    .join("");
};
const navlist = reactive([
  {
    name: "星月海",
    title: "星星啊，月亮啊，水啊",
    clickFun: showTips,
    note: "光年之外，璀璨零光不可触及；桂光倒悬，此番人间共饮一轮",
    subtitle: "我比他们更明亮，只因我的心离你更近而已。 —— 你好",
  },
  {
    name: "流萤",
    title: "萤火虫诶！",
    note: "夜幕挂星，飞火流萤",
    clickFun: createFirefly,
    subtitle:
      "树上的蝉、塘里的莲、河里的鱼，鱼跑了，塘旱了，就连那个村也推平了。 —— 童趣",
  },
  {
    name: "狂猪日记",
    title: "来看看猪的白日梦~",
    clickFun: showTips,
    note: "我梦见我变成了猪，今后一边怀恋当猪的好，一边想着做人的妙，比较可笑。",
    subtitle:
      "猪不会上班，猪不会写字，猪的一生只有一小年，可猪的所有痛苦也只有那最后那一刀。 —— 谁才是猪",
  },
  {
    name: "动画",
    title: "哟呵~",
    clickFun: showTips,
    note: "人的厚度来源于时间，人的宽度来源见识，希望我是、或者成为一个厚而重的人。",
    subtitle:
      "可是有人生来便拥有了财富，从而有了时间，而后有了见识。 —— 天赋异禀",
  },
]);
const itemClick = ($event, item, i) => {
  active.value = i;
  item.clickFun(
    {
      x: $event.clientX,
      y: $event.clientY,
    },
    item
  );
};
onMounted(() => {
  showTips(null, navlist[0]);
});
</script>

<style lang="scss" scoped>
@keyframes textShow {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes textShow2 {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  75% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.header {
  width: 100vw;
  height: 80px;
  background: #0000;
  position: absolute;
  top: 0;
  transition: all 0.3s;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 0 50px;
  min-width: 1600px;
  transition: all 0.3s;
  border-bottom: 0.5px solid #589dda66;
  box-shadow: 0 0px 6px #589dda66;
  overflow: hidden;
  &:hover {
    background: #0009;
  }
  .nav-list {
    height: 100%;
    display: flex;
    flex: 1;
    font-family: "fzlt";
    z-index: 10;
    .item {
      font-family: "muyao";
      font-size: 32px;
      color: #fff0b8;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 30px;
      min-width: 100px;
      font-weight: bold;
      transition: all 0.5s;
      &:hover {
        @include lightFontBlue(#fff);
      }
      &.active {
        @include lightFontBlue(#fff);
        animation: squiggly-anim 0.36s linear infinite;
      }
    }
  }

  .header-right {
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    font-family: "fzlt";
    div {
      text-align: left;
      height: 70%;
      display: flex;
      align-items: center;
      font-size: 24px;
      text-overflow: clip;
      overflow: hidden;
      width: 100%;
      @include lightFontBlue(#d6e5ff);
      :deep(span) {
        opacity: 0;
        animation: textShow2 0.2s;
        animation-fill-mode: forwards;
      }
    }
    p {
      width: 100%;
      margin: 0;
      text-align: right;
      flex: 1;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      font-size: 18px;
      text-overflow: clip;
      overflow: hidden;
      @include lightFontBlue(#d6e5ff);
      :deep(span) {
        opacity: 0;
        animation: textShow2 0.2s;
        animation-fill-mode: forwards;
      }
    }
  }
}
</style>
