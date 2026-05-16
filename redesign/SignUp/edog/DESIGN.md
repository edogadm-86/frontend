---
name: eDog
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c1c7d3'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8b919d'
  outline-variant: '#414751'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#4d93e5'
  on-primary-container: '#002a51'
  inverse-primary: '#0060ac'
  secondary: '#ffd798'
  on-secondary: '#422c00'
  secondary-container: '#feb300'
  on-secondary-container: '#6a4800'
  tertiary: '#ffb953'
  on-tertiary: '#452b00'
  tertiary-container: '#c58305'
  on-tertiary-container: '#3c2500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba35'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb953'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
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
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
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
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system for eDog is built on the pillars of **Trust**, **Precision**, and **Warmth**. It targets discerning pet owners who seek a premium, high-tech solution for pet health and lifestyle management. 

The aesthetic is **Corporate Modern with a Tactile edge**. It utilizes a deep, sophisticated dark mode palette to reduce eye strain and create a focused environment. The UI evokes a sense of "digital concierge" service—reliable and professional, yet welcoming enough to reflect the emotional bond between owner and pet. High-quality whitespace and clear hierarchical structures ensure that critical health data is digestible and actionable.

## Colors
The color palette is optimized for high-performance dark mode environments. 

*   **Primary (#4A90E2):** A dependable blue used for primary actions, active states, and brand highlights.
*   **Accent (#FFB400):** A warm gold used sparingly for "Premium" features, status alerts, and celebratory moments to provide high-contrast visual interest.
*   **Background (#121417):** A deep charcoal navy that provides the foundation for the interface.
*   **Surface (#1E2126):** A slightly lighter shade used for cards, modals, and container elements to create depth.
*   **Status Colors:** Success is represented by a desaturated emerald; Error by a soft coral to ensure accessibility against the dark backdrop.

## Typography
Plus Jakarta Sans is the exclusive typeface for this design system, chosen for its modern geometry and exceptional legibility in dark interfaces. 

Headlines utilize tighter letter-spacing and heavier weights to command attention. Body text maintains a generous line-height to ensure readability against dark backgrounds, preventing "halation" (the glowing effect of light text on dark). Labels and captions are set with slightly increased tracking to improve clarity at smaller scales.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

The spacing logic is based on a **4px baseline grid**. 
- **Desktop:** 24px gutters with 48px external margins. Content is often contained within a max-width of 1280px for optimal readability.
- **Mobile:** 16px gutters and 16px margins. 
- **Vertical Spacing:** Sections are separated by large increments (64px or 80px) to maintain a premium, airy feel despite the dark palette. Use `md` (16px) for internal component padding and `lg` (24px) for card padding.

## Elevation & Depth
In this dark mode system, depth is conveyed through **Tonal Layering** and **Subtle Inner Glows** rather than traditional heavy shadows.

1.  **Level 0 (Background):** #121417 - The base canvas.
2.  **Level 1 (Surface):** #1E2126 - Standard cards and containers.
3.  **Level 2 (Elevated):** #2A2E35 - Hover states or active modals.

**Shadows:** Use extremely soft, high-spread shadows with a color tint of `#000000` at 40% opacity. 
**Borders:** Elements at Level 1 should feature a subtle 1px stroke of `#ffffff10` (10% white) to define edges against the dark background.

## Shapes
The shape language is defined by **Round Eight (8px)**. This radius offers a balance between the precision of a professional tool and the friendliness of a pet-focused app.

*   **Small Components:** (Checkboxes, small tags) use 4px radius.
*   **Standard Components:** (Buttons, Inputs, Cards) use 8px radius.
*   **Large Components:** (Modals, Feature Banners) use 16px or 24px radius to emphasize their container status.

## Components
Consistent component styling ensures a unified user experience:

*   **Buttons:** Primary buttons use the Primary Blue with white text. Secondary buttons use a transparent background with an 8px border in the Primary Blue. Use a subtle 2px vertical gradient (lighter at top) to give a tactile "pressable" feel.
*   **Input Fields:** Surfaces use the Level 2 surface color (#2A2E35). Borders are invisible until focus, at which point they transition to a 2px Primary Blue stroke.
*   **Chips/Tags:** Used for pet categories (e.g., "Vaccination," "Grooming"). These use low-opacity versions of the status colors (e.g., Blue at 15% opacity) with high-contrast text.
*   **Cards:** The primary container for pet profiles and health data. Use Level 1 surface with an 8px radius and a very subtle outer glow when a pet is "Active."
*   **Progress Bars:** Thin, rounded tracks using #ffffff10 with a Primary Blue fill for health goals or training progress.
*   **Pet Avatars:** Circular with a 2px Primary Blue border to denote the currently selected pet.