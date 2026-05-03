<template>
  <ul class="pop">
    <template v-for="(item, index) in chainNodes" :key="item.chainId">
      <li class="chain-block">
        <div class="chain-main flex" @click="selectNetwork(index)">
          <i v-if="curr == item.chainId" class="icon active">&#xe692;</i>
          <img :src="item.icon" alt="" />
          <span class="chain-name">{{ item.name }}</span>
          <div class="space"></div>
          <div class="ping">{{ ping[index] }} ms</div>
        </div>
        <ul
          v-if="item.rpcUrls && item.rpcUrls.length > 1"
          class="rpc-sub"
          @click.stop
        >
          <li
            v-for="(u, ui) in item.rpcUrls"
            :key="ui"
            class="rpc-item flex"
            :class="{ 'rpc-item--on': u === item.chainUrl }"
            @click="selectRpc(index, u)"
          >
            <span class="rpc-mark" v-if="u === item.chainUrl">●</span>
            <span v-else class="rpc-mark rpc-mark--off">○</span>
            <span class="rpc-text" :title="u">{{ shortRpcLabel(u) }}</span>
          </li>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import { chainNodes, rebindInkAfterChainSwitch, applyRpcUrlToNode } from '@/plugins/chain';
import { shortRpcLabel } from '@/utils/chain_rpc';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const curr = ref(store.state.chainId);
const ping = ref(store.state.setPins);
watch(() => store.state.setPins, (newVal) => {
  ping.value = newVal;
});
watch(() => store.state.chainId, (id) => {
  curr.value = id;
});

const selectNetwork = async (index: number) => {
  const node = chainNodes[index];
  if (!node) return;
  await store.dispatch('setChainId', node.chainId);
  rebindInkAfterChainSwitch();
};

const selectRpc = async (index: number, url: string) => {
  const node = chainNodes[index];
  if (!node) return;
  applyRpcUrlToNode(node, url);
  await store.dispatch('setChainId', node.chainId);
  rebindInkAfterChainSwitch();
};
</script>

<style lang="scss" scoped>
.pop {
  width: 100%;
  min-width: 280px;
  max-width: 420px;
  background-color: rgba($primary-bg-rgb, 1);
  cursor: default;
  font-size: 14px;
  border: 1px solid rgba($secondary-text-rgb, 0.15);
  list-style: none;
  margin: 0;
  padding: 0;
}

.chain-block {
  border-bottom: 1px solid rgba($secondary-text-rgb, 0.12);

  &:last-child {
    border-bottom: none;
  }
}

.chain-main {
  padding: 12px 16px 12px 28px;
  cursor: pointer;
  position: relative;
  align-items: center;

  &:hover {
    background-color: rgba($secondary-text-rgb, 0.06);
  }

  img {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 8px;
  }

  .active {
    font-size: 10px;
    color: $primary-text;
    transform: rotate(90deg);
    position: absolute;
    left: 10px;
    top: 50%;
    margin-top: -5px;
  }

  .chain-name {
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.rpc-sub {
  list-style: none;
  margin: 0;
  padding: 0 0 8px 0;
  background-color: rgba($secondary-text-rgb, 0.04);
  border-top: 1px solid rgba($secondary-text-rgb, 0.08);
}

.rpc-item {
  padding: 8px 14px 8px 36px;
  cursor: pointer;
  font-size: 12px;
  color: rgba($primary-text-rgb, 0.85);
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: rgba($secondary-text-rgb, 0.08);
  }

  &--on {
    color: $primary-text;
    background-color: rgba($secondary-text-rgb, 0.06);
  }
}

.rpc-mark {
  flex: 0 0 auto;
  font-size: 8px;
  line-height: 1;
  opacity: 0.9;

  &--off {
    opacity: 0.35;
  }
}

.rpc-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
}

.ping {
  flex: 0 0 auto;
  color: rgba($primary-text-rgb, 0.55);
  font-size: 11px;
}

.space {
  flex: 1;
}
</style>
