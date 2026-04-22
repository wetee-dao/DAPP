<template>
  <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M256 192h512c70.692 0 128 57.308 128 128v384c0 70.692-57.308 128-128 128H256c-70.692 0-128-57.308-128-128V320c0-70.692 57.308-128 128-128zm64 128c-35.346 0-64 28.654-64 64v256c0 35.346 28.654 64 64 64h384c35.346 0 64-28.654 64-64V384c0-35.346-28.654-64-64-64H320z"
      fill-opacity=".55"
    />
    <path
      d="M384 448l128 96-128 96V448zm192 128h192v64H576v-64z"
    />
  </svg>
</template>

<style lang="scss" scoped>
.icon {
  width: 100%;
  height: 100%;

  path {
    fill: rgba(var(--g-primary-text-rgb), 1);
  }
}
</style>
