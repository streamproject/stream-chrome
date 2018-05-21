#!/bin/bash

read -p "Resetting packages. Press enter to continue."
echo "RESETTING PACKAGES ---------------------------"
echo "RESETTING PACKAGES (1) product/shared/ -------"
cd shared
yarn run build
echo "RESETTING PACKAGES (2) product/crx/ ----------"
cd ../crx
yarn add "file:../shared"
./fix_redux_segment.sh
yarn run build
echo "RESETTING PACKAGES (3) product/backend/ ------"
cd ../backend
yarn add "file:../shared"
echo "RESETTING PACKAGES (4) docker ----------------"
cd ..
docker-compose down
docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
docker volume rm product_backend_node_modules product_backend_dist product_shared_node_modules product_shared_dist
docker-compose build
echo "PACKAGES RESET (unless there was an error lol)"
