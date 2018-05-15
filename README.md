# POS Æpp

## Overview

This is a simple Web Application that will be used during [re:publica 2018](https://re-publica.com/en) using VueJS and [Aeternity's JS SDK](https://github.com/aeternity/aepp-sdk-js).

It allows the bar tender to check whether participants are actually allowed to get their beers using Æ tokens coming from the [Beer App](https://github.com/aeternity/beer-aepp/).

*This repository is a work in progress* and it has the precise scope of only being used during re:publica 2018 to gamify the process of ordering a beer offered by Aeternity.

## Usage

### Preliminaries

This application is only intended to work with the [Beer App](https://github.com/aeternity/beer-aepp/), make sure to read that documentation first.


### How it works

1. Print this PDF to speed up the work:  https://github.com/aeternity/pos-aepp/pos-aepp-commands.pdf
2. Access the app sending your secret via URL (eg. `http://URL_OF_APP/?secret=your-POS-secret-here`)
3. Use a QR code scanner (or manually type in the input field) to switch POS functionalities of the POS application
   * Possible commands:
      1. `th$...` – Scan mode - Verifies a transaction
      2. `number` - Refund mode - Refunds `number` AETs
      3. `close` - Close POS
      4. `out_of_beers` - Sets POS as "_out of beers_"
      5. `open` - Open POS

## Installation

```
git clone https://github.com/aeternity/pos-aepp
cd pos-aepp
yarn install
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
