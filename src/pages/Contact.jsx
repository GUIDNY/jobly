import { useState } from 'react';
import { Mail, MessageSquare, Send, Check } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={26} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">צור קשר</h1>
        <p className="text-gray-500">נשמח לשמוע ממך! נחזור אליך תוך 24 שעות</p>
      </div>

      {sent ? (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ההודעה נשלחה!</h2>
          <p className="text-gray-500 text-sm">נחזור אליך בהקדם האפשרי.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">שם מלא</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">אימייל</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">הודעה</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm resize-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            <Send size={16} />
            שלח הודעה
          </button>
        </form>
      )}
    </div>
  );
}
