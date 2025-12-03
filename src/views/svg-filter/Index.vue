<!--
  * @description:
  * @Author: xuyushu
  * @Date: 2025-12-03 13:56:47
  * @LastEditors: xuyushu
-->
<template>
  <div class="svg-filter-wrap">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="squiggly-0">
          <feTurbulence
            id="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="0"
          />
          <feDisplacementMap
            id="displacement"
            in="SourceGraphic"
            in2="noise"
            scale="3"
          />
        </filter>
        <filter id="squiggly-1">
          <feTurbulence
            id="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="1"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>

        <filter id="squiggly-2">
          <feTurbulence
            id="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="2"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
        <filter id="squiggly-3">
          <feTurbulence
            id="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="3"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
        <filter id="squiggly-4">
          <feTurbulence
            id="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="4"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>

        <filter id="roughpaper" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            result="noise"
            numOctaves="10"
          />

          <feDiffuseLighting
            in="noise"
            lighting-color="#f5f0e1"
            surfaceScale="1.5"
          >
            <feDistantLight azimuth="45" elevation="30" />
          </feDiffuseLighting>
        </filter>

        <filter id="roughpaper-text" width="100%" height="100%">
          <!-- 步骤1: 生成纸张的噪声纹理 -->
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            result="noise"
            numOctaves="10"
          />

          <!-- 步骤2: 使用纹理对文字进行轻微位移，模拟墨水渗透的毛边效果 -->
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacedText"
          />

          <!-- 步骤3: 应用柔和的光照，赋予文字与纸张一致的明暗质感 -->
          <feDiffuseLighting
            in="noise"
            lighting-color="#efefef"
            surfaceScale="1.2"
            result="lighting"
          >
            <feDistantLight azimuth="45" elevation="30" />
          </feDiffuseLighting>

          <!-- 步骤4: 将光照纹理与位移后的文字进行混合 -->
          <feComposite
            in="lighting"
            in2="displacedText"
            operator="in"
            result="litText"
          />

          <!-- 步骤5: 将处理后的文字与原始图形合并，确保颜色和清晰度 -->
          <feMerge>
            <feMergeNode in="litText" />
            <!-- 带有纸张质感的文字 -->
            <feMergeNode in="SourceGraphic" />
            <!-- 原始清晰的文字 -->
          </feMerge>
        </filter>

        <filter id="conform" x="-50%" y="-50%" width="200%" height="200%">
          <feImage
            xlink:href="roughpaper"
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          ></feImage>

          <feColorMatrix
            type="saturate"
            values="0"
            result="IMAGE"
          ></feColorMatrix>

          <feGaussianBlur
            in="IMAGE"
            stdDeviation="0.25"
            result="MAP"
          ></feGaussianBlur>
          <feDisplacementMap
            in="SourceGraphic"
            in2="MAP"
            scale="15"
            xChannelSelector="R"
            yChannelSelector="R"
            result="TEXTURED_TEXT"
          ></feDisplacementMap>
          <feMerge>
            <feMergeNode in="BG"></feMergeNode>
            <feMergeNode in="BLENDED_TEXT"></feMergeNode>
          </feMerge>
        </filter>

        <filter id="conformv2" x="-50%" y="-50%" width="200%" height="200%">
          <!-- 粗糙纹理  -->
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".01"
            numOctaves="7"
            result="noise"
          />
          <!-- 为噪声添加光照，增强立体感 -->
          <feDiffuseLighting
            in="noise"
            lighting-color="#efefef"
            surfaceScale=".85"
            result="paperTexture"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <!-- 使用纸张纹理扭曲源文本-->
          <feDisplacementMap
            in="SourceGraphic"
            in2="paperTexture"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="texturedText"
          />
          <!-- 调整扭曲后文本的透明度，为混合做准备 -->
          <feColorMatrix
            in="texturedText"
            result="semiTransparentText"
            type="matrix"
            values="1 0 0 0 0 
                0 1 0 0 0 
                0 0 1 0 0 
                0 0 0 0.9 0"
          />
          <!-- 模拟纸张底色 -->
          <!-- <feFlood flood-color="transparent" result="paperBase" /> -->
          <!-- 将带有纹理的文字与纸张底色混合 -->
          <feBlend
            in="paperBase"
            in2="semiTransparentText"
            mode="multiply"
            result="blendedText"
          />
          <!-- 最终合并，确保文字显示在纸张之上 -->
          <feMerge>
            <!-- <feMergeNode in="paperBase" /> -->
            <!-- 底层：纸张 -->
            <feMergeNode in="blendedText" />
            <!-- 上层：带有纸张纹理的文字 -->
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="scss">
@keyframes squiggly-anim {
  0% {
    -webkit-filter: url("#squiggly-0");
    filter: url("#squiggly-0");
  }
  25% {
    -webkit-filter: url("#squiggly-1");
    filter: url("#squiggly-1");
  }
  50% {
    -webkit-filter: url("#squiggly-2");
    filter: url("#squiggly-2");
  }
  75% {
    -webkit-filter: url("#squiggly-3");
    filter: url("#squiggly-3");
  }
  100% {
    -webkit-filter: url("#squiggly-4");
    filter: url("#squiggly-4");
  }
}
.svg-filter-wrap {
  width: 0;
  height: 0;
  svg {
    width: 0;
    height: 0;
  }
}
</style>
