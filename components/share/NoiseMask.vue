<template>
  <div
    class="pointer-events-none absolute inset-0 mix-blend-multiply duration-300"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style="filter: grayscale(0)"
      class="size-full"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.5"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>

      <rect
        width="100%"
        height="100%"
        filter="url(#noiseFilter)"
      />
    </svg>
  </div>
</template>
