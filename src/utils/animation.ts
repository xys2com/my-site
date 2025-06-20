class Animation {
  stack: any[] = null; // 事件栈列
  anm: null | any = null; // 动画id
  running: boolean = false; // 是否运行
  constructor() {
    this.stack = [];
  }
}
// 注册
function $register(options) {
  const {
    name,
    callback,
    args,
    id = null,
  }: {
    name: string;
    callback: Function;
    args: Array<any> | Object;
    id: string | number | null;
  } = options;
  this.stack.push({
    id,
    name,
    args,
    callback,
  });
  this.$eventBegin();
}
// 注销
function $writeoff(options: any) {
  if (typeof options == "string" || typeof options == "number") {
    const index = this.stack.findIndex((e) => e.id == options);
    this.stack.splice(index, 1);
    if (!this.stack.length) this.eventEnd();
    return;
  }
  const {
    name,
    id = null,
  }: {
    name: string;
    id: string | number | null;
  } = options;
  const index = this.stack.findIndex((e) => (id ? e.id == id : e.name == name));
  this.stack.splice(index, 1);
}
// 运行
function $run() {
  if (!this.stack.length) return;
  this.stack.forEach((evt) => {
    evt.callback(evt.args);
  });
  if (this.running) window.requestAnimationFrame(this.$run.bind(this));
}
// 开始运行
function $eventBegin() {
  if (this.running) return;
  this.running = true;
  this.anm = window.requestAnimationFrame(this.$run.bind(this));
}
// 结束运行
function $eventEnd() {
  if (!this.running) return;
  this.running = false;
  window.cancelAnimationFrame(this.anm);
  this.anm = null;
}

interface Animation {
  $register(options: Object): void;
  $writeoff(options: Object): void;
  $eventBegin(): void;
  $eventEnd(): void;
  $run(): void;
}
Animation.prototype.$register = $register;
Animation.prototype.$writeoff = $writeoff;
Animation.prototype.$run = $run;
Animation.prototype.$eventBegin = $eventBegin;
Animation.prototype.$eventEnd = $eventEnd;
export default new Animation();
