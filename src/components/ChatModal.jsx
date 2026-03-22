import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Phone } from 'lucide-react';

const formatWhatsapp = (num) => {
  if (!num) return null;
  const digits = num.replace(/\D/g, '');
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
};

export default function ChatModal({ bot, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const bottomRef = useRef(null);
  const msgCount = useRef(0);

  const isFreelancer = bot.bot_type === 'freelancer';
  const exposureMode = bot.whatsapp_exposure?.mode || 'after_pass';
  const whatsappNum = formatWhatsapp(bot.whatsapp);

  useEffect(() => {
    const opening = bot.opening_message || (isFreelancer
      ? `שלום! אני ${bot.name}. במה אוכל לעזור לך?`
      : `שלום! אני הסוכן המראיין של ${bot.company_name || 'החברה'}. ספר לי על עצמך.`);
    setMessages([{ role: 'assistant', content: opening }]);
    if (exposureMode === 'always' && whatsappNum) setShowWhatsapp(true);
  }, [bot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const buildReply = (userText) => {
    const count = msgCount.current;
    if (isFreelancer) {
      const replies = [
        `תודה על ההודעה! ${bot.instructions ? 'בהתאם להתמחות שלי — ' : ''}אשמח לעזור. מה בדיוק אתה מחפש?`,
        'בהחלט! יש לי ניסיון רב בתחום. מה גודל הפרויקט שלך?',
        `המחירים שלי מתחילים מ-₪${bot.pricing_basic?.price?.toLocaleString() || '500'}. מה התקציב שלך?`,
        'אני זמין להתחיל בקרוב. נדבר ישירות כדי לתאם פרטים?',
        'נשמע מצוין! בוא נקדם את זה. אשמח לתת לך הצעת מחיר מותאמת.',
      ];
      return replies[count % replies.length];
    } else {
      const replies = [
        'תודה! ספר לי על הניסיון הרלוונטי שלך.',
        `מצוין! מה הפרויקטים הכי משמעותיים שעבדת עליהם?`,
        'יש לך ניסיון בעבודת צוות ו-agile?',
        'נשמע מרשים! מה המשכורת הרצויה לך?',
        `תודה על הזמן! הפרטים שלך יועברו לצוות גיוס של ${bot.company_name || 'החברה'}.`,
      ];
      return replies[count % replies.length];
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || typing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTyping(true);

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 700));

    const reply = buildReply(text);
    msgCount.current++;
    setTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    // WhatsApp reveal logic
    if (whatsappNum && !showWhatsapp) {
      if (exposureMode === 'always') setShowWhatsapp(true);
      else if (exposureMode === 'after_pass' && msgCount.current >= 3) setShowWhatsapp(true);
      else if (exposureMode === 'limited' && msgCount.current >= 2) setShowWhatsapp(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img
            src={bot.avatar_url || `https://i.pravatar.cc/48?u=${bot.id}`}
            alt=""
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-400/40"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{bot.name}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              מחובר עכשיו
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'assistant' && (
                <img
                  src={bot.avatar_url || `https://i.pravatar.cc/32?u=${bot.id}`}
                  alt=""
                  className="w-7 h-7 rounded-lg object-cover ml-2 shrink-0 self-end"
                />
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-bl-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-br-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-end items-end gap-2">
              <img
                src={bot.avatar_url || `https://i.pravatar.cc/32?u=${bot.id}`}
                alt=""
                className="w-7 h-7 rounded-lg object-cover ml-2 shrink-0"
              />
              <div className="bg-white border border-gray-100 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {showWhatsapp && whatsappNum && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                <Phone size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {isFreelancer ? 'תאם ישירות בוואטסאפ' : 'מעוניין/ת? צור קשר'}
                </p>
                <p className="text-xs text-gray-500 mb-2">{isFreelancer ? 'לשאלות ותיאום מהיר' : 'נציג יחזור אליך'}</p>
                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <MessageCircle size={14} />
                  פתח וואטסאפ
                </a>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick messages */}
        {(bot.quick_messages || []).length > 0 && messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 bg-white border-t border-gray-100 pt-3">
            {bot.quick_messages.map((qm, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qm)}
                className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs rounded-full hover:bg-orange-100 transition-colors"
              >
                {qm}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="כתוב הודעה..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="p-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 rounded-xl text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
