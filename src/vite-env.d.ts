/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** tee-dsecret GraphQL 基址，如 `https://host:30115` 或 `https://host:30115/gql` */
  readonly VITE_SECRET_GQL_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

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
