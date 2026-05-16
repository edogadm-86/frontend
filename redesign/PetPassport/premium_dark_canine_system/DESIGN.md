---
name: Premium Dark Canine System
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#c1c7d3'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#8b919d'
  outline-variant: '#414751'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#4d93e5'
  on-primary-container: '#002a51'
  inverse-primary: '#0060ac'
  secondary: '#a9c7ff'
  on-secondary: '#003063'
  secondary-container: '#01488f'
  on-secondary-container: '#91b9ff'
  tertiary: '#bfc7d5'
  on-tertiary: '#29313c'
  tertiary-container: '#89919e'
  on-tertiary-container: '#222a35'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#dbe3f1'
  tertiary-fixed-dim: '#bfc7d5'
  on-tertiary-fixed: '#141c26'
  on-tertiary-fixed-variant: '#3f4753'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
This design system is a sophisticated evolution of a friendly identity, reimagined for a premium dark-mode experience. It targets a modern, tech-savvy audience that appreciates a balance between playful accessibility and professional high-fidelity aesthetics.

The style is **Corporate Modern with Glassmorphic accents**. It utilizes deep obsidian surfaces, subtle translucency, and vibrant blue focal points to create a sense of depth and focus. The interface should feel "expensive" yet welcoming—moving away from flat, heavy grays toward rich, cool-toned dark layers that evoke a night-sky clarity.

## Colors
The palette is anchored by the signature blue, optimized here for high contrast against dark backgrounds. 

- **Primary**: The core blue (#4a90e2) is used for calls to action, active states, and brand identifiers.
- **Secondary**: A lighter, more luminous blue used for accents and secondary indicators to maintain legibility.
- **Backgrounds**: The foundation is a deep obsidian (#0b0e14). 
- **Surfaces**: Elevated components use a tiered system of cool grays (ranging from #161b22 to #21262d) to establish hierarchy without relying on traditional shadows.
- **Status**: Success, Warning, and Error colors are desaturated to prevent visual vibration against the dark canvas.

## Typography
The typography utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary, friendly, and highly legible feel. 

Headlines feature tighter letter spacing and heavier weights to command attention. Body text is set with generous line height to ensure long-form reading comfort against the high-contrast dark background. Labels and captions use increased letter spacing to prevent "clumping" of characters on glowing screens.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

The spacing rhythm is built on an **8px base unit**, ensuring mathematical consistency across all margins and paddings. Layouts should prioritize negative space to let the dark "ink" of the background provide natural separation between content blocks. Containers should generally use the `md` spacing for internal padding to maintain the premium, breathable feel.

## Elevation & Depth
In this dark interface, depth is communicated through **Tonal Layers** and **Subtle Outlines** rather than heavy shadows.

1.  **Level 0 (Base)**: Obsidian (#0b0e14).
2.  **Level 1 (Cards/Sections)**: A slight lift using #161b22 with a 1px border of #2d3540.
3.  **Level 2 (Modals/Overlays)**: Elevated surfaces use #21262d with a subtle 10% opacity white inner-glow on the top edge to simulate light hitting the bevel.
4.  **Backdrop Blurs**: Floating elements (like navigation bars) should utilize a 12px blur with a 70% opacity fill of the surface color to create a glassmorphic effect that retains context of the content beneath.

## Shapes
The shape language is defined by **Soft Geometricism**. Elements use a standard 0.5rem (8px) corner radius to strike a balance between professional structure and approachable friendliness. 

Large containers and cards should scale up to `rounded-lg` (16px) to emphasize the "object-like" quality of the UI. Icons should always feature rounded terminals and corners to match the container language.

## Components
- **Buttons**: Primary buttons are solid #4a90e2 with white text. Secondary buttons use a ghost style with a #2d3540 border and secondary blue text.
- **Inputs**: Field backgrounds should be slightly darker than their parent surface to create an "inset" feel. Borders should brighten to the primary color on focus.
- **Cards**: Utilize the Level 1 elevation. For high-fidelity cards, include a subtle gradient stroke (from primary blue to transparent) to highlight specific features.
- **Chips**: Use low-contrast fills (15% opacity of the label color) with a solid border to ensure they don't visually compete with primary buttons.
- **Progress Indicators**: Use the primary blue with a subtle outer glow (neon effect) to indicate activity in the dark environment.
- **Lists**: Separate items with 1px lines of #1c2128; avoid full-width dividers where whitespace can achieve the same separation.