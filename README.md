# 🛒 Shopping Cart System — Full‑Stack Solution

This repository contains a complete solution to the **Shopping Cart System Interview Challenge**.

- **Frontend (React):** `ui-cart/`
- **Backend (Java Spring Boot):** `cart/`

It implements the required pricing rules, clean APIs, and a polished UI that lets users add/remove fruits with instant total updates.

---

## 📌 Problem Statement (Summary)

> Given a list of shopping items, calculate the total cost.  
> Items: **Apple** (35p), **Banana** (20p), **Melon** (50p, **BOGOF**), **Lime** (15p, **3‑for‑2**).  
> Build a **Java backend** for pricing logic and a **JavaScript API layer/UI** that exposes add/view/total.  

---

## 🧱 Architecture

```
.
├── cart/            # Java 17 + Spring Boot backend (pricing rules, offers, REST API)
│   └── src/...
└── ui-cart/         # React 18 frontend (login, cart UI, API client)
    └── src/...
```

### Data Flow
1. **UI** lets the user add/remove fruits using `+ / −` buttons (Apple/Banana/Melon/Lime).
2. **UI** calls backend endpoints with a lightweight header `X-User-Id`.
3. **Backend** owns:
   - The **cart store** per user (in‑memory for the demo).
   - The **pricing engine** (applies BOGOF and 3‑for‑2).
   - The **bill** computation: lines (qty, chargeable qty, unit, line total), and grand total.

### Pricing Rules
- Apple — **35p**  
- Banana — **20p**  
- Melon — **50p**, **Buy‑One‑Get‑One‑Free** (pay for `ceil(qty/2)`)  
- Lime — **15p**, **3‑for‑2** (every third is free → pay for `qty - floor(qty/3)`)  

Currency is handled as **minor units (pence)** on the backend; UI formats using `Intl.NumberFormat`.

---

## ▶️ Quick Start

### 1) Backend (`cart/`)
Requirements: **Java 21+**, **Maven**

```bash
cd cart
./mvnw spring-boot:run
# API available at http://localhost:8080
```

### 2) Frontend (`ui-cart/`)
Requirements: **Node.js 19+**, **npm**

```bash
cd ui-cart
npm install
npm start
# App available at http://localhost:3000
```

The frontend expects the backend at `http://localhost:8080`. If you need to change it, set an environment variable (e.g. `REACT_APP_API_BASE` in a `.env` inside `ui-cart/`) and ensure your Axios instance uses it.

---

## 🔌 REST API (Backend)

> All requests should include a simple header to identify the user:
>
> ```
> X-User-Id: <userId>
> ```

**Endpoints**

| Method | Path                       | Description                             | Body / Notes                         |
|-------:|----------------------------|-----------------------------------------|--------------------------------------|
| GET    | `/api/cart`                | Get current cart items (array of names) | —                                    |
| POST   | `/api/cart/items`          | Add one item                            | `{ "item": "Apple" }`                |
| DELETE | `/api/cart/items/{name}`   | Remove one occurrence of an item        | URL‑encode `{name}` if needed        |
| DELETE | `/api/cart`                | Clear cart                              | —                                    |
| POST   | `/api/cart/total`          | Calculate totals & bill lines           | — (reads cart by user)               |

**Response example — `POST /api/cart/total`**
```json
{
  "currency": "GBP",
  "totalPence": 135,
  "totalFormatted": "£1.35",
  "lines": [
    { "item": "Apple", "qty": 2, "chargeableQty": 2, "unitPricePence": 35, "lineTotalPence": 70 },
    { "item": "Melon", "qty": 2, "chargeableQty": 1, "unitPricePence": 50, "lineTotalPence": 50 },
    { "item": "Lime",  "qty": 1, "chargeableQty": 1, "unitPricePence": 15, "lineTotalPence": 15 }
  ]
}
```

**CORS:** Backend allows the React dev origin for local development.

---

## 🖥️ Frontend (`ui-cart/`) Highlights

- **Login** flow with a lightweight `AuthContext` (demo-level).
- **Cart UI** with four fruit cards (Apple/Banana/Melon/Lime), each offering **+ / −**.
- **Automatic total** recomputation after each change (no manual “calculate” needed).
- **Bill card** is centered, dark text, and **shown only when items exist**.
- “Shopping Cart” and “Signed in as …” appear **white** over a subtle gradient header background.

