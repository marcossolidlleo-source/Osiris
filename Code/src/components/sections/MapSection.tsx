import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Farm, CustomSensor } from '../../types';
import { CROPS } from '../../data/crops';

interface Props {
  selectedFarm: Farm | undefined;
  farms: Farm[];
  onSelectFarm: (id: number) => void;
  customSensors: CustomSensor[];
}

interface ParcelaCultivo {
  sectorId: string;
  nombre: string;
  emoji: string;
  color: number;
  x: number;
  z: number;
  ancho: number;
  alto: number;
}

const DEFAULT_PARCELAS: ParcelaCultivo[] = [
  { sectorId: 'Sector A', nombre: 'Tomate', emoji: '🍅', color: 0xff6347, x: -20, z: -10, ancho: 24, alto: 18 },
  { sectorId: 'Sector B', nombre: 'Maíz', emoji: '🌽', color: 0xffd700, x: 20, z: -10, ancho: 24, alto: 18 },
  { sectorId: 'Sector C', nombre: 'Lechuga', emoji: '🥬', color: 0x32cd32, x: -20, z: 10, ancho: 24, alto: 18 },
  { sectorId: 'Sector D', nombre: 'Pimiento', emoji: '🌶️', color: 0x1e90ff, x: 20, z: 10, ancho: 24, alto: 18 },
];

