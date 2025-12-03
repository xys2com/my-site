// 原型对象方法拓展

const deepClone = (obj: any, hash = new WeakMap()) => {
  // 基本类型、函数
  if (obj === null || typeof obj !== "object") return obj;
  if (hash.has(obj)) return hash.get(obj);
  // 日期
  if (obj instanceof Date) return new Date(obj);
  // 正则
  if (obj instanceof RegExp) return new RegExp(obj);
  // 数组
  if (Array.isArray(obj)) {
    const cloneArr: any = [];
    hash.set(obj, cloneArr);
    obj.forEach((item, index) => {
      cloneArr[index] = deepClone(item, hash);
    });
    return cloneArr;
  }
  const cloneObj = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloneObj);
  const allProps = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ];
  for (const key of allProps) {
    cloneObj[key] = deepClone(obj[key], hash);
  }
  return cloneObj;
};

// 去重
// [1,2,1].deRepeat() => [1,2]

// [{k:1},{k:2},{k:1}].deRepeat('k') => [{k:1},{k:2}]

// left true保留最前面出现的，false保留最后出现的
// [{k:1,v:'x'},{k:2, v:'y'},{k:1,v:'s'}].deRepeat('k',true) => [{k:1,v:'x'},{k:2, v:'y'}]
// [{k:1,v:'x'},{k:2, v:'y'},{k:1,v:'s'}].deRepeat('k',false) => [{k:2, v:'y'},{k:1,v:'s'}]
Array.prototype.deRepeat = function <T>(
  this: T[],
  key: string | null = null,
  left: boolean = true
): T[] {
  if (key === null) {
    // 简单数组去重
    return [...Array.from(new Set(this))];
  } else {
    // 对象数组根据key去重
    const seen = new Set();
    if (left)
      return this.filter((item: any) => {
        const value: T = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    else
      return this.reduceRight((acc: T[], item: any) => {
        const value: T = item[key];
        if (!seen.has(value)) {
          seen.add(value);
          acc.unshift(item);
        }
        return acc;
      }, []);
  }
};
// 最后一个元素
// index： 倒数第几个元素 默认1
Array.prototype.lastItem = function (index = 1) {
  return this[this.length - index];
};
// 删除数组中某个值
Array.prototype.deleteVal = function (val, prop) {
  const i = this.findIndex((e) => (prop ? e[prop] == val : e == val));
  return this.splice(i, 1);
};
// 获得复杂数据中key值的value值
// [{key: 1, value: '11'},{key: 2, value:'22'}].getValue(2) => '22'
Array.prototype.getValue = function (key = "", kKey = "key", nKey = "value") {
  if (key === 0 || !!key) {
    const item = this.find((e) => e[kKey] == key);
    return item[nKey];
  } else return "-";
};

Object.defineProperty(Array.prototype, "deepClone", {
  value: function () {
    return deepClone(this);
  },
  enumerable: false,
  writable: true,
  configurable: true,
});
// 挂载到Object.prototype
Object.defineProperty(Object.prototype, "deepClone", {
  value: function () {
    return deepClone(this);
  },
  enumerable: false, // 不可枚举
  writable: true,
  configurable: true,
});

// 取后缀
// separator标识符
// retain 保留标识符
String.prototype.suffix = function (
  retain: boolean = true,
  separator: string = "."
): string {
  return this.slice(
    (this.length - this.lastIndexOf(separator) - (retain ? 0 : 1)) * -1
  );
};
