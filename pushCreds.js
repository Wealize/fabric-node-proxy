require('dotenv').config();

var S3Service = require('./services/S3Service').default;
var s3_service = new S3Service();
s3_service.pushCreds();