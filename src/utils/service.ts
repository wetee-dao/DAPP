import { Component } from "vue";

export interface insType {
  name: string;
  icon: string;
  url: string;
  module: string;
}

export default <insType[]>[
  {
    name: "Cloud",
    icon: "cloud",
    url: "/cloud",
    module: "cloud",
  },
  {
    name: "Bridge",
    icon: "bridge",
    url: "/bridge",
    module: "bridge",
  },
  {
    name: "Storage",
    icon: "store",
    url: "/store",
    module: "store",
  },
  {
    name: "MPC",
    icon: "mpc",
    url: "/mpc",
    module: "mpc",
  },
  {
    name: "Miner",
    icon: "miner",
    url: "/miner",
    module: "miner",
  },
  {
    name: "Builder",
    icon: "builder",
    url: "/builder",
    module: "builder",
  },
]

