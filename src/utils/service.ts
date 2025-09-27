import { Component } from "vue";

export interface insType {
  name: string;
  icon: string;
  url: string;
  module: string;
  disabled: boolean;
}

export default <insType[]>[
  {
    name: "Container",
    icon: "cloud",
    url: "/cloud",
    module: "cloud",
  },
  {
    name: "Secret",
    icon: "secret",
    url: "/secret",
    module: "secret",
  },
  {
    name: "Disk",
    icon: "disk",
    url: "/disk",
    module: "disk",
  },
  {
    name: "Bridge",
    icon: "bridge",
    url: "/bridge",
    module: "bridge",
  },
  {
    name: "Miner",
    icon: "miner",
    url: "/miner",
    module: "miner",
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
    icon: "builder",
    url: "/builder",
    module: "builder",
    disabled: true,
  },
]

