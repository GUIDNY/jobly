import { supabase } from './supabase';

// =============================================
// BOTS
// =============================================

export async function getBots({ category, botType, search, ownerId } = {}) {
  let query = supabase.from('bots').select('*').eq('is_published', true);

  if (category) query = query.eq('category', category);
  if (botType) query = query.eq('bot_type', botType);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,role.ilike.%${search}%`);
  }

  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMyBots(ownerId) {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBotById(id) {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBot(botData) {
  const { data, error } = await supabase
    .from('bots')
    .insert(botData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBot(id, botData) {
  const { data, error } = await supabase
    .from('bots')
    .update(botData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBot(id) {
  const { error } = await supabase.from('bots').delete().eq('id', id);
  if (error) throw error;
}

// =============================================
// ORDERS
// =============================================

export async function getMyOrders(clientId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, bots(name, avatar_url, bot_type)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrdersForMyBots(ownerId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, bots!inner(name, avatar_url, owner_id)')
    .eq('bots.owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// =============================================
// CHAT SESSIONS
// =============================================

export async function getChatSession(botId, visitorId) {
  const { data } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('bot_id', botId)
    .eq('visitor_id', visitorId)
    .maybeSingle();
  return data;
}

export async function upsertChatSession({ id, botId, visitorId, userId, messages }) {
  const row = {
    bot_id: botId,
    visitor_id: visitorId,
    messages,
    updated_at: new Date().toISOString(),
    ...(userId && { user_id: userId }),
  };
  if (id) {
    const { data } = await supabase.from('chat_sessions').update(row).eq('id', id).select().single();
    return data;
  } else {
    const { data } = await supabase.from('chat_sessions').insert(row).select().single();
    return data;
  }
}

export async function getChatSessionsForBot(botId) {
  const { data } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('bot_id', botId)
    .order('updated_at', { ascending: false });
  return data || [];
}

export async function getChatSessionsForBots(botIds) {
  if (!botIds.length) return [];
  const { data } = await supabase
    .from('chat_sessions')
    .select('*, bots(name, avatar_url)')
    .in('bot_id', botIds)
    .order('updated_at', { ascending: false });
  return data || [];
}

// =============================================
// ADMIN
// =============================================

export async function getAllBots() {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, bots(name), profiles(email, full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
