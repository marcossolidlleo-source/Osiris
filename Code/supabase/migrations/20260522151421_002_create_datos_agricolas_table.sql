/*
  # Crear tabla datos_agricolas para histórico agrícola

  Tablas nuevas:
  - datos_agricolas: tabla para guardar datos agrícolas del último mes, actualizados cada hora
    - id (uuid, clave primaria)
    - finca_id (uuid, referencia a fincas)
    - fecha_lectura (timestamp, cuándo se capturó el dato)
    - temperatura_promedio (decimal, promedio del día en °C)
    - humedad_promedio (decimal, promedio del día en %)
    - flujo_riego (decimal, metros cúbicos de agua aplicada)
    - humedad_radiacion (decimal, radiación solar en W/m²)
    - grados_dias (decimal, unidad térmica de acumulación)
    - velocidad_viento (decimal, km/h)
    - presion_atmosferica (decimal, hPa)
    - velocidad_infiltracion (decimal, mm/h)
    - precipitacion (decimal, mm)
    - velocidad_humedad (decimal, cambio en humedad por hora)
    - radiacion_uva (decimal, radiación UV en W/m²)
    - radiacion_infrarroja (decimal, radiación IR en W/m²)
    - evapotranspiracion (decimal, mm)
    - humedad_relativa (decimal, %)
    - temperatura_minima (decimal, °C)
    - temperatura_maxima (decimal, °C)
    - radiacion_neta (decimal, W/m²)
    - velocidad_lluvia (decimal, mm/h)
    - humedad_hoja (decimal, %)
    - humedad_raiz (decimal, %)

  Seguridad:
  - RLS habilitado en tabla
  - Políticas: usuarios solo leen/escriben datos de sus propias fincas
  - Índices en finca_id y fecha_lectura para consultas rápidas
*/

-- Crear tabla datos_agricolas
CREATE TABLE IF NOT EXISTS datos_agricolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
  fecha_lectura TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperatura_promedio DECIMAL(10, 2),
  humedad_promedio DECIMAL(10, 2),
  flujo_riego DECIMAL(10, 2),
  humedad_radiacion DECIMAL(10, 2),
  grados_dias DECIMAL(10, 2),
  velocidad_viento DECIMAL(10, 2),
  presion_atmosferica DECIMAL(10, 2),
  velocidad_infiltracion DECIMAL(10, 2),
  precipitacion DECIMAL(10, 2),
  velocidad_humedad DECIMAL(10, 2),
  radiacion_uva DECIMAL(10, 2),
  radiacion_infrarroja DECIMAL(10, 2),
  evapotranspiracion DECIMAL(10, 2),
  humedad_relativa DECIMAL(10, 2),
  temperatura_minima DECIMAL(10, 2),
  temperatura_maxima DECIMAL(10, 2),
  radiacion_neta DECIMAL(10, 2),
  velocidad_lluvia DECIMAL(10, 2),
  humedad_hoja DECIMAL(10, 2),
  humedad_raiz DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_datos_agricolas_finca_id ON datos_agricolas(finca_id);
CREATE INDEX IF NOT EXISTS idx_datos_agricolas_fecha_lectura ON datos_agricolas(fecha_lectura);
CREATE INDEX IF NOT EXISTS idx_datos_agricolas_finca_fecha ON datos_agricolas(finca_id, fecha_lectura DESC);

-- Habilitar RLS
ALTER TABLE datos_agricolas ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuarios solo ven datos de sus fincas
CREATE POLICY "Usuarios leen datos agrícolas de sus fincas"
  ON datos_agricolas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = datos_agricolas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- Política para INSERT: usuarios insertan datos de sus fincas
CREATE POLICY "Usuarios insertan datos agrícolas de sus fincas"
  ON datos_agricolas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = datos_agricolas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- Política para UPDATE: usuarios actualizan datos de sus fincas
CREATE POLICY "Usuarios actualizan datos agrícolas de sus fincas"
  ON datos_agricolas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = datos_agricolas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = datos_agricolas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );
