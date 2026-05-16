---
name: Canine Utility System
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#414751'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#717783'
  outline-variant: '#c1c7d3'
  surface-tint: '#0060ac'
  primary: '#005da7'
  on-primary: '#ffffff'
  primary-container: '#2976c7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#bb0017'
  on-tertiary: '#ffffff'
  tertiary-container: '#e41d27'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#93000f'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
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
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  status-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin-mobile: 16px
  container-margin-desktop: 40px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is centered on the concept of **Vital Utility**. It serves as a bridge between a friendly pet profile and a critical information hub. The personality is dependable, approachable, and highly legible, optimized for high-stress or high-glare environments (like searching for a lost dog outdoors).

The visual style is **High-Contrast Modern**. It avoids decorative flourishes in favor of structural clarity. By utilizing generous whitespace, thick borders, and vibrant primary accents, the interface ensures that essential data—such as medical needs or contact information—is immediately digestible. The "safe" aspect is conveyed through soft rounded corners, while "urgency" is established through a strict information hierarchy and high-visibility status indicators.

## Colors

The palette is engineered for maximum legibility. 

*   **Primary (#4A90E2):** A trusted, vibrant blue used for primary actions and branding.
*   **Secondary (#F5A623):** A high-visibility amber used for "Warning" or "Caution" states (e.g., "Approaching Cautiously" or "Dietary Restrictions").
*   **Tertiary (#D0021B):** A critical red reserved for medical emergencies or "Lost" status alerts.
*   **Neutral (#1A1C1E):** A deep, near-black charcoal used for text to provide better contrast than pure black against white backgrounds in bright sunlight.

**Theming Logic:**
*   **Light Mode:** Uses a pure white (#FFFFFF) background to maximize screen brightness outdoors. Surfaces use a very light gray (#F4F7FA) to define sections.
*   **Dark Mode:** Uses a deep navy-black (#0B0D0F) background. Text shifts to high-brightness white (#F8FAFC). Interactive elements maintain the primary blue but increase luminance slightly for better glow against dark backgrounds.

## Typography

The design system exclusively uses **Plus Jakarta Sans** for its modern, friendly, and geometric proportions. 

The type scale emphasizes "at-a-glance" reading. **Display-lg** is reserved for the dog’s name. **Label-md** uses an uppercase style with increased letter spacing to clearly denote category headers (e.g., "MEDICAL INFO", "OWNER CONTACT"). 

For outdoor readability, we avoid weights below 400. Body text is prioritized at **18px (body-lg)** for critical information to accommodate users who may be viewing the screen at arm's length or in motion.

## Layout & Spacing

The layout utilizes a **Fixed-Width Fluid Hybrid**. On mobile, content is single-column with a 16px safety margin. On desktop, content is contained within a 720px central pillar to mimic the focused feel of a physical ID card or medical record.

**Spacing Philosophy:**
*   **Vertical Stacking:** Information is grouped into logical blocks (Profile, Behavior, Contact) using the `stack-lg` (48px) unit.
*   **Internal Grouping:** Related items within a block (e.g., Breed and Weight) use `stack-sm` (12px) to maintain a tight visual relationship.
*   **Touch Targets:** All interactive elements maintain a minimum height of 48px to ensure ease of use in outdoor/mobile contexts.

## Elevation & Depth

To maintain high contrast and readability in sunlight, this design system avoids soft, ambient shadows which can appear "muddy" or invisible in high-glare environments.

Instead, it uses **Tonal Layering and Sharp Outlines**:
1.  **Level 0 (Background):** Pure white (Light) or Deep Navy (Dark).
2.  **Level 1 (Card/Container):** Uses a 1px solid border (#E2E8F0 in Light, #2D3748 in Dark) to define boundaries.
3.  **Level 2 (Active/Critical):** Elements that require immediate attention (like a "Contact Owner" button) use a high-saturation fill color with no shadow, relying on color weight for depth.

Depth is achieved through the stacking of these flat containers rather than simulated light sources.

## Shapes

The shape language is **Rounded (0.5rem base)**. This softens the "utility" aspect of the page, making the dog's profile feel friendly and approachable. 

*   **Standard Cards/Inputs:** 0.5rem (8px) radius.
*   **Large Containers (Profile Photo):** 1rem (16px) radius to create a focal point.
*   **Badges/Status Tags:** Fully pill-shaped (999px) to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons are high-contrast blocks of the Primary Blue with white bold text. For "Urgent" actions (e.g., "Report Found"), the button uses the Tertiary Red. All buttons have a minimum 48px height.

### Status Chips
Used for temperament (e.g., "Friendly," "Anxious") or medical alerts. These are pill-shaped with a low-opacity background of the status color and a high-contrast text label in the same hue.

### Info Lists
Information is presented in "Key: Value" pairs. Labels are small, uppercase, and bolded (Label-md) placed directly above the value (Body-lg) to ensure clarity when scanning.

### Input Fields
For forms (like leaving a message for the owner), inputs use a thick 2px border when focused. This ensures the user knows exactly which field is active even in bright conditions.

### Profile Hero
The top section features a large, high-resolution square image with a significant 1rem corner radius, followed immediately by the dog's name in Display-lg and a primary status badge (e.g., "I'm Lost" or "I'm Friendly").

### Contact Cards
Owner contact information is housed in a "High-Priority" card with a subtle background tint (#F0F7FF) to separate it from general biological data.