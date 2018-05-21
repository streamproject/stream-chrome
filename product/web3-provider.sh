#! /bin/sh
node ./build/cli.node.js -m="$(cat /run/secrets/MNEMONIC)" --debug --db=/blockchain_data
