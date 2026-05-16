# Push Notifications — Implementation Summary

## Overview

Web push notifications implemented for the eDog desktop PWA and mobile (Android) app.  
Notifications are server-triggered via VAPID + Web Push API and delivered through a custom service worker.

---

## Notification Categories

| Category | Trigger | Timing |
|---|---|---|
| **Vaccinations** | Next due date approaching | 30, 7 and 1 day before |
| **Appointments** | Any scheduled appointment | At the configured reminder time |
| **Medications** | New medication health record created | Immediately on creation |
| **Lost dog alerts** | Community lost dog post | Broadcast to all opted-in users |

---

## Architecture

```
Backend cron job / event
        │
        ▼
pushService.ts  ──── reads push_subscriptions from DB
        │             checks user_notification_prefs
        ▼
web-push (VAPID) ──── HTTP push to browser/OS
        │
        ▼
sw.ts (service worker) ──── displays notification
        │
        ▼
notificationclick ──── opens the relevant app page
```

---

## Files Changed

### Backend

| File | Change |
|---|---|
| `backend/src/services/pushService.ts` | **New** — VAPID push delivery, handles expired subscriptions (410), broadcasts lost dog alerts |
| `backend/src/routes/push.ts` | **New** — 6 REST endpoints (see API below) |
| `backend/src/services/emailService.ts` | Extended cron jobs to also fire push alongside emails |
| `backend/src/server.ts` | Registered `/api/push` route |
| `backend/src/scripts/migrate.ts` | Added `push_subscriptions` + `user_notification_prefs` tables; fixed pre-existing SQL bugs |
| `backend/src/scripts/generateVapidKeys.ts` | **New** — one-time script to generate VAPID key pair |
| `backend/.env` | Added `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` |

### Desktop Frontend

| File | Change |
|---|---|
| `desktop-frontend/src/sw.ts` | **New** — custom service worker: `push` event displays notification, `notificationclick` opens app |
| `desktop-frontend/vite.config.ts` | Switched PWA strategy to `injectManifest`; enabled SW in dev mode |
| `desktop-frontend/src/hooks/usePushNotifications.ts` | **New** — subscription lifecycle hook with error states and 8 s SW timeout |
| `desktop-frontend/src/lib/api.ts` | Added 5 push API methods |
| `desktop-frontend/src/components/SettingsView.tsx` | Replaced generic toggles with full push section (master toggle + 4 category toggles + error banner) |
| `desktop-frontend/src/locales/en.json` | 20 new push translation keys |
| `desktop-frontend/src/locales/bg.json` | 20 new push translation keys (Bulgarian) |

### Mobile (Android)

| File | Change |
|---|---|
| `mobile/src/App.tsx` | One-time permission prompt: friendly bottom-sheet explains what notifications will be sent before the OS dialog appears |

---

## Database Tables

```sql
-- One row per browser/device subscription
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(endpoint)
);

-- One row per user — per-category opt-in flags
CREATE TABLE user_notification_prefs (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled    BOOLEAN DEFAULT true,
  vaccinations    BOOLEAN DEFAULT true,
  appointments    BOOLEAN DEFAULT true,
  medications     BOOLEAN DEFAULT true,
  lost_dog_alerts BOOLEAN DEFAULT true,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

All endpoints except `vapid-public-key` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/push/vapid-public-key` | Returns the public VAPID key for browser subscription |
| `POST` | `/api/push/subscribe` | Save a push subscription `{ endpoint, keys: { p256dh, auth } }` |
| `POST` | `/api/push/unsubscribe` | Remove a subscription `{ endpoint }` |
| `GET` | `/api/push/prefs` | Get per-category notification preferences |
| `PUT` | `/api/push/prefs` | Update preferences `{ push_enabled, vaccinations, appointments, medications, lost_dog_alerts }` |
| `POST` | `/api/push/test` | Send a test push to yourself (dev/testing) |

---

## Environment Variables

Add to `backend/.env`:

```env
VAPID_PUBLIC_KEY=<generated>
VAPID_PRIVATE_KEY=<generated>
VAPID_EMAIL=admin@edog.app
```

To regenerate keys (only needed once per deployment):

```bash
cd backend
npx ts-node src/scripts/generateVapidKeys.ts
```

> **Important:** if you regenerate VAPID keys, all existing browser subscriptions become invalid and users must re-subscribe.

---

## Running the Migration

```bash
cd backend
npx ts-node src/scripts/migrate.ts
```

---

## Testing

With the backend running and a browser subscribed, fire a test push from the browser DevTools console:

```js
fetch('http://localhost:3001/api/push/test', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

Expected response: `{ success: true, message: 'Test push sent' }`  
Expected result: OS notification appears within ~1 second.

---

## Bugs Fixed During Implementation

| File | Bug |
|---|---|
| `backend/src/scripts/migrate.ts` | `features TEXT;` → `features TEXT,` (semicolon inside CREATE TABLE broke the whole SQL block) |
| `backend/src/scripts/migrate.ts` | `ALTER TABLE meal_plans ADD COLUMN` → `ADD COLUMN IF NOT EXISTS` (migration was not idempotent) |
