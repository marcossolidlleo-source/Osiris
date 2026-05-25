import { useState } from 'react';
import { saveParcelas } from '../services/supabase'; // Asegúrate de que esta función exista

export default function FincaForm() {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handleGuardar = async () => {
    // Esto es lo que envías al webhook de n8n
    const nuevaFinca = [{
      nombre: nombre,
      sector: ubicacion,
      hectareas: 10,
      cultivo: "Olivos",
      latitud: 37.88,
      longitud: -4.77
    }];
    
    const { error } = await saveParcelas(nuevaFinca);
    
    if (error) {
      alert("Error: " + error);
    } else {
      alert("¡Finca guardada correctamente!");
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
        className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold"
      >
        Guardar Finca
      </button>
    </div>
  );
}