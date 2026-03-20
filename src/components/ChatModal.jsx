import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Phone } from 'lucide-react';

const MOCK_RESPONSES = {
  freelancer: [
    'תודה על השאלה! אשמח לעזור לך. יש לי ניסיון רב בתחום הזה.',
    'כמובן! אוכל לספק לך שירות מעולה. מה הפרויקט שלך?',
    'המחירים שלי כוללים גרסאות בסיסית, סטנדרטית ופרמיום — כל אחת מותאמת לצרכים שונים.',
    'זמן האספקה תלוי בהיקף הפרויקט. בדרך כלל עובד מהר ומדויק!',
    'אני זמין להתחיל מוקדם — נדבר?',
  ],
  employer: [
    'שמח לשמוע עליך! ספר לי על הניסיון שלך בתחום.',
    'מצוין! מה הפרויקטים הכי משמעותיים שבנית?',
    'יש לך ניסיון ב-teamwork ועבודה בסביבה אג\'ילית?',
    'נשמע מרשים! האם יש לך פורטפוליו שאוכל לצפות בו?',
    'על בסיס מה ששמעתי, נראה מתאים. נעביר את פרטיך הלאה. הנה הוואטסאפ שלנו לתיאום: 050-0000000',
  ],
};

export default function ChatModal({ bot, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const bottomRef = useRef(null);
  const responseIdx = useRef(0);

  useEffect(() => {
    if (bot.opening_message) {
      setMessages([{ role: 'assistant', content: bot.opening_message }]);
    }
  }, [bot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const pool = MOCK_RESPONSES[bot.bot_type] || MOCK_RESPONSES.freelancer;
    const reply = pool[responseIdx.current % pool.length];
    responseIdx.current++;

    setTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    // Simulate WhatsApp reveal after a few messages
    if (responseIdx.current >= 3) {
      setShowWhatsapp(true);
    }
  };

  const handleQuick = (msg) => sendMessage(msg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <img
            src={bot.avatar_url || `https://i.pravatar.cc/48?u=${bot.id}`}
            alt=""
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-400/40"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{bot.name}</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
              מחובר עכשיו
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-gray-900 rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-end">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {showWhatsapp && bot.bot_type === 'freelancer' && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
              <Phone size={18} className="text-green-400 shrink-0" />
              <div>
                <p className="text-xs text-green-400 font-medium">ניתן לתאם ישירות בוואטסאפ</p>
                <a
                  href={`https://wa.me/972501234567`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-900 font-semibold underline"
                >
                  פתח וואטסאפ
                </a>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick messages */}
        {bot.quick_messages?.length > 0 && messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {bot.quick_messages.map((qm, i) => (
              <button
                key={i}
                onClick={() => handleQuick(qm)}
                className="px-3 py-1.5 bg-orange-100 border border-orange-400/40 text-orange-600 text-xs rounded-full hover:bg-orange-500/40 transition-colors"
              >
                {qm}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="כתוב הודעה..."
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="p-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 rounded-xl text-gray-900 transition-colors"
            >
              <Send size={16} className="rtl-flip" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
