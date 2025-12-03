export const Danmu = [
  [
    "前方高能预警",
    "哈哈哈",
    "2333",
    "awsl",
    "妙啊",
    "泪目",
    "梦开始的地方",
    "名场面",
    "打卡",
    "完结撒花",
  ],
  [
    "？？？",
    "原来如此",
    "盲生，你发现了华点",
    "预言家",
    "刀片警告",
    "这是我免费能看的吗",
    "进度条撑住啊",
    "高能预警",
  ],
  [
    "经费在燃烧",
    "作画良心",
    "神仙UP主",
    "你币有了",
    "梦幻联动",
    "经典永不过时",
    "你管这叫新手？",
    "不愧是你",
  ],
  [
    "空降成功",
    "空难现场",
    "多谢指挥部",
    "从XX:XX空降",
    "暂停成功",
    "字幕君辛苦了",
    "这个我有高清版",
  ],
  [
    "今日无事，勾栏听曲",
    "接XX气运",
    "大佬666",
    "主播求翻牌",
    "这个反转我服",
    "主角快跑",
    "作者你没有心",
  ],
];
import animation from "@/utils/animation";
import biaoqing from "@/assets/meme";

// 常量配置
const BULLET_SCREEN_CONFIG = {
  MIN_FONT_SIZE: 16, // 字体
  MAX_FONT_SIZE: 48, //
  MIN_DURATION: 15, // 持续时间
  MAX_DURATION: 30, //
  FREEZE_MIN: 3000, // 冻结时间
  FREEZE_MAX: 5000,
  HSL_SATURATION: "70%", // 饱和度
  HSL_LIGHTNESS: "50%", // 明度
  FPS: 60, // 帧率
} as const;

// 点位
interface Point {
  x: number;
  y: number;
}
// item
export interface BulletItem {
  id: string;
  formatText: string;
  text: string;
  fontSize: number;
  width: number;
  dom: HTMLElement;
  position: Point;
  duration: number;
  totalFrames: number;
  currentFrame: number;
  type: BulletType;
  status: BulletStatus;
  speed: number;
}

enum BulletType {
  SCROLL = 0, // 滚动弹幕
  FLOATING = 1, // 悬浮弹幕 (没做)
}
// 弹幕状态
enum BulletStatus {
  PENDING = 0, // 等待
  ACTIVE = 1, // 滚动中
  FROZEN = 2, // 已执行完
}
// 发送配置项
interface SendOptions {
  content: string;
  type?: BulletType;
  duration?: number;
  fontSize?: number;
  color?: string;
}

// DOM 工具
const DOMUtils = {
  isHTMLElement(element: unknown): element is HTMLElement {
    return typeof HTMLElement === "function"
      ? element instanceof HTMLElement
      : Boolean(
          element &&
            typeof element === "object" &&
            (element as any).nodeType === 1
        );
  },

  queryElement(selector: string | HTMLElement): HTMLElement | null {
    if (typeof selector === "string") {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      return elements.length === 1 ? elements[0] : null;
    }
    return selector;
  },

  createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    className?: string
  ): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  },
};

