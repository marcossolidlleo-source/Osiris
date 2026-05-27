// ==========================================
// CONTROL DE VARIABLES GLOBALES Y FALLBACKS
// ==========================================

import * as THREE from 'three';

if (typeof window !== 'undefined') {
    // Aseguramos que existan contenedores para que no pinchen las funciones
    window.fincas = window.fincas || [];
    window.selectedFarmId = window.selectedFarmId || null;
    window.sensoresPersonalizados = window.sensoresPersonalizados || [];
}

// Aseguramos que todo se ejecute de forma segura
document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicializar los listeners del DOM de forma segura
    setTimeout(inicializarComponentesDOM, 100);
});

function inicializarComponentesDOM() {
    const input = document.getElementById('input-municipio'); 
    const list = document.getElementById('lista-municipios');
    const contenedor = document.getElementById('weather-widget-container');

    // 🛠️ FUNCIÓN CLIMA: Solo añade listeners si los elementos realmente existen en el DOM actual
    if (input && contenedor) {
        // Convierte lat/lon al formato forecast7.com
        function coordsToForecast7(lat, lon) {
            const latAbs = Math.abs(lat).toFixed(2).replace('.', 'd');
            const lonAbs = Math.abs(lon).toFixed(2).replace('.', 'd');
            const latDir = lat >= 0 ? 'n' : 's';
            return `${latAbs}${latDir}${lonAbs}`;
        }

        function cargarWidget(pueblo, coordStr) {
            const slug = pueblo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            contenedor.innerHTML = `<a class="weatherwidget-io" href="https://forecast7.com/es/${coordStr}/${slug}/" data-label_1="${pueblo.toUpperCase()}" data-theme="pure">${pueblo.toUpperCase()} WEATHER</a>`;
            
            const old = document.getElementById('weatherwidget-io-js');
            if (old) old.remove();
            const s = document.createElement('script');
            s.id  = 'weatherwidget-io-js';
            s.src = 'https://weatherwidget.io/js/widget.min.js';
            document.body.appendChild(s);
        }

        function buscarMunicipio() {
            const pueblo = input.value.trim();
            if (!pueblo) return;
            contenedor.innerHTML = `<p style="padding:2rem;color:#555;text-align:center;font-style:italic;">🔍 Cargando clima de <strong>${pueblo}</strong>...</p>`;

            fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(pueblo) + ',+Espa\u00f1a&limit=1')
                .then(r => r.json())
                .then(data => {
                    if (data && data.length > 0) {
                        cargarWidget(pueblo, coordsToForecast7(parseFloat(data[0].lat), parseFloat(data[0].lon)));
                    } else {
                        cargarWidget(pueblo, '40d42n3d70');
                    }
                })
                .catch(() => cargarWidget(pueblo, '40d42n3d70'));
        }

        input.addEventListener('change', buscarMunicipio);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); buscarMunicipio(); }
        });

        // Cargar lista en el datalist si existe
        if (list && list.options.length === 0) {
            fetch('https://raw.githubusercontent.com/frontid/municipios-espanoles/master/municipios.json')
                .then(r => r.json())
                .then(data => {
                    const frag = document.createDocumentFragment();
                    data.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m.nombre;
                        frag.appendChild(opt);
                    });
                    list.appendChild(frag);
                }).catch(err => console.error('Error municipios:', err));
        }
    }

    // 🛠️ HISTORIAL DE SENSORES (Blindado contra null)
    const filterHistoryBtn = document.getElementById('filter-history-btn');
    const historyTableContainer = document.getElementById('history-table-container');
    const historyTableBody = document.getElementById('history-table-body');

    if (filterHistoryBtn && historyTableContainer) {
        const historicalData = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            historicalData.push({
                fecha: d.toISOString().split('T')[0],
                finca: 'Finca Principal',
                temperatura: (15 + Math.random() * 20).toFixed(1),
                humedad: Math.floor(40 + Math.random() * 40)
            });
        }

        filterHistoryBtn.addEventListener('click', () => {
            const startStr = document.getElementById('history-start-date')?.value;
            const endStr = document.getElementById('history-end-date')?.value;
            if (!startStr || !endStr || new Date(startStr) > new Date(endStr)) {
                alert("Verifica las fechas seleccionadas.");
                return;
            }

            const filtered = historicalData.filter(record => record.fecha >= startStr && record.fecha <= endStr);
            const historyStatusMsg = document.getElementById('history-status-message');
            if (historyStatusMsg) historyStatusMsg.classList.add('hidden');
            historyTableContainer.classList.remove('hidden');
            
            if (historyTableBody) {
                historyTableBody.innerHTML = '';
                if (filtered.length === 0) {
                    historyTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center italic">No hay registros</td></tr>`;
                } else {
                    filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(record => {
                        const tr = document.createElement('tr');
                        tr.className = 'hover:bg-gray-50 border-b border-gray-100 last:border-0';
                        tr.innerHTML = `
                            <td class="p-3 text-sm font-medium text-gray-800">${record.fecha}</td>
                            <td class="p-3 text-sm text-gray-600">${record.finca}</td>
                            <td class="p-3 text-sm text-center font-semibold text-orange-600">${record.temperatura} °C</td>
                            <td class="p-3 text-sm text-center font-semibold text-blue-600">${record.humedad}%</td>
                        `;
                        historyTableBody.appendChild(tr);
                    });
                }
            }
        });
    }

    // 🛠️ NAVEGACIÓN Y SIDEBAR
    const userCardContainer = document.getElementById('user-card-container');
    const userOptionsPopup = document.getElementById('user-options-popup');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

    if (userCardContainer && userOptionsPopup) {
        userCardContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            userOptionsPopup.classList.toggle('hidden');
        });
        document.addEventListener('click', () => userOptionsPopup.classList.add('hidden'));
    }

    if (logoutBtnSidebar) {
        logoutBtnSidebar.addEventListener('click', () => {
            if (typeof logout === 'function') logout();
            else window.location.reload();
        });
    }

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                let sectionId = 'section-' + targetId.substring(1);
                if (targetId === '#mapas' || targetId === '#parcela') sectionId = 'section-parcela';

                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.id === sectionId ? sec.classList.add('active') : sec.classList.remove('active');
                });

                if (sectionId === 'section-parcela') init3DMap();
                if (sectionId === 'section-estadisticas') {
                    setTimeout(() => { if (!lineChartInstance) initAnalyticsCharts(); }, 200);
                }
            }
        });
    });
}

