const db = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async(req, res) => {
    try {
        const { name, email, whatsapp, password, role } = req.body;
        const userRole = role || 'user';

        if (!name || !password) {
            return res.status(400).json({ success: false, message: "Nama dan password wajib diisi!" });
        }

        if (userRole === 'user' && !whatsapp) {
            return res.status(400).json({ success: false, message: "Nomor WhatsApp wajib diisi untuk User!" });
        }
        if (userRole === 'agen' && !email) {
            return res.status(400).json({ success: false, message: "Email wajib diisi untuk Agen!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const query = `
            INSERT INTO users (name, email, whatsapp, password, role, otp_code) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, whatsapp, role`;
        const values = [name, email || null, whatsapp || null, hashedPassword, userRole, otpCode];
        const { rows } = await db.query(query, values);

        res.status(201).json({
            success: true,
            message: `Registrasi berhasil! Silakan verifikasi melalui ${userRole === 'user' ? 'WhatsApp' : 'Email'}.`,
            otp_preview: otpCode,
            data: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "Email atau Nomor WhatsApp sudah digunakan!" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOtp = async(req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ success: false, message: "Email/WhatsApp dan kode OTP wajib diisi!" });
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1 OR whatsapp = $1", [identifier]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (user.otp_code !== otp) {
            return res.status(400).json({ success: false, message: "Kode OTP salah!" });
        }

        await db.query(
            "UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1", [user.id]
        );

        res.status(200).json({ success: true, message: "Akun berhasil diverifikasi! Silakan login." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Email/WhatsApp dan password wajib diisi!" });
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1 OR whatsapp = $1", [identifier]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Akun tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (!user.is_verified) {
            return res.status(401).json({ success: false, message: "Akun anda belum diverifikasi. Silakan cek OTP!" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

        const token = jwt.sign({ id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkey_diah', { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login berhasil!",
            token,
            user: { id: user.id, name: user.name, role: user.role, identifier: user.email || user.whatsapp }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyOtp
};