import * as request from "supertest"

import app from "../app"

describe("GET chaincode", () => {
  it("Get index should be forbidden if not token", async () => {
    const res = await request(app)
      .get("/")
      .send()
    expect(res.statusCode).toEqual(401)
  })

  it("Get index should be bad request if token without chaincode parameters", async () => {
    const res = await request(app)
      .get("/?token=token")
      .send()
    expect(res.statusCode).toEqual(400)
  })
})
