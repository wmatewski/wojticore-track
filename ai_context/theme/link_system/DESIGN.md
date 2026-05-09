---
name: Link System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is built on the principles of **Minimalism** and **Modern Corporate** aesthetics. It aims to evoke feelings of efficiency, precision, and professional reliability. The target audience includes marketers, data analysts, and power users who require a high-speed tool that stays out of their way while providing deep insights.

The interface is characterized by "Invisible Design"—where the layout disappears to highlight the user's data and actions. It utilizes a flat design language with structural integrity provided by thin borders rather than heavy colors.

## Colors
This design system uses a high-contrast, limited palette to maintain a clean and professional look.

- **Primary (#2563EB):** A vibrant "Vibrant Blue" used strictly for primary actions, active states, and critical information.
- **Surface/Background (#FFFFFF):** Pure white is the canvas for all main content areas to maximize whitespace clarity.
- **Typography (#111827):** Deep Slate/Black ensures maximum legibility and a premium feel.
- **Borders (#E5E7EB):** A light gray used to define structure without adding visual noise.
- **Subtle Backgrounds (#F9FAFB):** Used for table headers or secondary card backgrounds to create soft separation.

## Typography
The typography utilizes **Inter**, a typeface designed for computer screens. It provides exceptional legibility for the dense data tables and analytics dashboards required by the platform.

- **Scale:** High contrast between headlines and body text to guide the eye.
- **Weights:** Regular (400) for body text to keep it light; Medium (500) and Semi-Bold (600) for UI labels and headings to provide hierarchy.
- **Language:** All microcopy and labels must be in Polish (e.g., "Skróć link", "Analityka", "Kliknięcia").

## Layout & Spacing
The layout follows a **Fixed Grid** system for the dashboard and a centered **Modular Layout** for the landing page.

- **Grid:** A 12-column system is used for the analytics dashboard to allow flexible placement of charts and data tables.
- **Rhythm:** A 4px baseline grid ensures consistent vertical spacing. 
- **Whitespace:** Generous padding (24px-32px) inside cards and sections to prevent the UI from feeling cluttered despite the data density.
- **Mobile:** Elements reflow to a single column with 16px side margins.

## Elevation & Depth
This design system uses a "Flat Plus" approach. Depth is communicated through structural layering rather than heavy shadows or gradients.

- **Surface Tiers:** Backgrounds are `#FFFFFF`. Cards and containers use a 1px border of `#E5E7EB`.
- **Shadows:** Use a single, subtle "Soft Shadow" for floating elements like dropdowns or primary cards: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
- **Interactions:** Buttons shift color slightly on hover, but never use gradients. Elevation does not increase on hover to maintain the flat aesthetic.

## Shapes
Shapes are friendly but professional, avoiding the playfulness of fully circular "pill" buttons in favor of more structured, rounded rectangles.

- **Standard Radius:** 8px for small components (buttons, inputs).
- **Large Radius:** 12px for containers and cards.
- **Checkboxes:** 4px radius to distinguish them from larger UI elements.

## Components
### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`. High contrast, bold weight.
- **Secondary:** Background transparent, border `1px solid #E5E7EB`, text `#111827`.

### Input Fields (Skracanie linków)
- Prominent, large height (56px) for the main shortener.
- Placeholder text in `#6B7280`. Focus state: 2px border of `#2563EB`.

### Data Tables (Tabele danych)
- Minimalist headers with `#F9FAFB` background.
- Row hover state: `#F9FAFB`.
- Typography within tables uses `label-md` for maximum density and clarity.

### Analytics Cards (Karty analityczne)
- Bordered containers (`#E5E7EB`) with 24px padding.
- Include a "Title" (`label-sm`, uppercase) and "Value" (`headline-lg`).

### Chips/Badges
- Small status indicators (e.g., "Aktywny", "Wygasł") using light tinted backgrounds and dark text.