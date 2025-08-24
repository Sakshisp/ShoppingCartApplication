import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(form.username, form.password);
      nav('/cart');
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          required
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button type="submit">Login</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </div>
  );
}
