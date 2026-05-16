---
name: Puppy Blue High-Fidelity
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f2'
  surface-container: '#efedec'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1b'
  on-surface-variant: '#414751'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0ef'
  outline: '#717783'
  outline-variant: '#c1c7d3'
  surface-tint: '#0060ac'
  primary: '#005da7'
  on-primary: '#ffffff'
  primary-container: '#2976c7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e5'
  on-secondary-container: '#636467'
  tertiary: '#5d5c5a'
  on-tertiary: '#ffffff'
  tertiary-container: '#757473'
  on-tertiary-container: '#f7fff1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e5e2e0'
  tertiary-fixed-dim: '#c8c6c4'
  on-tertiary-fixed: '#1c1c1b'
  on-tertiary-fixed-variant: '#474745'
  background: '#fbf9f8'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
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
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is centered on a "Clean-Professional" aesthetic that balances high-utility SaaS functionality with the warmth of a lifestyle brand. The personality is approachable yet authoritative, designed to evoke feelings of reliability and care for pet owners and professionals alike.

The style leverages a **Modern Minimalist** approach with a focus on high-quality whitespace and subtle depth. By utilizing soft off-white surfaces and refined typography, the UI remains uncluttered, allowing the primary "Puppy Blue" to act as a clear signifier for intent and action. The overall visual language avoids harshness, opting instead for a gentle, polished interface that feels both contemporary and trustworthy.

## Colors

This design system utilizes a sophisticated light-themed palette designed to reduce eye strain while maintaining clear hierarchy.

- **Primary (Puppy Blue):** Reserved for primary call-to-actions, active states, and critical brand moments.
- **Surface Foundations:** The base background uses a soft off-white (#FBF9F8), while secondary containers and grouping elements use a slightly deeper light gray (#F3F0EE) to create subtle tonal separation.
- **Typography:** High-contrast text is set in Dark Charcoal (#1A1C1E) for maximum legibility. Secondary information and metadata utilize a mid-gray to ensure the interface doesn't feel overly "heavy."

## Typography

The design system relies exclusively on **Plus Jakarta Sans** to maintain a modern, friendly, and geometric appearance. 

- **Headlines:** Bold and expressive with slight negative letter-spacing to feel "tight" and professional.
- **Body:** Open and airy line-heights are used to ensure long-form content is easy to digest.
- **Labels:** Semi-bold weights are used for buttons and navigation items to differentiate them clearly from body text.
- **Scaling:** On mobile devices, large display titles scale down to prevent excessive line-breaking, ensuring a compact and readable experience.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid** model. Content is contained within a maximum width of 1280px for desktop viewing, centered with generous margins. 

- **Grid:** A 12-column grid is used for desktop (24px gutters), collapsing to a 4-column grid for mobile (16px gutters).
- **Rhythm:** An 8pt spatial system governs all padding and margins. 
- **Adaptation:** On mobile, horizontal padding for cards and containers is reduced to 16px to maximize screen real estate, while vertical spacing remains generous (24px+) to maintain the "airy" brand feeling.

## Elevation & Depth

To maintain a clean and professional look, the design system prioritizes **Ambient Shadows** and **Tonal Layering** over heavy borders.

- **Level 0 (Base):** #FBF9F8 (Background).
- **Level 1 (Cards/Containers):** Pure white (#FFFFFF) surfaces with a very soft, diffused shadow (0px 4px 20px rgba(26, 28, 30, 0.04)).
- **Level 2 (Overlays/Dropdowns):** Elevated surfaces with a more pronounced shadow (0px 8px 30px rgba(26, 28, 30, 0.08)).
- **Outlines:** Use subtle #F3F0EE borders only for interactive components like input fields or when two white surfaces must touch.

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and approachable brand personality. 

Standard components (buttons, inputs, cards) utilize a 0.5rem (8px) base radius. Larger layout containers or featured marketing cards scale up to 1rem (16px) to emphasize their "container" nature. Selection indicators (pills/chips) and tags utilize a fully rounded (32px+) style to contrast against the more structured rectangular components.

## Components

- **Buttons:** Primary buttons use a solid Puppy Blue fill with white text. Secondary buttons are ghost-style with a Puppy Blue label and no border.
- **Inputs:** Input fields feature the light gray (#F3F0EE) background and a soft transition to a Puppy Blue focus ring. No heavy borders are used in the default state.
- **Cards:** White backgrounds with the Level 1 shadow. Cards do not have borders unless they are in an "unselected" state in a multi-choice layout.
- **Chips/Tags:** Used for pet categories or status. High-contrast labels on a #F3F0EE background for a neutral look, or light Puppy Blue tints for active states.
- **Lists:** Clean rows separated by subtle 1px #F3F0EE dividers. Use "Plus Jakarta Sans" Medium for list item headers.
- **Checkboxes/Radios:** Soft-rounded corners for checkboxes (4px) and full circles for radios. Active states utilize Puppy Blue with a white check/dot.