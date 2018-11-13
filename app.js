var express = require('express');
var bodyParser = require('body-parser');
var FabricService = require('./services/FabricService').default;
var S3Service = require('./services/S3Service').default;
require('dotenv').config();

var app = express();
const PORT = process.env.PORT || 3030;
const TOKEN = process.env.APP_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var s3_service = new S3Service();
s3_service.pullCreds();


app.post('/api/v1/:chaincode_name/:method', function (req, res) {

    if (req.query.token != TOKEN) {
        res.status(401).send({'error': 'Forbidden'});
        return;
    }

    var fabric_service = new FabricService();
    var chaincode_name = req.params.chaincode_name;
    var method = req.params.method;
    var data = req.body;
    var response = fabric_service.call(chaincode_name, method, data.args);

    response.then((message) => {
        res.send({"ok": message});
    }).catch((error) => {
        res.status(400).send(error);
    });
});

 app.listen(PORT, function(){
	console.log('Server listening in port '+ PORT);
});