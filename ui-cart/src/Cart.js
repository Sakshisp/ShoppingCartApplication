import React, { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthContext';

const fmt = (minor, currency) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(minor / 100);

export default function Cart() {
  const { axiosPrivate, logout, user } = useAuth();
  const userId = user?.sub ?? 'anon';

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [bill, setBill] = useState(null); // { currency, totalPence, totalFormatted, lines }
  const [error, setError] = useState('');

  const loadCart = async () => {
    try {
      const res = await axiosPrivate.get('/api/cart', { headers: { 'X-User-Id': userId } });
      setItems(res.data.cart || []);
      setBill(null); // reset bill when cart changes
    } catch {
      setError('Failed to load cart');
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      await axiosPrivate.post('/api/cart/items', { item: newItem.trim() }, { headers: { 'X-User-Id': userId } });
      setNewItem('');
      loadCart();
    } catch {
      setError('Failed to add item');
    }
  };

  const removeOne = async (name) => {
    try {
      await axiosPrivate.delete(`/api/cart/items/${encodeURIComponent(name)}`, { headers: { 'X-User-Id': userId } });
      loadCart();
    } catch {
      setError('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axiosPrivate.delete('/api/cart', { headers: { 'X-User-Id': userId } });
      loadCart();
    } catch {
      setError('Failed to clear cart');
    }
  };

  const calcTotal = async () => {
    try {
      const res = await axiosPrivate.post('/api/cart/total', {}, { headers: { 'X-User-Id': userId } });
      setBill(res.data);
    } catch {
      setError('Failed to calculate total');
    }
  };

  useEffect(() => { loadCart(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Shopping Cart</h1>
        <button onClick={logout} style={{ marginLeft: 'auto' }}>Logout</button>
      </div>
      <p style={{ opacity: 0.7, marginTop: 6 }}>Signed in as {user?.sub || 'user'}</p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {/* Add item */}
      <div style={{ margin: '12px 0' }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Apple / Banana / Melon / Lime"
          style={{ width: 280, marginRight: 8 }}
        />
        <button onClick={addItem} disabled={!newItem.trim()}>Add</button>
        <button onClick={clearCart} style={{ marginLeft: 8 }} disabled={!items.length}>Clear</button>
      </div>

      {/* Items list with quick remove */}
      <h2 style={{ marginBottom: 6 }}>Items</h2>
      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>Your cart is empty.</p>
      ) : (
        <ul>
          {items.map((it, idx) => (
            <li key={`${it}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{it}</span>
              <button onClick={() => removeOne(it)} style={{ fontSize: 12, padding: '2px 6px' }}>remove one</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={calcTotal} disabled={!items.length} style={{ marginTop: 6 }}>Calculate Total</button>

      {/* Bill/receipt table */}
      {bill && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Bill</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={th}>Item</th>
                  <th style={th} title="Quantity added to cart">Qty</th>
                  <th style={th} title="Quantity you pay for after offers">Chargeable</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.lines?.map((line, i) => (
                  <tr key={i}>
                    <td style={td}>{line.item}</td>
                    <td style={tdCenter}>{line.qty}</td>
                    <td style={tdCenter}>{line.chargeableQty}</td>
                    <td style={tdRight}>{fmt(line.unitPricePence, bill.currency)}</td>
                    <td style={tdRight}>{fmt(line.lineTotalPence, bill.currency)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...td, paddingTop: 12, fontWeight: 600 }} colSpan={4}>Total</td>
                  <td style={{ ...tdRight, paddingTop: 12, fontWeight: 700 }}>
                    {bill.totalFormatted /* already formatted by backend */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
  padding: '8px 10px',
  fontWeight: 600,
  fontSize: 14,
  background: '#fafafa'
};
const td = { borderBottom: '1px solid #eee', padding: '8px 10px', fontSize: 14 };
const tdCenter = { ...td, textAlign: 'center' };
const tdRight  = { ...td, textAlign: 'right', whiteSpace: 'nowrap' };
