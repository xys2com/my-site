import fs from "fs";
import path from "path";

export interface ImageWatcherOptions {
  watchDir?: string; // 监听的图片目录
  outputFile?: string; // 输出的ts文件路径
  watch?: boolean;
  filePattern?: RegExp; // 文件匹配模式
}

export default function imageWatcherPlugin(options: ImageWatcherOptions = {}) {
  const {
    watchDir = "./src/assets/meme/imgs",
    outputFile = "./src/assets/meme/index.ts",
    watch = true,
    filePattern = /\.(png|jpg|jpeg)$/i,
  } = options;

  let config;
  let isBuilding = false;

  // 生成索引文件的核心函数
  const generateIndexFile = async () => {
    if (isBuilding) return;
    isBuilding = true;

    try {
      if (!fs.existsSync(watchDir)) {
        fs.mkdirSync(watchDir, { recursive: true });
        return;
      }

      const files = fs.readdirSync(watchDir);
      const imageFiles = files.filter((file) => filePattern.test(file));

      // 按文件名排序确保一致性
      imageFiles.sort();

      let importStatements = "";
      const mappingEntries: string[] = [];

      imageFiles.forEach((file) => {
        const basename = path.basename(file, path.extname(file));
        // 生成合法的变量名（移除特殊字符）
        const varName = basename.replace(/[^a-zA-Z0-9_$]/g, "_");
        importStatements += `import ${varName} from "./imgs/${file}";\n`;
        mappingEntries.push(`  ${varName},`);
      });

      const fileContent = `// 该文件自动生成\n// 将png|jpg|jpeg图片放入imgs即可\n${importStatements}
const biaoqing: Record<string, string> = {
${mappingEntries.join("\n")}
};
export default biaoqing;
`;

      // 确保输出目录存在
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, fileContent, "utf-8");
      console.log(
        `✅ 表情索引文件已更新: ${outputFile} (${imageFiles.length}个图片)`
      );
    } catch (error) {
      console.error("❌ 生成索引文件失败:", error);
    } finally {
      isBuilding = false;
    }
  };

  return {
    name: "vite-plugin-meme-auto-export",

    // 配置解析完成后执行
    async configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    // 构建开始时的钩子
    async buildStart() {
      await generateIndexFile();
    },

    // 配置开发服务器
    configureServer(server) {
      if (watch) {
        // 监听图片目录变化
        server.watcher.add(watchDir);
        server.watcher.on("add", async (filePath) => {
          if (
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".jpeg")
          ) {
            if (filePattern.test(filePath)) {
              console.log(`📸 新增图片: ${path.basename(filePath)}`);
              generateIndexFile();
            }
            // 发送热更新信号
            server.ws.send({ type: "full-reload" });
          }
        });

        server.watcher.on("change", async (filePath) => {
          if (
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".jpeg")
          ) {
            console.log(`✏️ 图片更新: ${path.basename(filePath)}`);
            generateIndexFile();
            server.ws.send({ type: "full-reload" });
          }
        });

        server.watcher.on("unlink", async (filePath) => {
          if (
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".jpeg")
          ) {
            console.log(`🗑️ 删除图片: ${path.basename(filePath)}`);
            generateIndexFile();
            server.ws.send({ type: "full-reload" });
          }
        });
      }
    },

    // 构建结束钩子（生产环境）
    async buildEnd() {
      if (config.command === "build") {
        await generateIndexFile();
      }
    },
  };
}
