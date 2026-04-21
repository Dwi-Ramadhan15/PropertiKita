require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const userRoute = require('./routes/user_route');
const categoryRoutes = require('./routes/category_route');
const propertiRoute = require('./routes/properti_route');
const { swaggerUi, specs } = require('./utils/swagger');
const { minioClient, setBucketPublic } = require('./utils/minio_client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api', propertiRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

io.on('connection', (socket) => {
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
    });

    socket.on('new_property_submitted', (data) => {
        io.to('admin_room').emit('notify_admin', data);
    });

    socket.on('property_status_changed', (data) => {
        io.to(`agen_${data.agenId}`).emit('notify_agen', data);
    });
});

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

const initMinio = async() => {
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

server.listen(PORT, async() => {
    await initMinio();
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});