const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak! Anda belum login (Token tidak ditemukan)."
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

        req.user = verified;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token tidak valid atau sudah kadaluwarsa!"
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: "Akses terbatas! Hanya Super Admin yang diizinkan."
        });
    }
    next();
};

module.exports = { verifyToken, isAdmin };