import { useState, useMemo } from 'react';
import { CROPS } from '../data/crops';
import type { CropInfo } from '../types';
import { addAgriculturalData } from '../services/supabase';

interface Props {
  onClose: () => void;
  fincaId: string;
}

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function CropGuideModal({ onClose, fincaId }: Props) {
  const [query, setQuery] = useState('');
  const [ciclo, setCiclo] = useState('Todos');
  const [especie, setEspecie] = useState('Todos');
  const [metodo, setMetodo] = useState('Todos');
  const [uso, setUso] = useState('Todos');

  const filtered = useMemo<CropInfo[]>(() => {
    const q = normalize(query.trim());
    return CROPS.filter(c => {
      const matchText = q === '' || normalize(c.nombre).includes(q);
      const matchCiclo = ciclo === 'Todos' || c.cicloVida === ciclo;
      const matchEsp = especie === 'Todos' || c.especie === especie;
      const matchMet = metodo === 'Todos' || c.metodo === metodo;
      const matchUso = uso === 'Todos' || c.uso === uso;
      return matchText && matchCiclo && matchEsp && matchMet && matchUso;
    });
  }, [query, ciclo, especie, metodo, uso]);

  const handleSave = async (fincaId: string, cropData: CropInfo) => {
  // Aquí mapeamos los datos de la guía a la estructura que espera tu n8n
  const dataToSave = {
    finca_nombre: cropData.nombre,
    variedad: cropData.nombre, 
    // Puedes añadir aquí otros campos que necesites...
  };

  const { data, error } = await addAgriculturalData(fincaId, dataToSave);
  
  if (error) {
    alert("Error al guardar: " + error);
  } else {
    alert("¡Datos del cultivo guardados correctamente!");
  }
};

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-6 py-5 rounded-t-3xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-search text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Buscador de Cultivos</h3>
              <p className="text-emerald-100 text-xs">Encuentra los parámetros ideales para tu cultivo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200">
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 bg-gray-50 border-b border-gray-100">
          <div className="relative mb-4">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Escribe el nombre de un cultivo..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 shadow-sm placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
            <FilterSelect label="Ciclo de Vida" value={ciclo} onChange={setCiclo} options={['Todos', 'Anual', 'Bienal', 'Perenne']} />
            <FilterSelect label="Especie" value={especie} onChange={setEspecie} options={['Todos', 'Cereal', 'Leguminosa', 'Hortaliza', 'Frutal', 'Tubérculo', 'Industrial', 'Forrajero']} />
            <FilterSelect label="Método" value={metodo} onChange={setMetodo} options={['Todos', 'Secano', 'Regadío', 'Intensivo', 'Extensivo', 'Hidropónico']} />
            <FilterSelect label="Uso" value={uso} onChange={setUso} options={['Todos', 'Alimentario', 'Forrajero', 'Industrial', 'Ornamental']} />
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-8 col-span-3">
              <i className="fas fa-exclamation-circle text-2xl text-amber-400 mb-4" />
              <p className="text-gray-600 font-semibold mb-2">No hay cultivos que coincidan con estos filtros</p>
              <p className="text-xs text-gray-400">Prueba a ajustar tus criterios de búsqueda</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(c => (
                <div key={c.nombre} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{c.nombre}</h4>
                        <p className="text-xs text-gray-400">Parámetros ideales</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between bg-orange-50/70 p-2 rounded-lg text-[0.75rem]">
                        <span className="text-orange-700 font-semibold"><i className="fas fa-thermometer-half mr-2" />Temp.</span>
                        <span className="font-bold text-gray-700">{c.tempMin}°C - {c.tempMax}°C</span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50/70 p-2 rounded-lg text-[0.75rem]">
                        <span className="text-blue-700 font-semibold"><i className="fas fa-tint mr-2" />Hum.</span>
                        <span className="font-bold text-gray-700">{c.humMin}% - {c.humMax}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-50/70 p-2 rounded-lg text-[0.75rem]">
                        <span className="text-emerald-700 font-semibold"><i className="fas fa-vial mr-2" />pH</span>
                        <span className="font-bold text-gray-700">{c.phMin} - {c.phMax}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[0.6rem] font-bold rounded-md uppercase tracking-wider shadow-sm">{c.cicloVida}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[0.6rem] font-bold rounded-md uppercase tracking-wider shadow-sm">{c.especie}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[0.6rem] font-bold rounded-md uppercase tracking-wider shadow-sm">{c.metodo}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[0.6rem] font-bold rounded-md uppercase tracking-wider shadow-sm">{c.uso}</span>
                    </div>
                      <button 
                      onClick={async () => {
                        // Ejemplo de datos a guardar. Asegúrate de tener el fincaId disponible.
                        const result = await addAgriculturalData(fincaId, {
                          finca_nombre: c.nombre,
                          variedad: c.nombre,
                          humedad_suelo: c.humMin,
                          temperatura_ambiente: c.tempMin,
                          nivel_ph: c.phMin
                        });
                        
                        if (result.error) {
                          alert("Error: " + result.error);
                        } else {
                          alert("¡Cultivo guardado correctamente!");
                        }
                      }}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-save" /> Guardar parámetros
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] font-bold text-emerald-800 uppercase tracking-widest pl-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white border border-emerald-200 text-sm rounded-xl px-2 py-2 focus:border-emerald-500 outline-none text-gray-700 shadow-sm"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
