import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getBotById, updateBot, deleteBot } from '../lib/api';
import { CATEGORIES } from '../lib/mockData';
import { Save, Trash2, Eye, EyeOff, ChevronLeft, MessageCircle, Plus, X } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import ImagePicker from '../components/ImagePicker';

export default function EditBot() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = params.get('id');

  const [bot, setBot] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [quickMsgInput, setQuickMsgInput] = useState('');
  const [loadingBot, setLoadingBot] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBotById(id)
      .then(data => { setBot(data); setForm({ ...data }); })
      .catch(() => setBot(null))
      .finally(() => setLoadingBot(false));
  }, [id]);

  if (loadingBot) {
    return <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">טוען...</div>;
  }

  if (!bot || !user) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-xl">הסוכן לא נמצא</p>
        <button onClick={() => navigate('/MyDashboard')} className="mt-4 px-6 py-3 bg-orange-500 text-gray-900 rounded-xl text-sm">חזור</button>
      </div>
    );
  }

  if (bot.owner_id !== user.id && !user.is_admin) {
    navigate('/MyDashboard');
    return null;
  }

  const isFreelancer = bot.bot_type === 'freelancer';

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
  const handlePricingChange = (tier, field, value) => {
    setForm(prev => ({ ...prev, [`pricing_${tier}`]: { ...prev[`pricing_${tier}`], [field]: field === 'price' || field === 'delivery_days' ? Number(value) : value } }));
  };
  const handleSkillsChange = (v) => {
    setForm(prev => ({ ...prev, skills: v.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateBot(id, form);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (confirm('מחק את הסוכן לצמיתות?')) {
      await deleteBot(id);
      navigate('/MyDashboard');
    }
  };

  const handleTogglePublish = async () => {
    const newVal = !form.is_published;
    setForm(prev => ({ ...prev, is_published: newVal }));
    await updateBot(id, { is_published: newVal });
  };

  const addQuickMsg = () => {
    if (!quickMsgInput.trim()) return;
    setForm(prev => ({ ...prev, quick_messages: [...(prev.quick_messages || []), quickMsgInput.trim()] }));
    setQuickMsgInput('');
  };

  const removeQuickMsg = (i) => {
    setForm(prev => ({ ...prev, quick_messages: prev.quick_messages.filter((_, j) => j !== i) }));
  };

  const tabsFreelancer = ['profile', 'pricing', 'ai', 'quick'];
  const tabsEmployer = ['profile', 'interview'];
  const tabs = isFreelancer ? tabsFreelancer : tabsEmployer;
  const TAB_LABELS = { profile: 'פרופיל', pricing: 'מחירים', ai: 'הוראות AI', quick: 'כפתורים מהירים', interview: 'הגדרות ריאיון' };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-4 py-10">
      {showChat && <ChatModal bot={{ ...bot, ...form }} onClose={() => setShowChat(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/MyDashboard')} className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ChevronLeft size={20} className="rtl-flip" />
          </button>
          <img src={form.avatar_url || `https://i.pravatar.cc/48?u=${id}`} alt="" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">{form.name || 'ערוך סוכן'}</h1>
            <p className="text-xs text-gray-500">{isFreelancer ? 'סוכן פרילנסר' : 'משרה'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-3 py-2 border border-orange-400/40 text-orange-500 hover:bg-orange-50 rounded-lg text-xs transition-colors"
          >
            <MessageCircle size={14} />
            תצוגה מקדימה
          </button>
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
              form.is_published
                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
            }`}
          >
            {form.is_published ? <><EyeOff size={13} />הסתר</> : <><Eye size={13} />פרסם</>}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 rounded-lg text-xs font-medium transition-colors">
            <Save size={13} />
            {saving ? 'שומר...' : 'שמור'}
          </button>
          <button onClick={handleDelete} className="p-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tabs + Form */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit mb-6 flex-wrap">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === t ? 'bg-orange-500 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <ImagePicker
                label="באנר"
                value={form.banner_url || ''}
                onChange={v => handleChange('banner_url', v)}
                aspect="banner"
                folder={id}
              />
              <ImagePicker
                label="תמונת פרופיל"
                value={form.avatar_url || ''}
                onChange={v => handleChange('avatar_url', v)}
                aspect="avatar"
                folder={id}
              />
              <Field label="שם" value={form.name || ''} onChange={v => handleChange('name', v)} />
              <Field label="תפקיד/כותרת" value={form.role || ''} onChange={v => handleChange('role', v)} />
              <Field label="תיאור" value={form.description || form.job_description || ''} onChange={v => handleChange(isFreelancer ? 'description' : 'job_description', v)} textarea />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">קטגוריה</label>
                <select
                  value={form.category || ''}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm"
                >
                  <option value="">בחר</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <Field label="כישורים (מופרדים בפסיק)" value={(form.skills || []).join(', ')} onChange={handleSkillsChange} />
              {!isFreelancer && (
                <>
                  <Field label="שם חברה" value={form.company_name || ''} onChange={v => handleChange('company_name', v)} />
                  <Field label="טווח שכר" value={form.salary_range || ''} onChange={v => handleChange('salary_range', v)} />
                  <Field label="מיקום" value={form.location || ''} onChange={v => handleChange('location', v)} />
                </>
              )}
              <Field label="הודעת פתיחה" value={form.opening_message || ''} onChange={v => handleChange('opening_message', v)} textarea />
              <Field label="וואטסאפ (יוצג ללקוחות אחרי שיחה)" value={form.whatsapp || ''} onChange={v => handleChange('whatsapp', v)} />
            </div>
          )}

          {activeTab === 'pricing' && isFreelancer && (
            <div className="space-y-4">
              {['basic', 'standard', 'premium'].map(tier => {
                const tierLabels = { basic: 'בסיסי', standard: 'סטנדרטי', premium: 'פרמיום' };
                const data = form[`pricing_${tier}`] || {};
                return (
                  <div key={tier} className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">{tierLabels[tier]}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="מחיר (₪)" value={data.price || ''} onChange={v => handlePricingChange(tier, 'price', v)} type="number" />
                      <Field label="ימי אספקה" value={data.delivery_days || ''} onChange={v => handlePricingChange(tier, 'delivery_days', v)} type="number" />
                      <div className="col-span-2"><Field label="כותרת" value={data.title || ''} onChange={v => handlePricingChange(tier, 'title', v)} /></div>
                      <div className="col-span-2"><Field label="תיאור" value={data.description || ''} onChange={v => handlePricingChange(tier, 'description', v)} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <Field label="הוראות מערכת לAI" value={form.instructions || ''} onChange={v => handleChange('instructions', v)} textarea rows={8} />
              <div className="bg-orange-50 border border-orange-400/20 rounded-xl p-4 text-sm text-orange-600">
                <p className="font-medium mb-1">טיפ:</p>
                <p>הגדר את אישיות הסוכן, מה לענות, מה להציע, ומתי להציג את מחירי השירות.</p>
              </div>
            </div>
          )}

          {activeTab === 'quick' && isFreelancer && (
            <div>
              <p className="text-sm text-gray-500 mb-4">כפתורים שיוצגו בתחילת השיחה</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={quickMsgInput}
                  onChange={e => setQuickMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addQuickMsg()}
                  placeholder="הודעה מהירה חדשה..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50"
                />
                <button onClick={addQuickMsg} className="p-2.5 bg-orange-500 hover:bg-orange-400 text-gray-900 rounded-xl transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.quick_messages || []).map((msg, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 border border-orange-400/40 text-orange-600 rounded-full text-sm">
                    {msg}
                    <button onClick={() => removeQuickMsg(i)} className="text-orange-500 hover:text-gray-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interview' && !isFreelancer && (
            <div className="space-y-4">
              <Field label="קריטריוני ריאיון לAI" value={form.interview_criteria || ''} onChange={v => handleChange('interview_criteria', v)} textarea />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">סוג ריאיון</label>
                <select
                  value={form.interview_type || 'general'}
                  onChange={e => handleChange('interview_type', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm"
                >
                  <option value="general">כללי — AI שואל חופשי</option>
                  <option value="structured_test">מובנה — שאלות קבועות</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">מדיניות חשיפת וואטסאפ</label>
                <select
                  value={form.whatsapp_exposure?.mode || 'after_pass'}
                  onChange={e => handleChange('whatsapp_exposure', { mode: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400/50 text-sm"
                >
                  <option value="always">תמיד — חשוף מיד</option>
                  <option value="after_pass">אחרי מעבר — לאחר הצלחה</option>
                  <option value="limited">מוגבל — עם מגבלת חשיפות</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Preview sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            {form.banner_url ? (
              <img src={form.banner_url} alt="" className="w-full h-20 object-cover" />
            ) : (
              <div className="w-full h-20 bg-gradient-to-br from-orange-400/20 to-orange-600/20" />
            )}
            <div className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">תצוגה מקדימה</h3>
            <div className="flex items-center gap-3 mb-3">
              <img src={form.avatar_url || `https://i.pravatar.cc/48?u=${id}`} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-white -mt-8" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{form.name || '—'}</p>
                <p className="text-xs text-orange-500">{form.role || '—'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-3">{form.description || form.job_description || '—'}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {(form.skills || []).slice(0, 4).map(s => (
                <span key={s} className="px-2 py-0.5 bg-white/5 border border-gray-200 rounded-full text-xs text-gray-600">{s}</span>
              ))}
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="w-full py-2 bg-orange-100 border border-orange-400/40 text-orange-500 hover:bg-orange-500/30 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={13} />
              בדוק שיחה
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}


function Field({ label, value, onChange, textarea, rows = 4, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors text-sm resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-orange-400/50 transition-colors text-sm"
        />
      )}
    </div>
  );
}
