
import Input from './Input.vue';
import Bool from './Bool.vue';
import InputAccount from './InputAccount.vue';
import Enum from './Enum.vue';
import Option from './Option.vue';
import InputBalance from './InputBalance.vue';
import InputNumber from './InputNumber.vue';
import InputBytes from './InputBytes.vue';
import InputHash from './InputHash.vue';
import { TypeDefInfo } from '@polkadot/types';
import { TypeDef } from '@polkadot/types/types';

export const renderSubComponent = (t:TypeDef) => {
    // if (type.info === TypeDefInfo.Compact) {
    //   return findComponent(registry, type.sub as TypeDef);
    // }
  
    if (t.info === TypeDefInfo.Enum) {
      return Enum;
    }
  
    if (t.info === TypeDefInfo.Option) {
        return Option;
    }
  
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
  
    switch (t.type) {
      case 'AccountId':
      case 'Address':
        return InputAccount;
  
      case 'Balance':
        return InputBalance;
  
      case 'Hash':
        return InputHash;
  
      case "Bytes":
        return InputBytes;
  
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