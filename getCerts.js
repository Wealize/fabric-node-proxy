// TODO
// Mirar si existe un admin en S3 tnp-node-proxy bucket carpeta hfc-key-store
var S3Service = require('./services/S3Service').default;
var s3_service = new S3Service();
console.log(s3_service.get('admin'));
// Si no existe el admin nos vamos
// Leer y traernos el archivo admin
// Leer y traernos el cert privado y publico de admin
// Mirar si existe un user en S3 tnp-node-proxy bucket carpeta hfc-key-store
// Leer y traernos el archivo user
// Leer y traernos el cert privado y publico de user