import {
  random,
  createCanvas,
  transformRelative,
  throttle,
  $,
  isDOM,
} from "@/utils/tools";

interface Poi {
  x: number;
  y: number;
}
interface Item {
  radius: number; // 半径
  imgType: number; // 图片类型
  t: number; // 0 - 1的曲线进度值
  vt: number; // 用于累计t的步进值
  nextFrame: number; // 下一帧
  frame: number; // 总帧数
  pathIndex: number; // 路径数量
  alpha: number; // 0 - 1的透明度
  flashV: number; // 闪烁速度 正负值
  paths: number[][]; // 路径 二维数组
  symbol: number; //  闪烁衰减/闪烁增加   1 | -1
}
const getId = () => `${Math.random().toString(32).slice(-8)}`;
// let interval = null;
const fireflyImg = function (type) {
  // #8cd629 绿色；#fff62b 黄色
  const color = type ? "#fff62b" : "#8cd629";
  const radius = 10;
  let x = radius,
    y = radius;

  const width = radius * 2,
    height = radius * 2;
  const { canvas, context } = createCanvas({ width, height });
  let grd = context.createRadialGradient(
    radius,
    radius,
    0,
    radius,
    radius,
    radius
  );
  grd.addColorStop(0.0, "#fff");
  grd.addColorStop(0.2, "#fff");
  grd.addColorStop(0.3, `${color}`);
  grd.addColorStop(0.5, `${color}cc`);
  grd.addColorStop(0.6, `${color}aa`);
  grd.addColorStop(0.7, `${color}88`);
  grd.addColorStop(0.8, `${color}66`);
  grd.addColorStop(1, "transparent");
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = grd;
  context.fill();
  return canvas;
};

// 获取圆内随机点位
const getCircleRandomPoint = (cx, cy, r) => {
  // 随机角度
  const angle = Math.random() * Math.PI * 2;
  // 极坐标
  const radius = r * Math.sqrt(Math.random());
  // 转换到直角坐标
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);
  return { x, y };
};
class Firefly {
  context: null | CanvasRenderingContext2D = null; // 上下文canvas画笔
  canvas: null | HTMLCanvasElement = null; // canvas画布
  creating: boolean = false; // 是否处于创建中
  fireflies: Item[] = []; // 每个firefly对象
  fireflyImg: Object[] = []; // 两种萤火虫 一种黄绿色 一种绿黄色
  maxPoi: Poi = { x: 0, y: 0 }; // 最大位置限制
  startPoi: Poi = { x: 0, y: 0 }; // 最初的位置
  count: number = 0; // 萤火虫数量
  pathRandom: boolean = true; // 是否随机路径 false 使用递增路径
  speed: number = 1; // 整体速度
  createSpeed: number = 5; // 创建速度
  fittingPath: Poi[]; // 自动生成
  followMouse: boolean = false; // 是否跟随鼠标添加点位
  itemSpeed: number = 1; // 飞行速度
  mousedownSpeedRatio: number = 10; // 鼠标按下时的速度变化比
  mouseDownSign: boolean = false; // 鼠标按下标识
  mousePoi: Poi = { x: 0, y: 0 }; // 鼠标位置 在mouseMove 事件中更新
  randomPaths: Poi[][] = []; // 路径群
  randomPathItv: number = 0; // 定时器
  constructor(options) {
    const {
      el,
      count = 50,
      ex = 2000,
      ey = 100,
      sx,
      sy,
      success,
      pathRandom = true,
      speed = 1,
      createSpeed = 5,
      followMouse = false,
      mousedownSpeedRatio = 10,
    }: {
      el: string | HTMLElement;
      count: number;
      ex: number;
      ey: number;
      sx: number;
      sy: number;
      pathRandom: boolean;
      speed: number;
      createSpeed: number;
      followMouse: boolean;
      mousedownSpeedRatio: number;
      success: Function;
    } = options;
    this.startPoi = {
      x: sx,
      y: sy,
    };
    this.maxPoi = {
      x: ex,
      y: ey,
    };
    this.mousePoi = {
      x: ex / 2,
      y: ey / 2,
    };
    this.mousedownSpeedRatio = mousedownSpeedRatio;
    this.followMouse = followMouse;
    this.pathRandom = pathRandom;
    this.speed = speed || 1;
    this.createSpeed = createSpeed || 5;
    this.count = count;
    this.mouseDownSign = false;
    let element = isDOM(options.el) ? el : $(el);
    const { canvas, context } = createCanvas({
      width: ex,
      height: ey,
    });
    this.canvas = canvas;
    this.context = context;
    element.appendChild(canvas);
    this.init();
    if (typeof success === "function") success();
  }
}
const setRandomPath = function () {
  this.randomPaths = [];
  const pathNum = random(1, 4); // 1 - 5条路径
  for (let i = 0; i < pathNum; i++) {
    let path = this.createPathRandom(random(4, 6)); // 产生4 - 8个点位
    this.randomPaths.push(path);
  }
};
const init = function () {
  const img0 = fireflyImg(0);
  const img1 = fireflyImg(1);
  this.fireflyImg.push(img0, img1);
  // this.fittingPath = this.createPathRandom(6); // 生成拟合路径6个点位
  this.setRandomPath();
  this.randomPathItv = setInterval(() => {
    this.setRandomPath();
  }, 1e3 * 5);
  this.mouseMove = throttle(($event) => {
    this.updatePoi($event);
  }, 50);
  if (this.followMouse)
    this.canvas.addEventListener("mousemove", this.mouseMove);
  if (this.followMouse) {
    this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
  }
  this.increasedFirefly(this.count);
};

