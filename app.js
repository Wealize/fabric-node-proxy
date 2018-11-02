var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3030;
var FabricService = require('./services/FabricService').default;

const TOKEN = 'xxxxx' || process.env.APP_TOKEN;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var token = req.get('token');
    if(token != TOKEN)
        res.status(401).send('Unauthorized');
    else
        next();
});

app.post('/api/v1/:chaincode_name/:method', function (req, res) {
    //var fabric_service = new FabricService();
    var chaincode_name = req.params.chaincode_name;
    var method = req.params.method;
    var instance = req.body;
    console.log('instance: ')
    console.log(instance)
    //var data = JSON.stringify(req.body.data);
    //var response = fabric_service.call(chaincode_name, method, data);
    res.send({msj: 'ok'});
});


 app.listen( PORT , function(){
	console.log('Server listening in port '+ PORT);
});