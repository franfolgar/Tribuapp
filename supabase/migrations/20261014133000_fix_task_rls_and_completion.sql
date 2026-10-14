BEGIN;

-- Asegurar RLS en tareas_asignadas y tareas_catalogo
ALTER TABLE public.tareas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_asignadas ENABLE ROW LEVEL SECURITY;

-- Politicas completas para tareas_catalogo
DROP POLICY IF EXISTS tareas_catalogo_all ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_select ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_insert ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_update ON public.tareas_catalogo;
DROP POLICY IF EXISTS tareas_catalogo_delete ON public.tareas_catalogo;

CREATE POLICY tareas_catalogo_all ON public.tareas_catalogo
    FOR ALL TO authenticated
    USING (familia_id IS NULL OR familia_id = public.mi_familia_id())
    WITH CHECK (familia_id IS NULL OR familia_id = public.mi_familia_id());

GRANT ALL ON TABLE public.tareas_catalogo TO authenticated;

-- Politicas completas para tareas_asignadas
DROP POLICY IF EXISTS tareas_asignadas_all ON public.tareas_asignadas;
DROP POLICY IF EXISTS tareas_asignadas_select ON public.tareas_asignadas;
DROP POLICY IF EXISTS tareas_asignadas_insert ON public.tareas_asignadas;
DROP POLICY IF EXISTS tareas_asignadas_update ON public.tareas_asignadas;
DROP POLICY IF EXISTS tareas_asignadas_delete ON public.tareas_asignadas;

CREATE POLICY tareas_asignadas_all ON public.tareas_asignadas
    FOR ALL TO authenticated
    USING (familia_id = public.mi_familia_id())
    WITH CHECK (familia_id = public.mi_familia_id());

GRANT ALL ON TABLE public.tareas_asignadas TO authenticated;

COMMIT;