// 更新鼠标点位
const updatePoi = function ($event) {
  const poi = {
    x: $event.clientX,
    y: $event.clientY,
  };
  this.mousePoi = poi;
};

// 鼠标点下
const mouseDown = function () {
  this.mouseDownSign = true;
  this.setFirefliesVt(this.mousedownSpeedRatio);
  this.setRandomPath();
  clearInterval(this.randomPathItv);
  this.randomPathItv = null;
  // this.fittingPath = this.createPathRandom(6); // 生成拟合路径6个点位
};
// 鼠标释放
const mouseUp = function () {
  this.mouseDownSign = false;
  this.setFirefliesVt(1);
  this.setRandomPath();
  this.randomPathItv = setInterval(() => {
    this.setRandomPath();
  }, 1e3 * 10);
};
// 设置运动速率
const setFirefliesVt = function (speed: number = 1) {
  this.itemSpeed = speed;
};

// 创造一个随机点位
const createRandomPoint = function () {
  const maxx = this.maxPoi.x;
  const maxy = this.maxPoi.y;
  return {
    x: random(0, maxx),
    y: random(0, maxy),
  };
};

// 向单个item path 中添加一个点位
const addPointToPath = function (item) {
  const point = this.createRandomPoint();
  item.paths.push(point);
};

// 随机产生点位路径
const createPathRandom = function (dotNum: number = 20) {
  let nowi = 0;
  let paths: Poi[] = [];
  let fourPois = [
    {
      x: 0,
      y: 0,
    },
    {
      x: this.maxPoi.x,
      y: 0,
    },
    {
      x: this.maxPoi.x,
      y: this.maxPoi.y,
    },
    {
      x: 0,
      y: this.maxPoi.y,
    },
  ];
  paths.push(fourPois[random(0, 3)]);
  while (nowi < dotNum) {
    const poi = this.createRandomPoint();
    paths.push(poi);
    nowi++;
  }
  return paths;
};

