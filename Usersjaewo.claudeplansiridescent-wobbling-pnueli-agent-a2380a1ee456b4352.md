# SEOULINKHEALTH Upgrade Implementation Plan

## Overview
Two-goal upgrade: (1) polish public site, (2) overhaul admin for elderly Korean users. 8 phases.

---

## PHASE 1: New UI Components (7 new files)

### 1A. src/components/ui/ScrollToTop.tsx
- Floating button bottom-right, shows after 400px scroll
- Reuse useScrolled pattern, AnimatePresence fade, smooth scroll

### 1B. src/components/ui/Toast.tsx + src/store/toastStore.ts
- Zustand store, auto-dismiss 3s, slide-in animation, Korean messages

### 1C. src/components/ui/ConfirmDialog.tsx
- Modal with Korean defaults, large buttons min-h-12

### 1D. src/components/admin/DetailModal.tsx
- Card-based detail view, Korean labels, large text, status buttons, print

### 1E. src/hooks/usePageTitle.ts
- Sets document.title via SITE_CONFIG.seo.titleTemplate

### 1F. src/components/ui/SplashScreen.tsx
- Brand animation first visit only, 1.5s, sessionStorage check

---

## PHASE 2: Config + CSS (3 modified files)

### 2A. src/config/site.ts - Add admin.labels (Korean) + quickLinks
### 2B. src/index.css - Add .admin-layout, .stat-card, .admin-btn, print styles
### 2C. tailwind.config.ts - Add admin font sizes (15-32px)

---

## PHASE 3: Public Layout (4 modified files)

### 3A. src/App.tsx - AnimatePresence page transitions, ToastContainer, SplashScreen
### 3B. src/components/layout/Layout.tsx - ScrollToTop, id=main-content on main
### 3C. src/components/layout/Footer.tsx - Quick Links, dynamic copyright year
### 3D. src/components/layout/Header.tsx - skip-to-content, fix nav semantics

---

## PHASE 4: SEO + Page Polish (6 modified files)

All pages: usePageTitle() calls. Process.tsx: fix <a> to <Link>.

---

## PHASE 5: Backend (1 modified file)

### backend/src/routes/admin.ts - Add search query param

---

## PHASE 6: Admin Frontend (3 modified files)

### 6A. src/utils/api.ts - search param + exportToCSV()
### 6B. src/pages/Admin.tsx - MAJOR REWRITE (card list, Korean UI, 48px buttons)
### 6C. src/pages/Login.tsx - Korean labels, larger form

---

## Files: 7 new, 17 modified, 0 new dependencies