import { useState, useEffect } from 'react';
import type { Notification } from '../types';

const BASE = 'http://localhost:3001/api';

let _notifications: Notification[] = [];
let _listeners: (() => void)[] = [];
let _currentPassengerId: string | null = null;

const notifyListeners = () => _listeners.forEach(l => l());

// Push notification directly via backend
export async function pushNotification(n: Omit<Notification, 'id' | 'time'>, passengerId: string = _currentPassengerId!) {
  if (!passengerId) return;
  try {
    const r = await fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passengerId, ...n })
    });
    const saved = await r.json();
    saved.time = 'Just now'; // Map for frontend
    _notifications = [saved, ..._notifications];
    notifyListeners();
  } catch (error) {
    console.error('Failed to push notification', error);
  }
}

// Load initial notifications for passenger
export async function loadNotifications(passengerId: string) {
  _currentPassengerId = passengerId;
  try {
    const r = await fetch(`${BASE}/notifications/${passengerId}`);
    const data = await r.json();
    _notifications = data.map((d: any) => ({
      ...d,
      time: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    notifyListeners();
  } catch (error) {
    console.error('Failed to load notifications', error);
  }
}

export function useNotifications() {
  const [, rerender] = useState(0);
  
  useEffect(() => {
    const handler = () => rerender(x => x + 1);
    _listeners.push(handler);
    return () => { _listeners = _listeners.filter(l => l !== handler); };
  }, []);

  const markAllRead = async () => {
    if (!_currentPassengerId) return;
    try {
      await fetch(`${BASE}/notifications/${_currentPassengerId}/read-all`, { method: 'POST' });
      _notifications = _notifications.map(n => ({ ...n, unread: false }));
      notifyListeners();
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  return {
    notifications: _notifications,
    unreadCount: _notifications.filter(n => n.unread).length,
    markAllRead,
  };
}
