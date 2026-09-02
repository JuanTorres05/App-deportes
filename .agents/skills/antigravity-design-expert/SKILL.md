---
name: antigravity-design-expert
description: >-
  Expert guidelines and procedures for UI/UX design, visual hierarchy, mobile styling,
  color systems, micro-interactions, responsive layouts, typography, and polished user experience.
---

# Antigravity Design Expert Skill

This skill provides expert UI/UX design principles, styling standards, and component design patterns tailored for modern React Native and web applications.

---

## 🎨 1. Core Visual Principles

### Color Palette Architecture
- **Primary / Brand**: Green Emerald (`#10B981`, `#059669`) for energy, sports, confirmation, and growth.
- **Secondary / Action**: Electric Blue (`#3B82F6`, `#2563EB`) and Indigo/Violet (`#8B5CF6`, `#7C3AED`) for interactive cards, secondary CTAs, and badges.
- **Neutral Dark (Cards/Headers)**: Slate / Gray (`#111827`, `#1F2937`, `#374151`) for high-contrast headers, dark banners, and typography.
- **Backgrounds**: Soft Light Gray (`#F3F4F6`, `#F9FAFB`) to reduce eye strain and provide contrast against white elevated cards.
- **Status & Feedback**:
  - Success: `#10B981` (Green)
  - Warning / In-Progress: `#F59E0B` (Amber)
  - Danger / Cancellation: `#EF4444` (Red)

---

## 📐 2. Typography & Hierarchy

1. **Title / Screen Headers**: 22px – 28px, Bold (`fontWeight: 'bold'`), high contrast.
2. **Section Headings**: 16px – 18px, Bold / Semi-bold, with clean margins (`marginBottom: 8-12`).
3. **Card Titles / Primary Info**: 14px – 16px, Semi-bold (`fontWeight: '600'`).
4. **Body Text**: 13px – 14px, Neutral Dark (`#374151` / `#4B5563`), readable line-height.
5. **Captions / Meta Badges**: 10px – 12px, Muted Gray (`#6B7280` / `#9CA3AF`).

---

## 📱 3. Mobile UI Component Patterns

### Elevated Cards
```tsx
card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
}
```

### Pills & Status Badges
```tsx
badge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  alignSelf: 'flex-start',
}
```

### Action Buttons
- Minimum touch target: 44px height.
- Consistent border radius: 10px – 12px.
- Distinct states: Loading spinner indicator, active opacity (0.75), disabled state (opacity: 0.5).

---

## ✨ 4. Micro-Interactions & UX Polish

1. **Skeleton / Loading States**: Always display `ActivityIndicator` centered or skeleton placeholders when fetching data.
2. **Pull to Refresh**: Implement `RefreshControl` on scrollable feeds and dashboards.
3. **Empty States**: Never leave a blank page; include an illustrative emoji, clear explanation text, and an action CTA button.
4. **Haptic Feedback & Feedback Alerts**: Clear confirmation modals on destructive actions (e.g., cancelling bookings or removing favorites).
