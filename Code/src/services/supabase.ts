import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function createUserProfile(userId: string, email: string, fullName: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([
      {
        id: userId,
        email,
        nombre_completo: fullName,
        password_hash: 'auth_handled', // Auth is handled by Supabase
      },
    ])
    .select();
  return { data, error };
}

export async function addFarm(userId: string, nombre: string, hectareas: number, cultivo: string, sector: string, latitud?: number, longitud?: number) {
  const { data, error } = await supabase
    .from('fincas')
    .insert([
      {
        usuario_id: userId,
        nombre,
        hectareas,
        cultivo,
        sector,
        latitud,
        longitud,
      },
    ])
    .select();
  return { data, error };
}

export async function getFarms(userId: string) {
  const { data, error } = await supabase
    .from('fincas')
    .select('*')
    .eq('usuario_id', userId);
  return { data, error };
}

export async function addSensorData(sensorId: string, temperatura: number, humedad: number, ph: number, iluminacion: number) {
  const { data, error } = await supabase
    .from('datos_sensores')
    .insert([
      {
        sensor_id: sensorId,
        temperatura,
        humedad,
        ph,
        iluminacion,
        valor: humedad,
        unidad: '%',
      },
    ])
    .select();
  return { data, error };
}

export async function getSensorData(sensorId: string, limit = 100) {
  const { data, error } = await supabase
    .from('datos_sensores')
    .select('*')
    .eq('sensor_id', sensorId)
    .order('fecha_lectura', { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function getStatisticsData(fincaId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('datos_sensores')
    .select('*, sensores_iot(*)')
    .in('sensores_iot.parcela_id', [fincaId]);

  if (startDate) {
    query = query.gte('fecha_lectura', startDate);
  }
  if (endDate) {
    query = query.lte('fecha_lectura', endDate);
  }

  const { data, error } = await query.order('fecha_lectura', { ascending: false });
  return { data, error };
}

export async function addAlert(fincaId: string, tipo_alerta: string, nivel: string, titulo: string, descripcion: string) {
  const { data, error } = await supabase
    .from('alertas')
    .insert([
      {
        finca_id: fincaId,
        tipo_alerta,
        nivel,
        titulo,
        descripcion,
      },
    ])
    .select();
  return { data, error };
}

export async function getAlerts(fincaId: string, estado = true) {
  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('finca_id', fincaId)
    .eq('estado', estado)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getWorkOrders(fincaId: string) {
  const { data, error } = await supabase
    .from('ordenes_trabajo')
    .select('*')
    .eq('finca_id', fincaId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addAgriculturalData(fincaId: string, data: {
  temperatura_promedio?: number;
  humedad_promedio?: number;
  flujo_riego?: number;
  humedad_radiacion?: number;
  grados_dias?: number;
  velocidad_viento?: number;
  presion_atmosferica?: number;
  velocidad_infiltracion?: number;
  precipitacion?: number;
  velocidad_humedad?: number;
  radiacion_uva?: number;
  radiacion_infrarroja?: number;
  evapotranspiracion?: number;
  humedad_relativa?: number;
  temperatura_minima?: number;
  temperatura_maxima?: number;
  radiacion_neta?: number;
  velocidad_lluvia?: number;
  humedad_hoja?: number;
  humedad_raiz?: number;
}) {
  const { data: result, error } = await supabase
    .from('datos_agricolas')
    .insert([
      {
        finca_id: fincaId,
        ...data,
      },
    ])
    .select();
  return { data: result, error };
}

export async function getAgriculturalData(fincaId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('datos_agricolas')
    .select('*')
    .eq('finca_id', fincaId)
    .gte('fecha_lectura', startDate.toISOString())
    .order('fecha_lectura', { ascending: false });
  return { data, error };
}
