# Vizzit — Project Guide for AI Agents

This document is the authoritative reference for any AI agent continuing work on this project.

---

## What is Vizzit?

**Vizzit** (`vizzit.online`) is an Israeli SaaS platform for building mobile-first digital business cards and store pages — all in Hebrew, RTL layout. Users create a branded page with their services, contact info, and links, then share it via a short URL (`vizzit.online/their-slug`).

Two builder modes exist:
1. **Business Card Builder** — `/builder` — personal/business link-in-bio style card
2. **Store Builder** — `/store-builder` — e-commerce product page (single product or multi-category store)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 + inline `style={}` (mixed) |
| Animations | Framer Motion 12 (`motion.div`, `AnimatePresence`) |
| Routing | React Router DOM 7 |
| Backend / DB | Supabase (Postgres + Auth + Storage) |
| State | React `useState` / `useContext` (no Redux) |
| Data fetching | TanStack React Query 5 (minimal use so far) |
| Icons | lucide-react + custom inline SVGs |
| Language | Hebrew UI, RTL (`dir="rtl"` everywhere) |

---

## Supabase Config

```
URL:  https://tfyodjqusfwqmbjgwikf.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeW9kanF1c2Z3cW1iamd3aWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzg3MDEsImV4cCI6MjA4OTYxNDcwMX0.Ff4AvqCcfqTGhMqRqdK9K_I98oAk-osLK71MORUTJXQ
```

**Tables:**
- `profiles` — user profiles (`id`, `email`, `full_name`, `avatar_url`, `plan`, `plan_expires_at`, `is_admin`, `bio`, `headline`, `whatsapp`, `user_type`)
- `cards` — business cards (`id`, `user_id`, `slug`, `business_name`, `description`, `phone`, `avatar_url`, `template`, `primary_color`, `background_style`, `is_published`, `services_layout`, `card_style`, `faq`, `background_video_url`, etc.)
- `card_services` — services per card (`id`, `card_id`, `title`, `description`, `image_url`, `popup_image_url`, `price`, `size`, `service_url`, `order_index`)

**Storage bucket:** `card-images` (public) — all user images go here via `uploadCardImage(userId, file)`

**Admin user email:** `idanguindy@gmail.com` (has `is_admin: true` in profiles)

---

## Running the Project

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

No `.env` file needed — Supabase credentials are hardcoded in `src/lib/supabase.js`.

---

## Project Structure

```
src/
├── App.jsx                    # Routes
├── lib/
│   ├── supabase.js            # Supabase client
│   ├── AuthContext.jsx        # Auth provider + useAuth() hook
│   ├── cardsApi.js            # All DB/Storage functions
│   ├── api.js                 # (older, minimal use)
│   └── ...
├── pages/
│   ├── HomePage.jsx           # Landing page
│   ├── BuilderPage.jsx        # Business card builder (5 steps)
│   ├── StoreBuilderPage.jsx   # Store builder (single + multi)
│   ├── DashboardPage.jsx      # User dashboard (manage cards)
│   ├── CardPage.jsx           # Public card view at /:slug
│   ├── VizzitAdmin.jsx        # Admin panel (admin only)
│   ├── ProUpgrade.jsx         # Pro plan upgrade page
│   └── ...
└── components/
    ├── AuthModal.jsx          # Login/signup modal (iPhone-shaped design)
    ├── PhoneMockup.jsx        # Reusable phone shell component
    ├── CardPreview.jsx        # Live card preview inside phone
    ├── BgStylePicker.jsx      # Background style selector
    ├── PremiumPreview.jsx     # Premium features preview
    ├── LogoMark.jsx           # SVG logo mark
    └── ...
```

---

## Routes (`src/App.jsx`)

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Landing / marketing page |
| `/builder` | `BuilderPage` | Create new business card |
| `/builder/:cardId` | `BuilderPage` | Edit existing card |
| `/dashboard` | `DashboardPage` | User's card management |
| `/store-builder` | `StoreBuilderPage` | Store page builder |
| `/admin` | `VizzitAdmin` | Admin panel (admin only) |
| `/pro` | `ProUpgrade` | Pro upgrade page |
| `/c/:slug` | `CardPage` | Public card (legacy `/c/` prefix) |
| `/:slug` | `CardPage` | Public card (clean URL) |

---

## Auth System (`src/lib/AuthContext.jsx`)

`useAuth()` hook returns:
```js
{
  user,          // null or { id, email, full_name, avatar_url, is_admin, plan, bio, headline, whatsapp, ... }
  profile,       // raw profile row from DB
  loading,       // boolean — wait for this before redirecting
  isPro,         // boolean — plan === 'pro' and not expired
  loginWithEmail(email, password),
  signupWithEmail(email, password, fullName),
  logout(),
  updateMe(data),   // updates profiles table + local state
  activatePro(),    // dev helper — sets plan: 'pro'
}
```

