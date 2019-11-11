/*
 * SPDX-License-Identifier: Apache-2.0
 */

import * as FabricCAServices from "fabric-ca-client"
import { FileSystemWallet, X509WalletMixin } from "fabric-network"
import * as fs from "fs"
import * as path from "path"

const ccpPath = path.resolve(process.cwd(), process.env.CONNECTION_JSON_PATH)
const ccpJSON = fs.readFileSync(ccpPath, "utf8")
const ccp = JSON.parse(ccpJSON)

async function main() {
    try {
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
            console.log("You need to set the ADMIN_USERNAME and ADMIN_PASSWORD envvars")
            return
        }

        const adminUsername = process.env.ADMIN_USERNAME
        const adminPassword = process.env.ADMIN_PASSWORD

        const caInfo = ccp.certificateAuthorities[
            ccp.organizations.Org1.certificateAuthorities[0]]
        const caTLSCACerts = caInfo.tlsCACerts.pem
        const ca = new FabricCAServices(
            caInfo.url,
            { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

        const walletPath = path.join(process.cwd(), "wallet")
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(adminUsername)
        if (adminExists) {
            console.log(`An identity for the admin user "${adminUsername}" already exists in the wallet`)
            return
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll(
            { enrollmentID: adminUsername,
              enrollmentSecret: adminPassword })
        const identity = X509WalletMixin.createIdentity(
            ccp.organizations.Org1.mspid,
            enrollment.certificate,
            enrollment.key.toBytes())
        await wallet.import(adminUsername, identity)
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet')

    } catch (error) {
        console.error(
            `Failed to enroll admin user "${process.env.ADMIN_USERNAME}": ${error}`)
        process.exit(1)
    }
}

main()
