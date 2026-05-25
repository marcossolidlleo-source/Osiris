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
    
    const url = 'https://n8ntfp.duckdns.org/webhook/login';

    console.log("🚀 [signIn] Iniciando petición a n8n...", { email, url });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log("🛰️ [signIn] Respuesta de red recibida. Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en el servidor (Status ${response.status})`);
    }

    const result = await response.json();
    console.log("📦 [signIn] JSON parseado desde n8n:", result);

    if (result.success === false || result.isError) {
      throw new Error(result.error || 'Fallo en la autenticación');
    }

    // Guardar en almacenamiento local
    localStorage.setItem('osiris_token', result.token);
    localStorage.setItem('osiris_user', JSON.stringify({
      id: result.userId,
      nombre: result.nombre,
      email: result.email,
      rol: result.rol
    }));
    
    console.log("💾 [signIn] LocalStorage actualizado correctamente.");
    console.log("🔑 [signIn] Contenido actual de osiris_user:", localStorage.getItem('osiris_user'));

    return {
      data: {
        user: { id: result.userId, email: result.email, user_metadata: { full_name: result.nombre } },
        session: { access_token: result.token }
      },
      error: null
    };

  } catch (err: any) {
    console.error("❌ [signIn] Error cazado en la función:", err.message);
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
    // 1. Obtener ID de forma segura
    let idParaFiltrar = userId;
    
    if (!idParaFiltrar) {
      const userString = localStorage.getItem('osiris_user');
      if (userString) {
        const user = JSON.parse(userString);
        idParaFiltrar = user.id;
      }
    }

    if (!idParaFiltrar) {
      console.warn("No se encontró userId para filtrar parcelas");
      return { data: [], error: "ID de usuario no encontrado" };
    }

    // 2. Llamada al Webhook
    const url = `https://n8ntfp.duckdns.org/webhook/get-parcelas?usuario_id=${encodeURIComponent(idParaFiltrar)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json', // Importante pedir JSON
      }
    });

    // 3. Validar respuesta
    if (!response.ok) {
      throw new Error(`Error servidor: ${response.status}`);
    }

    const result = await response.json();
    console.log("Datos recibidos de n8n:", result); // Debug para ver qué llega

    // 4. Adaptar respuesta (n8n devuelve result.parcelas)
    if (result.success === false) {
      throw new Error(result.message || 'Error en el flujo de n8n');
    }

    return {
      data: result.parcelas || [],
      error: null
    };

  } catch (err: any) {
    console.error("Error al recuperar fincas desde n8n:", err);
    return {
      data: [],
      error: err.message || "Error de comunicación"
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