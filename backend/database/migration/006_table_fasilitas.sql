CREATE TABLE fasilitas_properti (
    id SERIAL PRIMARY KEY,
    id_properti INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    nama_fasilitas VARCHAR(100) NOT NULL
);