**Admin check:** `user?.is_admin === true`

---

## Business Card Builder (`src/pages/BuilderPage.jsx`)

5-step flow:
1. **פרטים בסיסיים** — business name, description, phone, avatar, WhatsApp message
2. **שירותים** — add/edit services (title, description, image, price, URL); services can be full-width or half-width cards; each has optional popup image
3. **קשר וקישורים** — Instagram, Facebook, TikTok, location, booking URL
4. **עיצוב ופרסום** — template, color, background style (gradient/solid/image/video), slug, publish
5. **✦ פרמיום** — premium features (FAQ, reviews, video background, etc.) + "מערכת סליקה" (coming soon badge)

**Layout pattern:**
- Mobile: steps bar at top (`md:hidden`), 50/50 split (form left, phone right), eye toggle to hide phone, bottom sheets for editing
- Desktop: section tabs row, full phone mockup (280×580) on right, form panel on left

**Key state:** `form` object matches `DEFAULT_CARD` structure. `dbCardId` tracks whether this is a new or existing card.

**Saving:** `createCard(userId, form)` for new, `updateCard(cardId, form)` for existing. Auto-saves on step change.

**Publishing:** Sets `is_published: true` + assigns slug. URL becomes `vizzit.online/[slug]`.

---

## Store Builder (`src/pages/StoreBuilderPage.jsx`)

### Mode 1: Single Product (`storeType === 'single'`)
4-section flow: מוצר → פרטים → תשלום → ביקורות

Data shape (`DEFAULT_DATA`):
```js
{
  storeType: 'single',
  storeName, image, name, tagline, price, originalPrice,
  ctaText, description, bullets[], paymentMethods[],
  reviews[{ name, rating, text }], accentColor,
  multi: { ...DEFAULT_MULTI }
}
```

### Mode 2: Multi-Category Store (`storeType === 'multi'`)
5-step flow: חנות → כריכה → לוגו → קטגוריות → פוטר

Data shape (`DEFAULT_MULTI` inside `data.multi`):
```js
{
  coverImage, logoImage, storeName, tagline, accentColor,
  social: { instagram, facebook, tiktok, whatsapp, website },
  terms,
  categories: [{
    id, name, icon, image, displayMode: 'popup' | 'page',
    products: [{ name, price, image, description }]
  }]
}
```

**Cart system:** `cart` state array (`[{ name, price, image, qty }]`), `CartSheet` component, `addToCart()`, `updateCartQty()`. Checkout opens demo `CheckoutModal`.

**Per-category display mode:**
- `popup` → tapping category opens bottom-sheet popup with products
- `page` → tapping expands inline list below categories grid

**Phone preview:** Both mobile (scaled at 0.70 in 182×390 container) and desktop (280×580 full shell) show live `MultiStorePreview` with working cart button.

**Key state variables:**
```js
multiStep   // 'info' | 'cover' | 'logo' | 'cats' | 'footer'
cart        // array of cart items
showCart    // boolean
coverRef    // ref for cover image file input
logoRef     // ref for logo file input
```

**Image upload helpers:**
- `handleCoverUpload(file)` → uploads to Supabase → `updMulti('coverImage', url)`
- `handleLogoUpload(file)` → uploads to Supabase → `updMulti('logoImage', url)`
- `handleProductImageUpload(catIdx, prodIdx, file)` → uploads → `updProduct(catIdx, prodIdx, { image: url })`
- All use `uploadCardImage(user.id, file)` from `cardsApi.js`

**Helper functions for updating multi state:**
```js
updMulti(key, val)              // update data.multi[key]
updMultiSocial(key, val)        // update data.multi.social[key]
updCategory(catIdx, patch)      // patch a category
updProduct(catIdx, prodIdx, patch) // patch a product
```

---

## Key Components

### `PhoneMockup` (`src/components/PhoneMockup.jsx`)
Reusable iPhone shell. Props: `children`, `className`, `overlay`.
- Width: 260px, screen height: 520px, content area: 470px (overflow-y-auto)
- Used in BuilderPage desktop view

### `AuthModal` (`src/components/AuthModal.jsx`)
Login/signup modal styled as an iPhone — gradient hero, white bottom sheet, tab toggle.
Props: `isOpen`, `onClose`, `onSuccess`

### `CardPreview` (`src/components/CardPreview.jsx`)
Renders the live card inside PhoneMockup. Reads from `form` state.

### `LogoMark` (`src/components/LogoMark.jsx`)
SVG logo. Props: `size` (default 24), `color` (default current)

---

## Design System

**Brand gradient:** `linear-gradient(135deg, #F4938C, #5BC4C8)` (coral → teal)

