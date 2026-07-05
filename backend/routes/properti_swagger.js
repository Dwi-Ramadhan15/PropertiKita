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
 *     tags:
 *       - Users & Auth
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
 *                 example: Dwi
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: '^[a-zA-Z0-9._%+-]+@gmail\.com$'
 *                 example: dwir57017@gmail.com
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
 *                 enum:
 *                   - user
 *                   - agen
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
 *     tags:
 *       - Users & Auth
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
 *                 example: dwir57017@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Akun berhasil diverifikasi.
 *       400:
 *         description: OTP salah atau sudah kadaluarsa.
 *       404:
 *         description: User tidak ditemukan.
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login untuk mendapatkan Token JWT [PUBLIC]
 *     tags:
 *       - Users & Auth
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
 *                 format: email
 *                 example: dwir57017@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123123123"
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token.
 *       400:
 *         description: Email dan password wajib diisi.
 *       401:
 *         description: Belum verifikasi atau password salah.
 *       404:
 *         description: User tidak ditemukan.
 */

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Meminta OTP untuk reset password [PUBLIC]
 *     description: Mengirimkan kode OTP ke WhatsApp untuk proses lupa sandi (baik untuk role user maupun agen).
 *     tags:
 *       - Users & Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Nomor WhatsApp pengguna yang sudah terdaftar.
 *                 example: "087891545344"
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim ke WhatsApp.
 *       400:
 *         description: Identifier tidak valid atau kosong.
 *       404:
 *         description: User tidak ditemukan di sistem.
 */

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password menggunakan kode OTP [PUBLIC]
 *     description: Mengatur ulang kata sandi pengguna dengan memvalidasi OTP yang telah dikirimkan sebelumnya melalui WhatsApp.
 *     tags:
 *       - Users & Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - otp
 *               - new_password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Nomor WhatsApp.
 *                 example: "087891545344"
 *               otp:
 *                 type: string
 *                 description: Kode OTP yang diterima dari WhatsApp.
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 description: Kata sandi baru yang ingin digunakan.
 *                 example: "passwordBaru123"
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diubah, silakan login dengan sandi baru.
 *       400:
 *         description: OTP salah, sudah kadaluarsa, atau format password tidak valid.
 *       404:
 *         description: User tidak ditemukan.
 */

/**
 * @swagger
 * /api/users/agen/terverifikasi:
 *   get:
 *     summary: Mendapatkan daftar agen yang sudah terverifikasi OTP [PUBLIC]
 *     description: Rute khusus untuk menampilkan daftar agen di halaman public/user.
 *     tags:
 *       - Users & Auth
 *     responses:
 *       200:
 *         description: Berhasil menarik data agen.
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Mendapatkan data profil user yang sedang login [PRIVATE]
 *     tags:
 *       - Users & Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menarik profil.
 *
 *   put:
 *     summary: Mengupdate data profil (Nama, Email, WA) [PRIVATE]
 *     tags:
 *       - Users & Auth
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
 *                 example: Dwi
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: '^[a-zA-Z0-9._%+-]+@gmail\.com$'
 *                 example: dwir57017@gmail.com
 *                 description: Email wajib menggunakan domain @gmail.com.
 *               phone_number:
 *                 type: string
 *                 example: "087891545344"
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate.
 *       400:
 *         description: Validasi gagal atau email bukan Gmail.
 *       409:
 *         description: Email sudah digunakan user lain.
 */

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Update foto profil [PRIVATE]
 *     tags:
 *       - Users & Auth
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
 *         description: Foto profil berhasil diupdate.
 */

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON + Pagination) [PUBLIC]
 *     tags:
 *       - Properti (Public & Admin)
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
 *           enum:
 *             - all
 *             - approved
 *             - pending
 *             - rejected
 *             - sold
 *         description: Pilih 'all' untuk melihat semua status. Berguna untuk admin mengambil data pending/approved secara bersamaan.
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
 *         description: Data properti berhasil diambil.
 *
 *   post:
 *     summary: Menambah properti baru (Minimal 2 Foto) (Agen Only) [PRIVATE]
 *     tags:
 *       - Properti (Agen)
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
 *               - tipe
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
 *                 example: Rumah Minimalis Rajabasa
 *               harga:
 *                 type: integer
 *                 example: 250000000
 *               tipe:
 *                 type: string
 *                 enum:
 *                   - Rumah
 *                   - Kost
 *                   - Apartemen
 *                   - Villa
 *                 example: Rumah
 *               id_kategori:
 *                 type: integer
 *                 example: 1
 *               lokasi:
 *                 type: string
 *                 example: Rajabasa, Bandar Lampung
 *               deskripsi:
 *                 type: string
 *                 example: Rumah nyaman dekat kampus dan fasilitas umum.
 *               kamar_tidur:
 *                 type: integer
 *                 example: 3
 *               kamar_mandi:
 *                 type: integer
 *                 example: 2
 *               luas:
 *                 type: integer
 *                 example: 120
 *               longitude:
 *                 type: number
 *                 format: double
 *                 example: 105.25803
 *               latitude:
 *                 type: number
 *                 format: double
 *                 example: -5.37710
 *               images:
 *                 type: array
 *                 description: Minimal unggah 2 file foto properti.
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Properti berhasil dikirim.
 *       400:
 *         description: Validasi gagal atau foto kurang dari 2.
 *       401:
 *         description: Token tidak ditemukan atau belum login.
 *       403:
 *         description: Hanya agen yang boleh menambahkan properti.
 */

