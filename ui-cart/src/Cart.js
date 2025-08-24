// src/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth/AuthContext";
import "./Cart.css"; // 👈 import styles

const fmt = (minor, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    minor / 100
  );

const FRUITS = [
  { key: "apple", name: "Apple", emoji: "🍎" },
  { key: "banana", name: "Banana", emoji: "🍌" },
  { key: "melon", name: "Melon", emoji: "🍈" },
  { key: "lime", name: "Lime", emoji: "🟢" },
];

export default function Cart() {
  const { axiosPrivate, logout, user } = useAuth();
  const userId = user?.sub ?? "anon";

  const [items, setItems] = useState([]);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // derive fruit quantities
  const qty = useMemo(() => {
    const m = { apple: 0, banana: 0, melon: 0, lime: 0 };
    for (const it of items) {
      const k = String(it).toLowerCase();
      if (m[k] !== undefined) m[k] += 1;
    }
    return m;
  }, [items]);

  const loadCart = async () => {
    const res = await axiosPrivate.get("/api/cart", {
      headers: { "X-User-Id": userId },
    });
    setItems(res.data.cart || []);
  };

  const calcTotal = async () => {
    const res = await axiosPrivate.post(
      "/api/cart/total",
      {},
      { headers: { "X-User-Id": userId } }
    );
    setBill(res.data);
  };

  const refreshCartAndBill = async () => {
    setLoading(true);
    setError("");
    try {
      await loadCart();
      await calcTotal();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addOne = async (name) => {
    try {
      await axiosPrivate.post(
        "/api/cart/items",
        { item: name },
        { headers: { "X-User-Id": userId } }
      );
      await refreshCartAndBill();
    } catch {
      setError("Failed to add item");
    }
  };

  const removeOne = async (name) => {
    try {
      await axiosPrivate.delete(`/api/cart/items/${encodeURIComponent(name)}`, {
        headers: { "X-User-Id": userId },
      });
      await refreshCartAndBill();
    } catch {
      setError("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await axiosPrivate.delete("/api/cart", {
        headers: { "X-User-Id": userId },
      });
      await refreshCartAndBill();
    } catch {
      setError("Failed to clear cart");
    }
  };

  useEffect(() => {
    refreshCartAndBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
      <p className="signed-in">Signed in as {user?.sub || "user"}</p>
      {error && <p className="error">{error}</p>}

      {/* Add items */}
      <section className="card">
        <h2>Add items</h2>
        <div className="grid">
          {FRUITS.map((f) => (
            <article key={f.key} className="fruit-card">
              <div className="fruit-media" aria-hidden>
                <span className="fruit-emoji" role="img" aria-label={f.name}>
                  {f.emoji}
                </span>
              </div>
              <div className="fruit-title">
                <h3>{f.name}</h3>
                <span>Qty: {qty[f.key]}</span>
              </div>
              <div className="fruit-controls">
                <button
                  className="icon-btn"
                  onClick={() => removeOne(f.name)}
                  disabled={loading || qty[f.key] === 0}
                >
                  −
                </button>
                <span className="qty">{qty[f.key]}</span>
                <button
                  className="icon-btn"
                  onClick={() => addOne(f.name)}
                  disabled={loading}
                >
                  +
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="card-footer">
          <button onClick={clearCart} disabled={loading || items.length === 0}>
            Clear cart
          </button>
          <span>{loading ? "Updating…" : "Click + / − to update quantities."}</span>
        </div>
      </section>

      {/* Bill */}
      {bill && items.length > 0 && (
        <section className="card bill-card">
          <h3>Bill</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th title="Quantity added">Qty</th>
                  <th title="Chargeable qty">Chargeable</th>
                  <th>Unit</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.lines?.map((line, i) => (
                  <tr key={i}>
                    <td>{line.item}</td>
                    <td className="center">{line.qty}</td>
                    <td className="center">{line.chargeableQty}</td>
                    <td className="right">
                      {fmt(line.unitPricePence, bill.currency)}
                    </td>
                    <td className="right">
                      {fmt(line.lineTotalPence, bill.currency)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="total-label">
                    Total
                  </td>
                  <td className="total-value">{bill.totalFormatted}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