// 递增到最大值产生路径
const createPathIncreasing = function () {
  let nowx: number = this.startPoi.x;
  let paths: Poi[] = [];
  paths.push(this.startPoi);
  const maxx: number = this.maxPoi.x;
  const stepx: number = maxx / 20;
  const miny = 5;
  const maxy: number = this.maxPoi.y;
  while (nowx < maxx) {
    let x: number = random(nowx, nowx + stepx);
    let y: number = random(miny, maxy);
    nowx = x;
    paths.push({ x, y });
    // 一定几率打转
    let spin = random(0, 100) < 20;
    if (spin) {
      const preItem: Poi = paths.lastItem(1);
      // preItem.y >= y 斜率正比  =>  /
      // preItem.y < y 斜率反比   =>  \
      const positive = preItem.y > y;
      let x1 = random(x - stepx, x);
      let y1 = !positive ? random(preItem.y, maxy) : random(miny, preItem.y);

      let x2 = random(x - 2 * stepx, x);
      let y2 = y + random(-10, 10);

      let x3 = random(x - stepx, x);
      let y3 = positive ? random(preItem.y, maxy) : random(miny, preItem.y);

      let x4 = x + random(-20, 20);
      let y4 = y + random(-20, 20);

      paths.push(
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
        { x: x4, y: y4 }
      );
      nowx = x4;
    }
  }
  return paths;
};

//
const createFirefly = function (useCopy: boolean = false, index: number) {
  // index 越小 t与 copy path的偏差越大
  let copyIndex = random(0, 2);
  const copyItem = this.fireflies[copyIndex];
  const radius = random(10, 30) / 10;
  const imgType = random(0, 1);
  const frame = useCopy
    ? copyItem.frame + random(-120, 120)
    : random(256, 1024) / this.speed; // 帧数
  const vt = 1 / frame; // 速度变化率 = 1 除以帧数（312.5 - 625）；每一段路径所用帧数暂定相同

  const nextFrame = useCopy ? vt * random(5, 20) * this.itemSpeed : 0;
  const t = nextFrame * vt;
  const pathIndex = 0; // 节点路径数量
  const alpha = random(2, 10) / 10; // 初始透明度
  const flashV = random(2, 6) / 500; // 闪烁速度

  const offset = random(100, 400);
  //
  const paths = !useCopy
    ? this.pathRandom
      ? this.createPathRandom(6) // 生成拟合路径
      : this.createPathIncreasing() // 总路径
    : copyItem.paths.map((e) => {
        return {
          x: e.x + random(-offset, offset) / 10,
          y: e.y + random(-offset, offset) / 10,
        };
      });
  const item = {
    radius,
    imgType,
    t,
    vt,
    nextFrame,
    frame,
    pathIndex,
    alpha,
    flashV,
    paths,
    onActive: false,
    symbol: -1,
  };
  this.fireflies.push(item);
};

// 添加萤火虫
const increasedFirefly = function (count: number) {
  if (this.creating) return;
  let index = 0;
  this.creating = true;
  const itv = setInterval(() => {
    const useCopy = random(0, 100) > 5 && this.fireflies.length > 3;
    if (index < count) {
      index++;
      this.createFirefly(useCopy, index);
      // if (useCopy) this.createFirefly(true);
    } else {
      clearInterval(itv);
      this.creating = false;
    }
  }, 1e3 / this.createSpeed);
};

