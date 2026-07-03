# MSF Eastern Africa — Digital Donations Portal

A type-safe, mobile-responsive donations portal built for Médecins Sans Frontières (MSF) Eastern Africa. Supports simulated **M-Pesa STK Push** and **Credit/Debit Card** payment workflows.

- **Live URL:** [https://msf-demo-tan.vercel.app](https://msf-demo-tan.vercel.app)
- **Deliverables:** Interactive application, simulated REST API, written documentation, API contract, architecture decisions.

---

## 1. Technology Stack

### Next.js (App Router) + TypeScript
- **Full-stack in one repo:** Serverless API routes (`/api/*`) live alongside UI components in the same deployment — no separate backend infrastructure needed.
- **End-to-end type safety:** TypeScript on both the UI and API layers enforces strict data contracts and eliminates payload deserialization errors at runtime.
- **Styling:** Tailwind CSS for layout utilities; Lucide/SVG icons for fast, script-free assets.

---

## 2. Design Decisions & Assumptions

### Simulation Behaviour
- **Card payments** resolve instantly, mirroring real-time authorization.
- **M-Pesa payments** simulate the async nature of STK Push via a loading overlay.
- Entering **`404`** as the amount forces a `502 Gateway Timeout` to test client-side error state handling.
- Entering **`408`** with M-Pesa selected forces a `408 Request Timeout`, simulating a user ignoring the STK PIN prompt on their phone.

### Form UX
- Fields render conditionally based on the selected payment method — donors only see what's relevant.
- The submit button stays disabled until all fields pass validation. M-Pesa numbers are validated in real-time against `/^0\d{9}$/`.

---

## 3. Production Security Considerations

If this prototype were deployed to handle live donations, the following controls would be required:

### Network
- **HSTS** — enforce TLS 1.3 across all routes.
- **Content Security Policy (CSP)** — restrict script sources and block unrecognized client connections to prevent XSS.

### Input & Rate Limiting
- **Schema validation (Zod)** — parse and strip unauthorized fields before they reach processing logic.
- **Rate limiting** — token-bucket middleware (e.g., Redis) on `/api/donate` to suppress automated abuse and DDoS attempts.

### Payment Compliance (PCI-DSS)
- **Zero storage** — card data must never touch MSF infrastructure. No logging, no transit through internal systems.
- **Tokenization** — replace the simulated form with direct tokenization scripts from verified payment processors (Safaricom Daraja API for M-Pesa; standard bank checkout SDKs for card).

---

## 4. API Reference

**Endpoint:** `POST /api/donate`  
**Content-Type:** `application/json`

---

### Request Payloads

#### Variant A — M-Pesa

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "amount": "2500",
  "paymentMethod": "mpesa",
  "phoneNumber": "0722777222"
}
```

#### Variant B — Credit/Debit Card

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "amount": "5000",
  "paymentMethod": "card",
  "cardName": "Jane Doe",
  "cardNumber": "4000123456789010",
  "expiry": "12/28",
  "cvc": "123"
}
```

---

### Responses

#### `200 OK` — Success

```json
{
  "success": true,
  "message": "Thank you, Jane Doe! Your donation of KSh 2,500 via M-Pesa was simulated successfully.",
  "transactionId": "MSF-K8A9L2XJ1",
  "timestamp": "2026-07-02T14:15:30.000Z"
}
```

#### `400 Bad Request` — Validation failure

```json
{
  "error": "Please enter a valid 10-digit M-Pesa number starting with 0 (e.g., 0722777222)."
}
```

#### `408 Request Timeout` — User ignored STK prompt (amount: 408)

```json
{
  "error": "M-Pesa request timed out. No PIN was entered on your phone."
}
```

#### `502 Bad Gateway` — Simulated gateway fault (amount: 404)

```json
{
  "error": "Simulated Error: Gateway connection timeout."
}
```

---

## 5. Future Improvements

1. **Webhooks** — replace polling with incoming webhook listeners for async M-Pesa transaction updates directly from the Daraja API.
2. **Persistent audit logs** — connect transaction records to an immutable database (PostgreSQL) without storing sensitive donor credentials.
3. **E2E test suite** — automate checkout path assertions using Playwright, covering gateway error states and edge-case simulations.