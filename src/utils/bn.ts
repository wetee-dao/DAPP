import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";

export const BN_ZERO = new BN(0);
export const BN_TEN = new BN(10);

export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}
export function isBn(value: unknown): value is typeof BN_ZERO {
    return BN.isBN(value);
}

export function toSats(api: ApiPromise, balance: BN | number): BN {
    let bn: BN;

    if (isNumber(balance)) {
        bn = new BN(balance);
    } else {
        bn = balance;
    }

    return bn.mul(BN_TEN.pow(new BN(api.registry.chainDecimals[0])));
}

export function fromSats(api: ApiPromise, sats: BN): string {
    const pow = BN_TEN.pow(new BN(api.registry.chainDecimals[0]));
    const [div, mod] = [sats.div(pow), sats.mod(pow)];

    return `${div.toString()}${!mod.eqn(0) ? `.${mod.toString()}` : ''}`;
}

export function printBN(num: number | BN | bigint) {
    return new Intl.NumberFormat('en-US').format(num as bigint);
}


export function fromBalance(value: BN | number | string | null): string {
    if (!value) {
        return '';
    }

    return value.toString();
}

export function toBalance(api: ApiPromise, value: string | number): BN {
    const asString = isNumber(value) ? value.toString() : value;
    const siPower = new BN(api.registry.chainDecimals[0]);

    const isDecimalValue = /^(\d+)\.(\d+)$/.exec(asString);

    if (isDecimalValue) {
        const div = new BN(asString.replace(/\.\d*$/, ''));
        const modString = asString.replace(/^\d+\./, '').substring(0, api.registry.chainDecimals[0]);
        const mod = new BN(modString);

        return div
            .mul(BN_TEN.pow(siPower))
            .add(mod.mul(BN_TEN.pow(new BN(siPower.subn(modString.length)))));
    } else {
        return new BN(asString.replace(/[^\d]/g, '')).mul(BN_TEN.pow(siPower));
    }
}