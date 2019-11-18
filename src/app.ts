import * as express from "express"
import * as bodyParser from "body-parser"
import { config } from "dotenv"
import * as morgan from "morgan"

import FabricService from "./services/FabricService"
import RequestValidationService from "./services/RequestValidationService"

config()

const TOKEN = process.env.APP_TOKEN
const CHANNEL_NAMES = process.env.CHANNEL_NAMES ?
  process.env.CHANNEL_NAMES.split(",") : []
const CHAINCODE_NAMES = process.env.CHAINCODE_NAMES ?
  process.env.CHAINCODE_NAMES.split(",") : []
const READ_METHODS = process.env.READ_METHODS ?
  process.env.READ_METHODS.split(",") : []
const WRITE_METHODS = process.env.WRITE_METHODS ?
  process.env.WRITE_METHODS.split(",") : []
const WALLET_PATH = process.env.WALLET_PATH || "wallet"
const CONNECTION_JSON_PATH = process.env.CONNECTION_PATH || "connection.json"
const USER_USERNAME = process.env.USER_USERNAME || "test"

const BASE_ROUTE = "/api/v1/:channel_name/:chaincode_name/:chaincode_method"

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
  WALLET_PATH,
  CONNECTION_JSON_PATH)
fabricService.withUser(USER_USERNAME)


app.post(BASE_ROUTE, (req, res) => {
  try {
    fabricService
      .withChannel(req.params.channel_name)
      .withContract(req.params.chaincode_name)
      .submit(req.params.chaincode_method, req.body).then(() => {
        res.send({status: "ok"})
    })
  } catch (error) {
    res.status(400).send({status: "error", message: error})
  }
})

app.get(BASE_ROUTE, (req, res) => {
  try {
    fabricService
      .withChannel(req.params.channel_name)
      .withContract(req.params.chaincode_name)
      .evaluate(req.params.chaincode_method).then((data) => {
        res.send({status: "ok", data: JSON.parse(data)})
    })
  } catch (error) {
    res.status(400).send({status: "error", message: error})
  }
})

export default app
