var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
var FabricService = require('./services/FabricService').default;

const TOKEN = process.env.APP_TOKEN;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next){ // middleware
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //var token = req.get('token');
    //if(token != TOKEN)
     // res.status(401).send('Unauthorized');
    next();
});

app.post('/api/v1/:chaincode_name/:method', function (req, res) {
    //var fabric_service = new FabricService();
    var chaincode_name = req.params.chaincode_name;
    var method = req.params.method;
    var data = JSON.stringify(req.body);
    //var response = fabric_service.call(chaincode_name, method, data);
    res.send('ok');
});


 app.listen( PORT , function(){
	console.log('Server listening in port '+ PORT);
});