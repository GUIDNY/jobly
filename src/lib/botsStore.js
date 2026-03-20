import { useState } from 'react';
import { mockBots } from './mockData';

// Simple in-memory store for bots (simulates backend)
let bots = [...mockBots];
let listeners = [];

export function getBots() {
  return bots;
}

export function getBotById(id) {
  return bots.find(b => b.id === id);
}

export function updateBot(id, data) {
  bots = bots.map(b => b.id === id ? { ...b, ...data } : b);
  listeners.forEach(fn => fn());
}

export function createBot(data) {
  const newBot = { ...data, id: String(Date.now()), rating: 0, total_orders: 0, is_published: false };
  bots = [newBot, ...bots];
  listeners.forEach(fn => fn());
  return newBot;
}

export function deleteBot(id) {
  bots = bots.filter(b => b.id !== id);
  listeners.forEach(fn => fn());
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
