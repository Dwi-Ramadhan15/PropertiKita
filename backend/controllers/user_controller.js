const db = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const { minioClient } = require('../utils/minio_client');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWhatsAppOTP = async(targetNumber, otpCode) => {
    try {
        await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Authorization': process.env.FONNTE_TOKEN },
            body: new URLSearchParams({
                target: targetNumber,
                message: `Halo! Kode OTP Verifikasi PropertiKita Anda adalah: *${otpCode}*. Berlaku 5 menit.`
            })
        });
    } catch (error) {
        console.error(error);
    }
};

const sendEmailOTP = async(targetEmail, otpCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: 'Verifikasi Akun PropertiKita',
            html: `<h3>Selamat Datang!</h3><p>Kode OTP Anda:</p><h2 style="color: blue;">${otpCode}</h2>`
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
};

const register = async(req, res) => {
    try {
        const { name, email, whatsapp, password, role } = req.body;
        const userRole = role || 'user';
        let foto_profil = null;

        if (!name || !password) {
            return res.status(400).json({ success: false, message: "Nama & Password wajib!" });
        }

        const cleanEmail = email ? email.trim().toLowerCase() : null;
        const cleanWhatsapp = whatsapp ? whatsapp.trim() : null;

        if (req.file) {
            const bucketName = 'propertikita';
            const objectName = `${Date.now()}-${req.file.originalname.replace(/\s/g, '-')}.webp`;
            const webpBuffer = await sharp(req.file.buffer).resize(500, 500).webp({ quality: 80 }).toBuffer();
            await minioClient.putObject(bucketName, objectName, webpBuffer);
            foto_profil = objectName;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await db.query(
            `INSERT INTO users (name, email, phone_number, password, role, otp_code, foto_profil) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [name, cleanEmail, cleanWhatsapp, hashedPassword, userRole, otpCode, foto_profil]
        );

        if (userRole === 'user' && cleanWhatsapp) await sendWhatsAppOTP(cleanWhatsapp, otpCode);
        else if (cleanEmail) await sendEmailOTP(cleanEmail, otpCode);

        res.status(201).json({ success: true, message: "Registrasi berhasil!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await db.query("SELECT * FROM users WHERE email = $1 OR phone_number = $1", [identifier.trim().toLowerCase()]);

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        const user = result.rows[0];
        if (!user.is_verified) return res.status(401).json({ success: false, message: "Belum verifikasi!" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: "Password salah!" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role, foto_profil: user.foto_profil } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOtp = async(req, res) => {
    const client = await db.connect();
    try {
        const { identifier, otp } = req.body;
        const result = await db.query("SELECT * FROM users WHERE email = $1 OR phone_number = $1", [identifier.trim().toLowerCase()]);

        if (result.rows.length === 0 || result.rows[0].otp_code !== otp) return res.status(400).json({ success: false, message: "OTP Salah!" });

        const user = result.rows[0];
        await client.query('BEGIN');
        await client.query("UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1", [user.id]);
        if (user.role === 'agen') {
            await client.query("INSERT INTO agen (nama_agen, email, no_whatsapp, foto_profil) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING", [user.name, user.email, user.phone_number, user.foto_profil]);
        }
        await client.query('COMMIT');
        res.json({ success: true, message: "Verifikasi Berhasil!" });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally { client.release(); }
};

const getProfile = async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email, phone_number, role, foto_profil FROM users WHERE id = $1", [req.user.id]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone_number } = req.body;
        const result = await db.query("UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4 RETURNING *", [name, email, phone_number, req.user.id]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateAvatar = async (req, res) => {
    try {
        const objectName = `avatar-${Date.now()}.webp`;
        const webpBuffer = await sharp(req.file.buffer).resize(300, 300).webp().toBuffer();
        await minioClient.putObject('propertikita', objectName, webpBuffer);
        await db.query("UPDATE users SET foto_profil = $1 WHERE id = $2", [objectName, req.user.id]);
        res.json({ success: true, foto_profil: objectName });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { register, login, verifyOtp, getProfile, updateProfile, updateAvatar };