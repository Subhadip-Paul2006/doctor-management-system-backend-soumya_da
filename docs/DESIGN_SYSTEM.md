# Proposed Frontend Design System Specification

> **Platform**: Doctor Management System  
> **Reference Inspiration**: Zoom Doctor (`zoomdoctor.in`)  
> **Target Audience**: AI Coding Agents (Kimi / Antigravity) & Frontend Engineers  
> **Important Notice**: All color codes, spacing rules, and component tokens documented herein are **PROPOSED FRONTEND TOKENS** designed for Phase 2 implementation. They are derived from visual analysis of Zoom Doctor UX patterns and do not represent proprietary internal assets.

---

## 1. Design Principles

1. **Healthcare Trust & Clarity**: Primary visual focus relies on clean medical emerald/teal tones, crisp white surfaces, and deep navy typography to instill trust and calm.
2. **Instant Scannability**: High contrast status indicators, bold token numbers, and clear card hierarchies allow patients and staff to digest information in seconds.
3. **Accessibility First**: Compliant color contrast ratios (WCAG AA standard), clear focus rings, legible text sizing (minimum 14px body), and touch-friendly target areas (minimum 44x44px).
4. **Zero Visual Clutter**: Clean Tailwind utility layouts without excessive animations, unnecessary 3D elements, or decorative distractions.

---

## 2. Zoom Doctor Visual Observations