export default function MapSection({ selectedFarm, farms, onSelectFarm, customSensors }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRootRef = useRef<THREE.Group | null>(null);
  const sensoresRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number>(0);
  const [parcelas, setParcelas] = useState<ParcelaCultivo[]>(DEFAULT_PARCELAS);
  const [divisions, setDivisions] = useState(4);
  const [plotSelects, setPlotSelects] = useState<string[]>(['Tomate', 'Maíz', 'Lechuga', 'Pimiento']);

  const totalSensores = sensoresRef.current.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 100, 150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(80, 120, 100);
    scene.add(dir);

    const root = new THREE.Group();
    scene.add(root);
    sceneRootRef.current = root;

    root.add(new THREE.GridHelper(80, 16, 0x888888, 0xcccccc));
    root.add(new THREE.AxesHelper(20));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 60),
      new THREE.MeshPhongMaterial({ color: 0x8cc56d, opacity: 0.35, transparent: true, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);

    let isDown = false, prevX = 0, prevY = 0;
    let rotX = 0, rotY = 0;

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', e => { isDown = true; prevX = e.clientX; prevY = e.clientY; renderer.domElement.style.cursor = 'grabbing'; });
    renderer.domElement.addEventListener('pointermove', e => {
      if (!isDown) return;
      rotY += (e.clientX - prevX) * 0.005;
      rotX += (e.clientY - prevY) * 0.005;
      rotX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotX));
      prevX = e.clientX; prevY = e.clientY;
      root.rotation.y = rotY; root.rotation.x = rotX;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => renderer.domElement.addEventListener(ev, () => { isDown = false; renderer.domElement.style.cursor = 'grab'; }));
    renderer.domElement.addEventListener('wheel', e => {
      e.preventDefault();
      camera.translateZ(e.deltaY * 0.05);
      const dist = camera.position.length();
      if (dist < 60) camera.translateZ(60 - dist);
      if (dist > 400) camera.translateZ(400 - dist);
    }, { passive: false });

    const handleResize = () => {
      if (!container || container.offsetParent === null) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    rebuildScene();
  }, [parcelas, customSensors]);

  const rebuildScene = () => {
    const root = sceneRootRef.current;
    if (!root) return;

    sensoresRef.current.forEach(s => root.remove(s));
    sensoresRef.current = [];

    // Rebuild parcela zones
    const zoneGroup = root.children.find(c => c.userData.isZoneGroup) as THREE.Group | undefined;
    if (zoneGroup) root.remove(zoneGroup);

    const newZoneGroup = new THREE.Group();
    newZoneGroup.userData.isZoneGroup = true;
    parcelas.forEach(zone => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(zone.ancho, zone.alto),
        new THREE.MeshPhongMaterial({ color: zone.color, opacity: 0.55, transparent: true, side: THREE.DoubleSide })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(zone.x, 0.05, zone.z);
      newZoneGroup.add(plane);
    });
    root.add(newZoneGroup);

    // Add 12 base sensors
    const tiposSensores = ['Temperatura', 'Humedad', 'pH', 'Luz'];
    const sensorColors: Record<string, number> = { Temperatura: 0xff4500, Humedad: 0x1e90ff, pH: 0x9b59b6, Luz: 0xf9d74c };
    const stateColors = [0x2ecc71, 0xf1c40f, 0xe74c3c];

    for (let i = 0; i < 12; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const x = -36 + (col + 1) * (72 / 5);
      const z = -24 + (row + 1) * (48 / 4);
      const tipo = tiposSensores[i % 4];
      const estado = Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2;
      addSensor3D(root, x, z, sensorColors[tipo], stateColors[estado], false);
    }

    // Custom sensors
    customSensors.forEach(s => {
      addSensor3D(root, s.x || 0, s.z || 0, 0x2563eb, 0x3b82f6, true);
    });
  };

  const addSensor3D = (root: THREE.Group, x: number, z: number, topColor: number, baseColor: number, _isCustom: boolean) => {
    const sensor = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 3.5, 20),
      new THREE.MeshStandardMaterial({ color: baseColor, metalness: 0.1, roughness: 0.7 })
    );
    sensor.position.set(x, 1.75, z);
    sensor.rotation.x = Math.PI;

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.4, 20),
      new THREE.MeshStandardMaterial({ color: topColor, metalness: 0.25, roughness: 0.5 })
    );
    top.position.y = -1.75;
    sensor.add(top);

    root.add(sensor);
    sensoresRef.current.push(sensor);
  };

  const applyPlots = () => {
    const cols = divisions <= 2 ? divisions : divisions <= 4 ? 2 : divisions <= 6 ? 3 : 4;
    const rows = Math.ceil(divisions / cols);
    const W = 72, H = 48;
    const cW = W / cols, cH = H / rows;
    const palette = [0xFF6B6B, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xC77DFF, 0xFF9A3C, 0x00C9A7, 0xF72585];

    const newParcelas: ParcelaCultivo[] = plotSelects.map((name, i) => {
      const crop = CROPS.find(c => c.nombre === name) || CROPS[0];
      const col = i % cols, row = Math.floor(i / cols);
      return {
        sectorId: `Sector ${String.fromCharCode(65 + i)}`,
        nombre: name,
        emoji: crop.emoji,
        color: palette[i % palette.length],
        x: (col * cW) - W / 2 + cW / 2,
        z: (row * cH) - H / 2 + cH / 2,
        ancho: cW,
        alto: cH,
      };
    });
    setParcelas(newParcelas);
  };

  const handleDivisionsChange = (n: number) => {
    setDivisions(n);
    const defaults = CROPS.slice(0, n).map(c => c.nombre);
    setPlotSelects(defaults);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Mapa de Dispositivos 3D</h2>
          <div className="flex items-center gap-2 mt-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Finca:</label>
            <select
              value={selectedFarm?.id}
              onChange={e => onSelectFarm(Number(e.target.value))}
              className="text-sm font-bold text-emerald-700 bg-emerald-50 border-none outline-none cursor-pointer hover:underline"
            >
              {farms.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={rebuildScene} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all">
            <i className="fas fa-magic mr-2" /> Optimizar Ubicaciones
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[
          { label: 'Sensores 3D', value: String(totalSensores + customSensors.length + 12), color: 'text-blue-700' },
          { label: 'Temp.', value: '3', color: 'text-orange-600' },
          { label: 'Humedad', value: '3', color: 'text-blue-600' },
          { label: 'pH', value: '3', color: 'text-emerald-600' },
          { label: 'Luz', value: '3', color: 'text-yellow-500' },
        ].map(s => (
          <div key={s.label} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">{s.label}</h4>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="w-full h-[500px] bg-[#0f172a] rounded-2xl overflow-hidden shadow-inner relative" />

      {/* Plot planner */}
      <div className="mt-6 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-800"><i className="fas fa-th-large mr-2" />Planificador de Parcelas</h3>
            <p className="text-sm text-emerald-600">Divide el terreno y asigna cultivos visualmente.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-emerald-700">Divisiones (1-8):</label>
            <select
              value={divisions}
              onChange={e => handleDivisionsChange(Number(e.target.value))}
              className="bg-white border-2 border-emerald-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 font-bold text-gray-700 shadow-sm cursor-pointer"
            >
              {[1, 2, 4, 6, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Sección' : 'Secciones'}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-200">
          {plotSelects.map((sel, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest pl-1">Sección {i + 1}</label>
              <select
                value={sel}
                onChange={e => {
                  const updated = [...plotSelects];
                  updated[i] = e.target.value;
                  setPlotSelects(updated);
                }}
                className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-2 py-2.5 focus:border-emerald-500 outline-none text-gray-700 shadow-sm"
              >
                {CROPS.map(c => <option key={c.nombre} value={c.nombre}>{c.emoji} {c.nombre}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={applyPlots} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
            <i className="fas fa-check-circle mr-2" />Aplicar al Mapa 3D
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Zonas de cultivo</h4>
            <ul className="space-y-1">
              {parcelas.map(p => (
                <li key={p.sectorId} className="flex items-center text-sm text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `#${p.color.toString(16).padStart(6, '0')}` }} />
                  <b>{p.sectorId}</b>: {p.emoji} {p.nombre}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Estado de sensores</h4>
            <div className="space-y-1 text-sm">
              {[['bg-green-500', 'Normal'], ['bg-yellow-500', 'Precaución'], ['bg-red-500', 'Alerta']].map(([cls, label]) => (
                <div key={label} className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${cls} mr-2`} />{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
