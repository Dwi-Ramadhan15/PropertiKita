const db = require('../utils/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const path = require('path');
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
            from: `"PropertiKita" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Verifikasi Akun PropertiKita',
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="cid:logoPropertiKita" alt="Logo PropertiKita" style="max-width: 150px;" />
                </div>
                
                <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
                    <h2 style="color: #1e293b; margin-bottom: 10px;">Selamat Datang!</h2>
                    <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
                        Terima kasih telah bergabung. Untuk menyelesaikan proses pendaftaran Anda, silakan gunakan kode verifikasi di bawah ini:
                    </p>
                    
                    <div style="margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: 900; color: #2563eb; letter-spacing: 8px; padding: 15px 30px; background-color: #eff6ff; border-radius: 10px; border: 1px dashed #bfdbfe;">
                            ${otpCode}
                        </span>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 14px; font-weight: 700;">
                        ⏳ Kode ini hanya berlaku selama 5 menit.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                    
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
                        <strong>PENTING:</strong> Jangan berikan kode OTP ini kepada siapa pun. Pihak PropertiKita tidak akan pernah meminta kode verifikasi Anda.
                        <br><br>
                        Jika Anda tidak merasa melakukan pendaftaran, abaikan saja email ini.
                    </p>
                </div>
            </div>
            `,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'logoPropertiKita'
            }]
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Gagal mengirim email OTP:", error);
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

        const cleanEmail = email ? String(email).trim().toLowerCase() : null;
        const cleanWhatsapp = whatsapp ? String(whatsapp).trim() : null;

        if (userRole === 'agen' && !cleanEmail) {
            return res.status(400).json({ success: false, message: "Email wajib diisi untuk pendaftaran Agen!" });
        }
        if (userRole === 'user' && !cleanWhatsapp) {
            return res.status(400).json({ success: false, message: "Nomor WhatsApp wajib diisi untuk pendaftaran User biasa!" });
        }

        const checkDup = await db.query(
            "SELECT id FROM users WHERE (email = $1 AND email IS NOT NULL) OR (phone_number = $2 AND phone_number IS NOT NULL)", [cleanEmail, cleanWhatsapp]
        );

        if (checkDup.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email atau Nomor WhatsApp sudah terdaftar!" });
        }

        if (req.file) {
            const bucketName = 'propertikita';
            const objectName = `${Date.now()}-${req.file.originalname.replace(/\s/g, '-')}.webp`;
            const webpBuffer = await sharp(req.file.buffer).resize(500, 500).webp({ quality: 80 }).toBuffer();
            await minioClient.putObject(bucketName, objectName, webpBuffer);
            foto_profil = objectName;
        }

        const hashedPassword = await argon2.hash(password);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);

        await db.query(
            `INSERT INTO users (name, email, phone_number, password, role, otp_code, foto_profil, otp_expired_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [name, cleanEmail, cleanWhatsapp, hashedPassword, userRole, otpCode, foto_profil, expiredAt]
        );

        if (userRole === 'agen') {
            await sendEmailOTP(cleanEmail, otpCode);
        } else if (userRole === 'user') {
            await sendWhatsAppOTP(cleanWhatsapp, otpCode);
        }

        try {
            const adminRes = await db.query("SELECT id FROM users WHERE role = 'admin'");
            const msgAdmin = `Pengguna baru telah mendaftar: ${name} (${userRole})`;
            for (const admin of adminRes.rows) {
                await db.query(
                    "INSERT INTO notifications (id_agen, title, message, status) VALUES ($1, $2, $3, $4)", [admin.id, "Registrasi Baru", msgAdmin, "info"]
                );
            }

            if (req.io) {
                req.io.to('admin_room').emit('notify_admin', {
                    title: "Registrasi Baru",
                    message: msgAdmin,
                    status: "info",
                    created_at: new Date()
                });
            }
        } catch (notifErr) {}

        res.status(201).json({ success: true, message: "Registrasi berhasil! Silakan cek OTP Anda." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email dan Password wajib diisi!" });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", [String(email).trim().toLowerCase()]
        );

        if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        const user = result.rows[0];
        if (!user.is_verified) return res.status(401).json({ success: false, message: "Belum verifikasi!" });

        const valid = await argon2.verify(user.password, password);
        if (!valid) return res.status(401).json({ success: false, message: "Password salah!" });

        const accessToken = jwt.sign({ id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' }
        );

        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secretkey';
        const refreshToken = jwt.sign({ id: user.id },
            refreshTokenSecret, { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token: accessToken,
            refreshToken: refreshToken,
            user: { id: user.id, name: user.name, role: user.role, foto_profil: user.foto_profil }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const refreshTokenEndpoint = async(req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(403).json({ success: false, message: "Refresh Token dibutuhkan!" });
        }

        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secretkey';

        jwt.verify(refreshToken, refreshTokenSecret, async(err, decoded) => {
            if (err) {
                return res.status(401).json({ success: false, message: "Refresh Token tidak valid atau kadaluwarsa!" });
            }

            const { rows } = await db.query("SELECT id, role FROM users WHERE id = $1", [decoded.id]);
            const user = rows[0];

            if (!user) {
                return res.status(404).json({ success: false, message: "User tidak ditemukan" });
            }

            const newAccessToken = jwt.sign({ id: user.id, role: user.role },
                process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                message: "Token berhasil diperbarui",
                token: newAccessToken
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOtp = async(req, res) => {
    const client = await db.connect();
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ success: false, message: "Data OTP tidak lengkap!" });
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1 OR phone_number = $1", [String(identifier).trim().toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (!user.otp_code || String(user.otp_code).trim() !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: "OTP Salah!" });
        }

        const now = new Date();
        const expired = new Date(user.otp_expired_at);
        if (now > expired) {
            return res.status(400).json({ success: false, message: "OTP sudah kadaluarsa! Silakan minta kode baru." });
        }

        await client.query('BEGIN');
        await client.query("UPDATE users SET is_verified = true, otp_code = NULL, otp_expired_at = NULL WHERE id = $1", [user.id]);
        if (user.role === 'agen') {
            await client.query("INSERT INTO agen (nama_agen, email, no_whatsapp, foto_profil) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING", [user.name, user.email, user.phone_number, user.foto_profil]);
        }
        await client.query('COMMIT');
        res.json({ success: true, message: "Verifikasi Berhasil!" });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const resendOtp = async(req, res) => {
    try {
        const { identifier, email, whatsapp } = req.body;
        const targetIdentifier = identifier || email || whatsapp;

        if (!targetIdentifier) {
            return res.status(400).json({ success: false, message: "Email atau Nomor WA wajib diisi!" });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", [String(targetIdentifier).trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ success: false, message: "Akun ini sudah diverifikasi. Silakan langsung login." });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);

        await db.query(
            "UPDATE users SET otp_code = $1, otp_expired_at = $2 WHERE id = $3", [otpCode, expiredAt, user.id]
        );

        if (user.role === 'agen' && user.email) {
            await sendEmailOTP(user.email, otpCode);
        } else if (user.role === 'user' && user.phone_number) {
            await sendWhatsAppOTP(user.phone_number, otpCode);
        }

        res.json({ success: true, message: "OTP baru berhasil dikirim ulang!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const forgotPassword = async(req, res) => {
    try {
        const { email, whatsapp } = req.body;
        const identifier = email || whatsapp;

        if (!identifier) {
            return res.status(400).json({ success: false, message: "Email atau Nomor WA wajib diisi!" });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", [String(identifier).trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);

        await db.query("UPDATE users SET otp_code = $1, otp_expired_at = $2 WHERE id = $3", [otpCode, expiredAt, user.id]);

        if (user.phone_number) {
            await sendWhatsAppOTP(user.phone_number, otpCode);
            return res.json({ success: true, message: "OTP berhasil dikirim ke WhatsApp!" });
        } else if (user.email) {
            await sendEmailOTP(user.email, otpCode);
            return res.json({ success: true, message: "OTP berhasil dikirim ke Email!" });
        }

        return res.status(500).json({ success: false, message: "Gagal mengirim OTP, pengguna tidak memiliki email atau WA yang valid" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resetPassword = async(req, res) => {
    try {
        const { identifier, otp, newPassword } = req.body;

        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "Data tidak lengkap!" });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 OR phone_number = $1", [String(identifier).trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const user = result.rows[0];

        if (!user.otp_code || String(user.otp_code).trim() !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: "OTP Salah!" });
        }

        const now = new Date();
        const expired = new Date(user.otp_expired_at);
        if (now > expired) {
            return res.status(400).json({ success: false, message: "OTP sudah kadaluarsa! Silakan minta kode baru." });
        }

        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "Password baru tidak boleh sama dengan password lama!"
            });
        }

        const hashedPassword = await argon2.hash(newPassword);
        await db.query(
            "UPDATE users SET password = $1, otp_code = NULL, otp_expired_at = NULL WHERE id = $2", [hashedPassword, user.id]
        );

        res.json({ success: true, message: "Password berhasil diperbarui!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const changePassword = async(req, res) => {
    try {
        const userId = req.user ? req.user.id : req.userId;
        const { currentPassword, newPassword } = req.body;

        const userRes = await db.query("SELECT password FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const valid = await argon2.verify(userRes.rows[0].password, currentPassword);
        if (!valid) {
            return res.status(400).json({ success: false, message: "Password saat ini salah!" });
        }

        const hashedPassword = await argon2.hash(newPassword);
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

        res.json({ success: true, message: "Password berhasil diperbarui!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProfile = async(req, res) => {
    try {
        const userId = req.user ? req.user.id : req.userId;
        const result = await db.query("SELECT id, name, email, phone_number, role, foto_profil FROM users WHERE id = $1", [userId]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllUsers = async(req, res) => {
    try {
        const { role } = req.query;
        const query = `
            SELECT id, name, email, phone_number, role, foto_profil, is_verified 
            FROM users 
            WHERE role = $1 
            ORDER BY id DESC
        `;
        const { rows } = await db.query(query, [role]);

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserProfile = async(req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT u.id, u.name, u.email, u.phone_number, u.foto_profil,
            COALESCE((
                SELECT COUNT(p.id) FROM properties p 
                WHERE p.id_agen = (
                    SELECT a.id FROM agen a 
                    WHERE a.email = u.email OR a.no_whatsapp = u.phone_number 
                    LIMIT 1
                )
            ), 0) as total_listing
            FROM users u
            WHERE u.id = $1
        `;
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProfile = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { name, email, phone_number } = req.body;
        const userId = req.user ? req.user.id : req.userId;

        const checkDup = await client.query(
            "SELECT id FROM users WHERE ((email = $1 AND email IS NOT NULL) OR (phone_number = $2 AND phone_number IS NOT NULL)) AND id != $3", [email ? String(email).trim().toLowerCase() : null, phone_number ? String(phone_number).trim() : null, userId]
        );

        if (checkDup.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "Email atau Nomor WhatsApp sudah digunakan pengguna lain!" });
        }

        const oldUser = await client.query("SELECT email, phone_number FROM users WHERE id = $1", [userId]);
        if (oldUser.rows.length > 0) {
            const old = oldUser.rows[0];
            await client.query(
                "UPDATE agen SET nama_agen = $1, email = $2, no_whatsapp = $3 WHERE email = $4 OR no_whatsapp = $5", [name, email, phone_number, old.email, old.phone_number]
            );
        }

        const result = await client.query("UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4 RETURNING *", [name, email, phone_number, userId]);
        await client.query('COMMIT');
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const updateAvatar = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user ? req.user.id : req.userId;
        const objectName = `avatar-${Date.now()}.webp`;
        const webpBuffer = await sharp(req.file.buffer).resize(300, 300).webp().toBuffer();

        await minioClient.putObject('propertikita', objectName, webpBuffer);

        const oldUser = await client.query("SELECT email, phone_number FROM users WHERE id = $1", [userId]);
        if (oldUser.rows.length > 0) {
            const old = oldUser.rows[0];
            const imageUrl = `http://127.0.0.1:9000/propertikita/${objectName}`;
            await client.query(
                "UPDATE agen SET foto_profil = $1 WHERE email = $2 OR no_whatsapp = $3", [imageUrl, old.email, old.phone_number]
            );
        }

        await client.query("UPDATE users SET foto_profil = $1 WHERE id = $2", [objectName, userId]);
        await client.query('COMMIT');

        res.json({ success: true, foto_profil: objectName });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const getVerifiedAgen = async(req, res) => {
    try {
        const query = `
            SELECT a.id, a.nama_agen, a.no_whatsapp, a.foto_profil, 
            COUNT(p.id) as total_properti
            FROM agen a
            JOIN users u ON a.email = u.email OR a.no_whatsapp = u.phone_number
            LEFT JOIN properties p ON a.id = p.id_agen AND p.status = 'approved'
            WHERE u.is_verified = true AND u.role = 'agen'
            GROUP BY a.id
            ORDER BY a.nama_agen ASC
        `;
        const { rows } = await db.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        const checkUser = await client.query("SELECT * FROM users WHERE id = $1", [id]);
        if (checkUser.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        const user = checkUser.rows[0];

        if (user.role === 'agen') {
            await client.query(
                "DELETE FROM agen WHERE email = $1 OR no_whatsapp = $2", [user.email, user.phone_number]
            );
        }

        await client.query("DELETE FROM users WHERE id = $1", [id]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Akun berhasil dihapus secara permanen" });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    register,
    login,
    refreshTokenEndpoint,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    getAllUsers,
    getUserProfile,
    updateProfile,
    updateAvatar,
    getVerifiedAgen,
    deleteUser
};