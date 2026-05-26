export default function PestSection() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <i className="fas fa-bug text-emerald-600" /> Control de Plagas IA
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Automatiza la detección de plagas subiendo fotos de tu finca a Google Drive. n8n e IA analizarán las imágenes y te notificarán por WhatsApp y Slack si hay peligro.
        </p>
      </div>
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
        <h3 className="text-emerald-800 font-bold mb-4 text-lg">¿Cómo funciona?</h3>
        <ul className="space-y-4">
          {[
            { n: 1, color: 'bg-blue-100 text-blue-600', title: 'Sube fotos a Google Drive', desc: 'Haz fotos a tus cultivos y súbelas a la carpeta compartida.' },
            { n: 2, color: 'bg-emerald-100 text-emerald-600', title: 'n8n + IA Analizan', desc: 'Nuestra automatización detecta la nueva imagen y una IA determina si hay plaga.' },
            { n: 3, color: 'bg-red-100 text-red-600', title: 'Recibe Alertas', desc: 'Si hay peligro, recibes mensajes al instante en Slack y WhatsApp.' },
          ].map(item => (
            <li key={item.n} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0 font-bold`}>{item.n}</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <a href="https://drive.google.com/drive/folders/1a5Xn0Ni722RnBaQE6L-QMPoMordHAWT2" target="_blank" rel="noopener noreferrer" className="mt-6 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <i className="fab fa-google-drive text-blue-500" /> Abrir Carpeta de Drive
        </a>
      </div>
    </div>
  );
}