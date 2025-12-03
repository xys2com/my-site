import { random, createCanvas, throttle, $, isDOM } from "@/utils/tools";

// 定义核心接口
interface Point {
  x: number;
  y: number;
}

interface FireflyConfig {
  el: string | HTMLElement;
  count?: number;
  ex?: number;
  ey?: number;
  sx?: number;
  sy?: number;
  pathRandom?: boolean;
  speed?: number;
  createSpeed?: number;
  followMouse?: boolean;
  mousedownSpeedRatio?: number;
  success?: () => void;
}

interface FireflyItem {
  radius: number;
  imgType: number;
  t: number;
  vt: number;
  nextFrame: number;
  frame: number;
  pathIndex: number;
  alpha: number;
  flashV: number;
  paths: Point[];
  symbol: -1 | 1;
}

// 萤火虫动画类
class FireflyAnimation {
  private context: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private creating: boolean = false;
  private fireflies: FireflyItem[] = [];
  private fireflyImages: HTMLCanvasElement[] = [];
  private maxPoint: Point = { x: 0, y: 0 };
  private startPoint: Point = { x: 0, y: 0 };
  private count: number;
  private pathRandom: boolean;
  private speed: number;
  private createSpeed: number;
  private followMouse: boolean;
  private itemSpeed: number = 1;
  private mousedownSpeedRatio: number;
  private mouseDownSign: boolean = false;
  private mousePoint: Point = { x: 0, y: 0 };
  private randomPaths: Point[][] = [];
  private randomPathInterval: number | null = null;
  private animationFrameId: number | null = null;
  private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;

  constructor(config: FireflyConfig) {
    const {
      el,
      count = 50,
      ex = 2000,
      ey = 1000,
      sx = 0,
      sy = 0,
      pathRandom = true,
      speed = 1,
      createSpeed = 5,
      followMouse = false,
      mousedownSpeedRatio = 10,
      success,
    } = config;

    this.startPoint = { x: sx, y: sy };
    this.maxPoint = { x: ex, y: ey };
    this.mousePoint = { x: ex / 2, y: ey / 2 };
    this.mousedownSpeedRatio = mousedownSpeedRatio;
    this.followMouse = followMouse;
    this.pathRandom = pathRandom;
    this.speed = speed;
    this.createSpeed = createSpeed;
    this.count = count;

    this.initializeCanvas(el);
    this.init();

    if (typeof success === "function") {
      success();
    }
  }

  private initializeCanvas(el: string | HTMLElement): void {
    const element = isDOM(el) ? el : $(el);

    if (!element) {
      throw new Error("Canvas container element not found");
    }

    const { canvas, context } = createCanvas({
      width: this.maxPoint.x,
      height: this.maxPoint.y,
    });

    if (!canvas || !context) {
      throw new Error("Failed to create canvas");
    }

    this.canvas = canvas;
    this.context = context;
    element.appendChild(canvas);
  }

  private init(): void {
    this.createFireflyImages();
    this.setRandomPaths();
    this.setupEventListeners();
    this.increasedFirefly(this.count);
    this.startAnimation();
  }

  private createFireflyImages(): void {
    const img0 = this.createFireflyImage(0);
    const img1 = this.createFireflyImage(1);
    this.fireflyImages.push(img0, img1);
  }

  private createFireflyImage(type: number): HTMLCanvasElement {
    const color = type === 1 ? "#fff62b" : "#8cd629";
    const radius = 10;
    const width = radius * 2;
    const height = radius * 2;

    const { canvas, context } = createCanvas({ width, height });

    if (!canvas || !context) {
      throw new Error("Failed to create firefly image canvas");
    }

    const gradient = context.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius
    );
    gradient.addColorStop(0.0, "#fff");
    gradient.addColorStop(0.2, "#fff");
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(0.5, `${color}cc`);
    gradient.addColorStop(0.6, `${color}aa`);
    gradient.addColorStop(0.7, `${color}88`);
    gradient.addColorStop(0.8, `${color}66`);
    gradient.addColorStop(1, "transparent");

    context.arc(radius, radius, radius, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();

    return canvas;
  }

  private setRandomPaths(): void {
    this.randomPaths = [];
    const pathNum = random(1, 4);

    for (let i = 0; i < pathNum; i++) {
      const path = this.createRandomPath(random(4, 6));
      this.randomPaths.push(path);
    }

    // 设置定时更新路径
    if (this.randomPathInterval) {
      clearInterval(this.randomPathInterval);
    }

    this.randomPathInterval = window.setInterval(() => {
      this.setRandomPaths();
    }, 5000);
  }

  private setupEventListeners(): void {
    this.mouseMoveHandler = throttle((event: MouseEvent) => {
      this.updateMousePoint(event);
    }, 50);

    if (this.followMouse && this.canvas) {
      this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
      this.canvas.addEventListener(
        "mousedown",
        this.handleMouseDown.bind(this)
      );
      this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
      this.canvas.addEventListener("mouseleave", this.handleMouseUp.bind(this));
    }
  }

