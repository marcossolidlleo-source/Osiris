// src/components/FincaForm.tsx
import { useState } from 'react';
import { saveParcelas } from '../services/supabase';

export default function FincaForm() {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !ubicacion.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    const nuevaFinca = [{
      nombre: nombre.trim(),
      sector: ubicacion.trim(),
      hectareas: 10,
      cultivo: 'Olivos',
      latitud: 37.88,
      longitud: -4.77
    }];

    const { error } = await saveParcelas(nuevaFinca);
    setLoading(false);

    if (error) {
      alert('❌ Error al guardar la finca: ' + error);
    } else {
      alert('✅ ¡Finca guardada correctamente!');
      setNombre('');
      setUbicacion('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Nueva Finca / Parcela</h2>
      
      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Nombre de la finca"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-4 rounded"
        placeholder="Ubicación / Provincia"
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
      />

      <button
        onClick={handleGuardar}
        className={`w-full py-2 rounded-xl font-bold text-white ${loading ? 'bg-gray-400' : 'bg-emerald-600'}`}
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar Finca'}
      </button>
    </div>
  );
}
