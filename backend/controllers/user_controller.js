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

        if ((userRole === 'agen' || userRole === 'admin') && !req.file) {
            return res.status(400).json({ success: false, message: "Agen dan Admin wajib upload foto profil!" });
        }

        const cleanEmail = email ? email.trim().toLowerCase() : null;
        const cleanWhatsapp = whatsapp ? whatsapp.trim() : null;

        if (req.file) {
            const bucketName = 'propertikita';
            const safeName = req.file.originalname.split('.')[0].replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            const objectName = `${Date.now()}-${safeName}.webp`;

            const webpBuffer = await sharp(req.file.buffer)
                .webp({ quality: 80 })
                .toBuffer();

            const exists = await minioClient.bucketExists(bucketName);
            if (!exists) await minioClient.makeBucket(bucketName);

            await minioClient.putObject(bucketName, objectName, webpBuffer);
            foto_profil = objectName;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const queryUsers = `
            INSERT INTO users (name, email, phone_number, password, role, otp_code, foto_profil) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
        const valuesUsers = [name, cleanEmail, cleanWhatsapp, hashedPassword, userRole, otpCode, foto_profil];
        await db.query(queryUsers, valuesUsers);

        if (userRole === 'user' && cleanWhatsapp) {
            await sendWhatsAppOTP(cleanWhatsapp, otpCode);
        } else if ((userRole === 'agen' || userRole === 'admin') && cleanEmail) {
            await sendEmailOTP(cleanEmail, otpCode);
        }

        res.status(201).json({
            success: true,
            message: `Registrasi berhasil! Cek ${userRole === 'user' ? 'WhatsApp' : 'Email'} untuk kode verifikasi.`,
            otp_preview: otpCode
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: "Email atau nomor WhatsApp sudah terdaftar!" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOtp = async(req, res) => {
    const client = await db.connect();
    try {
        const { identifier, otp } = req.body;
        if (!identifier || !otp) {
            return res.status(400).json({ success: false, message: "Identifier & OTP wajib diisi!" });
        }

        const cleanIdentifier = identifier.trim().toLowerCase();
        const resultUsers = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", 
            [cleanIdentifier]
        );

        if (resultUsers.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = resultUsers.rows[0];

        if (user.otp_code !== otp) {
            return res.status(400).json({ success: false, message: "Kode OTP salah!" });
        }

        await client.query('BEGIN');

        await client.query(
            "UPDATE users SET is_verified = true, otp_code = NULL WHERE id = $1", 
            [user.id]
        );

        if (user.role === 'agen') {
            const cekAgen = await client.query("SELECT * FROM agen WHERE email = $1", [user.email]);
            if (cekAgen.rows.length === 0) {
                const queryAgen = `
                    INSERT INTO agen (nama_agen, email, no_whatsapp, foto_profil) 
                    VALUES ($1, $2, $3, $4)`;
                await client.query(queryAgen, [user.name, user.email, user.phone_number, user.foto_profil]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Akun berhasil diverifikasi! Silakan login." });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const login = async(req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Identifier & Password wajib diisi!" });
        }

        const cleanIdentifier = identifier.trim().toLowerCase();
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", 
            [cleanIdentifier]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Akun tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (!user.is_verified) {
            return res.status(401).json({ success: false, message: "Akun Anda belum diverifikasi!" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Password yang Anda masukkan salah!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'secretkey', 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login berhasil!",
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                foto_profil: user.foto_profil,
                identifier: user.email || user.phone_number
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, verifyOtp };