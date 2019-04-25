export default {
  account: {
    pub: 'ak_6A2vcm1Sz6aqJezkLCssUXcyZTX7X8D5UwbuS2fRJr9KkYpRU',
    priv: 'a7a695f999b1872acb13d5b63a830a8ee060ba688a478a08c6e65dfad8a01cd70bb4ed7927f97b51e1bcb5e1340d12335b2a2b12c8bc5221d63c4bcb39d41e61'
  },
  url: process.env.VUE_APP_NODE_URL ? process.env.VUE_APP_NODE_URL : 'https://sdk-testnet.aepps.com',
  internalUrl: process.env.VUE_APP_NODE_INTERNAL_URL ? process.env.VUE_APP_NODE_INTERNAL_URL : 'https://sdk-testnet.aepps.com'
}
