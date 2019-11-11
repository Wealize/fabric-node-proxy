import express from "express"
import bodyParser from "body-parser"
// import FabricService from "./services/FabricService"
import { config } from "dotenv"
import morgan from "morgan"

config()

const app = express()
const PORT = process.env.PORT || 3030
const TOKEN = process.env.APP_TOKEN

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("combined"))

// const fabricService = new FabricService()


// app.post("/api/v1/:chaincode_name/:chaincode_method/:instance_id",
//     (req, res) => {

//     if (req.query.token != TOKEN) {
//         res.status(401).send({error: "Forbidden"})
//         return
//     }

//     const payload = fabricService.serialize(req.body, req.params.instance_id)
//     const response = fabricService.call(
//         req.params.chaincode_name,
//         req.params.chaincode_method,
//         payload)

//     response.then((response: any) => {
//         return response
//     }).then((data) => {
//         res.send({status: "ok", data})
//     }).catch((error) => {
//         res.status(400).send(error)
//     })
// })


// app.post("/api/v1/:chaincode_name/:chaincode_method", (req, res) => {

//     if (req.query.token !== TOKEN) {
//         res.status(401).send({error: "Forbidden"})
//         return
//     }

//     const payload = fabricService.serialize(req.body)
//     const response = fabricService.call(
//         req.params.chaincode_name,
//         req.params.chaincode_method,
//         payload)

//     response.then((response: any) => {
//         // TODO if response is not valid do something
//         return response.json()
//     }).then((data) => {
//         res.send({status: "ok", data})
//     }).catch((error) => {
//         res.status(400).send(error)
//     })
// })

app.listen(PORT, () => {
	console.log("Server listening in port " + PORT)
})
