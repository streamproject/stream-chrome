echo "DEPLOYING STR..."
echo "Make sure you have run the following commands first in a separate terminal:"
echo "docker-compose up web3-provider"
read -p "Press enter to continue."
smart-contracts/scripts/deploy.sh
echo "Make sure to save the smart contract address and add it to backend.env as STC_TOKEN_ADDRESS"