import type { CropInfo } from '../types';

export const CROPS: CropInfo[] = [
  { nombre: "Aguacate", tempMin: 15, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 7.0, icono: "fas fa-tree", emoji: "🥑", cicloVida: "Perenne", especie: "Frutal", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Acelga", tempMin: 10, tempMax: 22, humMin: 70, humMax: 90, phMin: 5.8, phMax: 6.8, icono: "fas fa-leaf", emoji: "🥗", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Albahaca", tempMin: 20, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 6.5, icono: "fas fa-leaf", emoji: "🌿", cicloVida: "Anual", especie: "Hortaliza", metodo: "Hidropónico", uso: "Ornamental" },
  { nombre: "Alfalfa", tempMin: 10, tempMax: 25, humMin: 60, humMax: 80, phMin: 6.2, phMax: 7.5, icono: "fas fa-leaf", emoji: "🌱", cicloVida: "Perenne", especie: "Forrajero", metodo: "Regadío", uso: "Forrajero" },
  { nombre: "Algodón", tempMin: 20, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 6.5, icono: "fas fa-seedling", emoji: "☁️", cicloVida: "Anual", especie: "Industrial", metodo: "Regadío", uso: "Industrial" },
  { nombre: "Berenjena", tempMin: 20, tempMax: 32, humMin: 60, humMax: 80, phMin: 5.5, phMax: 6.5, icono: "fas fa-seedling", emoji: "🍆", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Cacao", tempMin: 18, tempMax: 32, humMin: 70, humMax: 90, phMin: 5.0, phMax: 6.5, icono: "fas fa-tree", emoji: "🍫", cicloVida: "Perenne", especie: "Frutal", metodo: "Intensivo", uso: "Industrial" },
  { nombre: "Calabaza", tempMin: 18, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 7.0, icono: "fas fa-seedling", emoji: "🎃", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Cebada", tempMin: 10, tempMax: 22, humMin: 50, humMax: 70, phMin: 6.0, phMax: 7.5, icono: "fas fa-seedling", emoji: "🌾", cicloVida: "Anual", especie: "Cereal", metodo: "Secano", uso: "Industrial" },
  { nombre: "Cebolla", tempMin: 12, tempMax: 25, humMin: 60, humMax: 80, phMin: 5.5, phMax: 6.5, icono: "fas fa-seedling", emoji: "🧅", cicloVida: "Bienal", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Espinaca", tempMin: 10, tempMax: 24, humMin: 70, humMax: 90, phMin: 5.5, phMax: 7.0, icono: "fas fa-leaf", emoji: "🥬", cicloVida: "Anual", especie: "Hortaliza", metodo: "Hidropónico", uso: "Alimentario" },
  { nombre: "Fresa", tempMin: 15, tempMax: 25, humMin: 70, humMax: 85, phMin: 5.5, phMax: 6.5, icono: "fas fa-seedling", emoji: "🍓", cicloVida: "Perenne", especie: "Frutal", metodo: "Intensivo", uso: "Alimentario" },
  { nombre: "Girasol", tempMin: 20, tempMax: 30, humMin: 50, humMax: 70, phMin: 6.0, phMax: 7.5, icono: "fas fa-seedling", emoji: "🌻", cicloVida: "Anual", especie: "Industrial", metodo: "Extensivo", uso: "Industrial" },
  { nombre: "Lechuga", tempMin: 10, tempMax: 24, humMin: 70, humMax: 90, phMin: 6.0, phMax: 7.2, icono: "fas fa-leaf", emoji: "🥬", cicloVida: "Anual", especie: "Hortaliza", metodo: "Hidropónico", uso: "Alimentario" },
  { nombre: "Limonero", tempMin: 18, tempMax: 30, humMin: 50, humMax: 70, phMin: 5.5, phMax: 6.5, icono: "fas fa-lemon", emoji: "🍋", cicloVida: "Perenne", especie: "Frutal", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Maíz", tempMin: 20, tempMax: 35, humMin: 50, humMax: 70, phMin: 5.8, phMax: 7.0, icono: "fas fa-seedling", emoji: "🌽", cicloVida: "Anual", especie: "Cereal", metodo: "Extensivo", uso: "Industrial" },
  { nombre: "Menta", tempMin: 15, tempMax: 25, humMin: 70, humMax: 90, phMin: 6.0, phMax: 7.0, icono: "fas fa-leaf", emoji: "🌿", cicloVida: "Perenne", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Naranjo", tempMin: 15, tempMax: 30, humMin: 50, humMax: 70, phMin: 5.5, phMax: 6.5, icono: "fas fa-lemon", emoji: "🍊", cicloVida: "Perenne", especie: "Frutal", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Olivo", tempMin: 15, tempMax: 30, humMin: 40, humMax: 60, phMin: 6.0, phMax: 8.0, icono: "fas fa-tree", emoji: "🫒", cicloVida: "Perenne", especie: "Frutal", metodo: "Secano", uso: "Alimentario" },
  { nombre: "Patata", tempMin: 15, tempMax: 25, humMin: 60, humMax: 80, phMin: 5.0, phMax: 6.0, icono: "fas fa-seedling", emoji: "🥔", cicloVida: "Anual", especie: "Tubérculo", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Pepino", tempMin: 18, tempMax: 30, humMin: 70, humMax: 90, phMin: 5.5, phMax: 7.0, icono: "fas fa-seedling", emoji: "🥒", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Pimiento", tempMin: 18, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 7.0, icono: "fas fa-seedling", emoji: "🌶️", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Rúcula", tempMin: 10, tempMax: 22, humMin: 70, humMax: 90, phMin: 5.5, phMax: 7.0, icono: "fas fa-leaf", emoji: "🥬", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Sandía", tempMin: 22, tempMax: 35, humMin: 60, humMax: 80, phMin: 5.8, phMax: 6.8, icono: "fas fa-seedling", emoji: "🍉", cicloVida: "Anual", especie: "Frutal", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Tomate", tempMin: 18, tempMax: 30, humMin: 60, humMax: 80, phMin: 5.5, phMax: 6.5, icono: "fas fa-seedling", emoji: "🍅", cicloVida: "Anual", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
  { nombre: "Trigo", tempMin: 15, tempMax: 25, humMin: 50, humMax: 70, phMin: 6.0, phMax: 7.5, icono: "fas fa-seedling", emoji: "🌾", cicloVida: "Anual", especie: "Cereal", metodo: "Secano", uso: "Alimentario" },
  { nombre: "Vid", tempMin: 12, tempMax: 30, humMin: 50, humMax: 70, phMin: 5.5, phMax: 7.0, icono: "fas fa-wine-bottle", emoji: "🍇", cicloVida: "Perenne", especie: "Frutal", metodo: "Secano", uso: "Industrial" },
  { nombre: "Zanahoria", tempMin: 12, tempMax: 24, humMin: 60, humMax: 80, phMin: 6.0, phMax: 6.8, icono: "fas fa-carrot", emoji: "🥕", cicloVida: "Bienal", especie: "Hortaliza", metodo: "Regadío", uso: "Alimentario" },
];

export const DEFAULT_FARMS = [
  { id: 1, nombre: 'Hacienda El Sol', hectareas: 10.5, propietario: 'Admin', cultivo: 'Maíz', sector: 'Norte', lat: 37.88, lon: -4.78 },
  { id: 2, nombre: 'Finca Los Olivos', hectareas: 5.2, propietario: 'Admin', cultivo: 'Olivos', sector: 'Sur', lat: 37.39, lon: -5.98 },
  { id: 3, nombre: 'Granja Verde', hectareas: 3.8, propietario: 'Usuario', cultivo: 'Tomate', sector: 'Este', lat: 37.50, lon: -4.90 },
];

export const CREDENTIALS: Record<string, string> = {
  'adminAgri2026': 'Admin',
  'userSync123': 'Usuario',
};
