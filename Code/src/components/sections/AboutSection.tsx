const TEAM = [
  'Óscar Marín', 'Carlos Moya', 'Ana Olmedo', 'Pablo Rubio',
  'Jaime Sarsa', 'Álvaro Sosa', 'José Javier Ripado', 'Alejandro Muñoz',
  'Teresa Sáenz', 'Manuel Montilla', 'Juan Antonio Polonio', 'Marcos Olid', 'Javier Pozo',
];

export default function AboutSection() {
  return (
    <div className="card bg-white p-8 md:p-10 mb-8 border border-gray-100 shadow-sm rounded-3xl w-full">
      <header className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-black text-green-800 mb-2">Sobre Nosotros</h2>
        <p className="text-gray-500 font-medium text-lg">Digitalizando granjas. Llevando el campo a la Agricultura 4.0</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-10">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <h3 className="text-2xl font-black text-emerald-800 mb-4 flex items-center gap-3 relative z-10">
            <i className="fas fa-seedling text-emerald-600 text-xl" /> Nuestra Esencia
          </h3>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6 text-justify relative z-10">
            En Osiris, no solo instalamos sensores; <span className="font-bold text-emerald-800">sembramos el futuro</span>. Nacimos de la necesidad de entender la tierra para protegerla. Creemos en una tecnología que no reemplaza al agricultor, sino que le da <span className="font-bold text-emerald-800">superpoderes</span> para tomar decisiones basadas en datos reales, optimizando cada gota de agua y cada palmo de suelo.
          </p>
          <ul className="space-y-4 relative z-10">
            {[
              { icon: 'fas fa-globe-americas', title: 'Sostenibilidad', desc: 'Eficiencia real para un planeta vivo.' },
              { icon: 'fas fa-shield-alt', title: 'Transparencia', desc: 'Datos claros, decisiones seguras.' },
              { icon: 'fas fa-hands-helping', title: 'Innovación Humana', desc: 'Tecnología diseñada por y para el campo.' },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-200/50 flex flex-col justify-center items-center shrink-0 mt-0.5 shadow-inner">
                  <i className={`${item.icon} text-emerald-700`} />
                </div>
                <p className="text-sm text-gray-700 leading-snug self-center">
                  <span className="font-bold text-gray-900 block mb-0.5">{item.title}</span>
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3"><i className="fas fa-bullseye text-emerald-500 mr-2" />Nuestra Misión</h3>
          <p className="text-sm text-gray-600 leading-relaxed text-justify">
            Acabamos con los <span className="font-bold text-gray-800">silos de información</span>. Osiris centraliza datos, clima y sensores IoT en tiempo real para tomar mejores decisiones.
          </p>
        </div>
      </div>

      <div className="bg-emerald-50/50 rounded-2xl p-6 md:p-8 border border-emerald-100/60 shadow-inner">
        <h3 className="text-lg font-black text-gray-800 mb-6 text-center">
          <i className="fas fa-users text-emerald-500 mr-2" />Nuestro Equipo
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-5 gap-x-2">
          {TEAM.map(name => (
            <div key={name} className="flex items-center justify-center gap-2">
              <i className="fas fa-user-graduate text-emerald-600/70 text-lg drop-shadow-sm" />
              <span className="text-[0.75rem] font-bold text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Redes Sociales / RRSS */}
      <div className="mt-8 pt-8 border-t border-gray-100 text-center">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          <i className="fas fa-share-alt text-emerald-500" /> Síguenos en Redes Sociales
        </h3>
        <div className="flex justify-center gap-4">
          {[
            { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com/osirisoficical', color: 'hover:text-pink-600 hover:bg-pink-50 border-pink-100 text-pink-500' },
            { name: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/company/osiristfp/', color: 'hover:text-blue-700 hover:bg-blue-50 border-blue-100 text-blue-600' }
          ].map(social => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md ${social.color}`}
              title={social.name}
            >
              <i className={social.icon} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
