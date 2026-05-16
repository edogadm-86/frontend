---
name: Pet Management System
colors:
  surface: '#faf9f9'
  surface-dim: '#dbdada'
  surface-bright: '#faf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e8'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3f484c'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f2f0f0'
  outline: '#6f787d'
  outline-variant: '#bfc8cd'
  surface-tint: '#006782'
  primary: '#004e63'
  on-primary: '#ffffff'
  primary-container: '#006782'
  on-primary-container: '#9fe2ff'
  inverse-primary: '#86d0ef'
  secondary: '#535f70'
  on-secondary: '#ffffff'
  secondary-container: '#d7e3f8'
  on-secondary-container: '#596576'
  tertiary: '#52405f'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b5778'
  on-tertiary-container: '#e9d0f7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeaff'
  primary-fixed-dim: '#86d0ef'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#004d62'
  secondary-fixed: '#d7e3f8'
  secondary-fixed-dim: '#bbc7db'
  on-secondary-fixed: '#101c2b'
  on-secondary-fixed-variant: '#3c4858'
  tertiary-fixed: '#f3daff'
  tertiary-fixed-dim: '#d6bee4'
  on-tertiary-fixed: '#251431'
  on-tertiary-fixed-variant: '#523f5f'
  background: '#faf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
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
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
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

This design system is built to evoke a sense of professional reliability mixed with approachable warmth. As a pet management platform, the UI must balance the clinical precision required for health records with the emotional connection of pet ownership.

The design style follows a **Modern Corporate** aesthetic with a soft, friendly edge. It prioritizes clarity and "airiness" in light mode to reduce cognitive load for users managing multiple schedules, while using a sophisticated layered approach in dark mode to maintain depth and visual hierarchy. High-quality whitespace, rounded geometry, and a focus on legible, friendly typography define the visual signature.

## Colors

The palette is anchored by a professional Primary Teal, symbolizing health and vitality. 

- **Primary:** Used for high-emphasis actions, active states, and key branding moments.
- **Surface Container:** Specifically reserved for card backgrounds, grouping related content without the need for heavy borders.
- **Outline Variant:** A low-contrast stroke used for subtle structural boundaries and secondary dividers.

In **Light Mode**, the interface utilizes a high-key palette with expansive white space to feel "airy." In **Dark Mode**, depth is achieved through "Tonal Elevation," where higher-z-index components use lighter variants of the surface-container token to simulate proximity to a light source.

## Typography

**Plus Jakarta Sans** is the sole typeface for this design system. Its modern, geometric construction provides the "clean" feel of a SaaS product, while its slightly rounded terminals add the "approachable" character essential for a pet-focused brand.

- **Headlines:** Use Bold weights with slight negative letter-spacing for a tight, professional look.
- **Body:** Standardized at 16px for primary reading to ensure accessibility for all age groups.
- **Labels:** Use Medium weights and increased letter-spacing to ensure legibility at small sizes, particularly in data-heavy pet health charts.

## Layout & Spacing

The layout is governed by a **Fluid-Fixed Hybrid Grid**. Content is housed in a 12-column container that centers on large screens (max-width: 1440px) while maintaining fluid margins on smaller devices.

- **Grid:** Use a 16px gutter for standard components and 24px for major layout sections.
- **Rhythm:** All vertical spacing must be a multiple of the 4px base unit. 
- **Adaptation:** On mobile, margins shrink to 16px, and multi-column card layouts reflow into a single-column vertical stack. Cards within the `surface-container` should maintain 16px internal padding.

## Elevation & Depth

Visual hierarchy is established primarily through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Background):** The lowest layer, using the base background color.
- **Level 1 (Cards/Containers):** Uses the `surface-container` token. This is the primary workhorse for the UI.
- **Level 2 (Modals/Popovers):** Uses a slightly lighter tonal value in dark mode, or a very soft, diffused ambient shadow (15% opacity, 12px blur) in light mode to indicate temporary interaction.

Borders should be kept to a minimum, using the `outline-variant` only when elements of the same color need clear separation (e.g., overlapping cards or sticky headers).

## Shapes

The shape language is **Rounded**, reflecting the soft and friendly nature of the brand. 

- **Components:** Standard buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Dashboard widgets and main content areas use `rounded-lg` (16px) or `rounded-xl` (24px) to create a soft, framed appearance.
- **Interactive States:** Use a consistent corner radius across all form elements to ensure the UI feels like a single, cohesive toolset.

## Components

- **Buttons:** Primary buttons use a solid fill of the `primary` color with white or high-contrast text. Secondary buttons use a `primary` outline or a subtle ghost style.
- **Cards:** All pet profiles, medical records, and appointment reminders must use the `surface-container` background. Use `outline-variant` for the border (1px) to provide structure without visual noise.
- **Chips/Status Tags:** Use rounded-pill shapes. Pet categories (e.g., "Dog", "Cat") or status indicators (e.g., "Vaccinated", "Pending") should use low-saturation background tints of the primary or semantic colors.
- **Input Fields:** Use the `surface-container` background with an `outline-variant` border. On focus, the border should transition to the `primary` color with a 2px stroke.
- **Lists:** Use `outline-variant` for horizontal dividers between list items. Ensure generous vertical padding (12px-16px) to maintain the airy feel.
- **Pet Avatars:** Always circular to contrast against the predominantly rectangular/rounded card system.