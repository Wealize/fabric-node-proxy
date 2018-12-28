const fs = require('fs');

const localCertsPath = __dirname + '/hfc-key-store/';
const certs = JSON.parse(process.env.FABRIC_CERTS);
const creds = process.env.FABRIC_CREDS;


fs.writeFileSync(__dirname + '/creds.json', creds);

if (!fs.existsSync(localCertsPath)) {
  fs.mkdirSync(localCertsPath);
}

for (var i = 0; i < certs.length; i++) {
    const cert = certs[i];
    const filename = cert.enrollment.signingIdentity

    fs.writeFileSync(
        localCertsPath + filename + '-priv',
        cert.keys.private.split('  ').join('\n')
    );

    fs.writeFileSync(
        localCertsPath + filename + '-pub',
        cert.keys.public.split('  ').join('\n')
    );

    fs.writeFileSync(
        localCertsPath + cert.name,
        cert
    );
}