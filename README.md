Desde Django

POST {url}/api/v1/{chaincode_name}/{method}

['createRefugee', '{"name": "holi", "surname": "con mi tigre"}]


Dentro de Node

app.post('/api/v1/:chaincode_name/:method', function(req, res) {
    # TODO Get JSON Body
    # Get chaincode_name and method

    # FabricService().call(chaincode_name, method, data)

    # TODO Error handling and 200 with result data
    res.send(user_id + ' ' + token + ' ' + geo);
});