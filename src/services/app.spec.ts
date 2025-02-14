import * as request from "supertest"

import app from "../app"

describe("GET chaincode", () => {
  it("Get index should be forbidden if not token", async () => {
    const res = await request(app)
      .get("/")
      .send()

    expect(res.statusCode).toEqual(401)
  })

  it("Get index should be not found if token without chaincode parameters", async () => {
    const res = await request(app)
      .get("/?token=token")
      .send()

    expect(res.statusCode).toEqual(404)
  })

  it("Get chaincode method should be bad request if no token", async () => {
    const res = await request(app)
      .get("/api/v1/test/chaincode/hello")
      .send()

    expect(res.statusCode).toEqual(401)
  })

  it("Get chaincode method should be bad request if invalid channel", async () => {
    const res = await request(app)
      .get("/api/v1/bad/chaincode/readChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  it("Get chaincode method should be bad request if invalid chaincode", async () => {
    const res = await request(app)
      .get("/api/v1/test/bad/readChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  it("Get chaincode method should be bad request if invalid read method", async () => {
    const res = await request(app)
      .post("/api/v1/test/bad/writeChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  // TODO haven't figure it out yet
  // it("Get chaincode method should be ok if all valid", async () => {
  //   const mockedFabricService = FabricService as jest.Mock<FabricService>
  //   mockedFabricService.mockImplementation()

  //   const res = await request(app)
  //     .get("/api/v1/test/chaincode/readChaincode?token=token")
  //     .send()

  //   expect(res.statusCode).toEqual(200)
  // })
})

describe("POST chaincode", () => {
  it("Post index should be forbidden if not token", async () => {
    const res = await request(app)
      .post("/")
      .send()

    expect(res.statusCode).toEqual(401)
  })

  it("Post index should be not found if token without chaincode parameters", async () => {
    const res = await request(app)
      .post("/?token=token")
      .send()

    expect(res.statusCode).toEqual(404)
  })

  it("Post chaincode method should be bad request if no token", async () => {
    const res = await request(app)
      .post("/api/v1/test/chaincode/hello")
      .send()

    expect(res.statusCode).toEqual(401)
  })

  it("Post chaincode method should be bad request if invalid channel", async () => {
    const res = await request(app)
      .post("/api/v1/bad/chaincode/readChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  it("Post chaincode method should be bad request if invalid chaincode", async () => {
    const res = await request(app)
      .post("/api/v1/test/bad/readChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  it("Post chaincode method should be bad request if invalid write method", async () => {
    const res = await request(app)
      .post("/api/v1/test/bad/readChaincode?token=token")
      .send()

    expect(res.statusCode).toEqual(400)
  })

  // TODO haven't figure it out yet
  // it("Get chaincode method should be ok if all valid", async () => {
  //   const mockedFabricService = FabricService as jest.Mock<FabricService>
  //   mockedFabricService.mockImplementation()

  //   const res = await request(app)
  //     .post("/api/v1/test/chaincode/readChaincode?token=token")
  //     .send()

  //   expect(res.statusCode).toEqual(200)
  // })
})
