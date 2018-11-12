const fs = require('fs');

const AWS = require('aws-sdk');


export default class S3Service {
    constructor() {
        this.client = new AWS.S3();
    }

    pushCreds() {
      const localPath = __dirname + '/../hfc-key-store/';
      const s3Path = process.env.APP_ENVIRONMENT + '/';
      const bucket = process.env.BUCKET_NAME;

      var params = {};
      var contents = '';

      fs.readdirSync(localPath).forEach(file => {
        contents = fs.readFileSync(localPath + file, 'utf8');
        params = {Bucket: bucket, Key: s3Path + file, Body: contents};

        this.client.putObject(params, (err, data) => {
          if (err) {
            console.log(err)
          } else {
            console.log("Successfully uploaded data to myBucket/myKey");
          }
        });
      });
    }

    pullCreds() {
      const localPath = __dirname + '/../hfc-key-store/';
      const s3Path = process.env.APP_ENVIRONMENT + '/';
      const bucket = process.env.BUCKET_NAME;

      var params = {Bucket: bucket, Prefix: s3Path, Delimiter: '/'};

      this.client.listObjectsV2(params, (err, data) => {
        if (err) {
          console.log(err);
        }

        data['Contents'].forEach(item => {
          if (item['Key'] != s3Path) {
            params = {Bucket: bucket, Key: item['Key']};

            this.client.getObject(params, (err, data) => {
              if (err) {
                console.log(err);
                return err;
              }

              let objectData = data.Body.toString('utf-8');
              var filename = item['Key'].replace(s3Path, '');
              fs.writeFileSync(localPath + filename, objectData);
            });
          }
        });
      });
    }
}
