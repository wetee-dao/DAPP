<template>
  <ul>
    <li v-for="i in 4" :key="i" :style="{ background: '' + (i <= strength ? '' : 'rgba(0, 0, 0, 0.4)') + '' }">
    </li>
  </ul>
</template>
   
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  strength: {
    type: Number,
    default: 4,
    validator: function (value: number) {
      if (value > 4 || value < 0) {
        console.error(`ERROR in 'SignalStrength.vue':you must provide a number <=4 and >=0!`)
        return false
      } else {
        return true
      }
    }
  }
})

const strength = computed(() => {
  return props.strength
})

</script>
   
<style lang="scss" scoped>
ul {
  position: relative;
  width: 3.5em;
  height: 2em;
  font-size: 5px;
}

li {
  width: 0.5em;
  position: absolute;
  bottom: 0;
  border-radius: 1em;
  background: $primary-text;
}

ul li:nth-child(1) {
  height: 0.8em;
  left: 0px;
}

ul li:nth-child(2) {
  height: 1.2em;
  left: 1em;
}

ul li:nth-child(3) {
  height: 1.6em;
  left: 2em;
}

ul li:nth-child(4) {
  height: 2em;
  left: 3em;
}

// ul li:nth-child(5) {
//     height: 3em;
//     left: 4em;
// }

// ul li:nth-child(6) {
//     height: 3.5em;
//     left: 5em;
// }
</style>
   