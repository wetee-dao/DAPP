import { Balance } from '@polkadot/types/interfaces';
import type { FormattingOptions } from './formatUInt';
import { formatUInt } from './formatUInt';

const DEFAULT_OPTIONS: FormattingOptions = {
  decimals: 12,
  fractionDigits: 2,
  symbol: undefined,
  digitGrouping: true,
};

export const formatBalance = (balance: Balance, partialOptions?: Partial<FormattingOptions>) => {
  return formatUInt(balance, { ...DEFAULT_OPTIONS, ...partialOptions });
};
