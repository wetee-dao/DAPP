
// const PACKAGE_NAME = '@polkagate/snap';
// const NPM_SNAP_ID = `npm:${PACKAGE_NAME}`;

// export const NPM_SNAP_ID = 'local:http://localhost:8080';
// export const DEFAULT_SNAP_ORIGIN = NPM_SNAP_ID;

export const NPM_SNAP_ID = 'npm:@chainsafe/polkadot-snap';
export const DEFAULT_SNAP_ORIGIN = NPM_SNAP_ID;

export const DEFAULT_SNAP_VERSION = '0.2.2';
export const DEFAULT_SNAP_NAME = 'substrate-snap';

export const SUPPORTED_SNAPS = {
  [DEFAULT_SNAP_ORIGIN]: { version: `>=${DEFAULT_SNAP_VERSION}` }
};
