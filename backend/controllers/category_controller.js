const db = require('../utils/db');

const getAllCategories = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { nama } = req.body;
        const { rows } = await db.query(
            'INSERT INTO categories (nama) VALUES ($1) RETURNING *',
            [nama]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama } = req.body;
        const { rows } = await db.query(
            'UPDATE categories SET nama = $1 WHERE id = $2 RETURNING *',
            [nama, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Kategori tidak ditemukan" });
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM categories WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };