import * as express from "express"
import * as bodyParser from "body-parser"
import { config } from "dotenv"
import * as morgan from "morgan"

import FabricService from "./services/FabricService"
import RequestValidationService from "./services/RequestValidationService"

config()

const PORT = process.env.PORT || 3030
const TOKEN = process.env.APP_TOKEN
const CHANNEL_NAMES = process.env.CHANNEL_NAMES.split(",")
const CHAINCODE_NAMES = process.env.CHAINCODE_NAMES.split(",")
const READ_METHODS = process.env.READ_METHODS.split(",")
const WRITE_METHODS = process.env.WRITE_METHODS.split(",")

const app = express()
const validation = new RequestValidationService(
  CHANNEL_NAMES,
  CHAINCODE_NAMES,
  READ_METHODS,
  WRITE_METHODS)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("combined"))
app.use(validation.withToken(TOKEN).validateToken)
app.use(validation.validateChaincodeRequest)

const fabricService = new FabricService(
  process.env.WALLET_PATH,
  process.env.CONNECTION_JSON_PATH)
fabricService.withUser(process.env.USER_USERNAME)


app.post("/api/v1/:channel_name/:chaincode_name/:chaincode_method",
    (req, res) => {

  try {
    fabricService
      .withChannel(req.params.channel_name)
      .withContract(req.params.chaincode_name)
      .submit(req.params.chaincode_method, req.body).then(() => {
        res.send({status: "ok"})
    })
  } catch (error) {
    res.status(400).send(error)
  }
})

app.get("/api/v1/:channel_name/:chaincode_name/:chaincode_method",
    (req, res) => {
  try {
    fabricService
      .withChannel(req.params.channel_name)
      .withContract(req.params.chaincode_name)
      .evaluate(req.params.chaincode_method).then((data) => {
        res.send({status: "ok", data: JSON.parse(data)})
    })
  } catch (error) {
    res.status(400).send(error)
  }
})

app.listen(PORT, () => {
  console.log("Server listening in port " + PORT)
})
