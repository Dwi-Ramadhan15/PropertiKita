/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Users
 *     description: Manajemen User, Autentikasi JWT, dan Verifikasi OTP
 *   - name: Properti
 *     description: Manajemen Data Properti dan Pencarian (Public & Private)
 *   - name: Fasilitas
 *     description: Manajemen Fasilitas Properti (Agen Only)
 *   - name: Notifications
 *     description: Sistem Notifikasi Real-time & Riwayat Agen
 *   - name: Categories
 *     description: Master data untuk kategori (Dijual/Disewakan)
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrasi user baru [PUBLIC]
 *     description: Mendaftar akun baru. Jika role 'agen' maka OTP dikirim via Email. Jika role 'user' maka OTP dikirim via WhatsApp.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diah Ayu
 *               email:
 *                 type: string
 *                 example: diah@gmail.com
 *               phone_number:
 *                 type: string
 *                 example: "081234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, agen]
 *                 default: user
 *                 description: "Role agen: OTP via Email. Role user: OTP via WA."
 *     responses:
 *       201:
 *         description: Berhasil registrasi dan OTP terkirim
 */

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verifikasi akun menggunakan kode OTP [PUBLIC]
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email atau nomor WhatsApp user
 *                 example: diah@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Akun berhasil diverifikasi
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user untuk mendapatkan Token JWT [PUBLIC]
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email atau nomor WhatsApp user
 *                 example: diah@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token
 */

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Mengirim OTP untuk lupa password [PUBLIC]
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email atau nomor WhatsApp user
 *                 example: "diah@gmail.com"
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password menggunakan OTP [PUBLIC]
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "diah@gmail.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "passwordBaru123"
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *       400:
 *         description: OTP salah atau kadaluwarsa
 */

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON + Pagination) [PUBLIC]
 *     description: Mengambil data properti. Jika tanpa token, hanya menampilkan status 'approved'.
 *     tags: [Properti]
 *     parameters:
 *       - in: query
 *         name: minHarga
 *         schema:
 *           type: integer
 *         description: Harga minimal
 *       - in: query
 *         name: maxHarga
 *         schema:
 *           type: integer
 *         description: Harga maksimal
 *       - in: query
 *         name: lokasi
 *         schema:
 *           type: string
 *         description: Kata kunci lokasi (contoh "Rajabasa")
 *       - in: query
 *         name: id_kategori
 *         schema:
 *           type: integer
 *         description: Filter kategori (1 Dijual, 2 Disewakan)
 *       - in: query
 *         name: kamar_tidur
 *         schema:
 *           type: string
 *         description: Jumlah kamar (contoh "2", "3", atau "4+")
 *       - in: query
 *         name: agen
 *         schema:
 *           type: integer
 *         description: ID Agen untuk melihat properti spesifik agen
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter status (approved, pending, sold). Khusus Admin/Agen jika ingin melihat selain approved.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Data properti berhasil diambil dalam format GeoJSON
 *       500:
 *         description: Internal Server Error
 *   post:
 *     summary: Menambah properti baru (Agen Only) [PRIVATE]
 *     tags: [Properti]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               harga:
 *                 type: integer
 *               id_kategori:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               kamar_tidur:
 *                 type: string
 *               kamar_mandi:
 *                 type: string
 *               luas_tanah:
 *                type: string
 *               longitude:
 *                type: numeric
 *               latitude:
 *                type: numeric
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Properti berhasil dikirim dan menunggu tinjauan admin
 */

/**
 * @swagger
 * /api/properti/{slug}:
 *   get:
 *     summary: Mendapatkan detail lengkap properti + Gallery + Fasilitas [PUBLIC]
 *     description: Menampilkan semua data properti berdasarkan slug.
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail properti berhasil ditemukan
 *       404:
 *         description: Properti tidak ditemukan
 */

/**
 * @swagger
 * /api/properti/{id}/status:
 *   put:
 *     summary: Update status properti (Admin Only) [PRIVATE]
 *     tags: [Properti]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending, sold]
 *     responses:
 *       200:
 *         description: Status berhasil diubah
 */

/**
 * @swagger
 * /api/fasilitas:
 *   get:
 *     summary: Mendapatkan semua daftar fasilitas [PUBLIC]
 *     tags: [Fasilitas]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data fasilitas
 *   post:
 *     summary: Menambah fasilitas ke properti (Agen Only) [PRIVATE]
 *     tags: [Fasilitas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_properti
 *               - nama_fasilitas
 *             properties:
 *               id_properti:
 *                 type: integer
 *                 example: 27
 *               nama_fasilitas:
 *                 type: string
 *                 example: "Kolam Renang Indoor"
 *     responses:
 *       201:
 *         description: Fasilitas berhasil ditambahkan
 * 
 * /api/fasilitas/{id}:
 *   put:
 *     summary: Mengupdate nama fasilitas [PRIVATE]
 *     tags: [Fasilitas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_fasilitas:
 *                 type: string
 *                 example: "Taman Belakang"
 *     responses:
 *       200:
 *         description: Fasilitas berhasil diupdate
 *   delete:
 *     summary: Menghapus fasilitas [PRIVATE]
 *     tags: [Fasilitas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fasilitas berhasil dihapus
 */

/**
 * @swagger
 * /api/notifications/{id_agen}:
 *   get:
 *     summary: Mengambil riwayat notifikasi agen [PRIVATE]
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_agen
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil menarik data notifikasi
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Menandai notifikasi telah dibaca [PRIVATE]
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifikasi ditandai dibaca
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua daftar kategori [PUBLIC]
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     summary: Menambah kategori baru (Admin Only) [PRIVATE]
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Disewakan
 *     responses:
 *       201:
 *         description: Berhasil dibuat
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Mengupdate nama kategori (Admin Only) [PRIVATE]
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *   delete:
 *     summary: Menghapus kategori (Admin Only) [PRIVATE]
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 */