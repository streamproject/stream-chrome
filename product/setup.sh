echo "RUNNING BASIC SETUP..."

./setup-secrets-and-env.sh

read -p "Press enter to continue"
docker-compose down
./deploy-str.sh

echo "Copy paste the STR token address from above to update"
read -p "STR_TOKEN_ADDRESS: " STR_TOKEN_ADDRESS
sed -i 's/STR_TOKEN_ADDRESS=.*/STR_TOKEN_ADDRESS='$STR_TOKEN_ADDRESS'/' backend.env
sed -i 's/STR_TOKEN_ADDRESS=.*/STR_TOKEN_ADDRESS='$STR_TOKEN_ADDRESS'/' docker-compose.override.yml

./reset-packages.sh
cd crx
yarn
yarn build
cd -
echo "To install the chrome extension, add it as an unpacked extension in chrome://extensions and select product/crx/dist"
echo "To generate a chrome extension ID, see https://gist.github.com/raineorshine/970b60902c9e6e04f71d"