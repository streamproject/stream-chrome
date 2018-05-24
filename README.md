# HELLO
### Welcome to the Stream CRX + Smart Contract Repo!
#### We are very glad to have you here.

<img src="/wireframes/10%20-%20Dashboard/10.1%20-%20Dashboard.png?raw=True" height="400" title="Screenshot">


# Quick Overview
If you would like to play with our chrome extension and run this locally, `cd` into `product` and run the `setup.sh` script and follow its instructions. It will walk you through the setup process ie setting up credentials, local developer env variables, a local blockchain and deployed stream token smart contract, etc. Note: this will also require you to setup developer accounts on external including AWS, twitch, youtube, google analytics, infura, sentry, segment and gmail.

```
$ git clone https://github.com/streamproject/stream-chrome
$ cd stream-chrome/product/
$ setup.sh
$ docker-compose up
```

### Install the CRX
Navigate to `chrome://extensions/` and enable developer mode. Then, install the extension via "Load unpacked extension...", and select the folder `stream-chrome/product/crx/dist/`.

### Install MetaMask
- Install the MetaMask Chrome extension. Set up your account. In the top left corner of the Chrome Extension, change the Network to "localhost:85XX".

# Designs and Wireframes
See [wireframes](/wireframes) if you'd like to see the designs and wireframes which are implemented in the crx.

# Development Guide
The project is in written in typescript, so it's recommended to use vscode or some other typescript compatible editor that takes advantage of the types (e.g. webstorm). If you use vscode, use the workspace settings by setting the workspace to the root of this repo. If you do not use vscode, be aware that you should make sure to import the tslint settings another way (see `tslint.json`).

```
$ git clone https://github.com/streamproject/stream-chrome
$ cd stream-chrome/
$ code .
```

In addition, we chose to use yarn over npm, so make sure not to use commands like `npm install` or `npm run watch`, but instead `yarn add` or `yarn run watch`. There is only a `yarn.lock` and not a `package-lock.json` included in this repo so npm may install incorrect package versions.

## Basic Architecture
The product repository consists of four main pieces:
* [backend](/product/backend) - Although our extension is a dApp, there are pieces which require a centralized backend. This includes interacting with youtube/twitch, holding funds in escrow, and other functions that are simply easier done in a centralized manner until dApp related infrastructure is more mature.
* [crx](/product/crx) - This contains the code for the chrome extension itself
* [shared](/product/shared) - Shared typescript models between the crx and the backend
* [smart-contracts](/product/smart-contracts) - The smart-contracts for STR (stream tokens)

## Making Changes
Unfortunately, there are some additional steps required in the certain cases listed below.

### Adding a node module to backend
After adding the package, run `reset-packages.sh` so that docker swarm will update its volumes

### Making modifications to node_modules in crx
For instance, any time you run `yarn install`. Until [redux-segment](https://github.com/rangle/redux-segment) releases a new version with https://github.com/rangle/redux-segment/pull/113, you will need to run `crx/fix-redux-segment.sh` after installing packages to crX

### Modifying `shared`
Run `reset-packages.sh` so that crx and backend use the latest build of shared

### Updating Table Schemas
If you would like to update the table schemas, do so in [init.sql](/product/docker-entrypoint-initdb.d/init.sql). After this, run `reset-db.sh`.

```
cd product/
./reset-db.sh
```

This will delete your current postgres tables and generate new table typescript definitions in `shared`. Therefore, like with other changes in shared, we will need to then update `backend` and `crx` appropriately. The table typescript definitions are generated via [schemats](https://github.com/sweetiq/schemats)

## Debugging
### CRX
- To debug background scripts, open `background.html` via `chrome://extensions/`
- To debug popup scripts etc., go to `chrome-extension://[crx-ID]/popup.html` where `[crx-ID]` is the crx ID found at `chrome://extensions/`
- To see changes to the redux store, run `yarn run remotedev` in a new terminal in the crx package, and navigate to `http://localhost:8000`

### Backend
- Navigate to `chrome://inspect/#devices`. You should see a link labeled "Open dedicated DevTools for Node". This will allow you to use the chrome debug tools for changes to the backend.

# Troubleshooting
 - (This step might not be necessary: ADD "127.0.0.1 lvh.me" to /etc/hosts)

### Docker or yarn isn't installed
 - Install homebrew if necessary (`ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`).
 - `brew install yarn`
 - Install Docker from the Docker website. Open docker to set it up.

### Nuclear option
If you are running into issues when you `docker-compose up` or `yarn watch` and you think it's not your fault, run `cd product/ && ./reset-packages.sh` to fix most problems. The other `product/reset-*.sh` scripts should fix all of the other problems. Hopefully.

### Linux notes
- If you're running into trouble getting the backend to run using `cd product/ && docker-compose up`, check if postgres is running locally. If it does, use `pkill -u postgres` to stop all instances. Another possible fix is to delete `product/.postgres_data` and then running `docker-compose up` again.
- Errors raised by files not being found might be caused by OSX not being case-sensitive as opposed to Linux.
- Might not be linux-only, but sometimes reconnecting MetaMask to the Localhost network solves a problem where the CRX isn't working correctly.

