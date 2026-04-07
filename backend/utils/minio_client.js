const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: '192.168.1.16', // Sesuaikan dengan IP di screenshot kamu
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin', // Default minio
    secretKey: 'minioadmin', // Default minio
});

module.exports = minioClient;