// ==================== MUNDO 3D PARA PARCELA (ANTIERRORES) ====================
let scene3D = null, camera3D = null, renderer3D = null, sensores3D = [], ground3D = null, map3DInitialized = false;

function init3DMap(reset = false) {
    const container = document.getElementById('canvas-3d-container');
    if (!container) return;
    if (map3DInitialized && !reset) return;

    if (reset && renderer3D) {
        container.innerHTML = '';
        map3DInitialized = false;
    }

    map3DInitialized = true;

    let listaFincas = window.fincas || [];
    let currentFarmId = window.selectedFarmId || null;
    const farm = listaFincas.find(f => f && f.id === currentFarmId) || { hectareas: 5 };
    const hectareasSeguras = farm.hectareas || 5;
    const baseWidth = Math.sqrt(hectareasSeguras) * 20;
    const baseDepth = baseWidth * 0.75;

    // Forzar tamaño del contenedor ANTES de leer dimensiones
    container.style.width = '100%';
    container.style.height = '600px';
    container.style.display = 'block';
    container.style.position = 'relative';
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = 600;
    console.log('📐 width:', width, 'height:', height, 'baseWidth:', baseWidth);

    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x0d1f12);

    camera3D = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    window.camera3D = camera3D; // 👈 añade esto
    window.scene3D = scene3D; 
    camera3D.position.set(0, 15, 50);
    camera3D.lookAt(0, 0, 0);

    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(width, height);
    console.log('🎨 canvas size:', renderer3D.domElement.width, 'x', renderer3D.domElement.height);
    renderer3D.shadowMap.enabled = true;
    window.renderer3D = renderer3D; 
    container.appendChild(renderer3D.domElement);

    // SIN tocar el estilo del canvas — THREE lo gestiona

    scene3D.add(new THREE.AmbientLight(0xffffff, 0.4));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene3D.add(directionalLight);

    scene3D.add(new THREE.GridHelper(baseWidth * 1.5, 16, 0x444444, 0x222222));

    ground3D = new THREE.Mesh(
        new THREE.PlaneGeometry(baseWidth, baseDepth),
        new THREE.MeshPhongMaterial({ color: 0x3a7d44, shininess: 20, opacity: 0.6, transparent: true, side: THREE.DoubleSide })
    );
    ground3D.rotation.x = -Math.PI / 2;
    ground3D.receiveShadow = true;
    scene3D.add(ground3D);

    const animate = () => {
        requestAnimationFrame(animate);
        if (renderer3D) renderer3D.render(scene3D, camera3D);
    };
    animate();

    optimizarColocacionIA();

    const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = 600;
        if (w > 0 && camera3D && renderer3D) {
            camera3D.aspect = w / h;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(w, h);
        }
    });
    resizeObserver.observe(container);
}

