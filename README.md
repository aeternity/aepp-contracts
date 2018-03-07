# aepp-contracts

Editor to compile and deploy contracts.

*This repository still work in progress. Be aware that the wallet management will be made more secure in the near future*

## Installation

```
git clone https://github.com/aeternity/aepp-contracts
cd aepp-contracts
npm install
```

## Usage

### Preliminaries

At the current state of development, you have to be in control of a mining node
to be able to use the editor.

1. You have to decrypt your private key as hex 
from your node and copy it to your editor
2. Setup a proxy configuration for your node to set CORS headers to * or 
something appropriate

#### Decrypt your private key

Before you can start using the editor, you have to decrypt your nodes key to sign the transactions. 
Until tools become stable and have been made available as installable CLI tools, please use the npm script directly from the `aepp-sdk-js` repo.

```
git clone -b develop https://github.com/aeternity/aepp-sdk-js
cd aepp-sdk-js
npm install
npm run decrypt <PATH TO YOUR Epoch keys directory>
```

#### Setup NGINX

To be able to communicate with your node from the browser, you need to setup 
NGINX or Apache to set the CORS header.

Here is the standard [CORS Configuration](https://raw.githubusercontent.com/aeternity/epoch/master/docker/nginx-cors.conf)
Here is the standard [Proxy Configuration](https://raw.githubusercontent.com/aeternity/epoch/master/docker/nginx-default.conf)

*The configurations above expose all nodes of the 3-nodes localnet setup. 
To be able to work with the editor you only need to configure one node 
(Make sure that the routes and the private key match in the editor)*

### Start the application

```
npm run dev
```

The current form should be self explainatory. 

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
