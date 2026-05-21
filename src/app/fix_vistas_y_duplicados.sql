-- ============================================================
-- FIX COMPLETO: Vistas + Duplicados
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. LIMPIAR DUPLICADOS EN TAREAS
--    Mantiene solo la primera fila por (nombre, obra_id)
-- ──────────────────────────────────────────────────────────
WITH dupes_tareas AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY nombre, obra_id
      ORDER BY created_at ASC NULLS LAST
    ) AS rn
  FROM tareas
)
DELETE FROM tareas
WHERE id IN (SELECT id FROM dupes_tareas WHERE rn > 1);

-- ──────────────────────────────────────────────────────────
-- 2. LIMPIAR DUPLICADOS EN PAGOS
--    Mantiene solo la primera fila por (concepto, obra_id, valor, fecha_vencimiento)
-- ──────────────────────────────────────────────────────────
WITH dupes_pagos AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY concepto, obra_id, valor, fecha_vencimiento
      ORDER BY created_at ASC NULLS LAST
    ) AS rn
  FROM pagos
)
DELETE FROM pagos
WHERE id IN (SELECT id FROM dupes_pagos WHERE rn > 1);

-- ──────────────────────────────────────────────────────────
-- 3. RECREAR v_flujo_caja_mensual
--    El código del panel espera: anio, mes, total_ingresos, total_egresos, flujo_neto
-- ──────────────────────────────────────────────────────────
DROP VIEW IF EXISTS v_flujo_caja_mensual;

CREATE VIEW v_flujo_caja_mensual AS
SELECT
  EXTRACT(YEAR  FROM COALESCE(fecha_pago, fecha_vencimiento))::int AS anio,
  EXTRACT(MONTH FROM COALESCE(fecha_pago, fecha_vencimiento))::int AS mes,
  SUM(CASE WHEN tipo = 'ingreso' THEN valor ELSE 0     END)        AS total_ingresos,
  SUM(CASE WHEN tipo = 'egreso'  THEN valor ELSE 0     END)        AS total_egresos,
  SUM(CASE WHEN tipo = 'ingreso' THEN valor ELSE -valor END)       AS flujo_neto
FROM pagos
WHERE COALESCE(fecha_pago, fecha_vencimiento) IS NOT NULL
GROUP BY 1, 2
ORDER BY 1, 2;

-- ──────────────────────────────────────────────────────────
-- 4. RECREAR v_pagos_proximos
--    Solo pagos en ventana: -30 días (recientes vencidos) hasta +7 días (próximos)
-- ──────────────────────────────────────────────────────────
DROP VIEW IF EXISTS v_pagos_proximos;

CREATE VIEW v_pagos_proximos AS
SELECT
  *,
  (fecha_vencimiento - CURRENT_DATE)::int AS dias_para_vencer
FROM pagos
WHERE estado IN ('pendiente', 'vencido')
  AND fecha_vencimiento >= CURRENT_DATE - INTERVAL '30 days'
  AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY fecha_vencimiento ASC;

-- ──────────────────────────────────────────────────────────
-- 5. VERIFICAR resultados
-- ──────────────────────────────────────────────────────────
SELECT 'tareas activas'        AS tabla, COUNT(*) AS total FROM tareas WHERE estado != 'completada'
UNION ALL
SELECT 'pagos total',           COUNT(*) FROM pagos
UNION ALL
SELECT 'v_flujo_caja_mensual',  COUNT(*) FROM v_flujo_caja_mensual
UNION ALL
SELECT 'v_pagos_proximos',      COUNT(*) FROM v_pagos_proximos;
