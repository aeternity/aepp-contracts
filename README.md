# Contracts Æpp

## Overview

This is a simple Web Application that demonstrates Aeternity Contracts.

### How it works

1. Select a node
2. Add your private and public keys
3. Write an [Aeternity contract](https://github.com/aeternity/protocol/tree/master/contracts) in [Sophia](https://github.com/aeternity/protocol/blob/master/contracts/sophia.md)
4. Compile it by hitting "compile"
5. Deploy it to the chain hitting "Deploy"
6. Test other functionalities (call data, static function and function)

## Installation

1. Clone this repo and install required dependencies
```bash
git clone https://github.com/aeternity/aepp-contracts/
cd aepp-contracts
yarn install
```
1. Add a keypair and a url to `src/settings.js`
```
export default {
  account: {
    pub: 'YOUR_WALLET_PUB',
    priv: 'YOUR_WALLET_PRIV'
  },
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com'
}
```

## Start the application

```
yarn run start:dev
```

The current form should be self explainatory.

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run start:dev

# build for production with minification
yarn run build

# TODO: runs tests
yarn run test

```

## License

ISC License (ISC)
Copyright © 2018 aeternity developers

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
