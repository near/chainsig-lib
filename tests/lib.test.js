import test from 'ava';
import * as dotenv from 'dotenv';
import { near, ethereum, bitcoin } from '../dist/lib.js';

dotenv.config();

const { NEAR_ACCOUNT_ID, NEAR_PRIVATE_KEY } = process.env;
const nearConnection = near.init('testnet', NEAR_ACCOUNT_ID, NEAR_PRIVATE_KEY);

test('near init', async (t) => {
  t.true(!!nearConnection);
});

test('ethereum init', async (t) => {
  const { path } = ethereum.init();
  t.true(path === 'ethereum,1');
});

test('ethereum address', async (t) => {
  const { address } = await ethereum.getAddress();
  t.true(!!address);
});

test('ethereum balance', async (t) => {
  const { address } = await ethereum.getAddress();
  const balance = await ethereum.getBalance({ address });
  console.log('ethereum balance (gwei):', balance.toString());
  t.true(!!balance);
});

test('bitcoin init', async (t) => {
  const { path } = bitcoin.init();
  t.true(path === 'bitcoin,1');
});

test('bitcoin address', async (t) => {
  const { address } = await bitcoin.getAddress();
  t.true(!!address);
});

test('bitcoin balance', async (t) => {
  const { address } = await bitcoin.getAddress();
  const balance = await bitcoin.getBalance({ address });
  t.true(!!balance);
});
