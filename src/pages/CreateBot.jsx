import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { createBot } from '../lib/api';
import { CATEGORIES } from '../lib/mockData';
import { Bot, Building2, ChevronLeft } from 'lucide-react';

const FREELANCER_FIELDS = [
  { name: 'name', label: 'שם הסוכן', placeholder: 'למשל: ישראל ישראלי — Full Stack Dev', required: true },
  { name: 'role', label: 'תפקיד/כותרת', placeholder: 'למשל: מפתח Full Stack בכיר', required: true },
  { name: 'description', label: 'תיאור קצר', placeholder: 'תאר את עצמך ואת ניסיונך...', textarea: true, required: true },
  { name: 'category', label: 'קטגוריה', select: true, required: true },
  { name: 'skills', label: 'כישורים (מופרדים בפסיק)', placeholder: 'React, Node.js, TypeScript', required: false },
  { name: 'opening_message', label: 'הודעת פתיחה', placeholder: 'ההודעה הראשונה שהסוכן ישלח ללקוח', textarea: true, required: false },
];

const EMPLOYER_FIELDS = [
  { name: 'company_name', label: 'שם החברה', placeholder: 'שם החברה שלך', required: true },
  { name: 'job_title', label: 'תפקיד מבוקש', placeholder: 'למשל: Senior Full Stack Developer', required: true },
  { name: 'job_description', label: 'תיאור המשרה', placeholder: 'תאר את המשרה והדרישות...', textarea: true, required: true },
  { name: 'category', label: 'קטגוריה', select: true, required: true },
  { name: 'salary_range', label: 'טווח שכר', placeholder: 'למשל: 20,000 - 30,000 ₪', required: false },
  { name: 'location', label: 'מיקום', placeholder: 'למשל: תל אביב (היברידי)', required: false },
  { name: 'interview_criteria', label: 'קריטריוני ריאיון לAI', placeholder: 'מה הAI יחפש בין המועמדים?', textarea: true, required: false },
];

export default function CreateBot() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const type = params.get('type') || 'freelancer';
  const isFreelancer = type === 'freelancer';
  const fields = isFreelancer ? FREELANCER_FIELDS : EMPLOYER_FIELDS;

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/MyDashboard');
    return null;
  }

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    const skills = form.skills
      ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const botData = {
      ...form,
      skills,
      bot_type: type,
      owner_id: user.id,
      avatar_url: user.avatar_url || user.user_metadata?.avatar_url,
      is_published: false,
      rating: 0,
      total_orders: 0,
      ...(isFreelancer ? {
        pricing_basic: { price: 500, title: 'בסיסי', description: 'שירות בסיסי', delivery_days: 3 },
        pricing_standard: { price: 1500, title: 'סטנדרטי', description: 'שירות מורחב', delivery_days: 7 },
        pricing_premium: { price: 4000, title: 'פרמיום', description: 'שירות פרמיום', delivery_days: 14 },
        quick_messages: [],
        opening_message: form.opening_message || `שלום! אני ${form.name}. איך אוכל לעזור לך?`,
      } : {
        whatsapp_exposure: { mode: 'after_pass' },
        interview_type: 'general',
        opening_message: `שלום! אני הבוט המראיין של ${form.company_name}. ספר לי על עצמך.`,
      }),
    };

    const newBot = await createBot(botData);
    setSaving(false);
    navigate(`/EditBot?id=${newBot.id}`);
  };

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/MyDashboard')} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="rtl-flip" />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
          {isFreelancer ? <Bot size={20} className="text-gray-900" /> : <Building2 size={20} className="text-gray-900" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isFreelancer ? 'צור סוכן פרילנסר' : 'פרסם משרה'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isFreelancer ? 'הסוכן ישווק אותך ויתנהל מול לקוחות' : 'הבוט ימשוך ויסנן מועמדים עבורך'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-400 mr-1">*</span>}
            </label>
            {field.select ? (
              <select
                value={form[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                required={field.required}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 transition-colors text-sm"
              >
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            ) : field.textarea ? (
              <textarea
                value={form[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors text-sm resize-none"
              />
            ) : (
              <input
                type="text"
                value={form[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors text-sm"
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? 'יוצר...' : isFreelancer ? 'צור סוכן' : 'פרסם משרה'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/MyDashboard')}
            className="px-6 py-3 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl text-sm transition-colors"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
