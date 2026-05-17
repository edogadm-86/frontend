---
name: Premium Pet Care System
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414751'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#717783'
  outline-variant: '#c1c7d3'
  surface-tint: '#0060ac'
  primary: '#005da7'
  on-primary: '#ffffff'
  primary-container: '#2976c7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#785900'
  on-secondary: '#ffffff'
  secondary-container: '#fdc003'
  on-secondary-container: '#6c5000'
  tertiary: '#5a5c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#737576'
  on-tertiary-container: '#fcfdfe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
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
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
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
  md: 20px
  lg: 32px
  xl: 48px
  gutter: 16px
  margin-mobile: 20px
  touch-target: 48px
---

## Brand & Style

The design system is anchored in the "Premium Pet Care" aesthetic—a sophisticated blend of high-end service and unconditional warmth. It is designed to evoke feelings of safety, joy, and professional reliability, ensuring pet owners feel their companions are in expert hands.

The visual style leans into **Modern Minimalist with Tactile Warmth**. It avoids the clinical coldness often found in healthcare by utilizing soft geometry, generous whitespace, and a high-legibility typographic scale. The interface feels light and "airy," prioritizing ease of navigation for users who may be managing pet care tasks on the go. By combining soft-touch elements with structured layouts, the design system bridges the gap between a playful lifestyle app and a trustworthy utility.

## Colors

The palette is inspired by the natural warmth of animal companionship and the professional clarity of modern veterinary services.

- **Puppy Blue (#4A90E2):** The primary brand color. It represents trust, calmness, and stability. Used for primary actions, active states, and key brand identifiers.
- **Golden Retriever Yellow (#FFC107):** The secondary accent. It injects energy and warmth into the UI. Use sparingly for highlights, secondary buttons, or "joyful" notifications.
- **Bone White (#FDFCF8):** The primary background color. It is warmer than a sterile pure white, providing a premium, paper-like quality that reduces eye strain.
- **Soft Charcoal (#333333):** The primary text color. It provides high contrast against the Bone White background while appearing softer and more organic than true black.
- **Success & Alert:** Use a soft sage green for positive confirmations and a muted terracotta for errors to maintain the friendly, non-threatening tone.

## Typography

The typography system utilizes **Plus Jakarta Sans** for headlines and body copy to leverage its friendly, slightly rounded terminals and modern geometric construction. This font communicates approachability without sacrificing professionalism.

For functional UI elements like labels, data points, and small captions, the design system uses **Manrope**. This secondary typeface provides a more structured, systematic feel that aids in "at-a-glance" readability for utility-heavy screens.

- **Hierarchy:** Maintain a clear vertical rhythm by using larger headlines for section titles.
- **Readability:** Body text should always be in Soft Charcoal. Avoid using the secondary Yellow for any long-form text as it lacks sufficient contrast for accessibility.

## Layout & Spacing

This design system employs a **fluid-to-fixed hybrid grid** optimized for PWA usage. 

- **Mobile First:** Given the PWA nature, the primary experience is a single-column layout with 20px side margins.
- **Large Touch Targets:** All interactive elements (buttons, inputs, toggles) must adhere to a minimum 48px height/width touch target to ensure accessibility for users who may be holding a leash or managing a pet simultaneously.
- **Spacing Rhythm:** An 8px linear scale drives all spacing. Use `lg` (32px) for spacing between major sections and `md` (20px) for internal component padding. 
- **The "Breathable" Rule:** The layout should feel spacious. If in doubt, increase padding to prevent the UI from feeling cluttered or stressful.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layering** and **Ambient Shadows**.

- **Surface Tiers:** The "Bone White" background serves as the base layer. Interactive cards and containers sit on a pure white surface to create a subtle natural lift.
- **Shadow Profile:** Use soft, highly diffused shadows. A typical shadow should have a large blur (20-30px) and a very low opacity (5-8%), tinted slightly with the primary Puppy Blue to prevent a "dirty" gray appearance.
- **Interaction Depth:** Elements should feel "tappable." Use a slight scale-down effect (98%) and a subtle increase in shadow depth on active press states to mimic physical tactile feedback.

## Shapes

The shape language is defined by generous, friendly curves. This "Rounded" philosophy (Base 0.5rem / 8px) is applied consistently to create a welcoming environment.

- **Standard Elements:** Buttons and Input fields use the 8px base radius.
- **Containers:** Content cards and modals utilize `rounded-lg` (16px) or `rounded-xl` (24px) to emphasize the soft, premium feel.
- **Avatars:** Dog profile photos and user icons should always be rendered as circles (pill-shaped) to add a playful, organic touch to the structured layout.

## Components

- **Buttons:** Primary buttons use a solid Puppy Blue fill with white text. Secondary buttons use a thick 2px Puppy Blue outline. All buttons feature a 48px height and bolded Plus Jakarta Sans labels.
- **Cards:** Cards are the workhorse of the design system. They feature a white background, 16px corner radius, and a subtle ambient shadow. Use internal padding of 20px.
- **Input Fields:** Search bars and forms use a light gray-blue stroke that turns Puppy Blue on focus. Labels should use the Manrope typeface in a bold weight sitting just above the field.
- **Chips & Tags:** Use these for pet attributes (e.g., "Vaccinated," "Friendly"). They should have a soft pastel background derived from the brand colors (e.g., 10% opacity Blue or Yellow) with high-contrast text.
- **Progressive Indicators:** For multi-step pet care forms, use a rounded progress bar in Puppy Blue with a Bone White track. 
- **Bottom Navigation:** For the PWA experience, include a fixed bottom bar with clear icons and Manrope labels, ensuring the active state is clearly highlighted with a Puppy Blue tint.