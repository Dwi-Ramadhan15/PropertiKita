CREATE TABLE IF NOT EXISTS users (
    id integer PRIMARY KEY NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    otp_code character varying(6),
    phone_number character varying(20),
    foto_profil text
);
CREATE SEQUENCE public.users_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);