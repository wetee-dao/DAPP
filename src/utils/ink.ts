import type { Compact, UInt } from '@polkadot/types-codec';
import { AbiParam, BlueprintOptions } from '@polkadot/api-contract/types';
import { Balance, WeightV2 } from '@polkadot/types/interfaces';
import { Registry } from '@polkadot/types/types';
import { BN_ZERO, compactAddLength, isNumber, u8aToU8a } from '@polkadot/util';
import BN from 'bn.js';
import { ApiPromise } from '@polkadot/api';
import { Abi, BlueprintPromise, CodePromise } from '@polkadot/api-contract';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { randomAsU8a } from '@polkadot/util-crypto';
import { Bytes } from '@polkadot/types';

export type UIStorageDeposit = {
    value?: Balance;
    type: 'charge' | 'refund' | 'empty';
};

export function getGasLimit(
    switchOn: boolean,
    refTimeLimit: BN,
    proofSizeLimit: BN,
    registry: Registry,
): WeightV2 | null {
    return switchOn
        ? registry.createType('WeightV2', {
            refTime: refTimeLimit,
            proofSize: proofSizeLimit,
        }) as WeightV2
        : null;
}


export function getStorageDepositLimit(
    switchOn: boolean,
    userInput: BN,
    registry: Registry,
    dryRunValue?: UIStorageDeposit,
) {
    return switchOn
        ? registry.createType('Balance', userInput)
        : dryRunValue
            ? getPredictedCharge(dryRunValue)
            : null;
}

export function getPredictedCharge(dryRun: UIStorageDeposit) {
    return dryRun.type === 'charge'
        ? !dryRun.value?.eq(BN_ZERO)
            ? dryRun.value ?? null
            : null
        : null;
}

export function transformUserInput(
    registry: Registry,
    messageArgs: any[],
    values?: Record<string, unknown>,
): unknown[] {
    return messageArgs.map(({ name, type: { type } }) => {
        const value = values ? values[name] : null;

        if (type === 'Balance') {
            return registry.createType('Balance', value);
        }
        return value;
    });
}

export function formatRefTime(refTime: WeightV2['refTime'], unit: 'ms' | 'ps' = 'ps'): string {
    switch (unit) {
        case 'ps':
            return formatUInt(refTime, {
                decimals: 0,
                digitGrouping: false,
                fractionDigits: 0,
                symbol: unit,
            });
        case 'ms':
            return formatUInt(refTime, {
                decimals: 9,
                digitGrouping: false,
                fractionDigits: 2,
                symbol: unit,
            });
        default:
            throw new Error('Unsupported unit');
    }
}

export function formatProofSize(
    proofSize: WeightV2['proofSize'],
    unit: 'MB' | 'bytes' | 'kb' = 'bytes',
): string {
    switch (unit) {
        case 'bytes':
            return formatUInt(proofSize, {
                decimals: 0,
                digitGrouping: false,
                fractionDigits: 0,
                symbol: unit,
            });
        case 'kb':
            return formatUInt(proofSize, {
                decimals: 3,
                digitGrouping: false,
                fractionDigits: 2,
                symbol: unit,
            });
        case 'MB':
            return formatUInt(proofSize, {
                decimals: 6,
                digitGrouping: false,
                fractionDigits: 2,
                symbol: unit,
            });
        default:
            throw new Error('Unsupported unit');
    }
}

export type FormattingOptions = {
    decimals: number;
    symbol: string | undefined;
    fractionDigits: number;
    digitGrouping: boolean;
};

export const formatUInt = (value: UInt | Compact<UInt>, options: FormattingOptions) => {
    if (options.decimals < 0) throw new Error('Decimals must be positive');
    if (options.fractionDigits < 0) throw new Error('Fraction digits must be positive');
    if (options.decimals < options.fractionDigits)
        throw new Error('Decimals must be greater than fraction digits');

    const valueString = value.toString();
    const integerDigits = valueString.split('');

    let fractionalPart = ''.padStart(options.decimals, '0');
    if (options.decimals !== 0) {
        const fractionDigits = integerDigits.splice(-options.decimals);
        fractionalPart = fractionDigits.join('').padStart(options.decimals, '0');
    }

    let integerPart = integerDigits.length ? integerDigits.join('') : '0';

    if (options.digitGrouping) {
        integerPart = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
            BigInt(integerPart),
        );
    }

    if (options.fractionDigits === 0) {
        return integerPart + (options.symbol ? ` ${options.symbol}` : '');
    } else {
        return (
            integerPart +
            '.' +
            fractionalPart.slice(0, options.fractionDigits) +
            (options.symbol ? ` ${options.symbol}` : '')
        );
    }
};


export function createInstantiateTx(
    api: ApiPromise,
    {
        argValues,
        codeHash,
        constructorIndex,
        gasLimit,
        value,
        metadata,
        salt,
        storageDepositLimit,
    }: Omit<InstantiateData, 'name'>,
): SubmittableExtrinsic<'promise'> {
    const wasm = metadata?.info.source.wasm;
    const isValid = codeHash || !!wasm;

    if (isValid && metadata && isNumber(constructorIndex) && metadata && argValues) {
        const constructor = metadata.findConstructor(constructorIndex);

        const options: BlueprintOptions = {
            gasLimit,
            salt: salt || null,
            storageDepositLimit,
            value,
        };

        const codeOrBlueprint = codeHash
            ? new BlueprintPromise(api, metadata, codeHash)
            : new CodePromise(api, metadata, wasm && wasm.toU8a());

        const transformed = transformUserInput(api.registry, constructor.args, argValues);

        return constructor.args.length > 0
            ? codeOrBlueprint.tx[constructor.method](options, ...transformed)
            : codeOrBlueprint.tx[constructor.method](options);
    } else {
        throw new Error('Error creating instantiate tx');
    }
}

export interface InstantiateData {
    accountId: string;
    argValues?: Record<string, unknown>;
    value?: Balance;
    metadata?: Abi;
    name: string;
    constructorIndex: number;
    salt: string | Uint8Array | Bytes | null;
    storageDepositLimit: Balance | null;
    gasLimit: WeightV2 | undefined;
    codeHash?: string;
}

const EMPTY_SALT = new Uint8Array();
export function encodeSalt(salt: Uint8Array | string | null = randomAsU8a()): Uint8Array {
    return salt instanceof Bytes
        ? salt
        : salt && salt.length
            ? compactAddLength(u8aToU8a(salt))
            : EMPTY_SALT;
}