  private updateMousePoint(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.mousePoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private handleMouseDown(): void {
    this.mouseDownSign = true;
    this.setFirefliesSpeed(this.mousedownSpeedRatio);
    this.setRandomPaths();

    if (this.randomPathInterval) {
      clearInterval(this.randomPathInterval);
      this.randomPathInterval = null;
    }
  }

  private handleMouseUp(): void {
    this.mouseDownSign = false;
    this.setFirefliesSpeed(1);
    this.setRandomPaths();

    this.randomPathInterval = window.setInterval(() => {
      this.setRandomPaths();
    }, 10000);
  }

  private setFirefliesSpeed(speed: number = 1): void {
    this.itemSpeed = speed;
  }

  private getCircleRandomPoint(cx: number, cy: number, r: number): Point {
    const angle = Math.random() * Math.PI * 2;
    const radius = r * Math.sqrt(Math.random());

    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  private createRandomPoint(): Point {
    return {
      x: random(0, this.maxPoint.x),
      y: random(0, this.maxPoint.y),
    };
  }

  private createRandomPath(dotNum: number = 6): Point[] {
    const cornerPoints: Point[] = [
      { x: 0, y: 0 },
      { x: this.maxPoint.x, y: 0 },
      { x: this.maxPoint.x, y: this.maxPoint.y },
      { x: 0, y: this.maxPoint.y },
    ];

    const path: Point[] = [cornerPoints[random(0, 3)]];

    for (let i = 0; i < dotNum; i++) {
      path.push(this.createRandomPoint());
    }

    return path;
  }

  private createIncreasingPath(): Point[] {
    const path: Point[] = [this.startPoint];
    let currentX = this.startPoint.x;
    const stepX = this.maxPoint.x / 20;

    while (currentX < this.maxPoint.x) {
      const x = random(currentX, currentX + stepX);
      const y = random(5, this.maxPoint.y);
      currentX = x;
      path.push({ x, y });

      // 添加随机旋转路径
      if (random(0, 100) < 20) {
        const lastPoint = path[path.length - 1];
        const positive = lastPoint.y > y;

        // 创建旋转控制点
        const controlPoints = [
          {
            x: random(x - stepX, x),
            y: positive
              ? random(lastPoint.y, this.maxPoint.y)
              : random(5, lastPoint.y),
          },
          { x: random(x - 2 * stepX, x), y: y + random(-10, 10) },
          {
            x: random(x - stepX, x),
            y: positive
              ? random(5, lastPoint.y)
              : random(lastPoint.y, this.maxPoint.y),
          },
          { x: x + random(-20, 20), y: y + random(-20, 20) },
        ];

        path.push(...controlPoints);
        currentX = controlPoints[3].x;
      }
    }

    return path;
  }

  private createFirefly(useCopy: boolean = false, index: number): void {
    if (useCopy && this.fireflies.length < 3) {
      this.createFirefly(false, index);
      return;
    }

    let baseItem: FireflyItem | null = null;
    if (useCopy) {
      const copyIndex = random(0, Math.min(2, this.fireflies.length - 1));
      baseItem = this.fireflies[copyIndex];
    }

    const radius = random(10, 30) / 10;
    const imgType = random(0, 1);
    const frame = baseItem
      ? baseItem.frame + random(-120, 120)
      : random(256, 1024) / this.speed;

    const vt = 1 / frame;
    const nextFrame = useCopy ? vt * random(5, 20) * this.itemSpeed : 0;
    const t = nextFrame * vt;
    const alpha = random(2, 10) / 10;
    const flashV = random(2, 6) / 500;

    let paths: Point[];
    if (useCopy && baseItem) {
      const offset = 100;
      paths = baseItem.paths.map((point) => ({
        x: point.x + random(-offset, offset) / 10,
        y: point.y + random(-offset, offset) / 10,
      }));
    } else {
      paths = this.pathRandom
        ? this.createRandomPath(6)
        : this.createIncreasingPath();
    }

    const newItem: FireflyItem = {
      radius,
      imgType,
      t,
      vt,
      nextFrame,
      frame,
      pathIndex: 0,
      alpha,
      flashV,
      paths,
      symbol: -1,
    };

    this.fireflies.push(newItem);
  }

  private increasedFirefly(count: number): void {
    if (this.creating) return;

    this.creating = true;
    let index = 0;

    const interval = setInterval(() => {
      if (index < count) {
        const useCopy = random(0, 100) > 10 && this.fireflies.length > 3;
        this.createFirefly(useCopy, index);
        index++;
      } else {
        clearInterval(interval);
        this.creating = false;
      }
    }, 1000 / this.createSpeed);
  }

  private catmullRomInterpolate(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    t: number
  ): Point {
    const v0 = { x: (p2.x - p0.x) * 0.5, y: (p2.y - p0.y) * 0.5 };
    const v1 = { x: (p3.x - p1.x) * 0.5, y: (p3.y - p1.y) * 0.5 };

    const t2 = t * t;
    const t3 = t * t2;

    return {
      x:
        (2 * p1.x - 2 * p2.x + v0.x + v1.x) * t3 +
        (-3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x) * t2 +
        v0.x * t +
        p1.x,
      y:
        (2 * p1.y - 2 * p2.y + v0.y + v1.y) * t3 +
        (-3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y) * t2 +
        v0.y * t +
        p1.y,
    };
  }

  private updateFireflyPath(item: FireflyItem, index: number): void {
    const { paths, pathIndex, t } = item;

    if (pathIndex >= paths.length - 3) {
      return;
    }

    const p0 = pathIndex === 0 ? paths[0] : paths[pathIndex - 1];
    const p1 = paths[pathIndex];
    const p2 = paths[pathIndex + 1];
    const p3 =
      pathIndex >= paths.length - 2
        ? paths[paths.length - 1]
        : paths[pathIndex + 2];

    const newPosition = this.catmullRomInterpolate(p0, p1, p2, p3, t);

    // 绘制萤火虫
    if (this.context && this.fireflyImages[item.imgType]) {
      this.context.save();
      this.context.globalAlpha = item.alpha;
      this.context.drawImage(
        this.fireflyImages[item.imgType],
        newPosition.x - item.radius,
        newPosition.y - item.radius,
        item.radius * 2,
        item.radius * 2
      );
      this.context.restore();
    }

    // 更新状态
    item.t += item.vt * this.itemSpeed;
    item.alpha += item.flashV * item.symbol;
    item.nextFrame += this.itemSpeed;

    // 处理透明度闪烁
    if (item.alpha > 1) {
      item.alpha = 1;
      item.symbol = -1;
    } else if (item.alpha < 0.2) {
      item.alpha = 0.2;
      item.symbol = 1;
    }

    // 处理路径段完成
    if (item.nextFrame >= item.frame || item.t >= 1) {
      this.advanceToNextPathSegment(item, index);
    }
  }

  private advanceToNextPathSegment(item: FireflyItem, index: number): void {
    item.pathIndex++;
    item.t = 0;
    item.nextFrame = 0;

    if (!this.mouseDownSign) {
      if (item.pathIndex >= item.paths.length - 3) {
        this.extendPathWithRandomPoints(item, index);
      }
    } else {
      this.extendPathTowardMouse(item);
    }

    // 清理已完成的路径点
    if (item.pathIndex >= 3) {
      item.paths.shift();
      item.pathIndex--;
    }
  }

  private extendPathWithRandomPoints(item: FireflyItem, index: number): void {
    const randomPath = this.randomPaths[index % this.randomPaths.length];
    if (randomPath) {
      const newPoints = randomPath.map((point) =>
        this.getCircleRandomPoint(point.x, point.y, random(-50, 50))
      );
      item.paths.push(...newPoints);
    }
  }

  private extendPathTowardMouse(item: FireflyItem): void {
    // 移除后续路径点
    item.paths.splice(item.pathIndex + 1);

    // 添加朝向鼠标的新路径点
    for (let i = 0; i < 2; i++) {
      const newPoint = this.getCircleRandomPoint(
        this.mousePoint.x,
        this.mousePoint.y,
        random(-50, 100)
      );
      item.paths.push(newPoint);
    }
  }

  public animate = (): void => {
    if (!this.context || !this.canvas) return;

    // 清空画布
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新所有萤火虫
    this.fireflies.forEach((item, index) => {
      this.updateFireflyPath(item, index);
    });

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private startAnimation(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  // 公共方法
  public setSpeed(speed: number): void {
    this.speed = Math.max(0.1, speed);
  }

  public setCount(count: number): void {
    const difference = count - this.fireflies.length;
    if (difference > 0) {
      this.increasedFirefly(difference);
    } else if (difference < 0) {
      this.fireflies.splice(count, -difference);
    }
  }

  public destroy(): void {
    // 清理动画循环
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 清理定时器
    if (this.randomPathInterval) {
      clearInterval(this.randomPathInterval);
      this.randomPathInterval = null;
    }

    // 移除事件监听器
    if (this.canvas && this.mouseMoveHandler) {
      this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
      this.canvas.removeEventListener("mousedown", this.handleMouseDown);
      this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    }

    // 清理画布
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.fireflies = [];
    this.fireflyImages = [];
  }

  public getFireflyCount(): number {
    return this.fireflies.length;
  }

  public isRunning(): boolean {
    return this.animationFrameId !== null;
  }
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

export default FireflyAnimation;
