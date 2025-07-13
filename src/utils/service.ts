import { Component } from "vue";

export interface insType {
  name: string;
  icon: string;
  url: string;
  module: string;
}

export default <insType[]>[
  {
    name: "CLOUD",
    icon: "cloud",
    url: "/cloud",
    module: "cloud",
  },
  {
    name: "MINER",
    icon: "miner",
    url: "/miner",
    module: "miner",
  },
  {
    name: "BUILDER",
    icon: "builder",
    url: "/builder",
    module: "builder",
  },
]

