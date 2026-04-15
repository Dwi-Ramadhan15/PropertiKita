require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoute = require('./routes/user_route');
const categoryRoutes = require('./routes/category_route');
const propertiRoute = require('./routes/properti_route');
const { swaggerUi, specs } = require('./utils/swagger');
const { minioClient, setBucketPublic } = require('./utils/minio_client');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', propertiRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
    res.send('Server PropertiKita Berjalan Normal! 🚀');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Opps! Ada masalah di server, sedang diperbaiki.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const initMinio = async () => {
    const bucketName = 'propertikita';
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName);
        }
        await setBucketPublic(bucketName);
    } catch (error) {
        console.error("MinIO Init Error:", error);
    }
};

app.listen(PORT, async () => {
    await initMinio();
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});