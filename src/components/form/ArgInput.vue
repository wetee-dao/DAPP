<template>
  <component 
    v-if="cname != null" 
    :is="cname" :arg="props.arg" 
    :value="value"
    @input="emit('input', $event)"
  />
</template>

<script setup lang="ts">
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { AbiMessageParam } from '@polkadot/api-contract/types';
import { onMounted, ref, shallowRef, watch } from 'vue';
import Input from './Input.vue';
import Bool from './Bool.vue';
// import { AddressSelect } from './account/Select';
// import { Enum } from './Enum';
// import { InputBalance } from './InputBalance';
import InputNumber from './InputNumber.vue';
// import { InputBytes } from './InputBytes';
// import { InputHash } from './InputHash';
// import { Option } from './Option';
// import { Struct } from './Struct';
// import { SubForm } from './SubForm';
// import { Tuple } from './Tuple';
// import { Vector } from './Vector';
// import { VectorFixed } from './VectorFixed';
const props = defineProps(["arg","value"])
const emit = defineEmits(['input'])

const arg:AbiMessageParam = props.arg
const type: TypeDef = arg.type
const cname = shallowRef<any>(null)
const value = ref<any>(props.value)

watch(() => props.value, (val) => {
  value.value = val
})

onMounted(() => {
  cname.value = renderSubComponent()
})

const renderSubComponent = () => {
  // if (type.info === TypeDefInfo.Compact) {
  //   return findComponent(registry, type.sub as TypeDef);
  // }

  // if (type.info === TypeDefInfo.Enum) {
  //   const components = subComponents(registry, type, nestingNumber);

  //   return (props: React.PropsWithChildren<ArgComponentProps<Record<string, unknown>>>) => (
  //     <Enum components={components} {...props} typeDef={type} />
  //   );
  // }

  // if (type.info === TypeDefInfo.Option) {
  //   const [component] = subComponents(registry, type, nestingNumber);

  //   return (props: React.PropsWithChildren<ArgComponentProps<unknown>>) => {
  //     return <Option component={component} {...props} typeDef={type} />;
  //   };
  // }

  // if (type.info === TypeDefInfo.Si) {
  //   return findComponent(
  //     registry,
  //     registry.lookup.getTypeDef(type.type as `Lookup${number}`),
  //     nestingNumber,
  //   );
  // }

  // if (type.info === TypeDefInfo.Struct) {
  //   const components = subComponents(registry, type, nestingNumber + 1);

  //   return (props: ArgComponentProps<Record<string, unknown>>) => {
  //     return (
  //       <SubForm nestingNumber={nestingNumber}>
  //         <Struct components={components} {...props} />
  //       </SubForm>
  //     );
  //   };
  // }

  // if (type.info === TypeDefInfo.Tuple) {
  //   const components = subComponents(registry, type, nestingNumber + 1);

  //   return (props: ArgComponentProps<unknown[]>) => {
  //     return (
  //       <SubForm nestingNumber={nestingNumber}>
  //         <Tuple components={components} {...props} />
  //       </SubForm>
  //     );
  //   };
  // }

  // if (type.info === TypeDefInfo.Vec) {
  //   const [component] = subComponents(registry, type, nestingNumber + 1);

  //   return (props: ArgComponentProps<unknown[]>) => {
  //     return (
  //       <SubForm nestingNumber={nestingNumber}>
  //         <Vector component={component} {...props} />
  //       </SubForm>
  //     );
  //   };
  // }

  // if (type.info === TypeDefInfo.VecFixed) {
  //   if (type.sub && !Array.isArray(type.sub)) {
  //     switch (type.sub.type) {
  //       case 'u8':
  //         return (props: ArgComponentProps<Uint8Array>) => {
  //           if (!type.length) throw new Error('Fixed Vector has no length');
  //           return <InputBytes {...props} length={type.length * 2} />; // 2 hex chars per byte
  //         };
  //       default:
  //         break;
  //     }
  //   }

  //   const [component] = subComponents(registry, type, nestingNumber + 1);

  //   return (props: React.PropsWithChildren<ArgComponentProps<unknown[]>>) => (
  //     <SubForm nestingNumber={nestingNumber}>
  //       <VectorFixed component={component} {...props} />
  //     </SubForm>
  //   );
  // }

  switch (type.type) {
    // case 'AccountId':
    // case 'Address':
    //   return AddressSelect;

    // case 'Balance':
    //   return InputBalance;

    // case 'Hash':
    //   return InputHash;

    case 'bool':
      return Bool;

    case 'u8':
    case 'i8':
    case 'i32':
    case 'u32':
    case 'i64':
    case 'i128':
    case 'u64':
    case 'u128':
    case 'BN':
      return InputNumber;

    default:
      return Input;
  }
};



function onChange(e: any): void {

}

function onFocus(e: any): void {

}
</script>
