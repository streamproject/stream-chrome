#!/bin/bash
set -e
cd "$(dirname "$0")/.."
npx truffle compile
npx truffle exec scripts/truffle-deploy-script.js --network ${NETWORK_NAME:=deploymentNode}
