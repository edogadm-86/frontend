---
name: Pro-Grade Canine Training
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#c8c6c6'
  on-secondary: '#303030'
  secondary-container: '#474747'
  on-secondary-container: '#b6b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#690003'
  tertiary-container: '#ffdad5'
  on-tertiary-container: '#ca0a0f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#930005'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  video-timestamp:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
  touch-target-min: 48px
  video-control-padding: 24px
---

## Brand & Style
The design system is engineered for high-performance dog training, blending the precision of technical software with the intensity of outdoor athletics. The brand personality is authoritative, focused, and resilient, targeting professional trainers and dedicated owners who require immediate data legibility in high-stakes or outdoor environments.

The visual style is **High-Contrast / Modern**, utilizing deep obsidian surfaces and high-intensity signal colors to ensure clarity during fast-paced training sessions. It prioritizes "heads-up" interaction—large touch targets, clear status indicators, and an interface that feels like a tactical dashboard rather than a lifestyle app.

## Colors
The palette is built on a "Dark Room" philosophy to maximize focus.
- **Primary (Electric Lime):** Reserved for critical actions, progress indicators, and active training states. This high-visibility color ensures the UI is readable under sunlight or at a glance during movement.
- **Secondary (Iron):** Used for structural elements, secondary buttons, and inactive control states.
- **Tertiary (Signal Red):** Dedicated exclusively to "Correction" actions, stop commands, and error alerts.
- **Neutral (Obsidian):** The foundation of the UI, providing a pure black or near-black background to eliminate distractions.

## Typography
The typography system uses a tri-font approach for functional clarity. **Hanken Grotesk** provides a sharp, contemporary look for headlines that feel authoritative. **Inter** serves as the workhorse for instructions and training notes, ensuring maximum legibility across all lighting conditions. **JetBrains Mono** is utilized for "Technical Labels" such as duration, repetition counts, and timestamps, reinforcing the data-driven nature of this design system.

## Layout & Spacing
This design system utilizes a **Fixed Grid** on desktop and a **Fluid Grid** on mobile devices. The rhythm is based on a 4px base unit to ensure alignment of technical data. 

In training modes, the layout shifts to "Action View," where margins increase to 24px to prevent accidental edge-taps. The Video Player UI utilizes a "Safe Zone" overlay (24px padding) for controls, ensuring they are separated from the edge of the screen and the progress bar.

## Elevation & Depth
Depth is created through **Tonal Layers** rather than shadows. In a dark environment, true shadows are often invisible; instead, this design system uses increasing luminosity to indicate height.
- **Level 0 (Base):** #121212 (The background)
- **Level 1 (Cards/Panels):** #1C1C1C (Subtle separation)
- **Level 2 (Overlays/Modals):** #262626 (Clear focus)

Video controls use **Backdrop Blurs** (20px) with a 40% black tint to ensure they remain legible regardless of the video content behind them.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a professional, "tool-like" feel that is more approachable than sharp 90-degree angles but maintains a more serious tone than pill-shaped designs. Buttons and input fields use a consistent 4px radius, while Video Player containers and large training cards use 12px (rounded-xl) for a distinct containerized look.

## Components
- **Training Buttons:** Primary buttons are Electric Lime with black text for maximum contrast. Correction buttons are Tertiary Red with white text.
- **Video Player Controls:** Large, iconography-heavy buttons (min 48px size) with high-contrast white glyphs. Play/Pause is centralized and oversized.
- **Progress Tracking:** Progress bars use a dual-track system: a dark grey base with an Electric Lime fill. Key training milestones are marked with 2px vertical white ticks.
- **Training Chips:** Small, mono-spaced labels using JetBrains Mono with 1px borders. These indicate dog stats (e.g., "DRIVE: HIGH") or training categories.
- **Action Cards:** Large surface areas for session selection, featuring high-contrast headlines and a "Quick Start" chevron in the primary color.
- **Live-Feedback HUD:** Semi-transparent overlays that appear during video playback to show real-time stats (heart rate, duration), using the technical label style.