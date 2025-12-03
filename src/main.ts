import "@/utils/updateTypes/index";
import { createApp } from "vue";
import "./style.css";
import router from "./router";
import App from "./App.vue";
import ElementPlus from "element-plus";
import Svg from "@/components/SvgComps/Index.vue";
import "element-plus/dist/index.css";

createApp(App).use(router).component("Svg", Svg).use(ElementPlus).mount("#app");
