const db = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Nama, email, dan password wajib diisi!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP 6 Digit
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const query = `
            INSERT INTO users (name, email, password, role, otp_code) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`;
        
        const values = [name, email, hashedPassword, role || 'user', otpCode];
        const { rows } = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: "Registrasi berhasil! Silakan verifikasi akun anda.",
            otp_preview: otpCode, // Ditampilkan untuk mempermudah testing
            data: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "Email sudah digunakan!" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. VERIFY OTP (Sudah diperbaiki namanya menjadi verifyOtp)
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email dan kode OTP wajib diisi!" });
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];

        // Cek apakah OTP cocok
        if (user.otp_code !== otp) {
            return res.status(400).json({ success: false, message: "Kode OTP salah!" });
        }

        // Update status verifikasi dan hapus OTP agar tidak bisa dipakai lagi
        await db.query(
            "UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1",
            [user.id]
        );

        res.status(200).json({ success: true, message: "Akun berhasil diverifikasi! Silakan login." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Email tidak terdaftar!" });
        }

        const user = result.rows[0];

        // Validasi: Apakah sudah verifikasi?
        if (!user.is_verified) {
            return res.status(401).json({ 
                success: false, 
                message: "Akun anda belum diverifikasi. Silakan cek OTP!" 
            });
        }

        // Cek Password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

        // Buat Token JWT (Berlaku 1 hari)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkey_diah',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login berhasil!",
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyOtp // Sekarang sudah sinkron dengan nama fungsi di atas
};