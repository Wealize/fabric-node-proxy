
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
      if (request.query.token !== this.token) {
        response.status(401).send({error: "Forbidden"})
        return
      }

      next()
    }

    public validateChaincodeRequest(request, response, next) {
      const method = request.method

      if (
        !this.isParameterInArray(this.chaincodeNames, request.params.chaincode_name) ||
        !this.isParameterInArray(this.channelNames, request.params.channel_name)
      ) {
        response.status(400).send(
          {status: "error", message: "Channel or chaincode not valid"})
      }

      if (method === "GET") {
        if (
          !this.isParameterInArray(this.readMethods, request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
        }
      } else if (method === "POST") {
        if (
          !this.isParameterInArray(this.writeMethods, request.params.chaincode_method)
        ) {
          response.status(400).send({status: "error", message: "Method not valid"})
        }
      }

      next()
    }

    public isParameterInArray(
      validElements: string[], elementToSearch: string): boolean {
      return validElements.includes(elementToSearch)
    }
}
