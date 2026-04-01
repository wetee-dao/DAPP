import { Component } from "vue";

export interface insType {
  name: string;
  nameKey?: string;
  group?: string;
  groupKey?: string;
  icon: string;
  url: string;
  module: string;
  disabled: boolean;
}

export default <insType[]>[
  {
    name: "Service",
    nameKey: "routes.cloud",
    group: "Core",
    groupKey: "nav.core",
    icon: "cloud",
    url: "/cloud",
    module: "cloud",
  },
  {
    name: "Secret",
    nameKey: "routes.secret",
    group: "Core",
    groupKey: "nav.core",
    icon: "secret",
    url: "/secret",
    module: "secret",
  },
  {
    name: "Disk",
    nameKey: "routes.disk",
    group: "Core",
    groupKey: "nav.core",
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
    group: "Explore",
    groupKey: "nav.explore",
    icon: "bridge",
    url: "/bridge",
    module: "bridge",
    disabled: true,
  },
  {
    name: "MPC",
    group: "Explore",
    groupKey: "nav.explore",
    icon: "mpc",
    url: "/mpc",
    module: "mpc",
    disabled: true,
  },
  {
    name: "Builder",
    nameKey: "routes.builder",
    group: "Explore",
    groupKey: "nav.explore",
    icon: "builder",
    url: "/builder",
    module: "builder",
    disabled: true,
  },
]

