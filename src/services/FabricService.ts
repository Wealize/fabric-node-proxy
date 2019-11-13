import * as path from "path"

import { FileSystemWallet, Gateway } from "fabric-network"

export default class FabricService {
  private connectionPath: string
  private wallet: FileSystemWallet
  private gateway: Gateway
  private username: string
  private channelName: string
  private contractName: string

  constructor(walletPath: string, connectionJsonPath: string) {
    this.wallet = this.loadWallet(walletPath)
    this.connectionPath = path.resolve(
        process.cwd(), connectionJsonPath)
  }

  public withUser(username: string) {
      this.username = username
      return this
  }

  public withChannel(channelName: string) {
      this.channelName = channelName
      return this
  }

  public withContract(contractName: string) {
      this.contractName = contractName
      return this
  }

  public async evaluate(method: string): Promise<string> {
    try {
        await this.connectGateway()
        const network = await this.gateway.getNetwork(this.channelName)
        const contract = network.getContract(this.contractName)
        const result = await contract.evaluateTransaction(method)
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`)
        return result.toString()
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        process.exit(1)
    }
  }

  public async submit(method: string, methodArguments: string[]): Promise<void> {
    try {
        await this.connectGateway()
        const network = await this.gateway.getNetwork(this.channelName)
        const contract = network.getContract(this.contractName)
        await contract.submitTransaction(method, ...methodArguments)
        console.error("Transaction successful")
        await this.gateway.disconnect()
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        process.exit(1)
    }
  }

  private loadWallet(walletPath: string): FileSystemWallet {
    const wallet = new FileSystemWallet(path.join(process.cwd(), walletPath))
    return wallet
  }

  private async connectGateway(): Promise<void> {
        this.gateway = new Gateway()
        const wallet = this.wallet
        const username = this.username
        await this.gateway.connect(
            this.connectionPath,
            { wallet,
              identity: username,
              discovery: { enabled: true, asLocalhost: false } })
  }
}
