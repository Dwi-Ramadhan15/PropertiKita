CREATE TABLE IF NOT EXISTS categories (
    id integer NOT NULL,
    nama character varying(100) NOT NULL
);
CREATE SEQUENCE public.categories_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);