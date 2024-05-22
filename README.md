### ⚠️⚠️⚠️ Caution! This is beta / testnet technology ⚠️⚠️⚠️

# For RFC Skip Overview

A library that provides a suite of methods to easily interact with specific chains from NEAR.

## Contribution Guidelines

If you would like to contribute a new chain to this libary please:
- Create a new folder titled the chain name for example "Ethereum" in the chains folder.
- Implement all methods as defined in this README.
- Follow the Ethereum example.

Currently this can be implemented for any ECDSA based chain. 

# Overview

NEAR's Chain Signatures protocol allows any NEAR account to sign transactions for any chain. The signing step is a method call with signature:

```rust
sign(
	payload: [u8; 32],
	path: String,
	key_version: u32,
)
```

This is executed by a NEAR smart contract that returns the signature to the client. The client then combined this signature with their transaction payload and broadcasts it to the network of their choice.

The creation of secp256k1 public keys for Bitcoin, EVM and other chains that use this signature scheme are currently supported.

# RFC - Library Details

For a full list of methods, see Methods section below. The following section describes a typical usage pattern.

## Usage

```js
import { near, bitcoin, ethereum } from '@near/chain-sig-lib';

// initialize a NEAR connection, if you don't already have one in your client, this can be useful for testing
const nearConnection = near.init(network, [accountId], [accountSecretKey]);
// initialize the bitcoin module for use with the current NEAR connection (this can be your existing NEAR connection e.g. from wallet-selector)
bitcoin.init(path, keyVersion, [nearConnection]);
// get the balance of bitcoin for the currently initialized derived address created by NEAR accountId, path, key_version
// optional argument: minusGas of a basic transfer
const balance = bitcoin.getBalance([minusGas]);

// optional check balance against use specified amount to transfer
...

// get a bitcoin transfer payload (amount is in sats)
const baseTransaction = bitcoin.transferBase(to: string, amount, [maxUTXOs]);
// sign the bitcoin payload - creates a NEAR transaction using either wallet or secretKey if passed to near.init
const [signedTransaction] = bitcoin.sign([baseTransaction]);
// broadcast the bitcoin transaction
const txHash = await bitcoin.broadcast([signedTransaction], network);
```

### Shorthand

Shorthand calls will automatically check balance and throw an error before redirecting to a wallet.

Additionally, the above call to `transferPayload` will also throw an error before creating the payload to be signed.

```js
// optional shorthand for the last 3 steps
const txHash = await bitcoin.transfer(to: string, amount, network, [maxUTXOs]);
```

### Using with a web wallet

When using a web wallet, the txHash will not be returned. Instead you can fetch the result of the attempted NEAR transaction signing once redirected by the app using the following code:

```js
import { near, ... } from '@near/chain-sig-lib';
// your code to create, sign and broadcast a transaction
...
// after web wallet redirect to your application e.g. typically in a useEffect hook in React
const { errors, [txHashes], [signedTransactions] } = near.getResults();
```

### Smart contract methods

Smart contract chains (EVM and others) will typically have 1 state manipulating call, requiring gas to be spent and one view call. In order to encapsulte this and make it easier, there are some higher order methods, built on top of lower level primatives.

```js
// viewing contract state

// TODO UPDATE

const payload = ethereum.viewBase(to: string, method, args);
// or the shorthand to sign with NEAR account and broadcast all together
const txHash = await ethereum.view(to: string, method, args, network);

// changing contract state

// get balance minus the gas required to execute the transaction
const balance = await ethereum.getBalance([minusGas, rawTx]);

// optional check if balance is negative, meaning callPayload (and call) will throw errors
...

const payload = ethereum.callBase(to: string, method, args);
// or the shorthand to sign with NEAR account and broadcast all together
const txHash = await ethereum.call(to: string, method, args, network);
```

## Methods

For all chains, the following methods are available:

```js
// initializes the chain instance
// if you need to use multiple paths, call again and it will overwrite the current settings with a new path for example
[chainInstance].init(path: string, keyVersion: uint, [nearConnection: object]);

// get the address for the current chain instance settings
// derived address == nearAccountId x path x keyVersion
// @returns string - hex/base58/... address depends on chain
getAddress();

// @async
// get a gas price estimate for the current chain
// @returns - object - values are chain dependent
getGas();

// @async
// get the balance of the derived address in the chain's native currency
// @returns {object} balance - values are chain dependent
getBalance();

// get a base transaction to transfer the chain's native currency
// @param [option, ...] - chain specific options e.g. maxUTXOs for Bitcoin
// @returns object baseTransaction
transferBase(to: string, amount: string, [option, ...]);

// @async
// sign the base transaction prompting the user to sign a NEAR transaction
// @param {object} baseTransactions - array of base transactions
// @returns {object[]} signedTransactions - signed transactions as array
sign(baseTransactions: object[]);

// @async
// broadcast the transaction to the network specified
// @param {object[]} signedTransactions
// @param {string} network - name of network to broadcast to
// @returns {string[]} txHash
broadcast(signedTransactions: object[], network: string);

// @async
// shorthand to skip the above three methods
// will prompt user to sign the NEAR transaction
// @returns {string[]} txHash
transfer(to: string, amount, network, [option, ...])

// @async
// if the user was redirect to a web wallet, get the results once returned to the application e.g. in useEffect hook when React component for chain signatures loads
// requires the top level near import from library
// @returns {object} results - { errors, [txHashes], [signedTransactions] }
near.getResults();
```

For smart contract chains, additional methods are available:

```js
// because of the large number of bytes this is a special base transaction for deploying smart contracts
// @returns object baseTransaction
deployContractBase(bytes: string)

// call a method of a smart contract
// @returns object baseTransaction
callBase(to: string, methodName: string, args: object)

// view the result of a method call to a contract
// @returns object baseTransaction
viewBase(to: string, methodName: string, args: object)

// and the shorthands

// @async
deployContract(bytes: string, network: string)

// @async
call (to: string, methodName: string, args: object, network: string)

// @async
view (to: string, methodName: string, args: object, network: string)
```

### Additional chain specific methods (future work):

- Cosmos - IBC
- Dfinity - Canisters

# References & Useful Links

### Examples

[Live Example - NEAR Testnet, Sepolia, Bitcoin Testnet](https://test.near.social/md1.testnet/widget/chainsig-sign-eth-tx)

[A frontend example you can run locally](https://github.com/near-examples/near-multichain)

### Docs

[Path naming conventions](https://github.com/near/near-fastauth-wallet/blob/dmd/chain_sig_docs/docs/chain_signature_api.org)

[Chain Signatures Docs](https://docs.near.org/concepts/abstraction/chain-signatures)

[Chain Signatures Use Cases](https://docs.near.org/concepts/abstraction/signatures/use-cases)

### MPC Repositories

[MPC Repo](https://github.com/near/mpc-recovery/)

### Faucets and API Keys

[Sepolia Faucet](https://sepolia-faucet.pk910.de/)

[Bitcoin Testnet Faucet](https://faucet.triangleplatform.com/bitcoin/testnet)

#### For Dogecoin, you will need to register for Tatum API (free plan):

[Dogecoin Tatum API](https://tatum.io/) and [docs](https://apidoc.tatum.io/tag/Dogecoin)

[Dogecoin Testnet Faucet](https://shibe.technology/)

#### XRP Ledger

[XRP Ledger Testnet Faucet](https://test.bithomp.com/faucet/)

[XRP Ledger Testnet Explorer](https://test.bithomp.com/explorer)
