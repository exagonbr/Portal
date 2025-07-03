-- Table: public.roles

-- DROP TABLE IF EXISTS public.roles;

CREATE TABLE IF NOT EXISTS public.roles
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default" NOT NULL DEFAULT 'system'::text,
    user_count integer DEFAULT 0,
    status text COLLATE pg_catalog."default" DEFAULT 'active'::text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_name_unique UNIQUE (name),
    CONSTRAINT roles_type_check CHECK (type = ANY (ARRAY['system'::text, 'custom'::text])),
    CONSTRAINT roles_status_check CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.roles
    OWNER to postgres;

-- Trigger: update_roles_updated_at

-- DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;

-- Table: public.institutions


-- DROP TABLE IF EXISTS public.institutions;

CREATE TABLE IF NOT EXISTS public.institutions
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    city character varying(255) COLLATE pg_catalog."default",
    state character varying(255) COLLATE pg_catalog."default",
    zip_code character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    website character varying(255) COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default" DEFAULT 'active'::text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active boolean NOT NULL DEFAULT true,
    type character varying COLLATE pg_catalog."default",
    CONSTRAINT institutions_pkey PRIMARY KEY (id),
    CONSTRAINT institutions_code_unique UNIQUE (code),
    CONSTRAINT institutions_status_check CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.institutions
    OWNER to postgres;

-- Trigger: update_institutions_updated_at

-- DROP TRIGGER IF EXISTS update_institutions_updated_at ON public.institutions;

CREATE OR REPLACE TRIGGER update_institutions_updated_at
    BEFORE UPDATE 
    ON public.institutions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();