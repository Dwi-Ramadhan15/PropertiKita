const minioClient = require('./utils/minio_client');

const bucketName = 'my-bucket';

// Ini adalah aturan (policy) standar AWS S3 agar file bisa dibaca publik (ReadOnly)
const publicPolicy = {
    Version: '2012-10-17',
    Statement: [{
        Action: ['s3:GetObject'], // Hanya izinkan untuk melihat/mengambil gambar
        Effect: 'Allow',
        Principal: '*', // Boleh diakses oleh siapa saja
        Resource: [`arn:aws:s3:::${bucketName}/*`] // Berlaku untuk semua file di dalam my-bucket
    }]
};

async function setBucketToPublic() {
    try {
        // Cek dulu apakah bucket-nya beneran ada
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            console.log(`⚠️ Bucket '${bucketName}' belum ada. Silakan buat dulu di UI atau lewat kode.`);
            return;
        }

        // Terapkan aturan publik tadi ke bucket
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        console.log(`✅ MANTAP! Akses bucket '${bucketName}' berhasil diubah menjadi PUBLIC.`);
        console.log(`Sekarang foto properti sudah bisa dimunculkan di website React kamu! 🚀`);

    } catch (error) {
        console.error('❌ Yah gagal mengubah akses:', error);
    }
}

setBucketToPublic();