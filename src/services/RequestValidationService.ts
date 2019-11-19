import * as express from "express"

export default class RequestValidationService {
    private channelNames: string[]
    private chaincodeNames: string[]
    private readMethods: string[]
    private writeMethods: string[]
    private token: string

    constructor(
        channelNames: string[], chaincodeNames: string[],
        readMethods: string[], writeMethods: string[]) {
      this.channelNames = channelNames
      this.chaincodeNames = chaincodeNames
      this.readMethods = readMethods
      this.writeMethods = writeMethods
    }

    public withToken(token: string) {
      this.token = token
      return this
    }

    public validateToken(
      request: express.Request, response: express.Response,
      next: express.NextFunction) {
      if (this.isValidToken(request.query.token)) {
        response.status(401).send({status: "error", message: "Forbidden"})
        return
      }

      next()
    }

    public validateChaincodeRequest(
      request: express.Request, response: express.Response,
      next: express.NextFunction) {
      const requestMethod = request.method

      if (!this.isBasicRequestValid(request.params)) {
        response.status(400).send(
          {status: "error", message: "Channel or chaincode not valid"})
        return
      }

      if (requestMethod === "GET") {
        if (
          !this.isReadMethodValid(request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
          return
        }
      } else if (requestMethod === "POST") {
        if (
          !this.isWriteMethodValid(request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
          return
        }
      }

      next()
    }

    private isBasicRequestValid(parameters: any) {
      return (
        this.isParameterInArray(this.chaincodeNames, parameters.chaincode_name) &&
        this.isParameterInArray(this.channelNames, parameters.channel_name))
    }

    private isReadMethodValid(chaincodeMethod: string): boolean {
      return this.isParameterInArray(this.readMethods, chaincodeMethod)
    }

    private isWriteMethodValid(chaincodeMethod: string): boolean {
      return this.isParameterInArray(this.writeMethods, chaincodeMethod)
    }

    private isParameterInArray(
      validElements: string[], elementToSearch: string): boolean {
      return validElements.includes(elementToSearch)
    }

    private isValidToken(token: string): boolean {
      return token !== this.token
    }
}
