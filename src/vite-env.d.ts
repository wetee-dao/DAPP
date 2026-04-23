/// <reference types="vite/client" />

declare module "virtual:svg-icons-register" {
  const register: unknown;
  export default register;
}

declare module "vuex" {
  export const createStore: any;
  export const useStore: any;
}

declare module "@talismn/connect-wallets" {
  export const getWallets: any;
  export type Wallet = any;
}
