import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { getStoreById, updateStore, uploadCardImage } from '../lib/cardsApi';

const EMPTY_PRODUCT = { name: '', price: '', description: '', image: '', size: 'full', inStock: true, quantity: '' };

export default function WarehousePage() {
  const { storeId } = useParams();
  const navigate    = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [store, setStore]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [tab, setTab]             = useState('inventory');
  const [categories, setCategories] = useState([]);
  const [editingProd, setEditingProd] = useState(null); // { ci, pi }
  const [uploadingImg, setUploadingImg] = useState(null);

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

  const dirty = () => setSaved(false);

  // ── product helpers ──────────────────────────────────────────────────────────
  const updProduct = (ci, pi, patch) => {
    setCategories(prev => prev.map((c, ci2) => ci2 !== ci ? c : {
      ...c,
      products: (c.products || []).map((p, pi2) => pi2 !== pi ? p : { ...p, ...patch }),
    }));
    dirty();
  };

  const addProduct = (ci) => {
    setCategories(prev => prev.map((c, ci2) => ci2 !== ci ? c : {
      ...c,
      products: [...(c.products || []), { ...EMPTY_PRODUCT }],
    }));
    const newPi = (categories[ci]?.products || []).length;
    setEditingProd({ ci, pi: newPi });
    dirty();
  };

  const deleteProduct = (ci, pi) => {
    setCategories(prev => prev.map((c, ci2) => ci2 !== ci ? c : {
      ...c,
      products: (c.products || []).filter((_, i) => i !== pi),
    }));
    if (editingProd?.ci === ci && editingProd?.pi === pi) setEditingProd(null);
    dirty();
  };

  const moveProduct = (ci, pi, dir) => {
    setCategories(prev => prev.map((c, ci2) => {
      if (ci2 !== ci) return c;
      const prods = [...(c.products || [])];
      const to = pi + dir;
      if (to < 0 || to >= prods.length) return c;
      [prods[pi], prods[to]] = [prods[to], prods[pi]];
      return { ...c, products: prods };
    }));
    dirty();
  };

  const handleImageUpload = async (ci, pi, file) => {
    if (!file) return;
    setUploadingImg(`${ci}-${pi}`);
    try {
      const url = await uploadCardImage(user.id, file);
      updProduct(ci, pi, { image: url });
    } catch (e) { console.error(e); }
    finally { setUploadingImg(null); }
  };

  // ── category helpers ─────────────────────────────────────────────────────────
  const addCategory = () => {
    setCategories(prev => [...prev, { id: Date.now(), name: 'קטגוריה חדשה', icon: '🛍️', image: '', displayMode: 'popup', products: [] }]);
    dirty();
  };

  const updCategory = (ci, patch) => {
    setCategories(prev => prev.map((c, ci2) => ci2 !== ci ? c : { ...c, ...patch }));
    dirty();
  };

  const deleteCategory = (ci) => {
    setCategories(prev => prev.filter((_, i) => i !== ci));
    dirty();
  };

  const moveCategory = (ci, dir) => {
    setCategories(prev => {
      const next = [...prev];
      const to = ci + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[ci], next[to]] = [next[to], next[ci]];
      return next;
    });
    dirty();
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const storeData = { ...store.data, multi: { ...(store.data?.multi || store.data || {}), categories } };
      await updateStore(storeId, storeData);
      setStore(prev => ({ ...prev, data: storeData }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
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
  const allProducts = categories.flatMap(c => (c.products || []).filter(p => p.name));
  const inStockCount   = allProducts.filter(p => p.inStock !== false).length;
  const outCount       = allProducts.filter(p => p.inStock === false).length;
  const totalQty       = allProducts.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0);
  const inventoryValue = allProducts.reduce((s, p) => {
    const price = parseFloat((p.price || '0').replace(/[^0-9.]/g, '')) || 0;
    return s + price * (parseInt(p.quantity) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100" style={{ boxShadow:'0 1px 0 #f1f5f9' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate('/dashboard')}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background:`linear-gradient(135deg,${accent},${accent}bb)` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="min-w-0">
              <span className="font-black text-gray-900 text-sm">מחסן</span>
              <span className="text-gray-400 text-sm"> · {storeName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/store-builder/${storeId}`)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors hidden sm:block">
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
            { label:'במלאי',       value:inStockCount,   color:'#10B981', bg:'#f0fdf4', icon:'✅' },
            { label:'אזל',         value:outCount,        color:'#EF4444', bg:'#fef2f2', icon:'❌' },
            { label:'יחידות',      value:totalQty||'∞',  color:'#6366f1', bg:'#eef2ff', icon:'📦' },
            { label:'שווי מלאי',   value:inventoryValue > 0 ? `₪${inventoryValue.toLocaleString()}` : '—', color:'#F4938C', bg:'#fff5f5', icon:'💰' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">{s.icon}</span>
                <span className="text-lg font-black" style={{ color:s.color }}>{s.value}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            {[
              { id:'inventory', label:'מלאי ומוצרים', icon:'📦' },
              { id:'analytics', label:'אנליטיקס',     icon:'📊' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={tab===t.id ? { background:`linear-gradient(135deg,${accent},${accent}bb)`, color:'white' } : { color:'#6b7280' }}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          {tab === 'inventory' && (
            <button onClick={addCategory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 border-dashed border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              קטגוריה חדשה
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── INVENTORY TAB ── */}
          {tab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
              {categories.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-4xl mb-3">📂</p>
                  <p className="text-gray-500 font-semibold mb-1">אין קטגוריות עדיין</p>
                  <p className="text-gray-400 text-sm mb-4">הוסף קטגוריה ראשונה כדי להתחיל</p>
                  <button onClick={addCategory}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background:`linear-gradient(135deg,${accent},${accent}bb)` }}>
                    + הוסף קטגוריה
                  </button>
                </div>
              )}

              {categories.map((cat, ci) => (
                <div key={cat.id || ci} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
                  {/* Category header */}
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
                    <input value={cat.icon || ''} onChange={e => updCategory(ci,{icon:e.target.value})}
                      className="w-8 text-center text-lg bg-transparent outline-none cursor-pointer" maxLength={2} />
                    <input value={cat.name || ''} onChange={e => updCategory(ci,{name:e.target.value})}
                      className="flex-1 text-sm font-bold text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-gray-300 transition-colors min-w-0"
                      placeholder="שם קטגוריה" />
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">{(cat.products||[]).filter(p=>p.name).length} מוצרים</span>
                    {/* Move cat up/down */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button onClick={() => moveCategory(ci,-1)} disabled={ci===0}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 disabled:opacity-30 transition-all">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button onClick={() => moveCategory(ci,1)} disabled={ci===categories.length-1}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 disabled:opacity-30 transition-all">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </div>
                    <button onClick={() => { if (window.confirm('למחוק את הקטגוריה?')) deleteCategory(ci); }}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-gray-50">
                    {(cat.products || []).map((p, pi) => {
                      const isEditing = editingProd?.ci === ci && editingProd?.pi === pi;
                      const inStock   = p.inStock !== false;
                      const qty       = parseInt(p.quantity) || 0;
                      const price     = parseFloat((p.price||'0').replace(/[^0-9.]/g,'')) || 0;
                      return (
                        <div key={pi}>
                          {/* Product row */}
                          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                            {/* Image */}
                            <label className="relative flex-shrink-0 cursor-pointer">
                              {p.image
                                ? <img src={p.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-gray-100"/>
                                : <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center"><span style={{fontSize:18}}>📦</span></div>}
                              <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              </div>
                              {uploadingImg === `${ci}-${pi}` && (
                                <div className="absolute inset-0 rounded-xl bg-white/80 flex items-center justify-center">
                                  <svg className="animate-spin w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                </div>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(ci,pi,e.target.files?.[0])} />
                            </label>

                            {/* Name + price (click to expand edit) */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingProd(isEditing ? null : {ci,pi})}>
                              <p className="text-sm font-bold text-gray-800 truncate">{p.name || <span className="text-gray-400 font-normal">ללא שם</span>}</p>
                              <p className="text-xs text-gray-400">{price > 0 ? `₪${price}` : 'ללא מחיר'}{p.description ? ` · ${p.description.slice(0,30)}` : ''}</p>
                            </div>

                            {/* Stock + qty controls */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => updProduct(ci,pi,{inStock:!inStock})}
                                className="text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all"
                                style={inStock ? {borderColor:'#10B981',background:'#f0fdf4',color:'#10B981'} : {borderColor:'#EF4444',background:'#fef2f2',color:'#EF4444'}}>
                                {inStock ? 'במלאי' : 'אזל'}
                              </button>
                              {inStock && (
                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                  <button onClick={() => updProduct(ci,pi,{quantity:Math.max(0,qty-1).toString()})}
                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors font-bold">−</button>
                                  <input value={p.quantity||''} onChange={e => updProduct(ci,pi,{quantity:e.target.value.replace(/[^0-9]/g,'')})}
                                    className="w-8 text-center text-xs font-black text-gray-800 bg-transparent outline-none" placeholder="∞" dir="ltr"/>
                                  <button onClick={() => updProduct(ci,pi,{quantity:(qty+1).toString()})}
                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors font-bold">+</button>
                                </div>
                              )}
                            </div>

                            {/* Reorder + delete */}
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button onClick={() => moveProduct(ci,pi,-1)} disabled={pi===0}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-300 disabled:opacity-20 transition-all">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                              </button>
                              <button onClick={() => moveProduct(ci,pi,1)} disabled={pi===(cat.products||[]).length-1}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-300 disabled:opacity-20 transition-all">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              <button onClick={() => deleteProduct(ci,pi)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded edit form */}
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div key="edit" initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.18 }}
                                className="overflow-hidden">
                                <div className="px-4 pb-4 pt-2 space-y-2.5 bg-indigo-50/40 border-t border-indigo-100/60">
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">עריכת מוצר</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-semibold text-gray-500 block mb-1">שם המוצר</label>
                                      <input value={p.name||''} onChange={e => updProduct(ci,pi,{name:e.target.value})}
                                        placeholder="שם המוצר" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-semibold text-gray-500 block mb-1">מחיר</label>
                                      <input value={p.price||''} onChange={e => updProduct(ci,pi,{price:e.target.value})}
                                        placeholder="₪" dir="ltr" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-gray-500 block mb-1">תיאור</label>
                                    <textarea value={p.description||''} onChange={e => updProduct(ci,pi,{description:e.target.value})}
                                      placeholder="תיאור קצר של המוצר..." rows={2}
                                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none bg-white" />
                                  </div>
                                  <div className="flex gap-1.5">
                                    {[{v:'full',label:'רוחב מלא'},{v:'half',label:'חצי רוחב'}].map(opt => (
                                      <button key={opt.v} onClick={() => updProduct(ci,pi,{size:opt.v})}
                                        className="flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                                        style={(p.size||'full')===opt.v ? {borderColor:accent,background:`${accent}18`,color:accent} : {borderColor:'#e5e7eb',color:'#9ca3af'}}>
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                  <button onClick={() => setEditingProd(null)}
                                    className="w-full py-2 rounded-xl text-xs font-bold text-white"
                                    style={{ background:`linear-gradient(135deg,${accent},${accent}bb)` }}>
                                    סגור עריכה ✓
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add product */}
                  <button onClick={() => addProduct(ci)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-indigo-500 hover:bg-indigo-50 transition-colors border-t border-gray-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    הוסף מוצר לקטגוריה
                  </button>
                </div>
              ))}

              {/* Out of stock alert */}
              {outCount > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-red-700">{outCount} מוצרים אזלו מהמלאי</p>
                    <p className="text-xs text-red-500 mt-0.5">{categories.flatMap(c=>(c.products||[]).filter(p=>p.name&&p.inStock===false).map(p=>p.name)).join(' · ')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
              {/* Views */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <p className="text-sm font-bold text-gray-800 mb-3">צפיות בחנות</p>
                <p className="text-4xl font-black text-gray-900">{store?.views_count || 0}</p>
                <p className="text-sm text-gray-400 mt-1">סה"כ כניסות לדף</p>
              </div>

              {/* Inventory value by category */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <p className="text-sm font-bold text-gray-800 mb-4">שווי מלאי לפי קטגוריה</p>
                <div className="space-y-3">
                  {categories.map((cat, ci) => {
                    const val = (cat.products||[]).filter(p=>p.name&&p.inStock!==false).reduce((s,p)=>{
                      const price = parseFloat((p.price||'0').replace(/[^0-9.]/g,''))||0;
                      return s + price*(parseInt(p.quantity)||0);
                    },0);
                    return (
                      <div key={ci} className="flex items-center gap-3">
                        <span className="text-base w-6 flex-shrink-0">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">{cat.name}</p>
                            <p className="text-xs font-black text-gray-800">₪{val.toLocaleString()}</p>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width:inventoryValue>0?`${(val/inventoryValue*100).toFixed(1)}%`:'0%', background:`linear-gradient(135deg,${accent},${accent}bb)` }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {inventoryValue === 0 && <p className="text-sm text-gray-400 text-center py-4">הזן מחירים וכמויות כדי לראות שווי מלאי</p>}
                </div>
              </div>

              {/* Coming soon */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden" style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="absolute top-4 left-4 text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:'linear-gradient(135deg,#F4938C,#5BC4C8)' }}>בקרוב</div>
                <p className="text-sm font-bold text-gray-800 mb-4">מכירות ורווחיות</p>
                <div className="grid grid-cols-3 gap-3 opacity-40 pointer-events-none select-none">
                  {[{label:'הזמנות היום',value:'0',icon:'🛒'},{label:'הכנסות החודש',value:'₪0',icon:'💳'},{label:'רווח נקי',value:'₪0',icon:'📈'}].map(m=>(
                    <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <span className="text-xl">{m.icon}</span>
                      <p className="text-base font-black text-gray-800 mt-1">{m.value}</p>
                      <p className="text-[10px] text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">יגיע עם שילוב מערכת סליקה</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