function crearSensor3D(x, z, isCustom = false) {
    if (!scene3D) return;
    const geometry = new THREE.CylinderGeometry(1.2, 1.2, 4, 16);
    const color = isCustom ? 0x2563eb : 0x1a5d1a;

    const sensorMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: color, metalness: 0.3, roughness: 0.6 }));
    sensorMesh.position.set(x, 2, z);
    sensorMesh.castShadow = true; 

    const sensorTop = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshStandardMaterial({ color: isCustom ? 0x3b82f6 : 0x22c55e }));
    sensorTop.position.set(0, 2.2, 0);
    sensorTop.castShadow = true; 
    
    sensorMesh.add(sensorTop);
    scene3D.add(sensorMesh);
    sensores3D.push(sensorMesh);
}

function optimizarColocacionIA() {
    if (!scene3D) return;
    sensores3D.forEach(sensor => scene3D.remove(sensor));
    sensores3D = [];

    const listaFincas = window.fincas || [];
    const currentFarmId = window.selectedFarmId || null;
    const farm = listaFincas.find(f => f && f.id === currentFarmId) || { hectareas: 5 };
    const baseWidth = Math.sqrt(farm.hectareas) * 20;
    const baseDepth = baseWidth * 0.75;

    const numCols = 4; const numRows = 3;
    const spacingX = baseWidth / numCols; const spacingZ = baseDepth / numRows;

    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            let x = -(baseWidth / 2) + (spacingX / 2) + c * spacingX;
            let z = -(baseDepth / 2) + (spacingZ / 2) + r * spacingZ;
            crearSensor3D(x, z, false);
        }
    }

    const filteredSensores = (window.sensoresPersonalizados || []).filter(s => s && s.farmId === currentFarmId);
    filteredSensores.forEach(s => crearSensor3D(s.x || 0, s.z || 0, true));

    const totalMap = document.getElementById('total-sensores-mapa');
    if (totalMap) totalMap.innerText = sensores3D.length;
}

// Exponer funciones al objeto global window para comunicación externa
if (typeof window !== 'undefined') {
    window.init3DMap = init3DMap;
    window.crearSensor3D = crearSensor3D;
}

// ==========================================
// MÓDULO: DASHBOARD ANALÍTICO
// ==========================================
let sessionHistory = [];
let lineChartInstance = null;
let radarChartInstance = null;
let chartScriptLoading = false;

function initAnalyticsCharts() {
    if (typeof Chart !== 'undefined') { renderCharts(); return; }
    if (chartScriptLoading) return;
    chartScriptLoading = true;

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => { chartScriptLoading = false; renderCharts(); };
    document.head.appendChild(script);
}

function renderCharts() {
    const ctxLine = document.getElementById('lineChart');
    const ctxRadar = document.getElementById('radarChart');
    if (!ctxLine || !ctxRadar) return;

    if (lineChartInstance) lineChartInstance.destroy();
    if (radarChartInstance) radarChartInstance.destroy();

    lineChartInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
            datasets: [
                { label: 'Humedad (%)', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], borderColor: '#1a5d1a', backgroundColor: 'rgba(26, 93, 26, 0.1)', borderWidth: 2, tension: 0.4, fill: true },
                { label: 'Temperatura (°C)', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 2, tension: 0.4, fill: true }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    radarChartInstance = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Humedad', 'Temperatura', 'pH', 'Luz (x100)'],
            datasets: [
                { label: 'Actual', data: [0, 0, 0, 0], borderColor: '#1a5d1a', backgroundColor: 'rgba(26, 93, 26, 0.4)', borderWidth: 2 },
                { label: 'Ideal', data: [60, 24, 6.5, 8], borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderDash: [5, 5], borderWidth: 2 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function handleDataInput(sensorData) {
    const dashboardScreen = document.getElementById('dashboard-screen');
    if (!dashboardScreen || !dashboardScreen.classList.contains('active')) return;

    sessionHistory.push(sensorData);
    if (sessionHistory.length > 10) sessionHistory.shift();
    updateChartsUI();
}

function updateChartsUI() {
    if (!lineChartInstance || !radarChartInstance || sessionHistory.length === 0) return;

    lineChartInstance.data.labels = sessionHistory.map((_, i) => `T-${sessionHistory.length - 1 - i}`);
    lineChartInstance.data.datasets[0].data = sessionHistory.map(d => d.humedad);
    lineChartInstance.data.datasets[1].data = sessionHistory.map(d => parseFloat(d.temperatura));
    lineChartInstance.update('none');

    const last = sessionHistory[sessionHistory.length - 1];
    radarChartInstance.data.datasets[0].data = [last.humedad, parseFloat(last.temperatura), parseFloat(last.ph), (last.iluminacion / 100)];
    radarChartInstance.update('none');
}

if (typeof window !== 'undefined') window.handleDataInput = handleDataInput;