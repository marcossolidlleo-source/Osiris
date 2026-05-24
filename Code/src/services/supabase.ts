import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signUp(email: string, password: string, fullName: string, phone: string = '') {
  try {
    // Apuntamos al endpoint de producción de vuestro flujo de registro en n8n
    const url = 'https://n8ntfp.duckdns.org/webhook/register';

    const response = await fetch(url, {
      method: 'POST', // Definido en vuestro nodo "WH /register1"
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: fullName,
        email: email,
        password: password,
        telefono: phone
      })
    });

    const result = await response.json();

    // Si n8n devuelve success: false o el servidor da un error (como el 409 de email duplicado)
    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudo completar el registro');
    }

    // Si todo va bien (201 Created), guardamos la sesión inmediatamente para que entre directo
    localStorage.setItem('osiris_token', result.token);
    localStorage.setItem('osiris_user', JSON.stringify({
      id: result.userId,
      nombre: fullName,
      email: email,
      rol: 'usuario'
    }));

    // Retornamos la estructura que espera vuestro formulario de React
    return {
      data: {
        user: {
          id: result.userId,
          email: email,
          user_metadata: { full_name: fullName }
        },
        session: { access_token: result.token }
      },
      error: null
    };

  } catch (err: any) {
    console.error("Error en el registro personalizado (n8n):", err);
    return {
      data: { user: null, session: null },
      error: err.message || "Error al conectar con el servicio de registro"
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Apuntamos al endpoint de producción de vuestro flujo de login
    const url = 'https://n8ntfp.duckdns.org/webhook/login';

    const response = await fetch(url, {
      method: 'POST', // Tal y como está configurado en vuestro nodo "WH /login1"
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    // Si n8n responde con códigos de error (400, 401, 403, 404) o success: false
    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'Fallo en la autenticación');
    }

    // Si todo va bien (200 OK), n8n devuelve success, userId, nombre, email, rol y token
    // Guardamos el token en el localStorage para mantener la sesión si vuestra app lo requiere
    localStorage.setItem('osiris_token', result.token);
    localStorage.setItem('osiris_user', JSON.stringify({
      id: result.userId,
      nombre: result.nombre,
      email: result.email,
      rol: result.rol
    }));

    // Retornamos la estructura limpia para que el componente de Login no se rompa
    return {
      data: {
        user: {
          id: result.userId,
          email: result.email,
          user_metadata: { full_name: result.nombre }
        },
        session: { access_token: result.token }
      },
      error: null
    };

  } catch (err: any) {
    console.error("Error en el login personalizado (n8n):", err);
    return {
      data: { user: null, session: null },
      error: err.message || "Error al conectar con el servicio de autenticación"
    };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  try {
    const userString = localStorage.getItem('osiris_user');
    if (!userString) return null;
    
    const user = JSON.parse(userString);
    return {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.nombre },
      rol: user.rol
    };
  } catch {
    return null;
  }
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
  try {
    // Si por algún caso el frontend no pasa el userId, intentamos cogerlo del localStorage
    const idParaFiltrar = userId || (() => {
      const userString = localStorage.getItem('osiris_user');
      return userString ? JSON.parse(userString).id : '';
    })();

    // Construimos la URL apuntando a vuestro webhook con el usuario_id de filtro
    const url = `https://n8ntfp.duckdns.org/webhook/get-parcelas?usuario_id=${encodeURIComponent(idParaFiltrar)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudo obtener el listado de fincas');
    }

    // Vuestro flujo de n8n devuelve el array limpio en la propiedad "parcelas"
    // Adaptamos la respuesta al formato { data, error } para que React lo entienda perfectamente
    return {
      data: result.parcelas || [],
      error: null
    };

  } catch (err: any) {
    console.error("Error al recuperar fincas desde n8n:", err);
    return {
      data: [],
      error: err.message || "Error de comunicación con el servicio de fincas"
    };
  }
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
  try {
    // Llamamos directamente a tu webhook de n8n pasando el finca_id por la URL
    const url = `https://n8ntfp.duckdns.org/webhook/stats-usuario?finca_id=${encodeURIComponent(fincaId)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la API de n8n: ${response.status}`);
    }

    const result = await response.json();

    // Adaptamos la respuesta de n8n para que el frontend la reciba sin romperse
    // Tu frontend espera un objeto con { data, error }
    return { 
      data: result, // Aquí dentro viajan stats, distribucion_variedad, etc.
      error: null 
    };

  } catch (err: any) {
    console.error("Fallo al obtener estadísticas desde n8n:", err);
    return { 
      data: null, 
      error: err.message || "Error al conectar con el servidor analítico" 
    };
  }
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

