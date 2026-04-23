CREATE TABLE IF NOT EXISTS property_images (
    id integer NOT NULL,
    id_properti integer,
    image_url text NOT NULL
);
CREATE SEQUENCE public.property_images_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.property_images_id_seq OWNED BY public.property_images.id;
ALTER TABLE ONLY public.property_images ALTER COLUMN id SET DEFAULT nextval('public.property_images_id_seq'::regclass);