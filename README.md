# Fabric Node Proxy

The framework we're using the most for Blockchain implementations is [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.3/).

The documentation in their site is not bad, but it's not very thorough,
it's important to get concepts clear on the [Buiding your First Network](https://hyperledger-fabric.readthedocs.io/en/release-1.3/build_network.html)
and [Writing your first application](https://hyperledger-fabric.readthedocs.io/en/release-1.3/write_first_app.html) tutorials.

## Components

![](https://user-images.githubusercontent.com/488556/50635972-a156ca80-0f54-11e9-98af-777943e6048e.png)

In TNP we use several components to simplify how we develop smart contracts and its deployment and configuration.

![](https://media.giphy.com/media/xTk9ZXHUMwunBN3efe/giphy.gif)

## IBM Blockchain

IBM Blockchain is our `server`, it deploys easily a Hyperledger Fabric server we can use to deploy our smart contracts.

We use Go as the language for the smart contracts because the mocks for the unit and integration tests are mature, and testing
manually smart contracts is slow and tedious.

## Proxy

Fabric client SDKs are under heavy development and currently the Node SDK is the most mature. We might use the Python SDK in the future but It doesn't work well right now.

Since we have many backend code written in Python and we need to connect and execute
smart contract functions from there, we decided to create a proxy in Node for Fabric so we have a Rest API to access from any other backend,
so we don't need to take into account in which language we write our backend, but just create an API HTTP client to execute functions on an specific smart contract.

## Project implementation

We'll need to create a request to the Fabric proxy every time we want to send data to the smart contract.

## How to implement in a project

There are three steps to implement a solution with Hyperledger Fabric.

## Create the organizations and the channel where the smart contract is gonna execute

Only organizations in the channel will be able to use the smart contract deployed there. Assets data saved in this channel isn't
available in other channels.

![](https://user-images.githubusercontent.com/488556/50636289-cbf55300-0f55-11e9-81a7-7454f974af58.png)

![](https://user-images.githubusercontent.com/488556/50636290-cbf55300-0f55-11e9-87ca-686a4acedd7a.png)

## Create the smart contract (chaincode for Hyperledger Fabric)

To give our project Blockchain powers we'll need to implement one (or maybe more) smart contracts.

[You have an example in the Odos repository](https://github.com/TheNeonProject/odos/tree/master/chaincode).

You should follow the same structure so you can also implement the tests and run everything using Docker. The idea would be to do something like:

Create the `chaincode` dir in your project. Inside this folder, we'll create the `Dockerfile` and a dir called `ngo`. ngo dir will have smart contract code (`ngo.go`) and its tests (`ngo_test.go`)

```bash
mkdir chaincode
cd chaincode
mkdir ngo
touch ngo/ngo.go
touch ngo/ngo_test.go
touch Dockerfile
```

Copy the Dockerfile content from [Odos repository example](https://github.com/TheNeonProject/odos/blob/master/chaincode/Dockerfile) in your Dockerfile

Now, build the docker image:

```bash
docker build -t project-chaincode .
```

To run the tests:

```bash
docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app/project project-chaincode
```

## HTTP client in the project

Every project connecting to the Fabric proxy will need a service implementing the POST to the Fabric proxy with its specific smart contract
and methods. [An example can be seen in the Odos project](https://github.com/TheNeonProject/odos/blob/master/refugees/services.py#L13)

The `POST` looks like this:

```curl
POST {host}/api/v1/{chaincode_name}/{chaincode_method}/{resource_id}?token={token}
Content-type: application/json

body
```

## CI/CD

You can see [a working example in the Odos project](https://github.com/TheNeonProject/odos/blob/master/.gitlab-ci.yml).

The two phases would be something like this:

```yaml
build:chaincode:
image: golang:1.10
script:
- go get -v -u github.com/hyperledger/fabric-sdk-go
- go get -v -u github.com/stretchr/testify/assert
- mkdir -p $GOPATH/src/gitlab.com/TheNeonProject/myproject
- cp -r /builds/TheNeonProject/myproject/chaincode/myproject/* $GOPATH/src/gitlab.com/TheNeonProject/myproject

# Build hyperledger fabric
- apt-get update && apt-get install -y libltdl-dev
- mkdir -p $GOPATH/src/github.com/hyperledger
- cd $GOPATH/src/github.com/hyperledger
- git clone -b master https://github.com/hyperledger/fabric.git

- cd $GOPATH/src/gitlab.com/TheNeonProject/myproject
- go test -v .

chaincode_staging:
type: deploy
script:
- "curl -X POST https://$NETWORK_KEY:$NETWORK_PASS@blockchain-starter.eu-gb.bluemix.net/api/v1/networks/$NETWORK_ID/chaincode/install -H 'accept: application/json' -H 'Content-Type: multipart/form-data' -F 'files=@chaincode/myproject/myproject.go' -F 'chaincode_id=myproject' -F \"chaincode_version=$CI_COMMIT_SHA\" -F 'chaincode_type=golang'"
- "curl -X POST https://$NETWORK_KEY:$NETWORK_PASS@blockchain-starter.eu-gb.bluemix.net/api/v1/networks/$NETWORK_ID/channels/$STAGING_CHANNEL_ID/chaincode/instantiate -H 'accept: application/json' -H 'Content-Type: application/json' --data '{ \"chaincode_id\": \"myproject\", \"chaincode_version\": \"'\"$CI_COMMIT_SHA\"'\", \"chaincode_type\": \"golang\", \"chaincode_arguments\": [], \"endorsement_policy\": { \"identities\": [ { \"role\": { \"name\": \"member\", \"mspId\": \"org1\" } }, { \"role\": { \"name\": \"member\", \"mspId\": \"org2\" } } ], \"policy\": { \"1-of\": [ { \"signed-by\": 0 }, { \"signed-by\": 1 } ] } }}'"
- "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"Deploy Myproject Chaincode completed in IBM Blockchain Staging :cryptoparrot:, last commit:\"}' $SLACK_WEBHOOK_URL"
- "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"'\"$CI_COMMIT_TITLE\"'\"}' $SLACK_WEBHOOK_URL"
only:
- master

chaincode_production:
type: deploy
script:
- "curl -X POST https://$NETWORK_KEY:$NETWORK_PASS@blockchain-starter.eu-gb.bluemix.net/api/v1/networks/$NETWORK_ID/chaincode/install -H 'accept: application/json' -H 'Content-Type: multipart/form-data' -F 'files=@chaincode/myproject/myproject.go' -F 'chaincode_id=myproject' -F \"chaincode_version=$CI_COMMIT_TAG\" -F 'chaincode_type=golang'"
- "curl -X POST https://$NETWORK_KEY:$NETWORK_PASS@blockchain-starter.eu-gb.bluemix.net/api/v1/networks/$NETWORK_ID/channels/$CHANNEL_ID/chaincode/instantiate -H 'accept: application/json' -H 'Content-Type: application/json' --data '{ \"chaincode_id\": \"myproject\", \"chaincode_version\": \"'\"$CI_COMMIT_TAG\"'\", \"chaincode_type\": \"golang\", \"chaincode_arguments\": [], \"endorsement_policy\": { \"identities\": [ { \"role\": { \"name\": \"member\", \"mspId\": \"org1\" } }, { \"role\": { \"name\": \"member\", \"mspId\": \"org2\" } } ], \"policy\": { \"1-of\": [ { \"signed-by\": 0 }, { \"signed-by\": 1 } ] } }}'"
- "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"Deploy Myproject Chaincode completed in IBM Blockchain Production :cryptoparrot:, last commit:\"}' $SLACK_WEBHOOK_URL"
- "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"'\"$CI_COMMIT_TITLE\"'\"}' $SLACK_WEBHOOK_URL"
only:
- tags
```

Next variables have to be added to Gitlab CI project:

- `$NETWORK_ID` (required): `network_id` in IBM Network credentials
- `$NETWORK_KEY` (required): `key` in IBM Network credentials
- `$NETWORK_PASS` (required): `secret` in IBM Network credentials
- `$CHANNEL_ID` (required): the is the name we added when we created the channel for this project (`defaultchannel` by default)
- `$SLACK_WEBHOOK_URL` (optional): to send messages to Slack channels

![](https://user-images.githubusercontent.com/488556/50650717-8e0e2400-0f81-11e9-90dc-9668735b9225.png)

## Config to generate certificates

This part of the configuration is a bit cumbersome, so take a coffe and read carefully, we'll dive into it step by step 😎

If you haven't do it yet, clone the [fabric proxy repository](https://github.com/TheNeonProject/fabric-node-proxy) in your local machine and `cd` in it, we'll just work on it now.

The config to generate the certificates has to be downloaded from IBM Blockchain, and added to the root
of the repository as `creds.json`.

![](https://user-images.githubusercontent.com/488556/50650776-bb5ad200-0f81-11e9-8212-f80b2126cfc0.png)

Add this json to the proxy configuration in Heroku using the `FABRIC_CREDS` envvar.

## Config to query from Fabric node proxy

Now we'll work in the config to perform queries to the chaincode/smart contract.

- Start with `npm install` to install all dependencies. If you got an error installing grpc@1.14.2 try with `npm install --build-from-source`
- Create an .env file in the repository with a key called `FABRIC_USERNAME`. The value of this key will be an username that doesn't already exist in the IBM dahboard. If the blockchain is new, there'll be only to users, `admin` and `peer1`.
- Execute `enrollAdmin` with the command `./node_modules/.bin/babel-node enrollAdmin.js` to enroll admin user
- Add `registerUser.js require('dotenv').config();` at top of `registerUser.js` file to be able to execute next command, `./node_modules/.bin/babel-node registerUser.js` that will enroll the user you set in the `FABRIC_USERNAME` var in the `.env` file
- If everything is executed without problems, lets create the json that will contain all users info and its certificates. Create a new json, for example `certs.json` This will consist in a composition of the generated users and certificates for the client. Go to `hfc-key-store` dir and merge merge all those files into a json. The json will consist in:

```json
[
  {
    "name": "admin",
    "mspid": "Org1MSP",
    "roles": null,
    "affiliation": "",
    "enrollmentSecret": "",
    "enrollment": {
      "signingIdentity": "0cf19acace3478ba452ad21c3046e238a830b0690ac",
      "identity": {
        "certificate": "..."
      }
    },
    "keys": {
      "private": "Private key <signingIdentity-priv> file content",
      "public": "Public key <signingIdentity-pub> file content"
    }
  },
  {
    "name": "user1",
    "mspid": "Org1MSP",
    "roles": null,
    "affiliation": "",
    "enrollmentSecret": "",
    "enrollment": {
      "signingIdentity": "9b7fc81cd01bcb15d4ab61368c82f14fa0107ae71",
      "identity": {
        "certificate": "..."
      }
    },
    "keys": {
      "private": "Private key <signingIdentity-priv> file content",
      "public": "Public key <signingIdentity-pub> file content"
    }
  },
  {
    "name": "user2",
    "mspid": "org1",
    "roles": null,
    "affiliation": "",
    "enrollmentSecret": "",
    "enrollment": {
      "signingIdentity": "2e33bc2c84fb78ce987488d7773b22b79ae55e2453",
      "identity": {
        "certificate": ""
      }
    },
    "keys": {
      "private": "Private key <signingIdentity-priv> file content",
      "public": "Public key <signingIdentity-pub> file content"
    }
  }
]
```

Once the json is created, add it to Heroku project as `FABRIC_CERTS` envvar.

Let's Blockchain! Hiii Yaaa!

![](https://media.giphy.com/media/WgO4GFYzIgYHY55frA/giphy.gif)
