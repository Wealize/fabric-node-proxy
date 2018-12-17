var express = require('express');
var bodyParser = require('body-parser');
var FabricService = require('./services/FabricService').default;
var S3Service = require('./services/S3Service').default;
require('dotenv').config();
var morgan = require('morgan');

var app = express();
const PORT = process.env.PORT || 3030;
const TOKEN = process.env.APP_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

var s3_service = new S3Service();
var fabric_service = new FabricService();
s3_service.pullCreds();


app.post('/api/v1/:chaincode_name/:chaincode_method/:instance_id',
    function (req, res) {

    if (req.query.token != TOKEN) {
        res.status(401).send({'error': 'Forbidden'});
        return;
    }

    var payload = fabric_service.serialize(req.body, req.params.instance_id);
    var response = fabric_service.call(
        req.params.chaincode_name,
        req.params.chaincode_method,
        payload);

    response.then((response) => {
        // TODO if response is not valid do something
        return response.json();
    }).then((data) => {
        res.send({status: 'ok', data: data})
    }).catch((error) => {
        res.status(400).send(error);
    });
});


app.post('/api/v1/:chaincode_name/:chaincode_method', function (req, res) {

    if (req.query.token != TOKEN) {
        res.status(401).send({'error': 'Forbidden'});
        return;
    }

    var payload = fabric_service.serialize(req.body);
    var response = fabric_service.call(
        req.params.chaincode_name,
        req.params.chaincode_method,
        payload);

    response.then((response) => {
        // TODO if response is not valid do something
        return response.json();
    }).then((data) => {
        res.send({status: 'ok', data: data})
    }).catch((error) => {
        res.status(400).send(error);
    });
});

 app.listen(PORT, function(){
	console.log('Server listening in port '+ PORT);
});