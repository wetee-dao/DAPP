<template>
  <svg
    class="teeclaw-logo"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g class="claw claw-left">
      <path d="M42 27C28 22 16 28 12 40C9 49 13 59 22 64L31 58C24 54 22 48 24 42C27 36 33 34 41 37L47 39L50 31L42 27Z" />
      <path d="M32 47C22 50 16 57 17 66C18 75 26 82 38 83L45 76C37 75 32 71 30 65C29 60 32 55 39 53L48 50L46 42L32 47Z" />
    </g>

    <g class="claw claw-right">
      <path d="M54 27C68 22 80 28 84 40C87 49 83 59 74 64L65 58C72 54 74 48 72 42C69 36 63 34 55 37L49 39L46 31L54 27Z" />
      <path d="M64 47C74 50 80 57 79 66C78 75 70 82 58 83L51 76C59 75 64 71 66 65C67 60 64 55 57 53L48 50L50 42L64 47Z" />
    </g>

    <path class="body" d="M48 30C44 30 41 33 40 37L37 48L40 59C41 63 44 66 48 66C52 66 55 63 56 59L59 48L56 37C55 33 52 30 48 30Z" />
    <path class="spine" d="M48 36V60" />
    <path class="bar" d="M43 43C46 45 50 45 53 43" />
    <path class="bar" d="M42 51C46 53 50 53 54 51" />
  </svg>
</template>

<style lang="scss" scoped>
.teeclaw-logo {
  display: block;
  width: 100%;
  height: 100%;

  .claw {
    fill: rgba($primary-text-rgb, 0.16);
    stroke: $primary-text;
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .body {
    fill: rgba($primary-text-rgb, 0.06);
    stroke: $primary-text;
    stroke-width: 4;
    stroke-linejoin: round;
  }

  .spine,
  .bar {
    stroke: $primary-text;
    stroke-width: 4;
    stroke-linecap: round;
    fill: none;
  }
}
</style>
