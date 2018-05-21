cd ./shared
yarn
yarn run build
cd ../crx
yarn
cd node_modules/redux-segment && npm i && cd -
yarn run prod