From public analysis of [Zoom Doctor](https://www.zoomdoctor.in/):
- **Header Language**: Clean white navbar with primary brand logo on the left, clear navigation items in dark slate, and prominent rounded primary CTA buttons on the right.
- **Hero & Search Layout**: Clean search container with dual-field controls (Specialization/Doctor Name + Location) and an explicit, high-contrast action button.
- **Doctor Card Anatomy**: Horizontal white card layout featuring doctor profile thumbnail, verified status icon, credentials subtitle, clinic location pin, consultation fee pill, and two distinct action buttons (**"View Profile"** outline button + **"Book Token"** primary solid button).
- **Status Badges**: Rounded pill tags using soft background tints paired with saturated text colors (e.g. soft emerald for active/available, soft amber for waiting, soft red for unavailable).

---

## 3. Proposed Color Tokens (`PROPOSED FRONTEND TOKEN`)

These tokens will be configured in `@doctor/config` / Tailwind theme extensions:

```javascript
// PROPOSED FRONTEND TOKEN — Tailwind Extension Palette
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Medical Emerald Theme
        medical: {
          50: '#ECFDF5',  // PROPOSED FRONTEND TOKEN — Soft tint / Badge background
          100: '#D1FAE5', // PROPOSED FRONTEND TOKEN — Hover tint
          200: '#A7F3D0', // PROPOSED FRONTEND TOKEN — Light border
          500: '#10B981', // PROPOSED FRONTEND TOKEN — Primary Emerald CTA
          600: '#0D9488', // PROPOSED FRONTEND TOKEN — Primary Brand Dark Teal
          700: '#0F766E', // PROPOSED FRONTEND TOKEN — Deep Teal Hover
          800: '#115E59', // PROPOSED FRONTEND TOKEN — Dark Teal Text
          900: '#134E4A', // PROPOSED FRONTEND TOKEN — Header Accent
        },
        // Deep Navy / Slate Neutral Hierarchy
        navy: {
          50: '#F8FAFC',  // PROPOSED FRONTEND TOKEN — Page Background
          100: '#F1F5F9', // PROPOSED FRONTEND TOKEN — Surface / Card Background
          200: '#E2E8F0', // PROPOSED FRONTEND TOKEN — Subdued Border
          300: '#CBD5E1', // PROPOSED FRONTEND TOKEN — Muted Input Border
          500: '#64748B', // PROPOSED FRONTEND TOKEN — Secondary Text
          700: '#334155', // PROPOSED FRONTEND TOKEN — Sub-Heading Text
          800: '#1E293B', // PROPOSED FRONTEND TOKEN — Primary Body Text
          900: '#0F172A', // PROPOSED FRONTEND TOKEN — Primary Heading / Header Navy
        },
        // Status Colors
        status: {
          waiting: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },    // Amber
          checkedIn: { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },  // Sky Blue
          completed: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },  // Emerald
          cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },  // Rose Red
          absent: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },     // Slate Gray
          emergency: { bg: '#FFE4E6', text: '#9F1239', border: '#FECDD3' },  // Crimson
        }
      }
    }
  }
}
```

---

## 4. Typography Hierarchy (`PROPOSED FRONTEND TOKEN`)

The typography relies on standard system sans-serif font stack (`Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`) for maximal performance without web font loading overhead:

| Token Name | Tailwind Classes | Size / Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `Display Title` | `text-4xl font-bold tracking-tight` | 36px / 40px | Homepage hero headline |
| `Page Title (H1)` | `text-2xl font-bold text-navy-900` | 24px / 32px | Top page titles, doctor profile names |
| `Section Title (H2)`| `text-xl font-semibold text-navy-900` | 20px / 28px | Card headers, section titles |
| `Sub-Heading (H3)` | `text-lg font-medium text-navy-800` | 18px / 24px | Sub-sections, modal headers |
| `Body Large` | `text-base font-normal text-navy-800` | 16px / 24px | Primary text, lead paragraphs |
| `Body Regular` | `text-sm font-normal text-navy-800` | 14px / 20px | Standard text, table rows, form inputs |
| `Caption / Helper` | `text-xs font-normal text-navy-500` | 12px / 16px | Timestamps, helper text, subtitles |
| `Token Display` | `text-5xl font-black text-medical-700` | 48px / 56px | Prominent active queue token numbers |

---

## 5. Spacing, Elevation & Borders (`PROPOSED FRONTEND TOKEN`)

- **Spacing Scale**: Follows standard 4px Tailwind grid (`p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Border Radius**:
  - `rounded-md` (6px): Form inputs, table borders.
  - `rounded-lg` (8px): Standard cards, dropdown menus, modals.
  - `rounded-xl` (12px): Hero containers, doctor profile headers.
  - `rounded-full` (9999px): Status badges, avatars, pill buttons.
- **Shadows / Elevation**:
  - `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Input fields, static cards.
  - `shadow-md` (`0 4px 6px -1px rgb(0 0 0 / 0.1)`): Hovered cards, header navbar.
  - `shadow-lg` (`0 10px 15px -3px rgb(0 0 0 / 0.1)`): Modals, floating queue console.

---

## 6. Component Specs (`PROPOSED FRONTEND TOKEN`)

### 6.1 Buttons (`Button.jsx`)
- **Primary Button**: `bg-medical-600 hover:bg-medical-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors`
- **Secondary Button**: `bg-navy-100 hover:bg-navy-200 text-navy-900 font-medium px-4 py-2 rounded-lg transition-colors`
- **Outline Button**: `border border-medical-600 text-medical-700 hover:bg-medical-50 font-medium px-4 py-2 rounded-lg transition-colors`
- **Danger Button**: `bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors`
- **Disabled State**: `opacity-50 cursor-not-allowed pointer-events-none`

### 6.2 Inputs (`Input.jsx`)
- **Default Input**: `w-full bg-white border border-navy-300 rounded-md px-3 py-2 text-sm text-navy-800 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all`
- **Error Input State**: `border-rose-500 focus:ring-rose-500`

### 6.3 Cards (`Card.jsx`)
- **Default Card**: `bg-white border border-navy-200 rounded-lg shadow-sm p-5`
- **Interactive Hover Card**: `bg-white border border-navy-200 rounded-lg shadow-sm hover:shadow-md hover:border-medical-200 transition-all cursor-pointer`

### 6.4 Status Badges (`Badge.jsx`)
- **Waiting**: `bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full`
- **Checked In**: `bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold px-2.5 py-0.5 rounded-full`
- **Completed**: `bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full`
- **Cancelled**: `bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold px-2.5 py-0.5 rounded-full`
- **Emergency**: `bg-crimson-100 text-crimson-800 border border-crimson-200 text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse`

---

## 7. Specialized UI Specs (`PROPOSED FRONTEND TOKEN`)

### 7.1 Doctor Listing Card
```
+-----------------------------------------------------------------------------------+
|  [ Photo ]  Dr. S. Mukherjee  [Verified]              Fee: ₹500                   |
|   (Avatar)  MBBS, MD - Cardiology                     Queue Mode: LIVE            |
|             Apollo Clinic, Salt Lake, Kolkata         Next Slot: Token #12 (10m)  |
|                                                                                   |
|             [ View Profile (Outline) ]     [ Book Token (Primary Solid) ]        |
+-----------------------------------------------------------------------------------+
```

### 7.2 Patient Live Queue Tracker Widget
```
+-----------------------------------------------------------------------------------+
|  LIVE QUEUE TRACKER — Dr. S. Mukherjee (Apollo Clinic)                            |
|                                                                                   |
|        CURRENT TOKEN CALLING                 YOUR TOKEN NUMBER                    |
|             [  # 11  ]                          [  # 15  ]                      |
|                                                                                   |
|  Status: Live Queue Open  •  4 Patients Ahead  •  Est. Wait: 20 mins              |
+-----------------------------------------------------------------------------------+
```

### 7.3 Doctor Consultation Console Widget
```
+-----------------------------------------------------------------------------------+
|  DOCTOR QUEUE CONSOLE                               Status: [ OPEN (Green) v ]    |
|                                                                                   |
|        CURRENT PATIENT IN SESSION                                                 |
|             TOKEN # 12 — Anil Kumar (M, 34 yrs)                                   |
|             Booking: ONLINE  •  Checked-In: 10:15 AM                              |
|                                                                                   |
|  [ CALL NEXT TOKEN ]   [ MARK COMPLETED ]   [ MARK ABSENT ]   [ PAUSE QUEUE ]    |
+-----------------------------------------------------------------------------------+
```

---

## 8. State Components Specs (`PROPOSED FRONTEND TOKEN`)

- **Empty State (`EmptyState.jsx`)**: Centered layout with muted medical icon, bold title ("No Appointments Found"), description text, and optional primary action button ("Search Doctors").
- **Loading State (`Skeleton.jsx`)**: Pulse animation skeleton placeholder (`bg-navy-200 animate-pulse rounded`).
- **Error State (`Alert.jsx`)**: Banner alert with red icon, error message text, and optional retry button.

---

## 9. Responsive Breakpoints

Follows standard Tailwind CSS breakpoints:
- `sm`: 640px (Mobile landscape / Small tablets)
- `md`: 768px (Tablets / Portals)
- `lg`: 1024px (Small laptops / Desktop dashboard)
- `xl`: 1280px (Large desktop monitors)

On mobile (`< 768px`):
- Sidebars collapse into slide-over drawer menus.
- Tables format into stacked card list items.
- Doctor search bar stacks vertically.

---

## 10. Accessibility Considerations

- All interactive controls feature visible focus rings (`focus:ring-2 focus:ring-medical-500`).
- Text-to-background contrast ratio meets or exceeds WCAG 2.1 AA requirement (minimum 4.5:1 ratio for normal text).
- Form inputs have explicit label associations (`htmlFor`).
- Icon-only buttons include `aria-label` attributes.
