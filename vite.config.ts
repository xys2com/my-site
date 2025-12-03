import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import viteCompression from "vite-plugin-compression";
import svgAutoGenPlugin from "./vite-plugins/vite-plugin-svg-autogen";
import memeAutoExport from "./vite-plugins/vite-plugin-meme-auto-export";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgAutoGenPlugin(),
    memeAutoExport(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts", // 生成类型声明文件
    }),
    // 自动导入组件
    Components({
      resolvers: [
        ElementPlusResolver(), // Element Plus按需导入
      ],
      dts: "src/components.d.ts", // 组件类型声明位置
    }),
    viteCompression({
      algorithm: "gzip", // 或 'brotliCompress'
      ext: ".gz",
      threshold: 10240, // 对大于10KB的文件压缩
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/app.scss" as *;`, // 全局SCSS变量
      },
    },
  },
  server: {
    open: true,
    port: 9527,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 确保指向 src 目录
    },
  },
  build: {
    outDir: "dist", // 打包输出目录
    assetsDir: "assets", // 静态资源目录
    sourcemap: false, // 生产环境关闭sourcemap
    minify: "esbuild", // 代码压缩工具
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true, // 移除debugger
      },
    },
  },
});
