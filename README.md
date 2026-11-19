# MediVital Combo - Landing + Checkout + Admin (Firebase + Vercel)

Ye project ek single-combo landing page website hai jisme:
- Front page par combo product showcase
- Buy Now -> Checkout (contact + shipping details)
- Payment options: **Full Online (5% discount)**, **COD (10% extra)**, **Partial (10% advance now, 90% on delivery)**
- Demo online payment flow (gateway final hone tak simulate success/failure)
- Admin panel: dashboard/orders count, order & shipping details, product add/delete
- Database: **Firebase Firestore**
- Hosting target: **Vercel**

## 1) Setup

### Install
```bash
npm install
```

### Environment variables
`.env.example` ko reference le kar Vercel/Local env set karein:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Vercel env me multiline/private key ko `\n` ke sath set karein)
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (random long string)
- `APP_URL` (optional)
- `PAYMENT_PROVIDER=demo` (abhi gateway final nahi hai)

> Note: Firebase configure na hone par `/api/product` demo product dikhayega, lekin **real orders place karne ke liye Firestore config zaroori hai**.

### Local run
```bash
npm run dev
```
- Frontend: Vite dev server
- API routes (`/api/*`) Vercel style functions hain; local me full testing ke liye `vercel dev` recommended hai (agar Vercel CLI installed ho).

## 2) Firebase (Firestore)

1. Firebase project banayein
2. Firestore Database enable karein
3. Service account key generate karein (Project Settings -> Service accounts)
4. Service account se `project_id`, `client_email`, `private_key` env vars me set karein

Collections auto-use hongi:
- `products`
- `orders`

Agar `products` empty ho aur Firebase configured ho to pehli product fetch par default combo auto-seed ho sakta hai.

## 3) Payment Rules (implemented)

Base price = `P` (combo product `basePrice`)

- **Full Online Payment**: `0.95 * P` (5% discount), full amount abhi pay
- **Cash on Delivery**: `1.10 * P` (10% extra), full amount delivery par
- **Partial Payment**: `0.10 * P` abhi pay, `0.90 * P` delivery par (total `P`)

Gateway final nahi hone tak `full_online` aur `partial` ke liye **demo payment page** (`/pay/demo`) par success/failure simulate hota hai. Real gateway (e.g. Razorpay) integrate karte waqt `api/orders.js` ke payment action aur confirmation/callback flow ko replace/extend karna hoga.

## 4) Admin Panel

- URL: `/admin`
- Login: `ADMIN_PASSWORD`
- Features:
  - Dashboard: total orders, collected/expected revenue, status/payment breakdown
  - Orders: customer + shipping details, payment summary, shipping/order status update, due amount collected mark
  - Products: combo product add/delete (aur list)

## 5) Vercel Deploy

1. Repo/folder ko Vercel project se connect karein
2. Framework preset: **Vite** (auto-detect usually)
3. Build command: `npm run build`
4. Output: `dist`
5. Env vars add karein (Firebase + Admin + Payment provider)
6. Deploy

`vercel.json` me SPA rewrite configured hai (`/api/*` ko chhodkar routes -> `index.html`).

## 6) Important Notes

- Ye abhi demo-ready implementation hai (gateway integration pending).
- Production use se pehle real payment gateway, proper admin hardening/rate-limiting, aur order receipt/invoice needs ko finalize karein.
- Firebase credentials aur admin secrets kabhi client-side expose na karein.
