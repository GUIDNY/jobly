import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import LogoMark from '../components/LogoMark';
import { getStoreById, updateStore } from '../lib/cardsApi';

export default function WarehousePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [store, setStore]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [tab, setTab]         = useState('inventory'); // 'inventory' | 'analytics'
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/dashboard'); return; }
    getStoreById(storeId)
      .then(s => {
        setStore(s);
        const ms = s.data?.multi || s.data || {};
        setCategories(JSON.parse(JSON.stringify(ms.categories || [])));
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [storeId, user, authLoading]);

  const updateProduct = (ci, pi, patch) => {
    setCategories(prev => {
      const next = prev.map((c, ci2) => ci2 !== ci ? c : {
        ...c,
        products: (c.products || []).map((p, pi2) => pi2 !== pi ? p : { ...p, ...patch }),
      });
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storeData = {
        ...store.data,
        multi: { ...(store.data?.multi || store.data || {}), categories },
      };
      await updateStore(storeId, storeData);
      setStore(prev => ({ ...prev, data: storeData }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <svg className="animate-spin w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  const ms = store?.data?.multi || store?.data || {};
  const accent = ms.accentColor || '#F4938C';
  const storeName = ms.storeName || 'החנות';
  const allProducts = categories.flatMap(cat =>
    (cat.products || []).filter(p => p.name).map(p => ({ ...p, catName: cat.name }))
  );
  const inStockProducts   = allProducts.filter(p => p.inStock !== false);
  const outOfStockProducts = allProducts.filter(p => p.inStock === false);
  const totalQty = allProducts.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0);
  const inventoryValue = allProducts.reduce((s, p) => {
    const price = parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0;
    const qty   = parseInt(p.quantity) || 0;
    return s + price * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate('/dashboard')}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${accent},${accent}bb)` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="min-w-0">
              <span className="font-black text-gray-900 text-sm">מחסן</span>
              <span className="text-gray-400 text-sm"> · {storeName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/store-builder/${storeId}`)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              ערוך חנות
            </button>
            <button onClick={handleSave} disabled={saving}
              className="text-xs font-bold px-4 py-1.5 rounded-xl text-white transition-all disabled:opacity-60"
              style={{ background: saved ? '#10B981' : `linear-gradient(135deg,${accent},${accent}bb)` }}>
              {saving ? 'שומר...' : saved ? '✓ נשמר' : 'שמור שינויים'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'מוצרים במלאי', value: inStockProducts.length, color: '#10B981', bg: '#f0fdf4', icon: '✅' },
            { label: 'אזל מהמלאי',   value: outOfStockProducts.length, color: '#EF4444', bg: '#fef2f2', icon: '❌' },
            { label: 'יחידות במלאי', value: totalQty || '∞', color: '#6366f1', bg: '#eef2ff', icon: '📦' },
            { label: 'שווי מלאי',    value: inventoryValue > 0 ? `₪${inventoryValue.toLocaleString()}` : '—', color: '#F4938C', bg: '#fff5f5', icon: '💰' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{s.icon}</span>
                <span className="text-lg font-black" style={{ color: s.color }}>{s.value}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          {[
            { id:'inventory', label:'ניהול מלאי', icon:'📦' },
            { id:'analytics', label:'אנליטיקס', icon:'📊' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={tab === t.id
                ? { background:`linear-gradient(135deg,${accent},${accent}bb)`, color:'white' }
                : { color:'#6b7280' }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── INVENTORY TAB ── */}
          {tab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="space-y-4">
              {categories.map((cat, ci) => {
                const prods = (cat.products || []).filter(p => p.name);
                if (prods.length === 0) return null;
                return (
                  <div key={ci} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                    {/* Cat header */}
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-gray-50/60">
                      <span className="text-base">{cat.icon}</span>
                      <p className="text-sm font-bold text-gray-800">{cat.name}</p>
                      <span className="text-xs text-gray-400 font-medium">{prods.length} מוצרים</span>
                    </div>
                    {/* Products */}
                    <div className="divide-y divide-gray-50">
                      {(cat.products || []).map((p, pi) => {
                        if (!p.name) return null;
                        const inStock = p.inStock !== false;
                        const qty = parseInt(p.quantity) || 0;
                        const price = parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0;
                        return (
                          <div key={pi} className="flex items-center gap-3 px-5 py-3.5">
                            {/* Image */}
                            {p.image
                              ? <img src={p.image} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100"/>
                              : <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><span style={{fontSize:18}}>📦</span></div>}
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{price > 0 ? `₪${price}` : 'ללא מחיר'}{p.quantity ? ` · שווי מלאי: ₪${(price * qty).toLocaleString()}` : ''}</p>
                            </div>
                            {/* Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* In stock toggle */}
                              <button onClick={() => updateProduct(ci, pi, { inStock: !inStock, quantity: !inStock ? (p.quantity || '') : p.quantity })}
                                className="text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all"
                                style={inStock
                                  ? { borderColor:'#10B981', background:'#f0fdf4', color:'#10B981' }
                                  : { borderColor:'#EF4444', background:'#fef2f2', color:'#EF4444' }}>
                                {inStock ? 'במלאי' : 'אזל'}
                              </button>
                              {/* Quantity +/- */}
                              {inStock && (
                                <div className="flex items-center gap-1 bg-gray-50 rounded-xl border border-gray-200 px-1 py-0.5">
                                  <button onClick={() => updateProduct(ci, pi, { quantity: Math.max(0, qty - 1).toString() })}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-red-500 transition-all font-bold text-sm">−</button>
                                  <input value={p.quantity || ''} onChange={e => updateProduct(ci, pi, { quantity: e.target.value.replace(/[^0-9]/g, '') })}
                                    className="w-10 text-center text-sm font-black text-gray-800 bg-transparent outline-none"
                                    placeholder="∞" dir="ltr" />
                                  <button onClick={() => updateProduct(ci, pi, { quantity: (qty + 1).toString() })}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-green-500 transition-all font-bold text-sm">+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {allProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-gray-500 font-semibold">אין מוצרים עם שמות בחנות</p>
                  <p className="text-gray-400 text-sm mt-1">ערוך את החנות והוסף מוצרים</p>
                  <button onClick={() => navigate(`/store-builder/${storeId}`)}
                    className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background:`linear-gradient(135deg,${accent},${accent}bb)` }}>
                    ערוך חנות
                  </button>
                </div>
              )}
              {/* Out of stock alert */}
              {outOfStockProducts.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-red-700">{outOfStockProducts.length} מוצרים אזלו מהמלאי</p>
                    <p className="text-xs text-red-500 mt-0.5">{outOfStockProducts.map(p => p.name).join(' · ')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} className="space-y-4">
              {/* Views */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <p className="text-sm font-bold text-gray-800 mb-4">צפיות בחנות</p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-4xl font-black text-gray-900">{store?.views_count || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">סה"כ כניסות לדף</p>
                  </div>
                </div>
              </div>

              {/* Inventory value breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <p className="text-sm font-bold text-gray-800 mb-4">שווי מלאי לפי קטגוריה</p>
                <div className="space-y-3">
                  {categories.map((cat, ci) => {
                    const val = (cat.products || []).filter(p => p.name && p.inStock !== false).reduce((s, p) => {
                      const price = parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0;
                      const qty   = parseInt(p.quantity) || 0;
                      return s + price * qty;
                    }, 0);
                    if (val === 0 && (cat.products || []).filter(p => p.name).length === 0) return null;
                    return (
                      <div key={ci} className="flex items-center gap-3">
                        <span className="text-base w-6 flex-shrink-0">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">{cat.name}</p>
                            <p className="text-xs font-black text-gray-800">₪{val.toLocaleString()}</p>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: inventoryValue > 0 ? `${(val / inventoryValue * 100).toFixed(1)}%` : '0%', background:`linear-gradient(135deg,${accent},${accent}bb)` }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {inventoryValue === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">הזן מחירים וכמויות כדי לראות שווי מלאי</p>
                  )}
                </div>
              </div>

              {/* Coming soon metrics */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="absolute top-4 left-4 text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</div>
                <p className="text-sm font-bold text-gray-800 mb-4">מכירות ורווחיות</p>
                <div className="grid grid-cols-3 gap-3 opacity-40 pointer-events-none select-none">
                  {[
                    { label:'הזמנות היום', value:'0', icon:'🛒' },
                    { label:'הכנסות החודש', value:'₪0', icon:'💳' },
                    { label:'רווח נקי', value:'₪0', icon:'📈' },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <span className="text-xl">{m.icon}</span>
                      <p className="text-base font-black text-gray-800 mt-1">{m.value}</p>
                      <p className="text-[10px] text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">מעקב מכירות אוטומטי יגיע בקרוב עם שילוב מערכת סליקה</p>
              </div>

              {/* WhatsApp orders insight */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <p className="text-sm font-bold text-gray-800 mb-2">הזמנות וואטסאפ</p>
                <p className="text-xs text-gray-400 mb-4">כל הזמנה שמגיעה דרך כפתור הוואטסאפ</p>
                <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,#25D366,#128C7E)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.76.46 3.41 1.27 4.85L2 22l5.31-1.25A9.99 9.99 0 0012 22c5.514 0 9.99-4.476 9.99-9.99C21.99 6.486 17.514 2 11.99 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">מספר וואטסאפ: {ms.social?.whatsapp || 'לא הוגדר'}</p>
                    <p className="text-xs text-green-600 mt-0.5">הלקוחות שולחים הזמנות ישירות לנייד שלך</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
