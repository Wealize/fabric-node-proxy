import * as express from "express"
import * as bodyParser from "body-parser"
import { config } from "dotenv"
import * as morgan from "morgan"

import FabricService from "./services/FabricService"

config()

const PORT = process.env.PORT || 3030
const TOKEN = process.env.APP_TOKEN

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("combined"))

app.use((request, response, next) => {
  if (request.query.token !== TOKEN) {
    response.status(401).send({error: "Forbidden"})
    return
  }

  next()
})

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
