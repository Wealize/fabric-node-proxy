/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from "fs"
import * as path from "path"

import * as FabricCAServices from "fabric-ca-client"
import { FileSystemWallet, X509WalletMixin } from "fabric-network"


async function main() {
    if (!process.env.USER_USERNAME) {
        console.log("You need to set the ADMIN_USERNAME, USER_USERNAME and ADMIN_PASSWORD envvars")
        return
    }

    const userUsername = process.env.USER_USERNAME

    try {

        const ccpPath = path.resolve(
            process.cwd(),
            process.env.CONNECTION_JSON_PATH)
        const ccpJSON = fs.readFileSync(ccpPath, "utf8")
        const ccp = JSON.parse(ccpJSON)

        const caURL = ccp.certificateAuthorities[
            process.env.CERTIFICATE_AUTHORITY_KEY
        ].url
        const ca = new FabricCAServices(caURL)

        const walletPath = path.join(process.cwd(), process.env.WALLET_PATH)
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        const userExists = await wallet.exists(userUsername)
        if (userExists) {
          console.log(`An identity for "${userUsername}" already exists in the wallet`)
          return
        }

        const enrollment = await ca.enroll(
            { enrollmentID: process.env.ADMIN_USERNAME,
              enrollmentSecret: process.env.ADMIN_PASSWORD })
        const identity = X509WalletMixin.createIdentity(
            process.env.ENROLL_MSPID,
            enrollment.certificate,
            enrollment.key.toBytes())
        await wallet.import(userUsername, identity)
        console.log(`Successfully enrolled client "${userUsername}" and imported it into the wallet`)
    } catch (error) {
        console.error(`Failed to register user "${userUsername}": ${error}`)
        process.exit(1)
    }
}

main()
