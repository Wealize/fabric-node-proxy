import RequestValidationService from "../services/RequestValidationService"

describe("Request Validation", () => {
  describe("should", () => {
    it("basic request be invalid if not in array", () => {
      const validation = new RequestValidationService([], [], [], [])
      const parameters = {chaincode_name: "chaincode", channel_name: "channel"}

      // @ts-ignore
      const isValid = validation.isBasicRequestValid(parameters)

      expect(isValid).toEqual(false)
    })

    it("basic request be invalid if channel not in array", () => {
      const validation = new RequestValidationService([], ["chaincode"], [], [])
      const parameters = {chaincode_name: "chaincode", channel_name: "channel"}

      // @ts-ignore
      const isValid = validation.isBasicRequestValid(parameters)

      expect(isValid).toEqual(false)
    })

    it("basic request be invalid if chaincode not in array", () => {
      const validation = new RequestValidationService(["channel"], [], [], [])
      const parameters = {chaincode_name: "chaincode", channel_name: "channel"}

      // @ts-ignore
      const isValid = validation.isBasicRequestValid(parameters)

      expect(isValid).toEqual(false)
    })

    it("basic request be valid if chaincode and channel in array", () => {
      const validation = new RequestValidationService(["channel"], ["chaincode"], [], [])
      const parameters = {chaincode_name: "chaincode", channel_name: "channel"}

      // @ts-ignore
      const isValid = validation.isBasicRequestValid(parameters)

      expect(isValid).toEqual(true)
    })

    it("read method should be invalid if not in array", () => {
      const validation = new RequestValidationService([], [], [], [])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isReadMethodValid(method)

      expect(isValid).toEqual(false)
    })

    it("read method should be valid if in array", () => {
      const validation = new RequestValidationService([], [], ["hello"], [])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isReadMethodValid(method)

      expect(isValid).toEqual(true)
    })

    it("write method should be invalid if not in array", () => {
      const validation = new RequestValidationService([], [], [], [])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isWriteMethodValid(method)

      expect(isValid).toEqual(false)
    })

    it("write method should be valid if in array", () => {
      const validation = new RequestValidationService([], [], [], ["hello"])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isWriteMethodValid(method)

      expect(isValid).toEqual(true)
    })

    it("is parameter in array should be invalid if not in array", () => {
      const myArray = ["bye"]
      const validation = new RequestValidationService(myArray, [], [], [])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isParameterInArray(myArray, method)

      expect(isValid).toEqual(false)
    })

    it("is parameter in array should be valid if in array", () => {
      const myArray = ["hello"]
      const validation = new RequestValidationService([], [], [], [])
      const method = "hello"

      // @ts-ignore
      const isValid = validation.isParameterInArray(myArray, method)

      expect(isValid).toEqual(true)
    })
  })
})
