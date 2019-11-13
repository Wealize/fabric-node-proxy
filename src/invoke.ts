import FabricService from "./services/FabricService"

async function main() {
    if (!process.env.USER_USERNAME) {
        console.log("You need to set the ADMIN_USERNAME, USER_USERNAME and ADMIN_PASSWORD envvars")
        return
    }

    const service = new FabricService(
        process.env.WALLET_PATH,
        process.env.CONNECTION_JSON_PATH)
    service
        .withUser("user1")
        .withChannel("channel1")
        .withContract("fabcar")
        .submit("createCar", ["CAR13", "Honda", "Accord", "Black", "Tom"])
}

main()
