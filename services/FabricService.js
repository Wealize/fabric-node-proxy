var creds = require('../creds.json')
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');

const DEFAULT_CHANNEL = process.env.FABRIC_CHANNEL;
const DEFAULT_ORGANIZATION_PEER = 'org1-peer1'


export default class FabricService{
    constructor() {
        this.fabric_client = new Fabric_Client();
        this.channel = this.fabric_client.newChannel(DEFAULT_CHANNEL);
        this.peer = this.fabric_client.newPeer(
            creds.peers[DEFAULT_ORGANIZATION_PEER].url,
            {
                pem: creds.peers[DEFAULT_ORGANIZATION_PEER].tlsCACerts.pem,
                'ssl-target-name-override': null
            }
        );
        this.order = this.fabric_client.newOrderer(
            creds.orderers.orderer.url,
            {
                pem: creds.orderers.orderer.tlsCACerts.pem,
                'ssl-target-name-override': null
            }
        );
        this.member_user = null;
        this.store_path = path.join(__dirname, '../hfc-key-store');

        this.tx_id = null;
        this.setUpChannel();
    }

    serialize(data, instance_id) {
        if (instance_id) {
            return [String(instance_id), JSON.stringify(data)];
        }

        return [JSON.stringify(data)];
    }

    call(chaincode_name, chaincode_method, data) {
        return Fabric_Client.newDefaultKeyValueStore({ path: this.store_path

        }).then((state_store) => {
           return this.prepareContext(state_store);
        }).then((user_from_store) => {
            this.checkEnroll(user_from_store);
            return this.makeTransaction(chaincode_name, chaincode_method, data);
        }).then((results) => {
            var proposalResponses = results[0];
            var proposal = results[1];
            var response = proposalResponses[0].response;
            var isValidStatus = proposalResponses && response && response.status === 200;

            if (isValidStatus) {
                    console.log(util.format(
                        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                        response.status, response.message));
                    return this.registerEvent(proposalResponses, proposal);
                }
        }).then((results) => {
            var response = results[0];

            if (results && response && response.status != 'SUCCESS')
                throw new Error('Failed to order the transaction. Error code: ' + response.status);

            if(results && results[1] && results[1].event_status === 'VALID')
                return results;
            else
                throw new Error('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
        }).catch((err) => {
            throw new Error('Failed to invoke successfully :: ' + err);
        });
    }

    setUpChannel() {
        this.channel.addOrderer(this.order);
        this.channel.addPeer(this.peer);
    }

    prepareContext(state_store) {
        this.fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        var crypto_store = Fabric_Client.newCryptoKeyStore({path: this.store_path});
        crypto_suite.setCryptoKeyStore(crypto_store);
        this.fabric_client.setCryptoSuite(crypto_suite);
        return this.fabric_client.getUserContext('javaguirre', true);
    }

    checkEnroll(user_from_store) {
        if (user_from_store && user_from_store.isEnrolled())
            this.member_user = user_from_store;
        else
            throw new Error('Failed to get user1.... run registerUser.js');
    }

    makeTransaction(chaincode_name, chaincode_method, data) {

        this.tx_id = this.fabric_client.newTransactionID();
        var request = {
            chaincodeId: chaincode_name,
            fcn: chaincode_method,
            args: data,
            chainId: DEFAULT_CHANNEL,
            txId: this.tx_id
        };

        return this.channel.sendTransactionProposal(request);
    }

    registerEvent(proposalResponses, proposal){
        var request = {
            proposalResponses: proposalResponses,
            proposal: proposal
        };
        var transaction_id_string = this.tx_id.getTransactionID();
        var sendPromise = this.channel.sendTransaction(request);
        var promises = [];
        promises.push(sendPromise);
        let event_hub = this.channel.newChannelEventHub();
        let txPromise = new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                event_hub.unregisterTxEvent(transaction_id_string);
                event_hub.disconnect();
                resolve({event_status : 'TIMEOUT'});
            }, 3000);
            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                clearTimeout(handle);
                resolve({event_status : code, tx_id : transaction_id_string})
            }, (err) => {
                reject(new Error('There was a problem with the eventhub ::'+err));
            },
                {disconnect: true}
            );
            event_hub.connect();
        });
        promises.push(txPromise);
        return Promise.all(promises);
    }

}