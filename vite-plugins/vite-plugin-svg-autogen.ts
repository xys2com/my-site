import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

interface Options {
  svgDir?: string;
  outputFile?: string;
  watch?: boolean;
  cleanDistSvg?: boolean;
}

/**
 * SVG自动生成插件
 * @param {Object} options 配置选项
 * @param {string} options.svgDir SVG文件目录，如 './src/assets/svgs'
 * @param {string} options.outputFile 输出文件路径，如 './src/assets/svg-data.ts'
 * @param {boolean} options.watch 是否监听文件变化
 * @param {boolean} options.cleanDistSvg 是否清空dist svg文件
 */
export default function svgAutoGenPlugin(options: Options = {}) {
  const {
    svgDir = "./src/assets/svgs",
    outputFile = "./src/assets/simple-svg-data.ts",
    watch = true,
    cleanDistSvg = true,
  } = options;

  let config;
  let isBuilding = false;

  // 提取SVG文件名的核心部分作为name
  function getSvgName(filePath) {
    const baseName = path.basename(filePath, path.extname(filePath));
    // 将文件名转换为驼峰命名，如 "arrow-left" -> "arrowL"
    return baseName
      .toLowerCase()
      .replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());
  }

  // 清理和优化SVG内容
  function processSvgContent(content, fileName) {
    // 移除XML声明、注释等无关内容
    let cleaned = content
      .replace(/<\?xml[^>]*>\s*/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    // 提取viewBox（如果存在）
    const viewBoxMatch = cleaned.match(/viewBox=["']([^"']+)["']/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

    // 替换固定尺寸为动态占位符
    cleaned = cleaned
      .replace(/width="[^"]*"/, 'width="{width}"')
      .replace(/height="[^"]*"/, 'height="{height}"')
      .replace(/fill="[^"]*"/g, 'fill="{color}"')
      .replace(/stroke="[^"]*"/g, 'stroke="{line}"');

    return cleaned;
  }
  // 生产环境清除svg文件
  async function cleanSvgSourceFiles() {
    if (!cleanDistSvg) return;

    try {
      const files = await glob(`${svgDir}/**/*.svg`);
      let deletedCount = 0;

      for (const filePath of files) {
        try {
          await fs.unlink(filePath); // 删除SVG文件
          deletedCount++;
          console.log(
            `🗑️ 已删除原SVG文件: ${path.relative(process.cwd(), filePath)}`
          );
        } catch (error) {
          console.warn(`⚠️ 删除文件失败 ${filePath}:`, error.message);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ 生产构建清理完成，共删除 ${deletedCount} 个原SVG文件`);
      }
    } catch (error) {
      console.error("❌ 清理SVG文件过程中出错:", error);
    }
  }
  // 读取目录下的所有SVG文件
  async function readSvgFiles() {
    try {
      const files = await glob(`${svgDir}/**/*.svg`);
      const svgData = [];

      for (const filePath of files) {
        try {
          const content = await fs.readFile(filePath, "utf-8");
          const fileName = getSvgName(filePath);

          svgData.push({
            name: fileName,
            template: processSvgContent(content, fileName),
            formatted: true,
          });

          // console.log(`✅ 处理SVG: ${fileName} -> ${filePath}`);
        } catch (error) {
          console.error(`❌ 读取SVG文件失败 ${filePath}:`, error);
        }
      }

      return svgData;
    } catch (error) {
      console.error("❌ 扫描SVG目录失败:", error);
      return [];
    }
  }

  // 生成输出文件
  async function generateOutputFile(svgData) {
    try {
      const outputDir = path.dirname(outputFile);

      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });

      const tsContent = `// 自动生成的SVG数据 - 请勿手动修改\n// 将svg图片放入svgs即可\nexport default ${JSON.stringify(
        svgData,
        null,
        2
      )};`;

      await fs.writeFile(outputFile, tsContent, "utf-8");
      console.log(
        `✅ SVG数据已生成: ${outputFile} (共${svgData.length}个图标)`
      );
    } catch (error) {
      console.error("❌ 生成输出文件失败:", error);
    }
  }

  // 主生成函数
  async function generateSvgData() {
    if (isBuilding) return;

    isBuilding = true;
    try {
      const svgData = await readSvgFiles();
      await generateOutputFile(svgData);
    } finally {
      isBuilding = false;
    }
  }
  // 新增：清理dist目录中的SVG文件
  async function cleanDistSvgFiles() {
    if (!cleanDistSvg) return;

    try {
      // 等待构建完成，确保dist目录已生成
      setTimeout(async () => {
        try {
          const distDir = path.resolve(process.cwd(), "dist");
          const svgFiles = await glob(`${distDir}/**/*.svg`);

          let deletedCount = 0;
          for (const filePath of svgFiles) {
            try {
              await fs.unlink(filePath);
              deletedCount++;
              console.log(
                `🗑️ 已清理dist中的SVG文件: ${path.relative(distDir, filePath)}`
              );
            } catch (error) {
              console.warn(`⚠️ 删除dist文件失败 ${filePath}:`, error.message);
            }
          }

          if (deletedCount > 0) {
            console.log(
              `✅ 生产构建清理完成，共删除 ${deletedCount} 个dist中的SVG文件`
            );
          }
        } catch (error) {
          console.error("❌ 清理dist目录失败:", error);
        }
      }, 1000); // 延迟1秒确保构建完成
    } catch (error) {
      console.error("❌ 清理SVG文件过程中出错:", error);
    }
  }

  return {
    name: "vite-plugin-svg-autogen",

    // 配置解析完成后执行
    async configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    // 构建开始时的钩子
    async buildStart() {
      await generateSvgData();
    },

    // 配置开发服务器
    configureServer(server) {
      if (watch) {
        // 监听SVG目录变化
        server.watcher.add(svgDir);
        server.watcher.on("add", async (filePath) => {
          if (filePath.endsWith(".svg")) {
            console.log(`🔄 检测到新增SVG文件: ${filePath}`);
            await generateSvgData();
            // 发送热更新信号
            server.ws.send({ type: "full-reload" });
          }
        });

        server.watcher.on("change", async (filePath) => {
          if (filePath.endsWith(".svg")) {
            console.log(`🔄 检测到SVG文件修改: ${filePath}`);
            await generateSvgData();
            server.ws.send({ type: "full-reload" });
          }
        });

        server.watcher.on("unlink", async (filePath) => {
          if (filePath.endsWith(".svg")) {
            console.log(`🗑️ 检测到SVG文件删除: ${filePath}`);
            await generateSvgData();
            server.ws.send({ type: "full-reload" });
          }
        });
      }
    },

    // 构建结束钩子（生产环境）
    async buildEnd() {
      if (config.command === "build") {
        await generateSvgData();
      }
      // 仅在生产构建且启用清理功能时执行
      if (config.command === "build" && cleanDistSvg) {
        // await cleanSvgSourceFiles(); // 清除本地源文件
        // await cleanDistSvgFiles(); // 清除dist svg文件
      }
    },
  };
}
