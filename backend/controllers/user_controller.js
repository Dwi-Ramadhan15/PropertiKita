const db = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
            headers: {
                'Authorization': process.env.FONNTE_TOKEN
            },
            body: new URLSearchParams({
                target: targetNumber,
                message: `Halo! Kode OTP pendaftaran PropertiKita Anda adalah: *${otpCode}*. Berlaku untuk 5 menit. Jangan bagikan kode ini ke siapapun.`
            })
        });
        console.log(`[SUKSES] OTP dikirim ke WA: ${targetNumber}`);
    } catch (error) {
        console.error('[GAGAL] Mengirim WA via Fonnte:', error);
    }
};

const sendEmailOTP = async(targetEmail, otpCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: targetEmail,
            subject: 'Kode Verifikasi OTP PropertiKita',
            html: `<h3>Selamat Datang di PropertiKita!</h3>
                   <p>Halo, ini adalah kode OTP untuk verifikasi akun Anda:</p>
                   <h2 style="color: #2563eb; letter-spacing: 5px;">${otpCode}</h2>
                   <p>Mohon jangan bagikan kode ini kepada siapapun.</p>`
        };
        await transporter.sendMail(mailOptions);
        console.log(`[SUKSES] OTP dikirim ke Email: ${targetEmail}`);
    } catch (error) {
        console.error('[GAGAL] Mengirim Email:', error);
    }
};

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
        if ((userRole === 'agen' || userRole === 'admin') && !email) {
            return res.status(400).json({ success: false, message: `Email wajib diisi untuk mendaftar sebagai ${userRole}!` });
        }

        const cleanEmail = email ? email.trim().toLowerCase() : null;
        const cleanWhatsapp = whatsapp ? whatsapp.trim() : null;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. MASUKKAN KE TABEL USERS (Untuk Login)
        const queryUsers = `
            INSERT INTO users (name, email, phone_number, password, role, otp_code) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone_number, role`;
        const valuesUsers = [name, cleanEmail, cleanWhatsapp, hashedPassword, userRole, otpCode];
        const { rows } = await db.query(queryUsers, valuesUsers);

        // 2. SINKRONISASI OTOMATIS KE TABEL AGEN
        if (userRole === 'agen') {
            const queryAgen = `INSERT INTO agen (nama_agen, email, no_whatsapp) VALUES ($1, $2, $3)`;
            await db.query(queryAgen, [name, cleanEmail, cleanWhatsapp]);

            // Kirim OTP via Email untuk Agen
            await sendEmailOTP(cleanEmail, otpCode);
        } else if (userRole === 'user' && cleanWhatsapp) {
            // Kirim OTP via WA untuk User Biasa
            await sendWhatsAppOTP(cleanWhatsapp, otpCode);
        }

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

        const cleanIdentifier = identifier.trim().toLowerCase();

        const result = await db.query("SELECT * FROM users WHERE email = $1 OR phone_number = $1", [cleanIdentifier]);

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

        const cleanIdentifier = identifier.trim().toLowerCase();

        const result = await db.query("SELECT * FROM users WHERE email = $1 OR phone_number = $1", [cleanIdentifier]);
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
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                identifier: user.email || user.phone_number
            }
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