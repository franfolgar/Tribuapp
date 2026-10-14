BEGIN;

-- 1. Tabla para la lista de la compra familiar compartida
CREATE TABLE IF NOT EXISTS public.familias_compras (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    cantidad text NOT NULL DEFAULT '',
    seccion text NOT NULL DEFAULT 'General',
    comprado boolean NOT NULL DEFAULT false,
    creado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Habilitar RLS en familias_compras
ALTER TABLE public.familias_compras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS familias_compras_policy ON public.familias_compras;
CREATE POLICY familias_compras_policy
ON public.familias_compras
FOR ALL
TO authenticated
USING (familia_id = public.mi_familia_id())
WITH CHECK (familia_id = public.mi_familia_id());

GRANT ALL ON TABLE public.familias_compras TO authenticated;

-- 2. Tabla para el menú semanal compartido de la familia
CREATE TABLE IF NOT EXISTS public.familias_menus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    familia_id uuid NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
    dia text NOT NULL,
    tipo text NOT NULL,
    nombre text NOT NULL,
    tiempo text NOT NULL DEFAULT '25 min',
    ingredientes jsonb NOT NULL DEFAULT '[]'::jsonb,
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_familia_menu_dia_tipo UNIQUE (familia_id, dia, tipo)
);

-- Habilitar RLS en familias_menus
ALTER TABLE public.familias_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS familias_menus_policy ON public.familias_menus;
CREATE POLICY familias_menus_policy
ON public.familias_menus
FOR ALL
TO authenticated
USING (familia_id = public.mi_familia_id())
WITH CHECK (familia_id = public.mi_familia_id());

GRANT ALL ON TABLE public.familias_menus TO authenticated;

COMMIT;
