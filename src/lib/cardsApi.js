import { supabase } from './supabase';

// Hebrew to English transliteration for slugs
const hebrewMap = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
  'ח': 'h', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
  'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
  'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
};

export function toSlug(text) {
  if (!text) return '';
  let result = '';
  for (const char of text) {
    if (hebrewMap[char]) {
      result += hebrewMap[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (/\s/.test(char)) {
      result += '-';
    }
    // skip special chars
  }
  return result
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export async function checkSlugAvailable(slug, excludeId = null) {
  if (!slug || slug.length < 2) return false;
  let query = supabase.from('cards').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return !data || data.length === 0;
}

export async function suggestSlugs(baseSlug) {
  const suggestions = [
    `${baseSlug}1`,
    `${baseSlug}-il`,
    `${baseSlug}-tlv`,
    `${baseSlug}-pro`,
  ];
  const available = [];
  for (const s of suggestions) {
    const ok = await checkSlugAvailable(s);
    if (ok) available.push(s);
    if (available.length >= 3) break;
  }
  return available;
}

// Fetch services for one or more card IDs and attach them to the cards array
async function attachServices(cards) {
  if (!cards || cards.length === 0) return cards;
  const ids = cards.map(c => c.id);
  const { data: services } = await supabase
    .from('card_services')
    .select('*')
    .in('card_id', ids)
    .order('order_index', { ascending: true });
  const byCard = {};
  (services || []).forEach(s => {
    if (!byCard[s.card_id]) byCard[s.card_id] = [];
    byCard[s.card_id].push(s);
  });
  return cards.map(c => ({ ...c, card_services: byCard[c.id] || [] }));
}

export async function getMyCards(userId) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return attachServices(data || []);
}

export async function getCardBySlug(slug) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  const [card] = await attachServices([data]);
  return card;
}

export async function getCardById(id) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  const [card] = await attachServices([data]);
  return card;
}

export async function createCard(userId, cardData) {
  const { services, card_services, whatsapp_position, title_align, name_size, faq, ...rest } = cardData;
  const { data, error } = await supabase
    .from('cards')
    .insert({ ...rest, user_id: userId, faq: faq || [] })
    .select()
    .single();
  if (error) throw error;

  if (services && services.length > 0) {
    const serviceRows = services
      .filter(s => s.title?.trim())
      .map((s, i) => ({
        card_id: data.id,
        title: s.title || '',
        description: s.description || '',
        image_url: s.image_url || '',
        popup_image_url: s.popup_image_url || null,
        price: s.price || '',
        size: s.size || 'full',
        service_url: s.service_url || null,
        order_index: i,
      }));
    if (serviceRows.length > 0) {
      const { error } = await supabase.from('card_services').insert(serviceRows);
      if (error) throw error;
    }
  }
  return data;
}

export async function updateCard(cardId, cardData) {
  const { services, card_services, whatsapp_position, title_align, name_size, ...rest } = cardData;
  const { data, error } = await supabase
    .from('cards')
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq('id', cardId)
    .select()
    .single();
  if (error) throw error;

  // Replace services if provided
  if (services !== undefined) {
    await supabase.from('card_services').delete().eq('card_id', cardId);
    const serviceRows = (services || [])
      .filter(s => s.title?.trim())
      .map((s, i) => ({
        card_id: cardId,
        title: s.title || '',
        description: s.description || '',
        image_url: s.image_url || '',
        popup_image_url: s.popup_image_url || null,
        price: s.price || '',
        size: s.size || 'full',
        service_url: s.service_url || null,
        order_index: i,
      }));
    if (serviceRows.length > 0) {
      const { error } = await supabase.from('card_services').insert(serviceRows);
      if (error) throw error;
    }
  }
  return data;
}

export async function deleteCard(cardId) {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) throw error;
}

export async function publishCard(cardId) {
  const { data, error } = await supabase
    .from('cards')
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq('id', cardId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function incrementViews(cardId) {
  await supabase.rpc('increment_card_views', { card_id: cardId }).catch(() => {
    // Fallback: just ignore if RPC doesn't exist
  });
}

function compressImage(file, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
        else { width = Math.round(width * maxPx / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function uploadCardImage(userId, file) {
  const compressed = await compressImage(file);
  const path = `${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('card-images')
    .getPublicUrl(data.path);
  return publicUrl;
}

export async function uploadCardVideo(userId, file) {
  const ext = file.name.split('.').pop() || 'mp4';
  const path = `${userId}/video_${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('card-images')
    .getPublicUrl(data.path);
  return publicUrl;
}

// ─── Stores ────────────────────────────────────────────────────────────────────

export async function getMyStores(userId) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getStoreBySlug(slug) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  if (error) throw error;
  return data;
}

export async function getStoreById(id) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createStore(userId, storeData) {
  const { data, error } = await supabase
    .from('stores')
    .insert({ user_id: userId, data: storeData, store_type: storeData.storeType || 'multi', is_published: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStore(storeId, storeData) {
  const { data, error } = await supabase
    .from('stores')
    .update({ data: storeData, store_type: storeData.storeType || 'multi', updated_at: new Date().toISOString() })
    .eq('id', storeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publishStore(storeId, slug) {
  const { data, error } = await supabase
    .from('stores')
    .update({ is_published: true, slug, updated_at: new Date().toISOString() })
    .eq('id', storeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStore(storeId) {
  const { error } = await supabase.from('stores').delete().eq('id', storeId);
  if (error) throw error;
}

export async function checkStoreSlugAvailable(slug, excludeId = null) {
  if (!slug || slug.length < 2) return false;
  let query = supabase.from('stores').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return !data || data.length === 0;
}

// LocalStorage helpers for pre-auth data
const LS_KEY = 'mycard_draft';

export function saveDraft(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(LS_KEY);
}
