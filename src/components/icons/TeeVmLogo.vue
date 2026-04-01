<template>
  <svg
    class="teevm-logo"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g class="pins">
      <rect x="22" y="8" width="6" height="10" rx="2" />
      <rect x="44" y="8" width="8" height="10" rx="2" />
      <rect x="68" y="8" width="6" height="10" rx="2" />
      <rect x="78" y="22" width="10" height="6" rx="2" />
      <rect x="78" y="44" width="10" height="8" rx="2" />
      <rect x="78" y="68" width="10" height="6" rx="2" />
      <rect x="22" y="78" width="6" height="10" rx="2" />
      <rect x="44" y="78" width="8" height="10" rx="2" />
      <rect x="68" y="78" width="6" height="10" rx="2" />
      <rect x="8" y="22" width="10" height="6" rx="2" />
      <rect x="8" y="44" width="10" height="8" rx="2" />
      <rect x="8" y="68" width="10" height="6" rx="2" />
    </g>

    <rect class="chip-body" x="18" y="18" width="60" height="60" rx="14" />
    <rect class="chip-core" x="28" y="28" width="40" height="40" rx="10" />

    <path class="vm" d="M32 36H64V43H52V61H44V43H32V36Z" />
  </svg>
</template>

<style lang="scss" scoped>
.teevm-logo {
  display: block;
  width: 100%;
  height: 100%;

  .pins {
    fill: rgba($primary-text-rgb, 0.6);
  }

  .chip-body {
    fill: rgba($primary-text-rgb, 0.14);
    stroke: $primary-text;
    stroke-width: 4;
  }

  .chip-core {
    fill: rgba($primary-text-rgb, 0.04);
    stroke: rgba($primary-text-rgb, 0.88);
    stroke-width: 3;
  }

  .vm {
    fill: $primary-text;
  }
}
</style>