export async function addAgriculturalData(fincaId: string, data: any) {
  try {
    // Apuntamos al endpoint productivo de guardar datos del olivar en n8n
    const url = 'https://n8ntfp.duckdns.org/webhook/save-agri-data';

    // Recuperamos el ID del usuario actual si está logueado, ya que n8n lo acepta como opcional
    const userString = localStorage.getItem('osiris_user');
    const userId = userString ? JSON.parse(userString).id : null;

    // Fusionamos los identificadores clave con el resto del objeto que viene del formulario
    const payload = {
      fincaId: fincaId,
      usuarioId: userId,
      ...data
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudieron almacenar los datos agronómicos');
    }

    // Retornamos el formato habitual para el frontend de Osiris
    return {
      data: result.datos_recibidos, // Contiene los datos procesados y guardados en la BD
      error: null
    };

  } catch (err: any) {
    console.error("Error al registrar telemetría agrícola en n8n:", err);
    return {
      data: null,
      error: err.message || "Fallo en la comunicación con el servidor central de Osiris"
    };
  }
}

export async function getAgriculturalData(fincaId: string, days = 30) {
  try {
    // Llamamos al webhook pasando el fincaId como parámetro de consulta (query string)
    const url = `https://n8ntfp.duckdns.org/webhook/get-agri-data?fincaId=${encodeURIComponent(fincaId)}`;

    const response = await fetch(url, {
      method: 'GET', // Cambiamos a GET para alinearnos con una petición estándar de lectura
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudieron recuperar los registros agrícolas');
    }

    // Tu frontend en React espera un objeto con { data, error }
    // Devolvemos result.data, que contiene el array de registros mapeados por n8n
    return {
      data: result.data || [],
      error: null
    };

  } catch (err: any) {
    console.error("Error al obtener el historial agrícola desde n8n:", err);
    return {
      data: [],
      error: err.message || "Error de conexión con el servicio agronómico central"
    };
  }
}

export async function updateUserProfile(userId: string, nombre: string, telefono: string) {
  try {
    // Apuntamos a vuestro webhook de producción de n8n para actualizar perfiles
    const url = 'https://n8ntfp.duckdns.org/webhook/update-perfil';
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_id: userId,
        nombre: nombre,
        telefono: telefono
      })
    });

    const result = await response.json();

    // Si n8n nos devuelve un código de error (como el 400 o 404 que configuramos)
    if (!response.ok || result.success === false) {
      throw new Error(result.error || `Error en el servidor: ${response.status}`);
    }

    return { data: result.data, error: null };

  } catch (err: any) {
    console.error("Error al actualizar perfil mediante n8n:", err);
    return { data: null, error: err.message || "No se pudo actualizar el perfil" };
  }
}

export async function updateAgriculturalData(recordId: string, updates: any) {
  try {
    // Apuntamos al endpoint PUT que habéis diseñado en n8n
    const url = 'https://n8ntfp.duckdns.org/webhook/update-agri-data';

    // Construimos el body tal y como lo lee el nodo JavaScript "Validar Update"
    const payload = {
      record_id: recordId,
      ...updates
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudieron actualizar los parámetros agrícolas');
    }

    return {
      data: result.data,
      error: null
    };

  } catch (err: any) {
    console.error("Error al actualizar datos agrícolas mediante n8n:", err);
    return {
      data: null,
      error: err.message || "Fallo en la conexión con el servidor de actualización"
    };
  }
}

export async function deleteAgriculturalData(recordId: string) {
  try {
    // Apuntamos al webhook DELETE centralizado en n8n
    const url = `https://n8ntfp.duckdns.org/webhook/delete-agri-data?record_id=${encodeURIComponent(recordId)}`;

    const response = await fetch(url, {
      method: 'DELETE', // Coincide estrictamente con vuestro nodo de n8n
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'No se pudo eliminar el registro agrícola');
    }

    return {
      success: true,
      error: null
    };

  } catch (err: any) {
    console.error("Error al eliminar datos agrícolas mediante n8n:", err);
    return {
      success: false,
      error: err.message || "Fallo en la comunicación con el servidor de borrado"
    };
  }
}