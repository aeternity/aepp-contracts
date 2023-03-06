import {
  Node,
} from '@aeternity/aepp-sdk'

export const defaultNetworkId = 'ae_uat'

export const COMPILER_URL = 'https://v7.compiler.stg.aepps.com'

export const nodes = [{
  name: 'ae_uat',
  instance: new Node('https://testnet.aeternity.io'),

}, {
  name: 'ae_mainnet',
  instance: new Node('https://mainnet.aeternity.io'),
}]
