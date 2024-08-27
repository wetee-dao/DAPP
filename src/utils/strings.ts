import { hexToString } from "@polkadot/util";

export const ChainHexToString = (hex: string) => {
    if (!hex) return "";
    if (hex.indexOf("0x") === 0) {
        return hexToString(hex);
    }
    return hex
}