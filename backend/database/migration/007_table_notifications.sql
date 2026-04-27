CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    id_agen INTEGER REFERENCES agen(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- (contoh: 'approved', 'rejected', 'info')
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);