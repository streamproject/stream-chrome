echo "SECRETS AND ENV SETUP... (you can always change these later)"

mkdir -p secrets

# Postgres setup
read -p "POSTGRES_USER: " POSTGRES_USER
sed -i '' 's/POSTGRES_USER=.*/POSTGRES_USER='$POSTGRES_USER'/' ./postgres.env

read -p "POSTGRES_PASS: " POSTGRES_PASS
echo $POSTGRES_PASS > ./secrets/POSTGRES_PASS.txt

read -p "POSTGRES_DB: " POSTGRES_DB
sed -i '' 's/POSTGRES_DB=.*/POSTGRES_DB='$POSTGRES_DB'/' ./postgres.env

# Backend setup
read -p "Production POSTGRES_HOST: " POSTGRES_HOST
sed -i '' 's/POSTGRES_HOST=.*/POSTGRES_HOST='$POSTGRES_HOST'/' ./backend.env

read -p "AWS BUCKET_NAME: " BUCKET_NAME
sed -i '' 's/BUCKET_NAME=.*/BUCKET_NAME='$BUCKET_NAME'/' ./backend.env

echo "Generate a static chrome extension ID, see https://gist.github.com/raineorshine/970b60902c9e6e04f71d"
read -p "EXTENSION_ID: " EXTENSION_ID
sed -i '' 's/EXTENSION_ID=.*/EXTENSION_ID='$EXTENSION_ID'/' ./crx/crx.env

echo "Obtain a Twilio api key here: https://www.twilio.com/docs/authy/twilioauth-sdk/quickstart/obtain-authy-api-key"
read -p "TWILIO_API_KEY: " TWILIO_API_KEY
echo $TWILIO_API_KEY > ./secrets/TWILIO_API_KEY.txt

echo "Register your twitch application here: https://dev.twitch.tv/docs/authentication/#registration Register as a browser etxension and once you have a chrome extension ID the redirect URL to https://<chrome extension ID>.chromiumapp.org/twitch_cb"
read -p "TWITCH_CLIENT_ID: " TWITCH_CLIENT_ID
sed -i '' 's/TWITCH_CLIENT_ID=.*/TWITCH_CLIENT_ID='$TWITCH_CLIENT_ID'/' ./backend.env
sed -i '' 's/TWITCH_CLIENT_ID=.*/TWITCH_CLIENT_ID='$TWITCH_CLIENT_ID'/' ./crx/crx.env

read -p "TWITCH_SECRET: " TWITCH_SECRET
echo $TWITCH_SECRET > ./secrets/TWITCH_SECRET.txt

read -p "TWITCH_REDIRECT_URI: " TWITCH_REDIRECT_URI
sed -i '' 's/TWITCH_REDIRECT_URI=.*/TWITCH_REDIRECT_URI='$TWITCH_REDIRECT_URI'/' ./backend.env

echo "Register your as a google application here: https://developers.google.com/youtube/registering_an_application as OAUTH 2.0"
read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
sed -i '' 's/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID='$GOOGLE_CLIENT_ID'/' ./backend.env
sed -i '' 's/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID='$GOOGLE_CLIENT_ID'/' ./crx/crx.env

read -p "GOOGLE_API_KEY: " GOOGLE_API_KEY
sed -i '' 's/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID='$GOOGLE_CLIENT_ID'/' ./crx/crx.env

read -p "GOOGLE_SECRET: " GOOGLE_SECRET
echo $GOOGLE_SECRET > ./secrets/GOOGLE_SECRET.txt

read -p "GOOGLE_REDIRECT_URI: " GOOGLE_REDIRECT_URI
sed -i '' 's/GOOGLE_REDIRECT_URI=.*/GOOGLE_REDIRECT_URI='$GOOGLE_REDIRECT_URI'/' ./backend.env

echo "Register for infura https://infura.io/signup"
read -p "INFURA_ACCESS_TOKEN: " INFURA_ACCESS_TOKEN
echo $INFURA_ACCESS_TOKEN > ./secrets/INFURA_ACCESS_TOKEN.txt

echo "Setup an ethereum wallet, and generate a mnemonic. You can use metamask for this."
read -p "STREAM_HOT_WALLET_ADDRESS: " STREAM_HOT_WALLET_ADDRESS
sed -i '' 's/STREAM_HOT_WALLET_ADDRESS=.*/STREAM_HOT_WALLET_ADDRESS='$STREAM_HOT_WALLET_ADDRESS'/' ./backend.env

read -p "ETH Wallet MNEMONIC " MNEMONIC
echo $MNEMONIC > ./secrets/MNEMONIC.txt

echo "Set the STRToken smart contract address. You can generate this later with deploy-str.sh"
read -p "STR_TOKEN_ADDRESS: " STR_TOKEN_ADDRESS
sed -i '' 's/STR_TOKEN_ADDRESS=.*/STR_TOKEN_ADDRESS='$STR_TOKEN_ADDRESS'/' ./backend.env
sed -i '' 's/STR_TOKEN_ADDRESS=.*/STR_TOKEN_ADDRESS='$STR_TOKEN_ADDRESS'/' ./crx/crx.env
sed -i '' 's/STR_TOKEN_ADDRESS=.*/STR_TOKEN_ADDRESS='$STR_TOKEN_ADDRESS'/' ./docker-compose.override.yml

echo "Set the email address"
read -p "EMAIL_ACCOUNT " EMAIL_ACCOUNT
echo $EMAIL_ACCOUNT > ./secrets/EMAIL_ACCOUNT.txt

read -p "EMAIL_PASS " EMAIL_PASS
echo $EMAIL_PASS > ./secrets/EMAIL_PASS.txt

read -p "PHONE_SALT_HASH " PHONE_SALT_HASH
echo $PHONE_SALT_HASH > ./secrets/PHONE_SALT_HASH.txt

read -p "GA_TRACKING_ID: " GA_TRACKING_ID
sed -i '' 's/GA_TRACKING_ID=.*/GA_TRACKING_ID='$GA_TRACKING_ID'/' ./crx/crx.env

read -p "SENTRY_URI: " SENTRY_URI
sed -i '' 's/SENTRY_URI=.*/SENTRY_URI='$SENTRY_URI'/' ./crx/crx.env

read -p "SEGMENT_WRITE_KEY: " SEGMENT_WRITE_KEY
sed -i '' 's/SEGMENT_WRITE_KEY=.*/SEGMENT_WRITE_KEY='$SEGMENT_WRITE_KEY'/' ./crx/crx.env