/**
 * @swagger
 * /api/properti/{slug}:
 *   get:
 *     summary: Mendapatkan detail lengkap properti + Gallery + Fasilitas [PUBLIC]
 *     tags:
 *       - Properti (Public & Admin)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: rumah-minimalis-rajabasa
 *     responses:
 *       200:
 *         description: Detail properti ditemukan.
 *       404:
 *         description: Properti tidak ditemukan.
 */

/**
 * @swagger
 * /api/properti/{id}:
 *   put:
 *     summary: Mengupdate data properti (Agen Only) [PRIVATE]
 *     tags:
 *       - Properti (Agen)
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
 *                 format: double
 *               latitude:
 *                 type: number
 *                 format: double
 *               existing_images:
 *                 type: string
 *                 description: Data gambar lama yang tetap dipakai.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Berhasil update data.
 *
 *   delete:
 *     summary: Menghapus properti permanen (Agen Only) [PRIVATE]
 *     tags:
 *       - Properti (Agen)
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
 *         description: Properti dihapus.
 */

/**
 * @swagger
 * /api/properti/{id}/status:
 *   put:
 *     summary: Update status properti (Admin Only) [PRIVATE]
 *     tags:
 *       - Properti (Public & Admin)
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
 *                 enum:
 *                   - approved
 *                   - rejected
 *                   - pending
 *                   - sold
 *                 example: approved
 *     responses:
 *       200:
 *         description: Status berhasil diubah.
 */

/**
 * @swagger
 * /api/fasilitas:
 *   get:
 *     summary: Mendapatkan semua fasilitas agen [PRIVATE]
 *     tags:
 *       - Fasilitas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil fasilitas.
 *
 *   post:
 *     summary: Menambah master fasilitas (Agen Only) [PRIVATE]
 *     tags:
 *       - Fasilitas
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
 *                 example: Kolam Renang
 *     responses:
 *       201:
 *         description: Fasilitas ditambahkan.
 */

/**
 * @swagger
 * /api/fasilitas/{id}:
 *   put:
 *     summary: Mengupdate nama fasilitas [PRIVATE]
 *     tags:
 *       - Fasilitas
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
 *                 example: Garasi Mobil
 *     responses:
 *       200:
 *         description: Fasilitas diupdate.
 *
 *   delete:
 *     summary: Menghapus fasilitas [PRIVATE]
 *     tags:
 *       - Fasilitas
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
 *         description: Fasilitas dihapus.
 */

/**
 * @swagger
 * /api/notifications/{id_agen}:
 *   get:
 *     summary: Mengambil riwayat notifikasi [PRIVATE]
 *     tags:
 *       - Notifications
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
 *         description: Berhasil menarik data notifikasi.
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Menandai semua notifikasi telah dibaca [PRIVATE]
 *     tags:
 *       - Notifications
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
 *         description: Notifikasi ditandai dibaca.
 */

/**
 * @swagger
 * /api/notifications/{id}/clear:
 *   delete:
 *     summary: Menghapus semua riwayat notifikasi [PRIVATE]
 *     tags:
 *       - Notifications
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
 *         description: Notifikasi dibersihkan.
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua daftar kategori [PUBLIC]
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Berhasil mengambil kategori.
 *
 *   post:
 *     summary: Menambah kategori baru (Admin Only) [PRIVATE]
 *     tags:
 *       - Categories
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
 *         description: Berhasil dibuat.
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Mengupdate nama kategori (Admin Only) [PRIVATE]
 *     tags:
 *       - Categories
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
 *                 example: Dijual
 *     responses:
 *       200:
 *         description: Berhasil diupdate.
 *
 *   delete:
 *     summary: Menghapus kategori (Admin Only) [PRIVATE]
 *     tags:
 *       - Categories
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
 *         description: Berhasil dihapus.
 */