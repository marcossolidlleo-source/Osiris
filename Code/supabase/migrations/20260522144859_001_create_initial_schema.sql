/*
  # Osiris - Esquema Inicial de Base de Datos
  
  ## Descripción
  Crea la estructura completa de tablas para la aplicación Osiris:
  - Usuarios (autenticación)
  - Fincas/Parcelas
  - Sensores IoT
  - Datos históricos de sensores
  - Órdenes de trabajo (Odoo)
  - Alertas y registros
  
  ## Tablas Principales
  - usuarios: Users with email/password auth
  - fincas: Farms with GPS coordinates
  - parcelas: Farm plots/sections
  - sensores_iot: IoT sensor definitions
  - datos_sensores: Sensor readings history
  - ordenes_trabajo: Work orders from Odoo
  - alertas: Alerts and warnings
  - cultivos_referencia: Crop reference data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create fincas table
CREATE TABLE IF NOT EXISTS fincas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  hectareas DECIMAL(10, 2) NOT NULL,
  cultivo TEXT,
  sector TEXT,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create parcelas table
CREATE TABLE IF NOT EXISTS parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo_cultivo TEXT,
  hectareas DECIMAL(10, 2),
  descripcion TEXT,
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensores_iot table
CREATE TABLE IF NOT EXISTS sensores_iot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES parcelas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo_sensor TEXT NOT NULL CHECK (tipo_sensor IN ('Humedad', 'Temperatura', 'pH', 'Luz')),
  modelo TEXT,
  ubicacion_x DECIMAL(10, 4),
  ubicacion_y DECIMAL(10, 4),
  ubicacion_z DECIMAL(10, 4),
  valor_ideal TEXT,
  estado BOOLEAN DEFAULT true,
  ultima_lectura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create datos_sensores table (historical data)
CREATE TABLE IF NOT EXISTS datos_sensores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES sensores_iot(id) ON DELETE CASCADE,
  valor DECIMAL(10, 4) NOT NULL,
  unidad TEXT,
  temperatura DECIMAL(10, 2),
  humedad DECIMAL(10, 2),
  ph DECIMAL(10, 2),
  iluminacion DECIMAL(10, 2),
  estado_sensor TEXT CHECK (estado_sensor IN ('normal', 'advertencia', 'critico')),
  fecha_lectura TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ordenes_trabajo table
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  cost DECIMAL(10, 2),
  insumos_utilizados TEXT,
  horas_trabajo DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create alertas table
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('meteorologica', 'plagas', 'riego', 'fertilizacion', 'incendio', 'otro')),
  nivel TEXT DEFAULT 'info' CHECK (nivel IN ('info', 'advertencia', 'critico')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  estado BOOLEAN DEFAULT true,
  notificado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create cultivos_referencia table
CREATE TABLE IF NOT EXISTS cultivos_referencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  emoji TEXT,
  temp_min DECIMAL(10, 2),
  temp_max DECIMAL(10, 2),
  humedad_min DECIMAL(10, 2),
  humedad_max DECIMAL(10, 2),
  ph_min DECIMAL(10, 2),
  ph_max DECIMAL(10, 2),
  ciclo_vida TEXT,
  especie TEXT,
  metodo TEXT,
  uso TEXT
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_fincas_usuario_id ON fincas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_finca_id ON parcelas(finca_id);
CREATE INDEX IF NOT EXISTS idx_sensores_parcela_id ON sensores_iot(parcela_id);
CREATE INDEX IF NOT EXISTS idx_datos_sensores_sensor_id ON datos_sensores(sensor_id);
CREATE INDEX IF NOT EXISTS idx_datos_sensores_fecha ON datos_sensores(fecha_lectura);
CREATE INDEX IF NOT EXISTS idx_ordenes_finca_id ON ordenes_trabajo(finca_id);
CREATE INDEX IF NOT EXISTS idx_alertas_finca_id ON alertas(finca_id);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas(created_at);

-- Enable Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fincas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensores_iot ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_sensores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios
CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for fincas
CREATE POLICY "Usuarios pueden leer sus propias fincas"
  ON fincas FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden insertar fincas"
  ON fincas FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus fincas"
  ON fincas FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- RLS Policies for parcelas
CREATE POLICY "Usuarios pueden leer parcelas de sus fincas"
  ON parcelas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = parcelas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden insertar parcelas"
  ON parcelas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = parcelas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- RLS Policies for sensores_iot
CREATE POLICY "Usuarios pueden leer sensores de sus parcelas"
  ON sensores_iot FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parcelas
      JOIN fincas ON fincas.id = parcelas.finca_id
      WHERE parcelas.id = sensores_iot.parcela_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- RLS Policies for datos_sensores
CREATE POLICY "Usuarios pueden leer datos de sus sensores"
  ON datos_sensores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sensores_iot
      JOIN parcelas ON parcelas.id = sensores_iot.parcela_id
      JOIN fincas ON fincas.id = parcelas.finca_id
      WHERE sensores_iot.id = datos_sensores.sensor_id
      AND fincas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Sistema puede insertar datos de sensores"
  ON datos_sensores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for ordenes_trabajo
CREATE POLICY "Usuarios pueden leer ordenes de sus fincas"
  ON ordenes_trabajo FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = ordenes_trabajo.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- RLS Policies for alertas
CREATE POLICY "Usuarios pueden leer alertas de sus fincas"
  ON alertas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fincas
      WHERE fincas.id = alertas.finca_id
      AND fincas.usuario_id = auth.uid()
    )
  );

-- Insert reference crops
INSERT INTO cultivos_referencia (nombre, emoji, temp_min, temp_max, humedad_min, humedad_max, ph_min, ph_max, ciclo_vida, especie, metodo, uso) VALUES
  ('Tomate', '🍅', 18, 30, 60, 80, 5.5, 6.5, 'Anual', 'Hortaliza', 'Regadío', 'Alimentario'),
  ('Maíz', '🌽', 20, 35, 50, 70, 5.8, 7.0, 'Anual', 'Cereal', 'Extensivo', 'Industrial'),
  ('Lechuga', '🥬', 10, 24, 70, 90, 6.0, 7.2, 'Anual', 'Hortaliza', 'Hidropónico', 'Alimentario'),
  ('Olivo', '🫒', 15, 30, 40, 60, 6.0, 8.0, 'Perenne', 'Frutal', 'Secano', 'Alimentario'),
  ('Patata', '🥔', 15, 25, 60, 80, 5.0, 6.0, 'Anual', 'Tubérculo', 'Regadío', 'Alimentario'),
  ('Fresa', '🍓', 15, 25, 70, 85, 5.5, 6.5, 'Perenne', 'Frutal', 'Intensivo', 'Alimentario'),
  ('Zanahoria', '🥕', 12, 24, 60, 80, 6.0, 6.8, 'Bienal', 'Hortaliza', 'Regadío', 'Alimentario');
