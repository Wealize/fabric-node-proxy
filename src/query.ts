import FabricService from "./services/FabricService"


async function main() {
    const service = new FabricService(
        process.env.WALLET_PATH,
        process.env.CONNECTION_JSON_PATH)
    service
        .withUser("user1")
        .withChannel("channel1")
        .withContract("fabcar")
        .evaluate("queryAllCars")
}

main()
