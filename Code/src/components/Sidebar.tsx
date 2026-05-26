import type { ActiveSection } from '../types';

interface Props {
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  userRole: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: ActiveSection; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard General', icon: 'fas fa-tachometer-alt' },
  { id: 'parcela', label: 'Mapas', icon: 'fas fa-map' },
  { id: 'estadisticas', label: 'Estadísticas', icon: 'fas fa-chart-line' },
  { id: 'sensores', label: 'Clima', icon: 'fas fa-thermometer-half' },
  { id: 'plagas', label: 'Control de Plagas', icon: 'fas fa-bug' },
  { id: 'sobre-nosotros', label: 'Sobre Nosotros', icon: 'fas fa-users' },
];

export default function Sidebar({ activeSection, onNavigate, userRole, onLogout, isOpen, onClose }: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`bg-[#2D5A27] text-[#F4F7F6] w-[260px] shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shadow-2xl border-r border-[#1e4219] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 40 60 Q 100 35 160 60 Q 100 43 40 60 Z" fill="#ffffff" />
                <path d="M 100 70 C 88 95, 92 115, 100 125 C 108 115, 112 95, 100 70 Z" fill="#ffffff" />
                <path d="M 95 120 C 75 105, 65 90, 70 80 C 85 90, 95 105, 95 120 Z" fill="#ffffff" />
                <path d="M 105 120 C 125 105, 135 90, 130 80 C 115 90, 105 105, 105 120 Z" fill="#ffffff" />
                <path d="M 95 130 C 70 130, 55 125, 50 135 C 70 145, 85 140, 95 130 Z" fill="#ffffff" />
                <path d="M 105 130 C 130 130, 145 125, 150 135 C 130 145, 115 140, 105 130 Z" fill="#ffffff" />
                <path d="M 98 125 C 80 155, 85 185, 105 185 C 120 185, 125 160, 110 145 C 100 135, 98 125, 98 125 Z" fill="#ffffff" />
                <circle cx="108" cy="165" r="5" fill="#2D5A27" />
              </svg>
            </div>
            <h2 className="text-[1.3rem] tracking-widest text-[#f8fafc] uppercase" style={{ fontFamily: "'Times New Roman', Times, serif", textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}>
              OSIRIS
            </h2>
          </div>
          <button
            className="md:hidden text-white/70 hover:text-[#FFC107] transition-colors p-2 rounded-lg hover:bg-white/10"
            onClick={onClose}
          >
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[0.65rem] font-black text-white/40 uppercase tracking-widest mb-3">Principal</p>
          {navItems.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); onNavigate(item.id); onClose(); }}
              className={`sidebar-link flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 text-white/80 hover:bg-white/10 hover:text-white ${activeSection === item.id ? 'active' : ''}`}
            >
              <i className={`${item.icon} w-5 text-center text-lg`} />
              <span className="font-medium text-[0.95rem]">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="relative m-4">
          <div
            className="p-4 border-t border-white/10 rounded-2xl bg-black/15 backdrop-blur-md shadow-inner border border-white/5 cursor-pointer hover:bg-black/25 transition-colors"
            onClick={onLogout}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a5d1a] to-[#2e7d32] border-[1.5px] border-[#FFC107] flex items-center justify-center text-white shadow-md shrink-0">
                <i className="fas fa-user text-sm" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[0.9rem] font-bold text-white truncate">Usuario <span>{userRole}</span></p>
                <p className="text-xs text-[#FFC107] font-medium truncate mt-0.5">
                  <i className="fas fa-circle text-[0.5rem] mr-1 mb-0.5 align-middle" />En línea
                </p>
              </div>
              <i className="fas fa-door-open text-red-300 text-sm" title="Cerrar sesión" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
