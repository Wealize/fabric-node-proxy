import { Request, Response, NextFunction } from "express-serve-static-core"

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

    public validateToken(request, response, next) {
      if (this.isValidToken(request.query.token)) {
        response.status(401).send({status: "error", message: "Forbidden"})
        return
      }

      next()
    }

    public validateChaincodeRequest(
      request: Request, response: Response, next: NextFunction) {
      const requestMethod = request.method

      if (!this.isBasicRequestValid(request)) {
        response.status(400).send(
          {status: "error", message: "Channel or chaincode not valid"})
      }

      if (requestMethod === "GET") {
        if (
          !this.isParameterInArray(this.readMethods, request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
        }
      } else if (requestMethod === "POST") {
        if (
          !this.isParameterInArray(this.writeMethods, request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
        }
      }

      next()
    }

    private isBasicRequestValid(request: Request) {
      return (
        !this.isParameterInArray(this.chaincodeNames, request.params.chaincode_name) ||
        !this.isParameterInArray(this.channelNames, request.params.channel_name))
    }

    private isReadMethodValid(requestMethod: string, chaincodeMethod: string): boolean {
      return (
        requestMethod === "GET" &&
        this.isParameterInArray(this.readMethods, chaincodeMethod))
    }

    private isWriteMethodValid(requestMethod: string, chaincodeMethod: string): boolean {
      return (
        requestMethod === "POST" &&
        this.isParameterInArray(this.readMethods, chaincodeMethod))
    }

    private isParameterInArray(
      validElements: string[], elementToSearch: string): boolean {
      return validElements.includes(elementToSearch)
    }

    private isValidToken(token: string): boolean {
      return token !== this.token
    }
}
