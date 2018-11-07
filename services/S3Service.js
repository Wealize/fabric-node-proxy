var s3 = require('s3');
const AWS = require('aws-sdk');
var config = require('../config');
export default class S3Service {
    constructor() {
        const awsS3Client = new AWS.S3({
            accessKeyId: config.accessKeyId, //process.ENV.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.secretAccessKey, //process.ENV.AWS_ACCESS_SECRET_ID,
            region: 'eu-central-1'
          });
        this.client = s3.createClient({
            s3Client: awsS3Client
        });
    }

    get(user) {
        var params = {
            s3Params: {
                Bucket: config.bucket,// process.ENV.BUCKET_NAME
              }
        }
        var keys = this.client.listObjects(params);
        return keys;
    }

    syncDirectory(){ // it uploads file AWS
        var params = {
            localDir: "hfc-key-store",
            deleteRemoved: true,
            s3Params: {
              Bucket: config.bucket //process.ENV.BUCKET_NAME,
            }
          };
          console.log(params);
          var uploader = this.client.uploadDir(params);
          uploader.on('error', function(err) {
            console.error("unable to sync:", err.stack);
          });
          uploader.on('progress', function() {
            console.log("progress", uploader.progressAmount, uploader.progressTotal);
          });
          uploader.on('end', function() {
            console.log("done uploading");
          });
    }


}
