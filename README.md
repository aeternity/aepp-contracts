# aepp-contracts

## Overview

This is a simple utility to compile contracts and install them into the blockchain. It's a very early release, so bear with us if there are problems. In particular--

*This repository still work in progress. Be aware that the wallet management will be made more secure in the near future*

## Installation

```
git clone https://github.com/aeternity/aepp-contracts
cd aepp-contracts
npm install
```

## Usage

### Preliminaries

At the current state of development, you have to be in control of a node to use the editor. You sign your transactions with the node's public key, and the node must have enough tokens. Additionally, you'll need to decrypt your private key as hex and enter it into the editor, and set up a proxy configuration in order to set [CORS headers](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

#### Decrypt your private key

Before you can start using the editor, you have to decrypt your node's key, which you will use to sign the transactions. 
Until the tools become stable and have been made available as installable CLI tools, please use the npm script directly from the `aepp-sdk-js` repo.

```
git clone -b develop https://github.com/aeternity/aepp-sdk-js
cd aepp-sdk-js
npm install
npm run decrypt <PATH TO YOUR Epoch keys directory>
```

#### Setup NGINX

To be able to communicate with your node from the browser, you need to setup 
NGINX or Apache to set the CORS header.

Checkout the standard [CORS configuration](https://raw.githubusercontent.com/aeternity/epoch/master/docker/nginx-cors.conf)
and [Proxy configuration](https://raw.githubusercontent.com/aeternity/epoch/master/docker/nginx-default.conf). The proxy configuration is taken from the Docker configuration. Please make sure to change the hostnames to 127.0.0.1 or add `node1`, `node2`, `node3` to your `/etc/hosts`.

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
