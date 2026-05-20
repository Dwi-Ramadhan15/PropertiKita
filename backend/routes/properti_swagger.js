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
 *   - name: Users & Auth
 *     description: Autentikasi, Profil, dan Manajemen User/Agen
 *   - name: Properti
 *     description: Manajemen Data Properti dan Pencarian
 *   - name: Fasilitas
 *     description: Manajemen Fasilitas Properti (Agen Only)
 *   - name: Notifications
 *     description: Sistem Notifikasi Real-time & Riwayat
 *   - name: Categories
 *     description: Master data kategori properti
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrasi user/agen baru [PUBLIC]
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [user, agen]
 *               foto_profil:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Berhasil registrasi dan OTP terkirim
 */

/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verifikasi akun menggunakan kode OTP [PUBLIC]
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email atau nomor WhatsApp
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Akun berhasil diverifikasi
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login untuk mendapatkan Token JWT [PUBLIC]
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token
 */

/**
 * @swagger
 * /api/users/agen/terverifikasi:
 *   get:
 *     summary: Mendapatkan daftar agen yang sudah terverifikasi OTP [PUBLIC]
 *     description: Rute khusus untuk menampilkan daftar agen di halaman public/user.
 *     tags: [Users & Auth]
 *     responses:
 *       200:
 *         description: Berhasil menarik data agen
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Mendapatkan data profil user yang sedang login [PRIVATE]
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menarik profil
 *
 *   put:
 *     summary: Mengupdate data profil (Nama, Email, WA) [PRIVATE]
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate
 */

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Update foto profil [PRIVATE]
 *     tags: [Users & Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto_profil:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto profil berhasil diupdate
 */

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON + Pagination) [PUBLIC]
 *     tags: [Properti]
 *     parameters:
 *       - in: query
 *         name: minHarga
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxHarga
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lokasi
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_kategori
 *         schema:
 *           type: integer
 *       - in: query
 *         name: kamar_tidur
 *         schema:
 *           type: string
 *       - in: query
 *         name: agen
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Data properti berhasil diambil
 *
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
 *                 type: integer
 *               kamar_mandi:
 *                 type: integer
 *               luas:
 *                 type: integer
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Properti berhasil dikirim
 */

/**
 * @swagger
 * /api/properti/{slug}:
 *   get:
 *     summary: Mendapatkan detail lengkap properti + Gallery + Fasilitas [PUBLIC]
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail properti ditemukan
 */

/**
 * @swagger
 * /api/properti/{id}:
 *   put:
 *     summary: Mengupdate data properti (Agen Only) [PRIVATE]
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               existing_images:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Berhasil update data
 *
 *   delete:
 *     summary: Menghapus properti permanen (Agen Only) [PRIVATE]
 *     tags: [Properti]
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
 *         description: Properti dihapus
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
 *     summary: Mendapatkan semua fasilitas agen [PRIVATE]
 *     tags: [Fasilitas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil fasilitas
 *
 *   post:
 *     summary: Menambah master fasilitas (Agen Only) [PRIVATE]
 *     tags: [Fasilitas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_fasilitas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fasilitas ditambahkan
 */

/**
 * @swagger
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
 *     responses:
 *       200:
 *         description: Fasilitas diupdate
 *
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
 *         description: Fasilitas dihapus
 */

/**
 * @swagger
 * /api/notifications/{id_agen}:
 *   get:
 *     summary: Mengambil riwayat notifikasi [PRIVATE]
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
 *     summary: Menandai semua notifikasi telah dibaca [PRIVATE]
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
 * /api/notifications/{id}/clear:
 *   delete:
 *     summary: Menghapus semua riwayat notifikasi [PRIVATE]
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
 *         description: Notifikasi dibersihkan
 */