**Colors:**
- Primary coral: `#F4938C`
- Primary teal: `#5BC4C8`
- Success green: `#10B981`
- Background: `#f8f9fa` (inside phones), `bg-slate-50` (page bg)
- Text: `#111` (headings), `#374151` (body), `#6b7280` (secondary), `#9ca3af` (muted)

**Border radius:** `rounded-2xl` (16px) for cards, `rounded-xl` (12px) for inputs/buttons

**Shadow:** `boxShadow: '0 1px 4px rgba(0,0,0,0.06)'` for cards, `0 4px 16px rgba(244,147,140,0.3)` for gradient buttons

**Bottom sheet pattern (mobile):**
```jsx
<motion.div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden"
  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
  transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" /> {/* drag handle */}
  ...content...
</motion.div>
```

**Centered modal (RTL-safe):**
```jsx
// Use inset-0 + m-auto + h-fit — NOT translate tricks (they break in RTL)
className="fixed inset-0 m-auto w-[660px] h-fit"
```

**Steps bar pattern:**
```jsx
// Active: gradient bg, completed: #10B981, future: #f3f4f6
// connector lines: green if completed, gray if future
```

---

## `cardsApi.js` — Key Functions

```js
uploadCardImage(userId, file)    // compress + upload to Supabase → returns publicUrl string
getMyCards(userId)               // fetch all cards for user (with services attached)
getCardBySlug(slug)              // fetch public card + services
getCardById(id)                  // fetch card by id + services
createCard(userId, cardData)     // insert card + services
updateCard(cardId, cardData)     // update card + replace services
deleteCard(cardId)               // delete card
publishCard(cardId)              // set is_published: true
toSlug(text)                     // Hebrew text → URL slug
checkSlugAvailable(slug, excludeId?) // check if slug is taken
suggestSlugs(baseSlug)           // suggest 3 available slug variants
saveDraft(data) / loadDraft() / clearDraft()  // localStorage draft helpers
```

---

## Dashboard (`src/pages/DashboardPage.jsx`)

- Shows user's cards in a grid
- "צור חדש" button:
  - For **admin users**: opens modal to choose between "בנה את הלינק שלך" (`/builder`) or "בנה את החנות שלך" (`/store-builder`)
  - For **regular users**: goes directly to `/builder`
- Cards show: name, slug (copy button → `vizzit.online/slug`), edit button, delete (with confirm), published badge
- Pro badge shown if `isPro`

---

## Admin Panel (`src/pages/VizzitAdmin.jsx`)

Route: `/admin` — accessible only to `user.is_admin === true`

Tabs: סקירה (stats overview) | משתמשים (users list) | כרטיסים (all cards list)

Stats: total users, published cards, pro users, total views

---

## Known Patterns & Conventions

1. **All UI is RTL Hebrew** — `dir="rtl"` on root divs, Hebrew text everywhere
2. **No CSS modules** — all Tailwind classes or inline `style={}`
3. **Mobile-first** — `md:hidden` for mobile-only, `hidden md:block` for desktop-only
4. **50/50 split** on mobile builders: phone column `width: showPhonePreview ? '50%' : 'auto'`
5. **Phone scale on mobile:** `transform: 'scale(0.70)'`, `transformOrigin: 'top left'`, wrapped in `182×390` overflow-hidden container
6. **AnimatePresence wraps ALL conditional renders** that should animate in/out
7. **Bottom sheets use springs:** `damping: 28, stiffness: 320`
8. **Modal animation avoids y-translate** (RTL bug) — use `scale` instead or `inset-0 m-auto`
9. **Gradient button:** always `linear-gradient(135deg, #F4938C, #5BC4C8)` with `color: white, fontWeight: 800/900`
10. **Image upload flow:** `<input type="file" className="hidden" ref={ref}>` → on change → call `uploadCardImage()` → update state with returned URL

---

## What's NOT Yet Built (Planned)

- **Store saving to DB** — StoreBuilderPage currently has no save/publish to Supabase (demo only). Need a `stores` table.
- **Cart → real checkout** — Currently CheckoutModal is demo only. Need payment integration (Tranzila/Cardcom).
- **Store public page** — No public route for viewing a store. Store data is not persisted.
- **Pro plan payment** — ProUpgrade page exists but payment flow is not wired.
- **Auth email confirmation** — Supabase sends confirmation email; users see "check your email" message but the flow isn't tested end-to-end.
- **Category images in store builder** — Category image upload exists in data structure but no UI upload button (only product images have upload).

---

## File Sizes (approximate, as of 2026-04-04)

| File | Lines |
|---|---|
| `BuilderPage.jsx` | ~1800 |
| `StoreBuilderPage.jsx` | ~1705 |
| `DashboardPage.jsx` | ~400 |
| `CardPage.jsx` | ~600 |
| `cardsApi.js` | ~244 |
| `AuthContext.jsx` | ~144 |
| `AuthModal.jsx` | ~280 |
| `PhoneMockup.jsx` | ~95 |
