import { Component } from "vue";

export interface insType {
  name: string;
  icon: string;
  url: string;
}

export default [{
  name: "DAPPS",
  icon: "&#xe613;",
  sub: <insType[]>[
    { 
      name: "TEE Cloud", 
      icon: "cloud",
      url: "/cloud", 
    },
    { 
      name: "TEE Miner", 
      icon: "miner",
      url: "/miner", 
    },
    { 
      name: "TEE App Builder", 
      icon: "builder",
      url: "/builder", 
    },
  ],
}]