// 工具
export const Utils = {
  // 区间随机值
  random(min: number, max?: number): number {
    let actualMin: number;
    let actualMax: number;

    if (max === undefined) {
      actualMin = 0;
      actualMax = min;
    } else {
      actualMin = min;
      actualMax = max;
    }

    if (actualMin > actualMax) [actualMin, actualMax] = [actualMax, actualMin];
    return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
  },
  // 随机id
  generateId(): string {
    return `bullet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  // 取边界值
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },
};

export class BulletScreen {
  private items: Map<string, BulletItem> = new Map();
  private container: HTMLElement;
  private viewHeight: number = 0;
  private viewWidth: number = 0;
  private animationRegistered: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: string | HTMLElement) {
    const element = DOMUtils.queryElement(container);
    if (!element) throw new Error("Invalid container element");

    element.style.overflowX = "hidden";
    this.container = element;
    this.updateViewport();
    this.setupResizeObserver();
    this.registerAnimation();
  }

  // 发送弹幕
  $send(content: string | SendOptions, id: string): string {
    const options: SendOptions =
      typeof content === "string" ? { content } : content;
    const $id = id ? id : Utils.generateId();

    const item = this.createBulletItem($id, {
      content: options.content,
      type: options.type ?? BulletType.SCROLL,
      duration: options.duration,
      fontSize: options.fontSize,
      color: options.color,
    });

    this.container.appendChild(item.dom);
    this.items.set($id, item);
    return $id;
  }

  // 移除弹幕
  $remove(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    if (item.dom.parentNode === this.container) {
      this.container.removeChild(item.dom);
    }

    return this.items.delete(id);
  }
  // 获取一条弹幕
  $getItem(id: string): BulletItem | undefined {
    return this.items.get(id);
  }

  // 清空弹幕
  $clear(): void {
    this.items.forEach((item) => {
      if (item.dom.parentNode === this.container) {
        this.container.removeChild(item.dom);
      }
    });
    this.items.clear();
  }

  // 获取弹幕数量
  $getCount(): number {
    return this.items.size;
  }

  // 更新视口尺寸
  private updateViewport(): void {
    this.viewHeight = this.container.offsetHeight;
    this.viewWidth = this.container.offsetWidth;
  }

  // 设置视口变化监听
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateViewport();
    });

    this.resizeObserver.observe(this.container);
  }

  // 解析文本
  private matchText(
    content: string,
    clampedFontSize: number
  ): { formatText: string; content: string } {
    let formatText = content;
    if (/#(.*?)#/.test(content)) {
      let matchs = content.match(/#(.*?)#/g);
      let imgSize = clampedFontSize * 1.5;
      matchs.forEach((m) => {
        let img = biaoqing[m.replace(/#/g, "")];
        formatText = formatText.replace(
          m,
          `<img src="${img}" style="height:${imgSize}px;width:${imgSize}px;"/>`
        );
      });
    }
    return { formatText, content };
  }

  // 创建弹幕项
  private createBulletItem(
    id: string,
    options: Omit<SendOptions, "type"> & { type: BulletType }
  ): BulletItem {
    const {
      type = BulletType.SCROLL,
      duration = Utils.random(
        BULLET_SCREEN_CONFIG.MIN_DURATION,
        BULLET_SCREEN_CONFIG.MAX_DURATION
      ),
      fontSize = Utils.random(
        BULLET_SCREEN_CONFIG.MIN_FONT_SIZE,
        BULLET_SCREEN_CONFIG.MAX_FONT_SIZE
      ),
      color = `hsl(${Utils.random(360)}, ${
        BULLET_SCREEN_CONFIG.HSL_SATURATION
      }, ${BULLET_SCREEN_CONFIG.HSL_LIGHTNESS})`,
    } = options;
    let { content } = options;
    const clampedFontSize = Utils.clamp(
      fontSize,
      BULLET_SCREEN_CONFIG.MIN_FONT_SIZE,
      BULLET_SCREEN_CONFIG.MAX_FONT_SIZE
    );
    let width = clampedFontSize * content.replace(/#(.*?)#/g, "").length;

    const dom = DOMUtils.createElement("div", "bullet-item");
    Object.assign(dom.style, {
      position: "absolute",
      left: `${this.viewWidth}px`,
      top: `${Utils.random(this.viewHeight / 2)}px`,
      fontSize: `${clampedFontSize}px`,
      width: `${width}px`,
      color: color,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      willChange: "transform",
      // transition: "transform 0.1s linear"
    });
    // dom.textContent = content;
    // <img src=''/>
    let match = this.matchText(content, clampedFontSize);
    dom.innerHTML = match.formatText;

    return {
      id,
      formatText: match.formatText,
      text: content,
      fontSize: clampedFontSize,
      width,
      dom,
      position: { x: this.viewWidth, y: 0 },
      duration,
      totalFrames: duration * BULLET_SCREEN_CONFIG.FPS,
      currentFrame: 0,
      type,
      status: BulletStatus.PENDING,
      speed: (this.viewWidth + width) / (duration * BULLET_SCREEN_CONFIG.FPS),
    };
  }

  // 更新弹幕位置
  private updateBulletPosition(item: BulletItem): void {
    if (item.status === BulletStatus.FROZEN) return;

    if (item.currentFrame >= item.totalFrames) {
      this.freezeBullet(item);
      return;
    }

    if (item.currentFrame === 0) {
      item.status = BulletStatus.ACTIVE;
    }

    const translateX = -item.currentFrame * item.speed;
    item.dom.style.transform = `translateX(${translateX}px)`;
    item.currentFrame++;
  }

  // 冻结弹幕
  private freezeBullet(item: BulletItem): void {
    item.status = BulletStatus.FROZEN;
    item.dom.style.transition = "none";
    const freezeTime = Utils.random(
      BULLET_SCREEN_CONFIG.FREEZE_MIN,
      BULLET_SCREEN_CONFIG.FREEZE_MAX
    );

    setTimeout(() => {
      if (this.items.has(item.id)) {
        this.resetBullet(item);
      }
    }, freezeTime);
  }

  // 重置弹幕
  private resetBullet(item: BulletItem): void {
    item.currentFrame = 0;
    item.status = BulletStatus.PENDING;

    // 重置位置和样式
    const newFontSize = Utils.random(
      BULLET_SCREEN_CONFIG.MIN_FONT_SIZE,
      BULLET_SCREEN_CONFIG.MAX_FONT_SIZE
    );
    const newColor = `hsl(${Utils.random(360)}, ${
      BULLET_SCREEN_CONFIG.HSL_SATURATION
    }, ${BULLET_SCREEN_CONFIG.HSL_LIGHTNESS})`;
    const newY = Utils.random(this.viewHeight / 2);

    Object.assign(item.dom.style, {
      left: `${this.viewWidth}px`,
      top: `${newY}px`,
      fontSize: `${newFontSize}px`,
      color: newColor,
      transform: "translateX(0px)",
    });

    let content = item.text;
    let match = this.matchText(content, newFontSize);
    let width = newFontSize * content.replace(/#(.*?)#/, "").length;
    // let img = "";
    // if (match.img) {
    //   let imgSize = newFontSize * 1.5;
    //   width += imgSize;
    //   img = `<img src="${match.img}" style="height:${imgSize}px;width:${imgSize}px;"/>`;
    //   // content = match.content;
    // }
    item.width = width;
    item.dom.innerHTML = match.formatText; //`${img}${match.content}`;
    item.text = content;
    item.fontSize = newFontSize;
    item.position.y = newY;
    item.duration = Utils.random(
      BULLET_SCREEN_CONFIG.MIN_DURATION,
      BULLET_SCREEN_CONFIG.MAX_DURATION
    );
    item.totalFrames = item.duration * BULLET_SCREEN_CONFIG.FPS;
    item.speed = (this.viewWidth + item.width) / item.totalFrames;
  }

  // 注册动画循环
  private registerAnimation(): void {
    if (this.animationRegistered) return;

    animation.$register({
      name: "bullet-screen-update",
      id: "bullet-screen",
      callback: () => {
        if (this.items.size === 0) return;

        this.items.forEach((item) => {
          this.updateBulletPosition(item);
        });
      },
    });

    this.animationRegistered = true;
  }

  // 销毁实例
  $destroy(): void {
    this.$clear();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    animation.$writeoff({ id: "bullet-screen" });
    this.animationRegistered = false;
  }
}
