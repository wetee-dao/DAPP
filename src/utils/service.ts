import { Component } from "vue";

export interface insType {
  name: string;
  icon: string;
  url: string;
}

export default [{
  name: "DAPPS",
  icon: "&#xe613;",
  listUri: "/app_chain/blockInfo",
  sub: <insType[]>[
    { 
      name: "Confidential Cloud", 
      icon: "cloud",
      url: "/project", 
    },
    { 
      name: "Confidential Miner", 
      icon: "miner",
      url: "/miner", 
    },
  ],
}]

