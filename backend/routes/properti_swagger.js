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
 *   - name: Properti (Public & Admin)
 *     description: Manajemen Data Properti dan Pencarian (Public & Admin Only)
 *   - name: Properti (Agen)
 *     description: Manajemen Listing Properti (Agen Only)
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
 *     description: |
 *       Registrasi akun baru.
 *
 *       Ketentuan:
 *       - Jika role = agen, OTP dikirim melalui email.
 *       - Jika role = user, OTP dikirim melalui WhatsApp.
 *       - Email wajib menggunakan domain @gmail.com.
 *       - Email bersifat unique, sehingga email yang sudah terdaftar tidak dapat digunakan kembali.
 *     tags: [Users & Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - whatsapp
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diah
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: '^[a-zA-Z0-9._%+-]+@gmail\.com$'
 *                 example: diah@gmail.com
 *                 description: Email wajib menggunakan domain @gmail.com dan harus unique.
 *               whatsapp:
 *                 type: string
 *                 example: "087891545344"
 *                 description: Nomor WhatsApp aktif. Digunakan untuk OTP jika role user.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, agen]
 *                 example: agen
 *                 description: |
 *                   - agen: OTP dikirim melalui email.
 *                   - user: OTP dikirim melalui WhatsApp.
 *               foto_profil:
 *                 type: string
 *                 format: binary
 *                 description: Foto profil opsional.
 *     responses:
 *       201:
 *         description: Berhasil registrasi dan OTP terkirim sesuai role.
 *       400:
 *         description: Validasi gagal, field wajib belum diisi, email bukan Gmail, atau role tidak valid.
 *       409:
 *         description: Email atau nomor WhatsApp sudah terdaftar.
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
 *             required:
 *               - identifier
 *               - otp
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email atau nomor WhatsApp
 *                 example: diah@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Akun berhasil diverifikasi
 *       400:
 *         description: OTP salah atau sudah kadaluarsa
 *       404:
 *         description: User tidak ditemukan
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
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: diah@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token
 *       400:
 *         description: Email dan password wajib diisi
 *       401:
 *         description: Belum verifikasi atau password salah
 *       404:
 *         description: User tidak ditemukan
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
 *                 example: Diah
 *               email:
 *                 type: string
 *                 format: email
 *                 example: diah@gmail.com
 *               phone_number:
 *                 type: string
 *                 example: "087891545344"
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
 *             required:
 *               - foto_profil
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
 *     tags: [Properti (Public & Admin)]
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
 *     summary: Menambah properti baru (Minimal 2 Foto) (Agen Only) [PRIVATE]
 *     tags: [Properti (Agen)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - harga
 *               - id_kategori
 *               - lokasi
 *               - deskripsi
 *               - kamar_tidur
 *               - kamar_mandi
 *               - luas
 *               - longitude
 *               - latitude
 *               - images
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
 *                 description: Minimal unggah 2 file foto properti.
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
 *     tags: [Properti (Public & Admin)]
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
 *     tags: [Properti (Agen)]
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
 *     tags: [Properti (Agen)]
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
 *     tags: [Properti (Public & Admin)]
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
 *             required:
 *               - status
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
 *             required:
 *               - nama_fasilitas
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
 *             required:
 *               - nama_fasilitas
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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua daftar kategori [PUBLIC]
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil
 *
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
 *             required:
 *               - nama
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
 *             required:
 *               - nama
 *             properties:
 *               nama:
 *                 type: string
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *
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