// catmull rom 插值计算
function catmullRom(p0, p1, p2, p3, t) {
  // 参数t ∈ [0, 1]，在p1和p2之间插值
  const v0 = (p2.x - p0.x) * 0.5,
    v1 = (p3.x - p1.x) * 0.5;
  const v2 = (p2.y - p0.y) * 0.5,
    v3 = (p3.y - p1.y) * 0.5;

  const t2 = t * t;
  const t3 = t * t2;
  return {
    x:
      (2 * p1.x - 2 * p2.x + v0 + v1) * t3 +
      (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 +
      v0 * t +
      p1.x,
    y:
      (2 * p1.y - 2 * p2.y + v2 + v3) * t3 +
      (-3 * p1.y + 3 * p2.y - 2 * v2 - v3) * t2 +
      v2 * t +
      p1.y,
  };
}

// 计算每一帧路径
const flyPath = function (item, index) {
  let {
    paths,
    frame,
    nextFrame,
    vt,
    pathIndex,
    t,
    radius,
    imgType,
    alpha,
    flashV,
    symbol,
  } = item;
  const p0 = pathIndex === 0 ? paths[0] : paths[pathIndex - 1];
  const p1 = paths[pathIndex];
  const p2 = paths[pathIndex + 1];
  const p3 =
    pathIndex === paths.length - 2
      ? paths[paths.length - 1]
      : paths[pathIndex + 2];

  const { x: nx, y: ny } = catmullRom(p0, p1, p2, p3, t);

  const ctx = this.context;
  ctx.save();
  ctx.beginPath();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    this.fireflyImg[imgType],
    nx - radius,
    ny - radius,
    radius * 2,
    radius * 2
  );
  ctx.restore();
  t += vt * this.itemSpeed;
  alpha += flashV * symbol;
  nextFrame += 1 * this.itemSpeed;
  if (alpha > 1) {
    alpha = 1;
    symbol = -1;
  }
  if (alpha < 0.2) {
    alpha = 0.2;
    symbol = 1;
  }

  // 帧数走完
  if (nextFrame >= frame || t >= 1) {
    pathIndex++;
    t = 0;
    nextFrame = 0;
    if (!this.mouseDownSign) {
      // 如果路径只剩下3个点位
      if (pathIndex >= paths.length - 4) {
        // this.addPointToPath(item);
        const path = this.randomPaths[index % this.randomPaths.length].map(
          (e) => getCircleRandomPoint(e.x, e.y, random(-50, 50))
        );
        paths.push(...path);
      }
    } else {
      // 切掉当前下标以后的点位
      paths.splice(pathIndex + 1, paths.length - 1);
      // 放入两个后置点位
      const x = this.mousePoi.x;
      const y = this.mousePoi.y;
      paths.push(getCircleRandomPoint(x, y, random(-50, 50)));
      paths.push(getCircleRandomPoint(x, y, random(-50, 50)));
    }
    // 如果路径已经走完两个点位
    if (pathIndex >= 3) {
      item.paths.shift();
      pathIndex--;
    }
  }
  item.t = t;
  item.alpha = alpha;
  item.nextFrame = nextFrame;
  item.pathIndex = pathIndex;
  item.symbol = symbol;
  item.alpha = alpha;
};

const fly = function () {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // const ctx = this.context;
  // ctx.save();
  // let grd = ctx.createLinearGradient(0, 0, 1, this.maxPoi.y);
  // grd.addColorStop(0, "#04042633");
  // grd.addColorStop(1, "#061b5e33");
  // ctx.fillStyle = grd;
  // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  // ctx.restore();
  this.fireflies.forEach((item, index) => {
    this.flyPath(item, index);
  });
};

interface Firefly {
  init(): void;
  mouseDown(event: HTMLElementEventMap): void;
  mouseUp(event: HTMLElementEventMap): void;
  increasedFirefly(count: number): void;
  createPathRandom(dotNum: number): Poi[];
  setRandomPath(): void;
  createPathIncreasing(): void;
  createRandomPoint(): void;
  setFirefliesVt(): void;
  addPointToPath(item: Item): void;
  mouseMove(event: HTMLElementEventMap): void;
  updatePoi(event: HTMLElementEventMap): void;
  flying(): void;
  createFirefly(useCopy: boolean, index: number): void;
  flyPath(item: Item, index: number): void;
}

Firefly.prototype.init = init;
Firefly.prototype.mouseDown = mouseDown;
Firefly.prototype.mouseUp = mouseUp;
Firefly.prototype.updatePoi = updatePoi;
Firefly.prototype.setFirefliesVt = setFirefliesVt;
Firefly.prototype.addPointToPath = addPointToPath;
Firefly.prototype.createRandomPoint = createRandomPoint;
Firefly.prototype.increasedFirefly = increasedFirefly;
Firefly.prototype.setRandomPath = setRandomPath;
Firefly.prototype.createPathRandom = createPathRandom;
Firefly.prototype.createPathIncreasing = createPathIncreasing;
Firefly.prototype.createFirefly = createFirefly;
Firefly.prototype.flying = fly;
Firefly.prototype.flyPath = flyPath;
export default Firefly;
