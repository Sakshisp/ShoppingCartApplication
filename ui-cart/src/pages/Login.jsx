import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pending, setPending] = useState(false);

  // ----- Forgot password modal -----
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotErr, setForgotErr] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const forgotTriggerRef = useRef(null);
  const emailInputRef = useRef(null);

  // ----- Create account modal -----
  const [createOpen, setCreateOpen] = useState(false);
  const [create, setCreate] = useState({ name: "", email: "", phone: "" });
  const [createErr, setCreateErr] = useState("");
  const [createSent, setCreateSent] = useState(false);
  const createTriggerRef = useRef(null);
  const createNameRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setPending(true);
    try {
      await login(form.username.trim(), form.password);
      nav("/cart");
    } catch {
      setErr("Login failed. Please check your credentials and try again.");
    } finally {
      setPending(false);
    }
  };

  // ===== Forgot helpers
  const openForgot = (btnEl) => { forgotTriggerRef.current = btnEl; setForgotOpen(true); };
  const closeForgot = () => {
    setForgotOpen(false); setForgotEmail(""); setForgotErr(""); setForgotSent(false);
    forgotTriggerRef.current?.focus?.();
  };
  useEffect(() => { if (forgotOpen) setTimeout(() => emailInputRef.current?.focus(), 0); }, [forgotOpen]);

  const requestPasswordReset = async (email) => {
    // TODO: replace with API call
    await new Promise((r) => setTimeout(r, 700));
    return true;
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotErr(""); setForgotSent(false);
    const email = forgotEmail.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) { setForgotErr("Please enter a valid email address."); return; }
    try { await requestPasswordReset(email); setForgotSent(true); }
    catch { setForgotErr("Unable to send reset email right now. Please try again."); }
  };

  // ===== Create-account helpers
  const openCreate = (btnEl) => { createTriggerRef.current = btnEl; setCreateOpen(true); };
  const closeCreate = () => {
    setCreateOpen(false);
    setCreate({ name: "", email: "", phone: "" });
    setCreateErr(""); setCreateSent(false);
    createTriggerRef.current?.focus?.();
  };
  useEffect(() => { if (createOpen) setTimeout(() => createNameRef.current?.focus(), 0); }, [createOpen]);

  const requestCreateAccount = async ({ name, email, phone }) => {
    // TODO: replace with API call, e.g. await api.post('/auth/create-request', { name, email, phone })
    await new Promise((r) => setTimeout(r, 800));
    return true;
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErr(""); setCreateSent(false);

    const name = create.name.trim();
    const email = create.email.trim();
    const phone = create.phone.trim();

    if (!name) { setCreateErr("Please enter your name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setCreateErr("Please enter a valid email."); return; }
    // simple phone sanity (allows digits, spaces, +, -, parentheses; length check on digits)
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { setCreateErr("Please enter a valid phone number."); return; }

    try { await requestCreateAccount({ name, email, phone }); setCreateSent(true); }
    catch { setCreateErr("We couldn't submit your request. Please try again."); }
  };

  return (
    <main className="auth">
      <div className="auth__bg auth__bg--1" aria-hidden />
      <div className="auth__bg auth__bg--2" aria-hidden />

      <section className="auth__card" role="region" aria-labelledby="auth-title">
        <header className="auth__header">
          <h1 id="auth-title">Shopping Cart</h1>
          <p className="muted">Sign in to continue</p>
        </header>

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="visually-hidden" aria-live="polite">
            {pending ? "Signing you in…" : ""}
          </div>

          {err ? <div className="alert" role="alert">{err}</div> : null}

          <div className="field">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="input"
              placeholder=" "
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <label htmlFor="username" className="label">Username</label>
          </div>

          <div className="field">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              className="input"
              placeholder=" "
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <label htmlFor="password" className="label">Password</label>

            <button
              type="button"
              className="ghost-btn"
              aria-pressed={showPwd}
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="row">
            <label className="checkbox">
              <input type="checkbox" name="remember" /> <span>Remember me</span>
            </label>

            <button
              type="button"
              className="link link--button"
              onClick={(e) => openForgot(e.currentTarget)}
            >
              Forgot password?
            </button>
          </div>

          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>

          <p className="muted center" style={{ marginTop: 8 }}>
            Don’t have an account?{" "}
            <button
              type="button"
              className="link link--button"
              onClick={(e) => openCreate(e.currentTarget)}
            >
              Create one
            </button>
          </p>
        </form>
      </section>

      {/* ===== Forgot Password Modal ===== */}
      {forgotOpen && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fp-title"
          onKeyDown={(e) => e.key === "Escape" && closeForgot()}
        >
          <div className="modal__backdrop" onClick={closeForgot} />
          <div className="modal__card">
            <header className="modal__header">
              <h2 id="fp-title">Reset your password</h2>
              <button className="modal__close" aria-label="Close dialog" onClick={closeForgot}>✕</button>
            </header>

            {!forgotSent ? (
              <form className="form" onSubmit={onForgotSubmit} noValidate>
                {forgotErr ? <div className="alert" role="alert">{forgotErr}</div> : null}
                <div className="field">
                  <input
                    ref={emailInputRef}
                    id="fp-email"
                    name="email"
                    type="email"
                    className="input"
                    placeholder=" "
                    autoComplete="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <label htmlFor="fp-email" className="label">Email address</label>
                </div>

                <div className="modal__actions">
                  <button type="button" className="btn btn--ghost" onClick={closeForgot}>Cancel</button>
                  <button type="submit" className="btn">Send reset link</button>
                </div>
              </form>
            ) : (
              <div className="success">
                <div className="success__icon" aria-hidden>✅</div>
                <h3 className="success__title">Password reset email sent</h3>
                <p className="muted">
                  If an account exists for <strong>{forgotEmail}</strong>, you’ll receive an email with a reset link.
                </p>
                <div className="modal__actions">
                  <button className="btn" onClick={closeForgot}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Create Account Modal ===== */}
      {createOpen && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ca-title"
          onKeyDown={(e) => e.key === "Escape" && closeCreate()}
        >
          <div className="modal__backdrop" onClick={closeCreate} />
          <div className="modal__card">
            <header className="modal__header">
              <h2 id="ca-title">Request account</h2>
              <button className="modal__close" aria-label="Close dialog" onClick={closeCreate}>✕</button>
            </header>

            {!createSent ? (
              <form className="form" onSubmit={onCreateSubmit} noValidate>
                {createErr ? <div className="alert" role="alert">{createErr}</div> : null}

                <div className="field">
                  <input
                    ref={createNameRef}
                    id="ca-name"
                    name="name"
                    type="text"
                    className="input"
                    placeholder=" "
                    required
                    value={create.name}
                    onChange={(e) => setCreate({ ...create, name: e.target.value })}
                  />
                  <label htmlFor="ca-name" className="label">Full name</label>
                </div>

                <div className="field">
                  <input
                    id="ca-email"
                    name="email"
                    type="email"
                    className="input"
                    placeholder=" "
                    autoComplete="email"
                    required
                    value={create.email}
                    onChange={(e) => setCreate({ ...create, email: e.target.value })}
                  />
                  <label htmlFor="ca-email" className="label">Email address</label>
                </div>

                <div className="field">
                  <input
                    id="ca-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    className="input"
                    placeholder=" "
                    value={create.phone}
                    onChange={(e) => setCreate({ ...create, phone: e.target.value })}
                  />
                  <label htmlFor="ca-phone" className="label">Phone</label>
                </div>

                <div className="modal__actions">
                  <button type="button" className="btn btn--ghost" onClick={closeCreate}>Cancel</button>
                  <button type="submit" className="btn">Submit request</button>
                </div>
              </form>
            ) : (
              <div className="success">
                <div className="success__icon" aria-hidden>✅</div>
                <h3 className="success__title">Request submitted</h3>
                <p className="muted">
                  Once approved by the admin, you will receive an email at{" "}
                  <strong>{create.email}</strong> with your login credentials.
                </p>
                <div className="modal__actions">
                  <button className="btn" onClick={closeCreate}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
