# Development Plan

## Application Overview

A dog management platform with mobile (Capacitor/Android), desktop (PWA), and backend (Node.js/PostgreSQL) components.

## Current Features

| Area | Status |
|---|---|
| Dog profiles (breed, microchip, passport, sex, color) | Done |
| Health records (vet visits, medications, illness, injury) | Done |
| Vaccination tracker | Done |
| Nutrition tracker + meal plans | Done |
| Training tracker (sessions, commands, progress) | Done |
| Appointments + Calendar | Done |
| Emergency contacts | Done |
| Pet Passport (digital document) | Done |
| Community posts & events (backend) | Done — frontend uses mock data only |
| Push notifications | Done |
| Public dog profile (shareable) | Done |
| Shop view | Done (UI only) |
| Multi-language BG/EN | Done |
| Tidio chatbot widget | Done (generic support, not dog-specific) |

---

## Feature Gaps — Ranked by Impact

### Tier 1 — High value, missing entirely

**1. Walk / Activity Tracking**
The appointments have a "walk" type but there's zero actual tracking. This is probably the #1 thing a dog owner does daily. Mobile already has Capacitor installed so GPS is accessible. Track route, distance, duration, calories burned (estimated by breed+weight). Show walk history and streaks. This drives daily engagement.

**2. Weight & Growth History with Charts**
The `Dog` model has a single static `weight` field. No history. You can't see if your dog is gaining/losing weight over time. A simple time-series weight log with a chart would be genuinely useful for health monitoring, especially for puppies and senior dogs.

**3. AI Dog Assistant / Symptom Checker**
The Tidio widget is a generic human support chat. Replacing or augmenting it with a Claude-powered assistant that knows about the specific dog (breed, age, weight, health records, vaccinations) would be very distinctive. "My dog just ate grapes — what do I do?" or "Max hasn't eaten in 2 days, is that serious for a 3-year-old Labrador?" This is a real differentiator vs. competitors.

**4. Medication & Preventive Care Reminders**
Health records track medications, but there's no recurring reminder for: monthly flea/tick prevention, quarterly deworming, heartworm medication, etc. Push notifications are now live — this is the perfect next use for them.

### Tier 2 — High value, partially started

**5. Community — Connect to Real Data**
The backend for posts and events is fully built (pagination, types, joining events, geo coordinates). But the mobile Community component uses 100% hardcoded mock data. Wiring it to the real API would unlock the most social feature in the app at low cost.

**6. Expense / Vet Cost Tracker**
No financial tracking at all. Dog owners spend significantly on food, vet, grooming, training. A simple expense log by category with monthly totals gives owners real insight and makes the app stickier.

**7. Lost Dog Mode / QR Code**
The Pet Passport exists. A scannable QR code embedded in it that opens a public emergency page (name, owner phone, medical alerts) would be extremely practical. The `public.ts` route already exists for public profiles.

### Tier 3 — Nice to have

**8. Photo Journal / Milestone Timeline** — chronological photo diary, first bath, first vet visit, weight milestones
**9. Dog Park / Pet-Friendly Places Map** — map view of nearby parks using geo data already in the events model
**10. Training Achievements / Streaks** — gamification, badges for consistent tracking, streak counter for daily walks/training

---

## Development Roadmap

### Phase 1 — Quick wins (1-2 weeks)
- [ ] Wire Community posts & events to the real API (backend is ready)
- [ ] Weight history log + simple chart on the health screen
- [ ] Medication recurring reminders using push notifications

### Phase 2 — Core differentiator (2-4 weeks)
- [ ] Walk tracking on mobile (GPS route, distance, duration, history)
- [ ] QR code on Pet Passport (public emergency page)
- [ ] Expense tracker (simple CRUD + monthly totals)

### Phase 3 — AI & social (4-6 weeks)
- [ ] AI Dog Assistant using Claude API — contextualized with the dog's data
- [ ] Dog Park map view using the community events geo coordinates
- [ ] Training achievements / streak system

---

## Current Sprint: Community — Real Data Wiring

**Goal:** Replace mock data in the Community component with real API calls to the existing backend.

**Backend endpoints available:**
- `GET /events` — paginated public events, supports `type`, `location`, `upcoming` filters
- `GET /events/my-events` — user's own events
- `POST /events` — create event (types: meetup, training, competition, adoption, fundraiser, other)
- `PUT /events/:id` — update event
- `DELETE /events/:id` — delete event
- `POST /events/:id/join` — join/leave event (with dog_id)
- `GET /events/:id/participants` — list attendees
- `GET /posts` — community posts
- `POST /posts` — create post

**Files to update:**
- `mobile/src/components/Community.tsx` — primary target, currently all mock data
- `desktop-frontend/src/components/CommunityView.tsx` — desktop equivalent
- `mobile/src/lib/api.ts` — add events/posts API methods
- `desktop-frontend/src/lib/api.ts` — add events/posts API methods
