import { throttle } from "@/utils/tools";
// 页面缩放事件薄
interface Item {
  id: string;
  fun: Function;
  params: Object;
}
class Resize {
  list: Array<Item>;
  observer: any;
  constructor() {
    this.list = [];
    this.observer = new ResizeObserver((entries) => {
      this.throttleFun();
    });
    const targetElement = document.body;
    if (targetElement) this.observer.observe(targetElement);
  }
  push(args: Item) {
    const { id, fun, params } = args;
    this.list.push({ id, fun, params });
  }
  pop(id: string) {
    const index = this.list.findIndex((e) => e.id == id);
    this.list.splice(index, 1);
  }
}
const throttleFun = throttle(function (this: any) {
  this.list.forEach((item: Item) => {
    item.fun(item.params);
  });
}, 150);
interface Resize {
  throttleFun(): void;
}
Resize.prototype.throttleFun = throttleFun;
export default new Resize();
