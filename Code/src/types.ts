export interface Farm {
  id: number;
  nombre: string;
  hectareas: number;
  propietario: string;
  cultivo: string;
  sector: string;
  lat?: number;
  lon?: number;
}

export interface CustomSensor {
  id: number;
  farmId: number;
  nombre: string;
  cultivo: string;
  metrica: string;
  ideal: string;
  valorActual: string;
  locationMode: string;
  x: number;
  z: number;
}

export interface SensorData {
  temperatura: string;
  humedad: number;
  ph: string;
  iluminacion: number;
}

export interface HistoricalRecord {
  fecha: string;
  finca: string;
  temperatura: string;
  humedad: number;
}

export interface CropInfo {
  nombre: string;
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  phMin: number;
  phMax: number;
  icono: string;
  emoji: string;
  cicloVida: string;
  especie: string;
  metodo: string;
  uso: string;
}

export type ActiveSection =
  | 'dashboard'
  | 'parcela'
  | 'estadisticas'
  | 'sensores'
  | 'plagas'
  | 'sobre-nosotros';
