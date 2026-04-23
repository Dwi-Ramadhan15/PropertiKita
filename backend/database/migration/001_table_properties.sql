CREATE TABLE IF NOT EXISTS properties (
    id integer PRIMARY KEY NOT NULL,
    id_agen integer,
    title character varying(255) NOT NULL,
    harga bigint NOT NULL,
    lokasi character varying(255) NOT NULL,
    tipe character varying(50) NOT NULL,
    image_url text,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    kamar_tidur integer,
    kamar_mandi integer,
    luas integer,
    id_kategori integer,
    slug character varying(255),
    deskripsi text DEFAULT ''::text,
    kolam_renang boolean DEFAULT false,
    wifi boolean DEFAULT false,
    keamanan_24jam boolean DEFAULT false,
    parkir boolean DEFAULT false,
    ac boolean DEFAULT false,
    status character varying(20) DEFAULT 'pending'::character varying
);

CREATE SEQUENCE public.properties_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;
ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);