import { vec3, mat4 } from "gl-matrix";
export const createCanvas = ({ width, height }) => {
  width = width || 500;
  height = height || 309;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  c.width = width;
  c.height = height;
  return {
    canvas: c,
    context: ctx,
  };
};

export const asyncLoadImage = (src) => {
  return new Promise((resp, rej) => {
    try {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        resp(img);
      };
    } catch (error) {
      rej(error);
    }
  });
};
// 随机值
export const random = function (n, r?) {
  // eslint-disable-next-line
  if ((arguments.length < 2 && ((r = n), (n = 0)), n > r)) {
    var a = r;
    (r = n), (n = a);
  }
  return Math.floor(Math.random() * (r - n + 1)) + n;
};
// 节流
export const throttle = (cb, gap) => {
  let timer;
  return function () {
    let _this = this;
    let args = arguments;
    if (!timer)
      timer = setTimeout(function () {
        timer = null;
        cb.apply(_this, args);
      }, gap);
  };
};
// 是否dom
export const isDOM = (item) => {
  return typeof HTMLElement === "function"
    ? item instanceof HTMLElement
    : item &&
        typeof item === "object" &&
        item.nodeType === 1 &&
        typeof item.nodeName === "string";
};
// 节点查找
export const $ = (e) => {
  const els = document.querySelectorAll(e);
  return els.length === 1 ? els[0] : els;
};

/**
 * 对点进行相对原点的变换
 * @param point 原始点坐标 [x, y, z]
 * @param origin 相对原点 [ox, oy, oz]
 * @param scale 缩放系数
 * @param rotation 旋转弧度 [rx, ry, rz] (绕X/Y/Z轴)
 * @returns 变换后的新坐标
 */
export const transformRelative = (point, origin, scale, rotation) => {
  // 创建变换矩阵
  const matrix = mat4.create();
  // 平移至相对原点坐标系
  mat4.translate(matrix, matrix, [-origin[0], -origin[1], -origin[2]]);
  // 缩放
  mat4.scale(matrix, matrix, [scale, scale, scale]);
  // 旋转（按X/Y/Z轴顺序）
  mat4.rotateX(matrix, matrix, rotation[0]);
  mat4.rotateY(matrix, matrix, rotation[1]);
  mat4.rotateZ(matrix, matrix, rotation[2]);
  // 平移回原坐标系
  mat4.translate(matrix, matrix, origin);

  // 变换点坐标
  const result = vec3.create();
  vec3.transformMat4(result, point, matrix);

  return result;
};
/**
 * 计算两条线之间的夹角（弧度）
 * @param line1 线段1的起点和终点 [{x1, y1}, {x2, y2}]
 * @param line2 线段2的起点和终点 [{x3, y3}, {x4, y4}]
 * @param fullAngle 是否返回 完整角度（0-180度）返回锐角（0-90度）
 * @returns 角度值
 */
export const getAngleBetweenLines = (line1, line2, fullAngle = true) => {
  // 计算两条线的方向向量
  const vec1 = [line1[1].x - line1[0].x, line1[1].y - line1[0].y];
  const vec2 = [line2[1].x - line2[0].x, line2[1].y - line2[0].y];

  // 计算向量点积和叉积模长
  const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  const crossProduct = vec1[0] * vec2[1] - vec1[1] * vec2[0];

  // 计算弧度
  const angle = Math.atan2(Math.abs(crossProduct), dotProduct);

  // 返回角度
  return (
    ((fullAngle ? angle : Math.min(angle, Math.PI - angle)) * 180) / Math.PI
  );
};

// copy
export const copy = (val: string) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(val)
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(() => {
        return Promise.reject(false);
      });
  } else {
    const textarea = document.createElement("textarea");
    textarea.readOnly = true;
    textarea.style.position = "absolute";
    textarea.style.top = "0px";
    textarea.style.left = "-9999px";
    textarea.style.zIndex = "-9999";
    textarea.value = val;
    document.body.appendChild(textarea);
    if ((textarea as any).createTextRange) {
      textarea.select();
    } else {
      textarea.setSelectionRange(0, val.length);
      textarea.focus();
    }
    const result = document.execCommand("Copy");
    document.body.removeChild(textarea);
    if (result) {
      return Promise.resolve(true);
    } else {
      return Promise.reject(false);
    }
  }
};
