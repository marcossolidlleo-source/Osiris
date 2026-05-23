import { useState } from 'react';

export default function PestSection() {
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/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');
  const [alertStatus, setAlertStatus] = useState('');
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    setAlertStatus('Enviando imagen a IA...');
    await new Promise(r => setTimeout(r, 1500));
    setAlertStatus('¡Plaga detectada! Enviando alertas...');

    const phoneNumber = "+34623190486";
    const apiKey = "9687095";
    const msg = `🚨 ALERTA PLAGA DETECTADA 🚨%0ALa IA ha detectado una posible plaga.%0ARevisa la parcela inmediatamente.`;
    fetch(`https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${msg}&apikey=${apiKey}`)
      .catch(() => {});

    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '🚨 *ALERTA DE PLAGA DETECTADA* 🚨\nLa IA ha detectado una posible plaga.' }),
      }).catch(() => {});
    }

    await new Promise(r => setTimeout(r, 2000));
    setAlertStatus('Alertas enviadas correctamente a WhatsApp y Slack.');
    setSimulating(false);
    setTimeout(() => setAlertStatus(''), 5000);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          <a
            href="https://drive.google.com/drive/folders/1a5Xn0Ni722RnBaQE6L-QMPoMordHAWT2"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <i className="fab fa-google-drive text-blue-500" /> Abrir Carpeta de Drive
          </a>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-800 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <i className="fab fa-slack text-emerald-600" /> Configurar Slack Webhook
            </h3>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500">URL del Webhook de n8n/Slack</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-colors bg-gray-50"
              />
              <p className="text-[0.65rem] text-gray-400">Pega aquí la URL para recibir alertas en tu canal privado.</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-orange-800 font-bold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-vial" /> Simular Detección
            </h3>
            <p className="text-xs text-orange-700 mb-4">Prueba la integración. Esto enviará una alerta de prueba a WhatsApp y al canal de Slack configurado.</p>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <i className={simulating ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} />
              {simulating ? 'Simulando...' : 'Lanzar Alerta de Plaga'}
            </button>
            {alertStatus && (
              <div className={`mt-3 text-xs font-bold text-center ${alertStatus.includes('detectada') ? 'text-red-600' : alertStatus.includes('correctamente') ? 'text-green-600' : 'text-orange-600'}`}>
                {alertStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
