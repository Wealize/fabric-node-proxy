/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileSystemWallet, Gateway } from "fabric-network"
import * as path from "path"

const ccpPath = path.resolve(process.cwd(), process.env.CONNECTION_JSON_PATH)

async function main() {
    try {
        if (!process.env.ADMIN_USERNAME || !process.env.USER_USERNAME || !process.env.USER_PASSWORD) {
            console.log("You need to set the ADMIN_USERNAME, USER_USERNAME and ADMIN_PASSWORD envvars")
            return
        }

        const userUsername = process.env.USER_USERNAME

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet")
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userUsername)
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet')
            console.log("Run the registerUser.ts application before retrying")
            return
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway()
        await gateway.connect(
            ccpPath,
            { wallet,
              identity: userUsername,
              discovery: { enabled: true, asLocalhost: true } })

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel")

        // Get the contract from the network.
        const contract = network.getContract("fabcar")

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        await contract.submitTransaction("createCar", "CAR12", "Honda", "Accord", "Black", "Tom")
        console.log(`Transaction has been submitted`)

        // Disconnect from the gateway.
        await gateway.disconnect()

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`)
        process.exit(1)
    }
}

main()
