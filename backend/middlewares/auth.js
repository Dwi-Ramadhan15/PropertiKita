const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Ambil token dari header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formatnya: "Bearer <token>"

    if (!token) {
        return res.status(403).json({ 
            success: false, 
            message: "Akses ditolak! Anda belum login (Token tidak ditemukan)." 
        });
    }

    try {
        // Verifikasi token menggunakan secret key yang sama dengan saat login
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey_diah');
        
        // Simpan data user yang login (id & role) ke dalam request agar bisa dipakai di controller
        req.user = verified;
        
        next(); // Lanjut ke fungsi berikutnya (controller)
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: "Token tidak valid atau sudah kadaluwarsa!" 
        });
    }
};

// Middleware tambahan khusus untuk Super Admin (Opsional)
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