const Minio = require('minio');
const sharp = require('sharp');

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1', // Sesuai dengan dashboard kamu
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin', 
    secretKey: 'minioadmin', 
});

// Fungsi untuk membuat bucket otomatis jadi PUBLIC
const setBucketPublic = async (bucketName) => {
    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetBucketLocation", "s3:ListBucket"],
                Resource: [`arn:aws:s3:::${bucketName}`],
            },
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
        ],
    };

    try {
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`[MINIO] Bucket '${bucketName}' sekarang PUBLIC.`);
    } catch (err) {
        console.error(`[MINIO] Gagal set policy public:`, err);
    }
};

const uploadToMinio = async (file) => {
    const bucketName = 'propertikita';
    const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.').replace(/\s/g, '-');
    const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName);
    }

    // Pastikan bucket diset public setiap kali upload atau saat inisialisasi
    await setBucketPublic(bucketName);

    const webpBuffer = await sharp(file.buffer)
        .webp({ quality: 80 }) // Konversi otomatis ke webp
        .toBuffer();

    await minioClient.putObject(bucketName, objectName, webpBuffer);
    return objectName;
};

module.exports = { minioClient, uploadToMinio, setBucketPublic };