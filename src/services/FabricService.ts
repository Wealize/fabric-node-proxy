import path from "path"

import { FileSystemWallet, Gateway, X509WalletMixin, Contract } from "fabric-network"


const DEFAULT_CHANNEL = process.env.FABRIC_CHANNEL
const DEFAULT_ORGANIZATION_PEER =
  process.env.DEFAULT_ORGANIZATION || "org1-peer1"
const DEFAULT_USER = process.env.FABRIC_USER || "user1"

export default class FabricService {
  private wallet: FileSystemWallet
  private connectionPath: string
  private username: string

  constructor(username: string) {
      this.connectionPath = this.loadConnectionData(process.env.CONNECTION_JSON_PATH)
      this.wallet = this.loadWallet()
      this.username = username
  }

  public async evaluateTransaction(
      chaincodeName: string, channelName: string, chaincodeMethod: string,
  ): string {
      try {
        const contract = this.loadContract(
            chaincodeName, channelName, chaincodeMethod)
        const result = await contract.evaluateTransaction(chaincodeMethod)
        return result.toString()
      } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        process.exit(1)
      }
  }

  public async submitTransaction(
      chaincodeName: string, channelName: string, chaincodeMethod: string,
  ): string {
      try {
        const contract = this.loadContract(
            chaincodeName, channelName, chaincodeMethod)
        const result = await contract.submitTransaction(
            chaincodeMethod, chaincodeArguments)
        return result.toString()
      } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        process.exit(1)
      }
  }

  private async loadContract(
      chaincodeName: string, channelName: string, chaincodeMethod: string,
  ): Promise<Contract> {
      // FABRIC does a Pokemon here, we'll need to test it more
      // to know which of these can throw an error
      try {
        const gateway = new Gateway()
        const wallet = this.wallet
        const username = this.username

        await gateway.connect(
            this.connectionPath,
            { wallet,
              identity: username,
              discovery: { enabled: true, asLocalhost: true },
            })

        const network = await gateway.getNetwork(channelName)
        return network.getContract(chaincodeName)
      } catch (error) {
        console.error(`Error in loadContract: ${error}`)
        process.exit(1)
      }
  }

  private loadConnectionData(filepath: string): string {
    return path.resolve(process.cwd(), filepath)
  }

  private loadWallet() {
    const walletPath = path.join(process.cwd(), "wallet")
    const wallet = new FileSystemWallet(walletPath)
    return wallet
  }

  private async userExists(username: string): Promise<boolean> {
    return this.wallet.exists(username)
  }
}
