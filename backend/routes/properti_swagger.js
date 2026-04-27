/**
 * @swagger
 * tags:
 *   - name: Properti
 *     description: Manajemen Data Properti, Pencarian Geospatial, dan Gallery Foto
 *   - name: Categories
 *     description: Master data untuk kategori (Dijual/Disewakan)
 *   - name: Users
 *     description: Manajemen User, Autentikasi JWT, dan Verifikasi OTP
 */

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON + Pagination)
 *     description: Mengambil data properti berdasarkan filter harga, lokasi, tipe, kategori, dan spesifikasi rumah.
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
 *         description: Filter kategori (1 untuk Dijual, 2 untuk Disewakan)
 *       - in: query
 *         name: kamar_tidur
 *         schema:
 *           type: string
 *         description: Jumlah kamar (contoh "2", "3", atau "4+" untuk 4 ke atas)
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
 */

/**
 * @swagger
 * /api/properti/{id}:
 *   get:
 *     summary: Mendapatkan detail lengkap properti + Gallery
 *     description: Menampilkan semua data properti, data agen, nama kategori, dan daftar URL foto (gallery).
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail properti berhasil ditemukan
 *       404:
 *         description: Properti tidak ditemukan
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua daftar kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     summary: Menambah kategori baru (Admin Only)
 *     tags: [Categories]
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
 *     summary: Mengupdate nama kategori
 *     tags: [Categories]
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
 *     summary: Menghapus kategori
 *     tags: [Categories]
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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrasi user baru
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
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diah Ayu
 *               email:
 *                 type: string
 *                 example: diah@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, agen, super_admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Berhasil registrasi
 */

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verifikasi akun menggunakan kode OTP
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
 *                 example: diah@example.com
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
 *     summary: Login user untuk mendapatkan Token JWT
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
 *                 example: diah@example.com
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
 *     summary: Mengirim OTP untuk lupa password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email atau nomor WhatsApp user
 *                 example: "08...."
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
 *     summary: Reset password menggunakan OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "diah@example.com"
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