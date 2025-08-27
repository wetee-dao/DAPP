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
  height: 2em;
  font-size: 5px;
}

li {
  width: 0.3em;
  margin-left: 0.4em;
  bottom: 0;
  border-radius: 1em;
  background: rgba($primary-text-rgb, 1);
  display: inline-block;
}

ul li:nth-child(1) {
  height: 0.8em;
  margin-left: 0em;
}

ul li:nth-child(2) {
  height: 1.2em;
}

ul li:nth-child(3) {
  height: 1.6em;
}

ul li:nth-child(4) {
  height: 2em;
}

.pop {
  width: 100%;
  position: fixed;
  left: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.8);
  height: calc(100% - 75px);
  z-index: 99;
  top: 55px;
}
</style>
   