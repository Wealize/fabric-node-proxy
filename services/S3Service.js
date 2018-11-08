var s3 = require('s3');
const AWS = require('aws-sdk');
var config = require('../config');
export default class S3Service {
    constructor() {
        const awsS3Client = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.accessKeyId,
            secretAccessKey: process.env.AWS_ACCESS_SECRET_ID || config.secretAccessKey,
            region: 'eu-central-1'
          });
        this.client = s3.createClient({
            s3Client: awsS3Client
        });
    }

    download(user) {
        var params = {
            localFile: "hfc-key-store/"+user,
            s3Params: {
              Bucket: process.env.BUCKET_NAME || config.bucket,
              Key: user,
            },
          };
          var downloader = this.client.downloadFile(params);

          downloader.on('error', function(err) {
            console.error("unable to download:", err.stack);
          });
          downloader.on('progress', function() {
            console.log("progress", downloader.progressAmount, downloader.progressTotal);
          });
          downloader.on('end', function() {
            console.log("done downloading");
          });

    }

    syncDirectory() {
        var params = {
            localDir: "../hfc-key-store",
            // deleteRemoved: true,
            s3Params: {
              Bucket: process.env.BUCKET_NAME || config.bucket
            }
          };

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
