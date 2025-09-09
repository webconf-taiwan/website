<template>
  <div
    class="pointer-events-none absolute inset-0 duration-300"
    style="
      background:
        repeating-radial-gradient(
          circle,
          rgba(0, 0, 0, 0.25) 0,
          rgba(0, 0, 0, 0.25) 1px,
          transparent 1px,
          transparent 2px
        ),
        repeating-conic-gradient(
          rgba(0, 0, 0, 0.25) 0,
          rgba(0, 0, 0, 0.25) 1deg,
          transparent 1deg,
          transparent 2deg
        );
      background-size: 10px 10px;
      mix-blend-mode: soft-light;
    "
  ></div>
</template>
