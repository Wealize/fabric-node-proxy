import app from "./app"

const PORT = parseInt(process.env.PORT, 10) || 3030
const HOST = process.env.HOST || "0.0.0.0"

app.listen(PORT, HOST, () => {
  console.log("Server listening in port " + PORT)
})
