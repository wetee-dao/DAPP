import { Component } from "vue";

export interface insType {
  name: string;
  nameKey?: string;
  icon: string;
  url: string;
  module: string;
  disabled: boolean;
}

export default <insType[]>[
  {
    name: "Service",
    nameKey: "routes.cloud",
    icon: "cloud",
    url: "/cloud",
    module: "cloud",
  },
  {
    name: "Secret",
    nameKey: "routes.secret",
    icon: "secret",
    url: "/secret",
    module: "secret",
  },
  {
    name: "Disk",
    nameKey: "routes.disk",
    icon: "disk",
    url: "/disk",
    module: "disk",
  },
  // {
  //   name: "Miner",
  //   icon: "miner",
  //   url: "/miner",
  //   module: "miner",
  // },
  {
    name: "Bridge",
    icon: "bridge",
    url: "/bridge",
    module: "bridge",
    disabled: true,
  },
  {
    name: "MPC",
    icon: "mpc",
    url: "/mpc",
    module: "mpc",
    disabled: true,
  },
  {
    name: "Builder",
    nameKey: "routes.builder",
    icon: "builder",
    url: "/builder",
    module: "builder",
    disabled: true,
  },
]

