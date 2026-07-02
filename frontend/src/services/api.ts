// Centralised API layer – all fetch calls go here
const BASE = 'http://localhost:3001/api';

export async function getPassengerByEmail(email: string) {
  const r = await fetch(`${BASE}/passenger/email/${email}`);
  if (!r.ok) throw new Error('Passenger not found');
  return r.json();
}

export async function getPassengerById(id: string) {
  const r = await fetch(`${BASE}/passenger/${id}`);
  if (!r.ok) throw new Error('Passenger not found');
  return r.json();
}

export async function getPassengers() {
  const r = await fetch(`${BASE}/passengers`);
  if (!r.ok) throw new Error('Failed to fetch passengers');
  return r.json();
}

export async function loginWithEmail(email: string, password: string) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return r.json();
}

export async function forgotPassword(email: string) {
  const r = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!r.ok) throw new Error('Failed to send reset email');
  return r.json();
}

export async function resetPassword(token: string, newPassword: string) {
  const r = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset password');
  }
  return r.json();
}

export async function analyzeRecovery(bookingId: string) {
  const r = await fetch(`${BASE}/recovery/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId }),
  });
  if (!r.ok) throw new Error('Recovery analysis failed');
  return r.json();
}

export async function acceptRecovery(bookingId: string, recommendationId: string, alternativeFlightId: string) {
  const r = await fetch(`${BASE}/recovery/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, recommendationId, alternativeFlightId }),
  });
  if (!r.ok) throw new Error('Failed to accept recovery');
  return r.json();
}

export async function requestRefund(bookingId: string, reason: string) {
  const r = await fetch(`${BASE}/recovery/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, reason }),
  });
  if (!r.ok) throw new Error('Refund request failed');
  return r.json();
}

export async function getRecoveryHistory(bookingId: string) {
  const r = await fetch(`${BASE}/recovery/history/${bookingId}`);
  if (!r.ok) throw new Error('Failed to fetch history');
  return r.json();
}

export async function demoReset() {
  await fetch(`${BASE}/demo/reset`, { method: 'POST' });
}

export async function demoCancelFlight(flightId: string) {
  await fetch(`${BASE}/demo/cancel-flight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightId }),
  });
}

export async function demoDelayFlight(flightId: string, delayMinutes: number) {
  await fetch(`${BASE}/demo/delay-flight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightId, delayMinutes }),
  });
}

export async function getChatHistory(passengerId: string) {
  const r = await fetch(`${BASE}/chat/${passengerId}`);
  if (!r.ok) throw new Error('Failed to fetch chat history');
  return r.json();
}

export async function sendChatMessage(passengerId: string, text: string) {
  const r = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passengerId, text }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message');
  }
  return r.json();
}
