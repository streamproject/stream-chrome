#!/bin/bash

echo "RESETTING DATABASES --------------------------"
echo "Make sure you have run the following commands first in a separate terminal:"
echo "docker-compose down"
echo "rm -rf ./.postgres_data"
echo "docker-compose up db"
read -p "Resetting Databases: Press enter to continue once the db is initiated and ready to accept connections."
echo "DATABASES RESET ------------------------------"
echo "UPDATING SCHEMAS ------------------------------"
eval $(cat postgres.env | sed 's/^/export /')
pass=$(< ./secrets/POSTGRES_PASS.txt)
schemats generate -c postgres://$POSTGRES_USER:$pass@localhost/stream -o shared/src/models/tables.ts
./reset-packages.sh
