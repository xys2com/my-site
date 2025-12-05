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
            baseFrequency="0.02"
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

        <filter id="conform">
          <!-- 噪声  -->
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            result="noise"
            numOctaves="10"
          />
          <!-- 噪声光照 -->
          <feDiffuseLighting
            in="noise"
            lighting-color="#f5f0e1"
            surfaceScale="1.5"
            result="paperTexture"
          >
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <!-- 混合纹理与文字-->
          <feDisplacementMap
            in="SourceGraphic"
            in2="paperTexture"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="texturedText"
          />
          <!-- 文本的透明度 -->
          <feColorMatrix
            in="texturedText"
            result="semiTransparentText"
            type="matrix"
            values="1 0 0 0 0 
                0 1 0 0 0 
                0 0 1 0 0 
                0 0 0 .7 0"
          />
          <feMerge>
            <feMergeNode in="semiTransparentText" />
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
