<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-11-11 14:43:54
  * @LastEditors: xuyushu
-->
<template>
  <div v-if="show" class="bullet-screen">
    <div ref="flows" class="flows"></div>
    <div class="text-content"></div>
    <div class="send-input">
      <div class="input-wrap">
        <div v-if="chooseImg.src" class="img">
          <Svg
            name="round-error"
            color="#ff5252"
            size="30"
            @click="cancelChoose"
          />
          <img :src="chooseImg.src" alt="" />
        </div>
        <el-input
          type="textarea"
          class="input"
          :rows="3"
          v-model="inputContext"
        />
      </div>
      <div class="handle">
        <!-- <div class="hd-bq-btn">
            <div v-for="item in memelist" class="bq-item">
              <img :src="item.src" @click="chooseBq(item)" />
              <span>{{ item.name }}</span>
            </div>
          </div> -->
        <el-popover
          ref="bqPop"
          title=""
          trigger="click"
          placement="top"
          width="668px"
        >
          <template #reference>
            <div class="hd-bq-btn">
              <img :src="biaoqing.halou" alt="" />表情
            </div>
          </template>
          <div class="bullet-screen-bq-list">
            <img
              v-for="item in memelist"
              :src="item.src"
              @click="chooseBq(item)"
            />
          </div>
        </el-popover>
        <div class="btns">
          <div class="btn back" @click="show = false">返回</div>
          <div class="btn submit" @click="submitFn">提交</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  BulletScreen,
  Danmu,
  Utils,
  type BulletItem,
} from "@/utils/animation/bullet-screen";
import biaoqing from "@/assets/meme";
import { ElMessage } from "element-plus";

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
const handleClose = () => {
  show.value = false;
};

const flows = ref();
let initKey = false;
let count = 0;
const chooseImg = ref({ src: "", name: "" });
const inputContext = ref("");
const $bulletScreen = ref();
const memelist = ref([]);
for (let k in biaoqing) {
  memelist.value.push({
    src: biaoqing[k],
    text: `<img src="${biaoqing[k]}"/>`,
    name: k,
  });
}
const bqPop = ref();
const chooseBq = (item: any) => {
  // chooseImg.value = item.deepClone();
  inputContext.value += `#${item.name}#`;
  bqPop.value.hide();
};
const cancelChoose = () => {
  chooseImg.value.src = "";
  chooseImg.value.name = "";
};

// 弹幕信息
const studentsBulletContent = localStorage.getItem("hdkt-student-bullet-list");
let studentsBullets: any[] = studentsBulletContent
  ? JSON.parse(studentsBulletContent)
  : [];
// 发送socket弹幕信息
const getBulletText = (options: any) => {
  const { fromUserId, barrageContent } = options;
  // 定义ID查询缓存中的id
  const id = `userid_${fromUserId}`;
  let item = studentsBullets.find((e: BulletItem) => e.id == id);
  let msg = item ? item.msg : "";

  // 如果缓存中没有当前用户的弹幕，直接发送弹幕，并缓存弹幕文本、弹幕id、弹幕实例id
  if (!item) {
    msg = barrageContent;
    let bulletId = $bulletScreen.value.$send(msg);
    studentsBullets.push({
      id,
      bulletId,
      msg,
    });
  } else if (msg != barrageContent) {
    // 如果缓存中存在当前用户的弹幕信息，则更改文本为socket收到的文本，并根据 弹幕实例id 重新发送
    item.msg = barrageContent;
    let bulletItem = $bulletScreen.value.$getItem(item.bulletId);
    if (!bulletItem) {
      $bulletScreen.value.$send(barrageContent, item.bulletId);
    } else bulletItem.text = barrageContent;
  }

  localStorage.setItem(
    "hdkt-student-bullet-list",
    JSON.stringify(studentsBullets)
  );
};

// 发送缓存弹幕
let cacheIndex = 0;
const sendCacheBullte = () => {
  let t = setTimeout(() => {
    let item = studentsBullets[cacheIndex];
    $bulletScreen.value.$send(item.msg, item.bulletId);
    clearTimeout(t);
    if (cacheIndex < studentsBullets.length - 1) {
      cacheIndex++;
      sendCacheBullte();
    }
  }, Utils.random(500, 2000));
};

