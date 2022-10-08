# Verified Wallet

![Language](https://img.shields.io/badge/language-Javascript-blue)
[![LICENSE](https://img.shields.io/github/license/verified-network/verified-payments)](LICENSE)
![Status](https://img.shields.io/badge/status-unstable-red)
[![Website](https://img.shields.io/website?down_color=lightgrey&down_message=offline&up_color=blue&up_message=online&url=https://www.verified.network/)](https://www.verified.network/)
<!-- [![GitHub Issues](https://img.shields.io/github/issues/verified-network/verified-payments)](https://github.com/verified-network/verified-payments/issues) -->
<!-- ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/verified-network/verified-payments) -->
<!-- ![Sonar Quality Gate](https://img.shields.io/sonar/:metric/:component?server=https%3A%2F%2Fsonarcloud.io&sonarVersion=4.2) -->

> This is a decentralized application (DAPP) on the ethereum network for investors and issuers.

## Contact

- Report bugs, issues or feature requests using [GitHub issues](https://github.com/verified-network/verified-wallet/issues/new).

## Install

### Building from the source

#### Get the source code

Git and Github are used to maintain the source code. Clone the repository by:

```shell
git clone https://github.com/verified-network/verified-wallet.git

cd verified-wallet/src
```

#### Install Nodejs 

Install nodejs and node package manager (npm).


#### Build

Run 
```shell 
npm install 
```
to install dependencies.

Run 
```shell 
npm start 
```
to start the node server

Go to http://localhost:8080 to use application

#### Host on Firebase

Run 
```shell 
npm run dist 
```
to copy build to dist folder.

Run 
```shell
$> firebase login
$> firebase init 
$> firebase deploy 
```
to log into firebase (only if not done earlier), initializing firebase project (only if firebase.json does not exist in project root), and deploying to firebase (always to be done with new builds)