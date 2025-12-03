// 事件列
interface AnimationEvent {
  id?: string | number | null;
  name: string;
  args?: any[] | Record<string, any>;
  callback: (...args: any[]) => void;
}
// 注册配置
interface RegisterOptions {
  name: string;
  callback: (...args: any[]) => void;
  args?: any[] | Record<string, any>;
  id?: string | number | null;
}
// 注销配置
interface WriteOffOptions {
  name?: string;
  id?: string | number | null;
}
// 动画管理
class Animation {
  private stack: AnimationEvent[] = [];
  private animationId: number | null = null;
  private running: boolean = false;
  constructor() {
    this.run = this.run.bind(this);
  }

  // 注册动画事件
  $register(options: RegisterOptions): void {
    const { name, callback, args, id = null } = options;
    this.stack.push({
      id,
      name,
      args,
      callback,
    });
    this.$eventBegin();
  }

  // 注销动画
  $writeoff(options: string | number | WriteOffOptions): void {
    if (typeof options === "string" || typeof options === "number") {
      const index = this.stack.findIndex((e) => e.id === options);
      if (index !== -1) {
        this.stack.splice(index, 1);
      }
    } else {
      const { name, id = null } = options;
      const index = this.stack.findIndex((e) =>
        id ? e.id === id : e.name === name
      );
      if (index !== -1) {
        this.stack.splice(index, 1);
      }
    }

    if (!this.stack.length) {
      this.$eventEnd();
    }
  }

  // 运行动画
  private run(): void {
    if (!this.stack.length) {
      this.$eventEnd();
      return;
    }
    // 执行所有动画事件
    this.stack.forEach((event) => {
      try {
        if (Array.isArray(event.args)) {
          event.callback(...event.args);
        } else if (event.args) {
          event.callback(event.args);
        } else {
          event.callback();
        }
      } catch (error) {
        console.error(`执行动画事件 ${event.name} 时出错:`, error);
      }
    });
    // 继续动画循环
    if (this.running) {
      this.animationId = window.requestAnimationFrame(this.run);
    }
  }
  // 开始动画
  $eventBegin(): void {
    if (this.running) return;
    this.running = true;
    this.animationId = window.requestAnimationFrame(this.run);
  }
  // 结束动画
  $eventEnd(): void {
    if (!this.running) return;
    this.running = false;
    if (this.animationId !== null) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  // 获取队列
  getStatus(): { running: boolean; queueLength: number } {
    return {
      running: this.running,
      queueLength: this.stack.length,
    };
  }
  // 清空
  clear(): void {
    this.stack = [];
    this.$eventEnd();
  }
  // 根据名称查找
  findEventsByName(name: string): AnimationEvent[] {
    return this.stack.filter((event) => event.name === name);
  }
  // 根据id查找
  findEventById(id: string | number): AnimationEvent | undefined {
    return this.stack.find((event) => event.id === id);
  }
}
// 创建实例
const animationInstance = new Animation();
export default animationInstance;
