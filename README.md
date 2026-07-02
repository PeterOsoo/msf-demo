```markdown
# Médecins Sans Frontières (MSF) Eastern Africa — Digital Donations Portal

A high-performance, type-safe, mobile-responsive single-page digital donations application engineered for MSF Eastern Africa. This portal features native payment context simulations for local **M-Pesa STK Push** prompts and standard **Credit/Debit Card** payment workflows.

* **Live Hosted URL:** [https://msf-demo-tan.vercel.app](https://msf-demo-tan.vercel.app)
* **Submitted artifacts:** Interactive Application, Simulated REST API, Written Documentation, API Contract, Architecture Decisions.

---

## 1. Technology Stack Decisions

### Core Framework: Next.js (App Router) & TypeScript
* **Unified Full-Stack Architecture:** Next.js eliminates architectural fragmentation by running serverless Node.js backend endpoints (`/api/*`) within the exact same deployment context as the UI components. This dramatically simplifies client-server network requests and infrastructure footprint.
* **Deterministic Type Safety:** By implementing TypeScript on both the UI layer and the backend endpoint handlers, the system guarantees strong data contracts. This prevents data runtime errors during form payload deserialization.
* **Optimized Rendering & Styling:** Built alongside **Tailwind CSS** for component layout utility abstraction and **Lucide/SVG iconography** for fast, script-free visual asset loads.

---

## 2. Solution Design & System Assumptions

### Behavioral System Assumptions
1. **Instantly Configured Channels:** Card authorization triggers real-time response processing. M-Pesa interactions mirror regional network realities by simulating an asynchronous transaction delay via an overlay window.
2. **Deterministic Simulation Mock States:**
   * Entering an amount of **`404`** forces a `502 Gateway Connection Timeout` to evaluate client-side state resilience.
   * Entering an amount of **`408`** combined with an M-Pesa method forces a simulated `408 Request Timeout` to mirror a user ignoring an STK SIM prompt.

### Form UX Decisions
* **Dynamic Content Adaptation:** Rather than overwhelming anonymous donors with field variants, fields switch conditionally based on the active payment mode.
* **Aggressive Client Validation:** The primary submit button is evaluating fields in real-time using a strict conditional regex (`/^0\d{9}$/` for M-Pesa mobile inputs). The interface completely locks down click capabilities until validation conditions are satisfied.

---

## 3. Production Environment Security Hardening Strategy

If transitioning this prototype to a production environment handling live fiscal operations for MSF, the following multi-tiered security controls would be integrated:

### A. Network & Protocol Resilience
* **Strict Transport Security (HSTS):** Enforce TLS 1.3 across all connection routes to guarantee secure, encrypted transit.
* **Content Security Policy (CSP):** Strict script and connect headers to prevent Cross-Site Scripting (XSS) injections and block unrecognized client connections.

### B. Request Ingestion & Data Sanitation
* **Strict Schema Interception:** Swap out basic data interfaces for schema parsing engines like **Zod** to strip away unauthorized parameter injections before they hit processing functions.
* **Rate-Limiting Middleware:** Implement token-bucket middleware arrays (e.g., via Redis) to throttle ingestion thresholds on `/api/donate`, suppressing automated scripting and Distributed Denial of Service (DDoS) attempts.

### C. Compliance & Payment Security (PCI-DSS & Tokenization)
* **Zero Storage Data Isolation:** Complete isolation of payment parameters. To remain compliant with PCI-DSS standards, card attributes should never traverse or log onto MSF infrastructure.
* **Direct Merchant Tokenization:** Swap our simulated form out for direct secure tokenization scripts embedded straight into client windows from verified payment processing networks (e.g., Safaricom Daraja API or standard banking checkout scripts).

---

## 4. API Documentation (REST Principles)

The serverless backend handles incoming payload operations through an asynchronous RESTful design vector over JSON.

### Submit Payment Simulation
* **Endpoint:** `POST /api/donate`
* **Content-Type:** `application/json`

#### Request Payload Examples

##### Variant A: M-Pesa Channel Selection
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "amount": "2500",
  "paymentMethod": "mpesa",
  "phoneNumber": "0722777222"
}

```

##### Variant B: Credit/Debit Card Channel Selection

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

#### API System Responses

##### HTTP 200 OK — Successful Processing

```json
{
  "success": true,
  "message": "Thank you, Jane Doe! Your donation of KSh 2,500 via M-Pesa was simulated successfully.",
  "transactionId": "MSF-K8A9L2XJ1",
  "timestamp": "2026-07-02T14:15:30.000Z"
}

```

##### HTTP 400 Bad Request — Validation Breach

```json
{
  "error": "Please enter a valid 10-digit M-Pesa number starting with 0 (e.g., 0722777222)."
}

```

##### HTTP 408 Request Timeout — Simulated User Drop-off (Amount: 408)

```json
{
  "error": "M-Pesa request timed out. No PIN was entered on your phone."
}

```

##### HTTP 502 Bad Gateway — Simulated Processing Circuit Fault (Amount: 404)

```json
{
  "error": "Simulated Error: Gateway connection timeout."
}

```

---

## 5. Architectural Recommendations for Future Iterations

1. **Webhook Processing Engine:** Shift long-tail asynchronous operations (like M-Pesa transaction updates) away from polling connections. Instead, implement incoming secure webhook listeners capable of ingesting structural notifications directly from payment gateways.
2. **Persistent Audit Trails:** Connect transaction logs to isolated, immutable databases (such as PostgreSQL) to track transaction statuses securely without archiving sensitive donor credentials.
3. **Automated End-to-End Test Matrix:** Introduce structural assertion tests across checkout paths using automation tools like **Playwright**, validating the UI's behavior during complex gateway error responses.

```

```