const dmtest = () => {
  $bulletScreen.value.$send("卧槽！牛逼");
  const molidanmu = () => {
    let counet = $bulletScreen.value.$getCount();
    if (counet > 50) return;

    let a1 = Danmu[Utils.random(Danmu.length - 1)];
    let text = a1[Utils.random(a1.length - 1)];
    let t = setTimeout(() => {
      $bulletScreen.value.$send(text);
      clearTimeout(t);
      molidanmu();
    }, Utils.random(500, 2000));
  };
  molidanmu();
};
const init = () => {
  $bulletScreen.value = new BulletScreen(flows.value);
  dmtest();
  // if (studentsBullets && studentsBullets.length) sendCacheBullte();
};
const checkEl = () => {
  if (count > 4) {
    ElMessage.error("页面渲染错误，请刷新后重试");
    return;
  }
  initKey = flows.value.offsetWidth;
  if (!initKey) {
    let t = setTimeout(() => {
      count++;
      checkEl();
      clearTimeout(t);
    }, 50);
    return;
  }
  init();
};
const send = (msg: string) => {
  $bulletScreen.value.$send(msg);
};
const submitFn = async () => {
  // if (!chooseImg.value.name && !inputContext.value) {
  //   ElMessage.error("请输入表情包或文字弹幕");
  //   return;
  // }
  // let content = "";
  // if (chooseImg.value.name) content += `#${chooseImg.value.name}#`;
  // content += inputContext.value;
  // inputContext.value = "";
  // chooseImg.value = { src: "", name: "" };
  $bulletScreen.value.$send(inputContext.value);
  inputContext.value = "";
};
watch(
  () => show.value,
  async (v) => {
    if (v) {
      await nextTick();
      checkEl();
    }
  }
);
onUnmounted(() => {
  $bulletScreen.value && $bulletScreen.value.$destroy();
});
</script>
<style lang="scss">
* {
  box-sizing: border-box;
}
.bullet-screen {
  height: calc(100vh - 80px);
  width: 100vw;
  left: 0;
  z-index: 9;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: 0 bottom;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  .flows {
    z-index: 9;
    pointer-events: none;
    position: absolute;
    height: 100%;
    width: 100%;
    // background: linear-gradient(to bottom, #000 0%, #000 80%, #fff 100%);
    .bullet-item {
      position: absolute;
      text-shadow: 1px 0px 2px #000, 0px 1px 2px #000, -1px 0px 2px #000,
        0px -1px 2px #000;
      color: #fff;
      font-size: 16px;
      opacity: 0.8;
      display: flex;
      align-items: center;
      img {
        width: 60px;
        height: 60px;
      }
      .b {
        text-shadow: 1px 0px 2px #fff, 0px 1px 2px #fff, -1px 0px 2px #fff,
          0px -1px 2px #fff;
        color: #000;
      }
    }
  }
  .text-content {
    height: 100%;
    width: 100%;
    background: #0003;
    box-shadow: 6px 0 6px #0001, -6px 0 6px #0001;
    box-sizing: border-box;
    padding: 0 20px;
    width: 100%;
    letter-spacing: 4px;
    text-align: justify;
    font-size: 24px;
    line-height: 32px;
    position: absolute;
    bottom: 0;
    border-radius: 10px;
    padding-top: 48px;
    overflow-y: auto;
    padding-bottom: 120px;
    span {
      font-family: "KaiTi" !important;
      display: inline-block;
      &:first-child {
        text-indent: 48px;
      }
    }
    br + span {
      text-indent: 48px;
      margin-top: 24px;
    }
  }
  .send-input {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: #2f1b6466;
    padding: 24px 40px;
    display: flex;
    flex-direction: column;
    .tit {
      font-size: 32px;
      line-height: 56px;
    }
    .input-wrap {
      height: 100px;
      flex: 1;
      border: none;
      box-shadow: 0 0 6px #e3ef3f;
      border-radius: 3px;
      display: flex;
      align-items: center;
      textarea {
        background: transparent;
      }
      .img {
        width: 180px;
        height: 180px;
        position: relative;
        .svg-coms {
          position: absolute;
          top: 0px;
          right: 0px;
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .input {
        border: none;
        flex: 1;
        padding: 16px;
        font-size: 32px;
        border: none;
        textarea {
          min-height: 100% !important;
          border: none;
          box-shadow: none;
          box-sizing: border-box;
        }
        &:focus-visible {
          outline: #0000 auto 1px;
        }
      }
    }
    .handle {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      align-items: center;
      .hd-bq-btn {
        display: flex;
        cursor: pointer;
        align-items: center;
        font-size: 20px;
        font-weight: bold;
        @include lightFontBlue(#fff);
        img {
          height: 60px;
          width: 60px;
          margin-right: 16px;
          filter: drop-shadow(0 0 3px #0005);
          &:hover {
            transform: scale(1.1);
          }
        }
        .bq-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 10px;
          img {
            height: 60px;
            width: 60px;
          }
          span {
            font-size: 20px;
          }
        }
      }
      .btns {
        display: flex;
        align-items: center;
        .btn {
          height: 48px;
          width: 100px;
          color: #fff;
          border-radius: 8px;
          font-size: 30px;
          text-align: center;
          line-height: 48px;
          cursor: pointer;
          font-family: "muyao";
          font-weight: 0;
          & + .btn {
            margin-left: 8px;
          }
        }
        .back {
          background: #ce52ff;
          text-shadow: 0 0 2px #fff;
          box-shadow: 0 0 10px #ce52ff;
        }
        .submit {
          background: #ff9d52;
          text-shadow: 0 0 2px #fff;
          box-shadow: 0 0 10px #ff9d52;
        }
      }
    }
  }
}
.bullet-screen-bq-list {
  display: flex;
  flex-wrap: wrap;
  img {
    width: 80px;
    height: 80px;
    padding: 5px;
    cursor: pointer;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
