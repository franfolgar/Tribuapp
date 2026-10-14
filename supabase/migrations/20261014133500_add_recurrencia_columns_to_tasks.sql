BEGIN;

ALTER TABLE public.tareas_asignadas ADD COLUMN IF NOT EXISTS recurrencia text DEFAULT 'Puntual';
ALTER TABLE public.tareas_catalogo ADD COLUMN IF NOT EXISTS recurrencia_sugerida text DEFAULT 'Puntual';

COMMIT;
