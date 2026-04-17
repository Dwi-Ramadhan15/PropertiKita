CREATE TABLE IF NOT EXISTS agen (
    id integer NOT NULL,
    nama_agen character varying(100) NOT NULL,
    no_whatsapp character varying(20) NOT NULL,
    foto_profil text,
    email character varying(100)
);
CREATE SEQUENCE public.agen_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.agen_id_seq OWNED BY public.agen.id;
ALTER TABLE ONLY public.agen ALTER COLUMN id SET DEFAULT nextval('public.agen_id_seq'::regclass);