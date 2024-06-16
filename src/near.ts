import * as nearAPI from 'near-api-js';
import BN from 'bn.js';
const { Near, Account, keyStores, KeyPair } = nearAPI;

let nearConnection, account;

const defaults = {
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
  },
};

// TODO add MPC contract param to init

export const near = {
  init: (network: string, accountId: string, privateKey: string) => {
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey('testnet', accountId, KeyPair.fromString(privateKey));
    const config = { ...defaults[network], keyStore };
    nearConnection = new Near(config);
    account = new Account(nearConnection, accountId);
    return near;
  },
  sign: async (payload, path) => {
    const args = {
      payload,
      path,
      key_version: 0,
      rlp_payload: undefined,
    };
    let attachedDeposit = '0';

    if (process.env.NEAR_PROXY_CONTRACT === 'true') {
      delete args.payload;
      args.rlp_payload = payload.substring(2);
      attachedDeposit = nearAPI.utils.format.parseNearAmount('1');
    } else {
      // reverse payload required by MPC contract
      payload.reverse();
    }

    console.log(
      'sign payload',
      payload.length > 200 ? payload.length : payload.toString(),
    );
    console.log('with path', path);
    console.log('this may take approx. 30 seconds to complete');

    let res;
    try {
      res = await account.functionCall({
        contractId: process.env.MPC_CONTRACT_ID,
        methodName: 'sign',
        args,
        gas: new BN('300000000000000'),
        attachedDeposit,
      });
    } catch (e) {
      return console.log('error signing', JSON.stringify(e));
    }

    // parse result into signature values we need r, s but we don't need first 2 bytes of r (y-parity)
    if ('SuccessValue' in (res.status as any)) {
      const successValue = (res.status as any).SuccessValue;
      const decodedValue = Buffer.from(successValue, 'base64').toString(
        'utf-8',
      );
      const parsedJSON = JSON.parse(decodedValue) as [string, string];

      return {
        r: parsedJSON[0].slice(2),
        s: parsedJSON[1],
      };
    } else {
      return console.log('error signing', JSON.stringify(res));
    }
  },
};
