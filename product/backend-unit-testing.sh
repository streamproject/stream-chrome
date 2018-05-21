#!/bin/sh
echo "Setting compiler variables..."
export POSTGRES_DB="stream"

pass=$(cat ../secrets/POSTGRES_PASS.txt)

export POSTGRES_PASS=$pass
export POSTGRES_HOST="127.0.0.1"
export POSTGRES_USER="beebus"

echo "Env variables set, running db unit testing"
mocha --watch --check-leaks --reporter spec -r ts-node/register test/**/*.spec.ts
