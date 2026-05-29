import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'bot' | 'user' }>>([
    { text: '👋 ¡Hola! Soy AgroBot, tu asistente en Osiris. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    setMessages((prev: any[]) => [...prev, { text, sender: 'user' }]);
    setIsTyping(true);

    try {
      const user = JSON.parse(localStorage.getItem('osiris_user') || '{}');
      const correo = user.email || '';

      const response = await fetch('https://n8ntfp.duckdns.org/webhook/agrobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: text, correo })
      });

      const data = await response.json();
      const reply = data.output || data.text || data.message || data.response || 'No he podido procesar tu consulta.';
      
      setIsTyping(false);
      setMessages((prev: any[]) => [...prev, { text: reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      setMessages((prev: any[]) => [...prev, { text: '⚠️ Error al conectar con el asistente. Inténtalo de nuevo.', sender: 'bot' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      {/* Ventana de Chat */}
      {isOpen && (
        <div 
          className="w-[360px] max-w-[calc(100vw-40px)] h-[480px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-gray-200"
          style={{
            animation: 'slideUp 0.25s ease-out',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)'
          }}
        >
          {/* Cabecera */}
          <div className="bg-gradient-to-br from-[#1a5d1a] to-[#2e7d32] p-4 flex items-center gap-3 text-white shadow-md">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-seedling text-white text-base" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">AgroBot · Osiris</h4>
              <p className="text-white/75 text-[11px] leading-tight">Asistente de navegación</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="ml-auto bg-white/15 hover:bg-white/35 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 bg-[#f9fafb]">
            {messages.map((msg: any, index: number) => (
              <div
                key={index}
                className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-[#1a5d1a] to-[#2e7d32] text-white self-end rounded-br-sm shadow-sm'
                    : 'bg-white text-gray-800 self-start rounded-bl-sm shadow-sm border border-gray-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="max-w-[82%] px-4 py-2.5 rounded-2xl text-[13px] bg-white text-gray-400 italic self-start rounded-bl-sm shadow-sm border border-gray-100">
                AgroBot está escribiendo...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input/Pie */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-grow border border-gray-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#2e7d32] transition-colors text-gray-800 bg-gray-50 focus:bg-white"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-br from-[#1a5d1a] to-[#2e7d32] hover:scale-105 active:scale-95 transition-all text-white rounded-xl w-9 h-9 flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Botón Burbuja */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a5d1a] to-[#2e7d32] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white border border-[#2D5A27]/20"
      >
        {isOpen ? (
          <i className="fas fa-times text-xl" />
        ) : (
          <i className="fas fa-comment-dots text-xl" />
        )}
      </button>

      {/* Estilo local para animación */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