**Key files**
- `src/Cart.jsx` — main cart screen (calls backend, renders fruit cards + bill)
- `src/cart.css` — styles split from JSX
- `src/auth/AuthContext.js` — minimal auth + Axios instance
- `src/App.jsx` / routing — navigation between login and cart

---

## 🧪 Tests

**Backend**
```bash
cd cart
./mvnw test
```
Unit tests cover the **pricing rules** and offer math (BOGOF, 3‑for‑2).  
You can extend with more edge cases (large quantities, mixed baskets).

**Frontend**
```bash
cd ui-cart
npm test
```
(If timeboxed, smoke tests or simple render tests are included; E2E can be added with Playwright/Cypress later.)

---

## 🧰 Tech Stack

- **Backend:** Java 21, Spring Boot 3, Maven, JUnit 5
- **Frontend:** React 19, Context API, Axios, CSS
- **Formatting:** `Intl.NumberFormat` for currency (UI), minor units (backend)

---

## 🧩 Assumptions & Decisions

- **Case-insensitive** item names on the backend (normalized to lowercase).
- **In‑memory cart store** keyed by `X‑User‑Id` for the demo (swap with Redis/DB for production).
- **Single currency (GBP)** for clarity; extendable via config.
- **Idempotency:** Adding one item always appends one; deleting removes a single occurrence.
- **Security:** The “auth” is intentionally lightweight for the challenge scope; production would use OAuth/JWT and server‑side sessions.

---

## What we’d do next

- Persistent storage (Postgres/Redis) with schema for carts & pricing.
- More robust auth (JWT) and input validation (Bean Validation).
- Swagger/OpenAPI docs at `/swagger-ui`.
- CI (GitHub Actions) with unit + lint + format checks.
- Accessibility polish (keyboard focus rings, aria‑live regions in more places).

---

## 🧪 Optional Extension: Real‑time Synchronization (Discussion)

> _“Maintain perfect real‑time sync between backend and frontend without latency, even during network outages… with zero drift tolerance and automatic conflict resolution.”_

**Reality check:** Zero‑latency and perfect sync **during outages** is not physically achievable on the open internet. However, we can **approximate** strong consistency and automatic resolution:

- Use **WebSockets**/**SSE** for live updates.
- Maintain **server as source of truth**; client uses **optimistic UI** with **operation logs**.
- On reconnection, perform **state reconciliation**:  
  - Re‑send pending ops with **monotonic sequence numbers**.  
  - Back‑off and retry with **idempotent commands** (e.g., `opId`).  
- To guarantee identical pricing: **do pricing only on the backend**. The frontend **never** computes final totals; it only displays the server’s bill.  
- For brief offline use, store queued ops in `IndexedDB` and re‑apply upon connectivity.

---

## 🧪 Example cURL

```bash
# Add items
curl -X POST http://localhost:8080/api/cart/items \
  -H "Content-Type: application/json" \
  -H "X-User-Id: testuser" \
  -d '{"item": "Apple"}'

# View cart
curl -X GET http://localhost:8080/api/cart \
  -H "X-User-Id: testuser"

# Calculate total
curl -X POST http://localhost:8080/api/cart/total \
  -H "X-User-Id: testuser"
```

---

## 📝 Full Prompt (for reference)

**Shopping Cart System Interview Challenge**

- **Part 1 (Java Core):** Implement core pricing logic for Apple (35p), Banana (20p), Melon (50p, BOGOF), Lime (15p, 3‑for‑2). Items arrive as names in a list (e.g., `["Apple","Apple","Banana"]` → 2 apples, 1 banana).  
- **Part 2 (JS API Layer):** Expose endpoints to add items, view cart, and calculate total; talk to Java backend; handle errors; (optional) add basic auth.  
- **Part 3 (Optional):** Real‑time synchronization with zero drift (see discussion above).  
- **Note:** If any part is challenging within time, document approach/trade‑offs.

---

## 📄 License

This repository is provided for interview/demo purposes.  
Feel free to fork and adapt.
