-- ============================================================
-- DATOS DEMO: TAREAS y PAGOS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- TAREAS para Casa Rodriguez - Chia (obra 001)
-- ──────────────────────────────────────────────────────────
INSERT INTO tareas (obra_id, nombre, descripcion, estado, prioridad, fecha_inicio_plan, fecha_fin_plan, porcentaje_avance) VALUES
('20000000-0000-0000-0000-000000000001', 'Excavación y movimiento de tierras', 'Excavación para cimentación según planos', 'completada', 'alta', '2025-01-10', '2025-01-20', 100),
('20000000-0000-0000-0000-000000000001', 'Cimentación y zapatas', 'Vaciado de concreto para cimentación', 'completada', 'alta', '2025-01-21', '2025-02-05', 100),
('20000000-0000-0000-0000-000000000001', 'Estructura primer piso', 'Columnas y vigas primer nivel', 'completada', 'alta', '2025-02-06', '2025-03-01', 100),
('20000000-0000-0000-0000-000000000001', 'Mampostería primer piso', 'Levantamiento de muros en bloque', 'en_progreso', 'alta', '2025-03-02', '2025-04-15', 65),
('20000000-0000-0000-0000-000000000001', 'Instalaciones eléctricas primer piso', 'Tubería y cableado eléctrico', 'en_progreso', 'media', '2025-03-15', '2025-04-30', 40),
('20000000-0000-0000-0000-000000000001', 'Instalaciones hidrosanitarias', 'Red de acueducto y alcantarillado', 'pendiente', 'media', '2025-04-01', '2025-05-15', 0),
('20000000-0000-0000-0000-000000000001', 'Estructura segundo piso', 'Losa y columnas segundo nivel', 'pendiente', 'alta', '2025-04-15', '2025-05-30', 0),
('20000000-0000-0000-0000-000000000001', 'Acabados y pintura', 'Estuco, pintura y pisos', 'pendiente', 'media', '2025-06-01', '2025-07-15', 0);

-- ──────────────────────────────────────────────────────────
-- TAREAS para Remodelacion Gomez - Medellin (obra 002)
-- ──────────────────────────────────────────────────────────
INSERT INTO tareas (obra_id, nombre, descripcion, estado, prioridad, fecha_inicio_plan, fecha_fin_plan, porcentaje_avance) VALUES
('20000000-0000-0000-0000-000000000002', 'Demolición y limpieza', 'Demolición de muros a modificar', 'completada', 'alta', '2025-02-01', '2025-02-10', 100),
('20000000-0000-0000-0000-000000000002', 'Refuerzo estructural', 'Refuerzo de vigas y columnas existentes', 'completada', 'alta', '2025-02-11', '2025-02-28', 100),
('20000000-0000-0000-0000-000000000002', 'Nueva distribución espacial', 'Levantamiento de muros divisorios nuevos', 'en_progreso', 'alta', '2025-03-01', '2025-03-31', 70),
('20000000-0000-0000-0000-000000000002', 'Instalaciones eléctricas nuevas', 'Red eléctrica nueva distribución', 'en_progreso', 'media', '2025-03-15', '2025-04-15', 30),
('20000000-0000-0000-0000-000000000002', 'Pisos y enchapes', 'Instalación de pisos y baldosas', 'pendiente', 'media', '2025-04-01', '2025-04-30', 0),
('20000000-0000-0000-0000-000000000002', 'Pintura y acabados finales', 'Estuco liso y pintura de interiores', 'pendiente', 'baja', '2025-05-01', '2025-05-31', 0);

-- ──────────────────────────────────────────────────────────
-- TAREAS para Centro Comercial Inversiones (obra 003)
-- ──────────────────────────────────────────────────────────
INSERT INTO tareas (obra_id, nombre, descripcion, estado, prioridad, fecha_inicio_plan, fecha_fin_plan, porcentaje_avance) VALUES
('20000000-0000-0000-0000-000000000003', 'Estudio de suelos y topografía', 'Análisis geotécnico del terreno', 'completada', 'critica', '2024-11-01', '2024-11-30', 100),
('20000000-0000-0000-0000-000000000003', 'Diseño estructural', 'Cálculo y diseño estructura metálica', 'completada', 'critica', '2024-12-01', '2025-01-31', 100),
('20000000-0000-0000-0000-000000000003', 'Pilotaje y cimentación profunda', 'Instalación de pilotes de concreto', 'en_progreso', 'critica', '2025-02-01', '2025-04-30', 45),
('20000000-0000-0000-0000-000000000003', 'Estructura metálica nivel 1', 'Montaje de estructura de acero nivel 1', 'pendiente', 'alta', '2025-05-01', '2025-07-31', 0),
('20000000-0000-0000-0000-000000000003', 'Losa de piso nivel 1', 'Vaciado losa de concreto reforzado', 'pendiente', 'alta', '2025-06-01', '2025-08-31', 0),
('20000000-0000-0000-0000-000000000003', 'Fachada y cubierta', 'Instalación fachada vidrio y cubierta metálica', 'pendiente', 'media', '2025-09-01', '2025-12-31', 0);

