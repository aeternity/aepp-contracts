# Changelog

## [2.5.0](https://github.com/aeternity/aepp-contracts/compare/v2.4.2...v2.5.0) (2024-12-12)


### Features

* allow to evaluate args ([45320bc](https://github.com/aeternity/aepp-contracts/commit/45320bc79d8ddff806032a83a9242a3f85f4a2ac))
* show call logs ([b5e5c88](https://github.com/aeternity/aepp-contracts/commit/b5e5c8891d020909e4cf23bb2e6bffcbccfbafc2))
* trigger action on enter ([5cd2591](https://github.com/aeternity/aepp-contracts/commit/5cd2591b707548e5266eb82b38050419714b3ebd))


### Bug Fixes

* repl ([1541a44](https://github.com/aeternity/aepp-contracts/commit/1541a44ff7df18db7e41df0a03b8b4c52ffc26a1))


### Miscellaneous

* update dependencies, fix eslint ([ef7077e](https://github.com/aeternity/aepp-contracts/commit/ef7077ed3d9761a2cbb466c7114d1a8cec9be3be))

## [2.4.2](https://github.com/aeternity/aepp-contracts/compare/v2.4.1...v2.4.2) (2024-11-07)


### Miscellaneous

* publish releases to ECR as well ([8e5f2e6](https://github.com/aeternity/aepp-contracts/commit/8e5f2e6ee5e5a251d0322fc287d921a5ae9e2fda))

## [2.4.1](https://github.com/aeternity/aepp-contracts/compare/v2.4.0...v2.4.1) (2024-10-30)


### CI / CD

* switch to node@20 ([d4106a8](https://github.com/aeternity/aepp-contracts/commit/d4106a84f08e5379d999539fb01cf5ff3929e87b))


### Refactorings

* drop bignumber.js ([c503e9d](https://github.com/aeternity/aepp-contracts/commit/c503e9daab8cf47a9076fdad35e7971948bbefd9))
* extract common status markup in Account.vue ([0c5437a](https://github.com/aeternity/aepp-contracts/commit/0c5437af7c2ece5fb9d30fb6dac694115dbe5629))
* rename `isStatic` to `isLocalAccount` ([531ded4](https://github.com/aeternity/aepp-contracts/commit/531ded4d562cd6883c8cbd9d151ce6eb1bd38b69))


### Miscellaneous

* **deps:** update ([31f72e3](https://github.com/aeternity/aepp-contracts/commit/31f72e310e5f29b5a00df3223d9895f70cf3acee))
* explicitly ignore promise returned by `updateConnectionInfo` ([e8589e9](https://github.com/aeternity/aepp-contracts/commit/e8589e92f33f004f31a551adeb974d072fbfa29e))
* make disconnectWallet sync ([7a1f42f](https://github.com/aeternity/aepp-contracts/commit/7a1f42f9a269f7d0e89e44beee84a5ec2708e998))
* update sdk to 14, improve types ([97ada22](https://github.com/aeternity/aepp-contracts/commit/97ada2281f5bfcbd62cafa36710e61029e015ecd))

## [2.4.0](https://github.com/aeternity/aepp-contracts/compare/v2.3.0...v2.4.0) (2024-06-25)


### Features

* Update aerepl-web interface ([cd8618d](https://github.com/aeternity/aepp-contracts/commit/cd8618d582cddd04e2070ca2aaa27667e930a868))

## [2.3.0](https://github.com/aeternity/aepp-contracts/compare/v2.2.6...v2.3.0) (2024-05-23)


### Features

* use v8 compiler ([38920ed](https://github.com/aeternity/aepp-contracts/commit/38920ed38fc0541f794878c6a86fda9dc3bae877))

## [2.2.6](https://github.com/aeternity/aepp-contracts/compare/v2.2.5...v2.2.6) (2024-04-26)


### Miscellaneous

* regenerate package-lock to fix dead code elimination in rollup ([#135](https://github.com/aeternity/aepp-contracts/issues/135)) ([0eee5a7](https://github.com/aeternity/aepp-contracts/commit/0eee5a714532ccfaccb1ee2862092762add03a28))

## [2.2.5](https://github.com/aeternity/aepp-contracts/compare/v2.2.4...v2.2.5) (2024-04-26)


### Miscellaneous

* log connection error ([afa793f](https://github.com/aeternity/aepp-contracts/commit/afa793fcdd3996f626d0cc311cf04b802fcb95df))

## [2.2.4](https://github.com/aeternity/aepp-contracts/compare/v2.2.3...v2.2.4) (2024-04-25)


### Miscellaneous

* update dependencies ([c50712d](https://github.com/aeternity/aepp-contracts/commit/c50712d44037a9a497fb926ab4899bdc649b2edb))

## [2.2.3](https://github.com/aeternity/aepp-contracts/compare/v2.2.2...v2.2.3) (2023-11-15)


### Bug Fixes

* repl contract name parsing ([cd36e0e](https://github.com/aeternity/aepp-contracts/commit/cd36e0e6a9b398ae713a9301432940e70617d527))

## [2.2.2](https://github.com/aeternity/aepp-contracts/compare/v2.2.1...v2.2.2) (2023-11-15)


### CI / CD

* use bot token for release please workflow ([#126](https://github.com/aeternity/aepp-contracts/issues/126)) ([19df8d8](https://github.com/aeternity/aepp-contracts/commit/19df8d82f0c3ddc4846c644ca9176afb45f0988d))

## [2.2.1](https://github.com/aeternity/aepp-contracts/compare/v2.2.0...v2.2.1) (2023-11-14)


### Miscellaneous

* update dependencies ([787ec54](https://github.com/aeternity/aepp-contracts/commit/787ec5449f4f08dca99a8e4def8d68bd305e2035))

## [2.2.0](https://github.com/aeternity/aepp-contracts/compare/v2.1.0...v2.2.0) (2023-09-12)


### Features

* add show/hide repl ([0c4c621](https://github.com/aeternity/aepp-contracts/commit/0c4c621ca6ddd3e07b83976556f2cf4fef8a7a74))
* initial repl implementation ([2f2cf80](https://github.com/aeternity/aepp-contracts/commit/2f2cf80f6ec980b1cd6d157985556387d187a664))


### Bug Fixes

* improve code style, typedefs ([3bbd8c9](https://github.com/aeternity/aepp-contracts/commit/3bbd8c9e1fc170e68898829a35cbb0d1a8773c51))


### Refactorings

* check transaction type in result of contract call ([51bda26](https://github.com/aeternity/aepp-contracts/commit/51bda260a78753c2ac74cb4bfb7fc54bd85b9f2d))
* deploy bytecode ([bb37701](https://github.com/aeternity/aepp-contracts/commit/bb37701d2331f32c829ff98f9f49cc730a032f05))
* only establish channel on open, fix code style ([15ff4ad](https://github.com/aeternity/aepp-contracts/commit/15ff4ad76b2811d2aae120714a8f65f790a163b3))
* persist bytecode, allow input without compile ([5c2ce76](https://github.com/aeternity/aepp-contracts/commit/5c2ce7626801075acef38e49d4289e1a6be539ac))
* variable naming ([eef3aa0](https://github.com/aeternity/aepp-contracts/commit/eef3aa081da7a47808290f64067546f7fdac651c))


### Miscellaneous

* add lint to actions ([c1ccb20](https://github.com/aeternity/aepp-contracts/commit/c1ccb20ded47079844beaae3efbdf3ca83e9d38b))
* fix codestyle ([5dd8bf5](https://github.com/aeternity/aepp-contracts/commit/5dd8bf546c9288acd969d6433e8c8a11b31699eb))
* update dependencies ([fe0740d](https://github.com/aeternity/aepp-contracts/commit/fe0740d0088b96573eafa7076edfd044142b9118))

## [2.1.0](https://github.com/aeternity/aepp-contracts/compare/v2.0.1...v2.1.0) (2023-05-08)


### Features

* add version and contribution note ([69af2e2](https://github.com/aeternity/aepp-contracts/commit/69af2e2cf70e7d86ca5c6c055f0bb5076675b776))


### CI / CD

* test build in actions ([e6b32f1](https://github.com/aeternity/aepp-contracts/commit/e6b32f1ddc0bf58cb22dd3a328a61ba30fafa8e3))

## [2.0.1](https://github.com/aeternity/aepp-contracts/compare/v2.0.0...v2.0.1) (2023-05-08)


### Bug Fixes

* incorrect deploydata reset ([8e547d6](https://github.com/aeternity/aepp-contracts/commit/8e547d6759ba3e11830c2f0c8bda9d3f0df11964))
* sdk ref, custom node url and secret usage ([4fc710a](https://github.com/aeternity/aepp-contracts/commit/4fc710ac5335dd46460b2c72721303b8a8353e1c))


### Miscellaneous

* update dependencies ([46e74f4](https://github.com/aeternity/aepp-contracts/commit/46e74f4a3e9e0d0212ee3b5a00a0d1bad12a07bf))

## [2.0.0](https://github.com/aeternity/aepp-contracts/compare/1.1.2...v2.0.0) (2023-04-20)


### ⚠ BREAKING CHANGES

* update to sdk 13, refactor as vue3/vite project

### Features

* allow resizing of source and aci editor ([e05c8a9](https://github.com/aeternity/aepp-contracts/commit/e05c8a910b6d8f389021731c9579c4ac61f434b3))
* update to sdk 13, refactor as vue3/vite project ([170fc67](https://github.com/aeternity/aepp-contracts/commit/170fc67875cc834871b6cd50d4621dc26d61c153))


### Bug Fixes

* adjust for pr review, fix and satisfy eslint ([48b0870](https://github.com/aeternity/aepp-contracts/commit/48b0870d5cb0ebc36e6a7e83104a5e039ad00bfc))


### Miscellaneous

* remove unused files ([4156878](https://github.com/aeternity/aepp-contracts/commit/4156878fafdea0366c812a2bd09222b6dc0b67eb))


### CI / CD

* add release please ([0ddc18b](https://github.com/aeternity/aepp-contracts/commit/0ddc18b2e083862a9afdfac767c68ce9188c3dab))
