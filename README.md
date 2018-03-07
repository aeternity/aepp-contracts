# aepp-contracts

Editor to compile and deploy contracts.

*This repository still work in progress. Be aware that the wallet management will be made more secure in the near future*

## Installation

```
git clone https://github.com/aeternity/aepp-contracts
cd aepp-contracts
npm run install
```

## Usage

### Preliminaries

Before you can start using the editor, you have to decrypt your nodes key to sign the transactions. Until tools become stable and been made available as installable CLI tools, please use the npm script directly from the `aepp-sdk-js` repo.

```
git clone -b develop https://github.com/aeternity/aepp-sdk-js
cd aepp-sdk-js
npm install
npm run decrypt <PATH TO YOUR Epoch keys directory>
```
### Start the application

```
npm run dev
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
