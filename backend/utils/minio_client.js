const Minio = require('minio');

const minioClient = new Minio.Client({
<<<<<<< HEAD
    endPoint: '192.168.1.16', // Sesuaikan dengan IP di screenshot kamu
=======
    endPoint: '127.0.0.1',
>>>>>>> 6f07009e609101757d963ae2098fc4fb82869913
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin', // Default minio
    secretKey: 'minioadmin', // Default minio
});

module.exports = minioClient;