-- ──────────────────────────────────────────────────────────
-- PAGOS (ingresos de clientes)
-- ──────────────────────────────────────────────────────────
INSERT INTO pagos (tipo, obra_id, concepto, valor, fecha_pago, fecha_vencimiento, estado, cuota_numero, cuotas_total) VALUES
-- Casa Rodriguez pagos
('ingreso', '20000000-0000-0000-0000-000000000001', 'Anticipo inicial contrato', 80000000, '2025-01-05', '2025-01-05', 'pagado', 1, 4),
('ingreso', '20000000-0000-0000-0000-000000000001', 'Segunda cuota - avance 25%', 80000000, '2025-02-28', '2025-02-28', 'pagado', 2, 4),
('ingreso', '20000000-0000-0000-0000-000000000001', 'Tercera cuota - avance 50%', 80000000, NULL, '2025-05-15', 'pendiente', 3, 4),
('ingreso', '20000000-0000-0000-0000-000000000001', 'Cuota final - entrega obra', 80000000, NULL, '2025-08-30', 'pendiente', 4, 4),

-- Remodelacion Gomez pagos
('ingreso', '20000000-0000-0000-0000-000000000002', 'Anticipo remodelación', 35000000, '2025-02-01', '2025-02-01', 'pagado', 1, 3),
('ingreso', '20000000-0000-0000-0000-000000000002', 'Segunda cuota remodelación', 35000000, '2025-03-31', '2025-03-31', 'pagado', 2, 3),
('ingreso', '20000000-0000-0000-0000-000000000002', 'Cuota final remodelación', 35000000, NULL, '2025-06-30', 'pendiente', 3, 3),

-- Centro Comercial pagos
('ingreso', '20000000-0000-0000-0000-000000000003', 'Anticipo Centro Comercial', 200000000, '2025-01-15', '2025-01-15', 'pagado', 1, 5),
('ingreso', '20000000-0000-0000-0000-000000000003', 'Segunda cuota CC', 150000000, '2025-03-01', '2025-03-01', 'pagado', 2, 5),
('ingreso', '20000000-0000-0000-0000-000000000003', 'Tercera cuota CC', 150000000, NULL, '2025-06-01', 'pendiente', 3, 5),
('ingreso', '20000000-0000-0000-0000-000000000003', 'Cuarta cuota CC', 150000000, NULL, '2025-09-01', 'pendiente', 4, 5),
('ingreso', '20000000-0000-0000-0000-000000000003', 'Cuota final CC', 150000000, NULL, '2025-12-01', 'pendiente', 5, 5),

-- Egreso proveedores (próximos a vencer)
('egreso', '20000000-0000-0000-0000-000000000001', 'Proveedor cemento - factura Mayo', 8500000, NULL, '2026-05-28', 'pendiente', NULL, NULL),
('egreso', '20000000-0000-0000-0000-000000000001', 'Arrendamiento andamios Junio', 3200000, NULL, '2026-06-05', 'pendiente', NULL, NULL),
('egreso', '20000000-0000-0000-0000-000000000002', 'Contratista acabados saldo', 12000000, NULL, '2026-05-25', 'pendiente', NULL, NULL),
('egreso', '20000000-0000-0000-0000-000000000003', 'Proveedor acero estructura', 45000000, NULL, '2026-06-10', 'pendiente', NULL, NULL);

-- ──────────────────────────────────────────────────────────
-- ACTUALIZAR STOCK inventario (cantidad_disponible)
-- ──────────────────────────────────────────────────────────
-- Obtener IDs de obra y material para actualizar
-- Ejecuta esto SOLO si el inventario tiene registros con stock en 0

UPDATE inventario SET cantidad_disponible =
  CASE
    WHEN obra_id = '20000000-0000-0000-0000-000000000001'
      AND material_id = (SELECT id FROM materiales WHERE codigo = 'MAT-001') THEN 45
    WHEN obra_id = '20000000-0000-0000-0000-000000000001'
      AND material_id = (SELECT id FROM materiales WHERE codigo = 'MAT-002') THEN 12
    WHEN obra_id = '20000000-0000-0000-0000-000000000001'
      AND material_id = (SELECT id FROM materiales WHERE codigo = 'MAT-003') THEN 500
    WHEN obra_id = '20000000-0000-0000-0000-000000000001'
      AND material_id = (SELECT id FROM materiales WHERE codigo = 'MAT-004') THEN 80
    WHEN obra_id = '20000000-0000-0000-0000-000000000001'
      AND material_id = (SELECT id FROM materiales WHERE codigo = 'MAT-005') THEN 8
    ELSE cantidad_disponible
  END;
